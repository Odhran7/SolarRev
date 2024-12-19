"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { MaplibreMeasureControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import { Position } from "geojson";
import * as turf from "@turf/turf";
import { LngLatLike } from "maplibre-gl";
import Legend from "./Legend";
import { CoordinateDisplay } from "./components/CoordinateDisplay";
// Geojson data
import transform from "@/utils/transform";
import solarData from "@/constants/solar_plants/solar_projects.json";
const geoJson = transform(solarData);

interface MapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  initialPitch?: number;
  bounds?: [number, number, number, number];
}

const Map: React.FC<MapProps> = ({
  initialCenter = [-8.2439, 53.4129],
  initialZoom = 7,
  initialPitch = 45,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [coordinates, setCoordinates] = useState<Position[]>([]);
  const [zoom, setZoom] = useState(initialZoom);
  const [center, setCenter] = useState(initialCenter);
  const [pitch, setPitch] = useState(initialPitch);
  const [area, setArea] = useState<number | null>(null);
  const [showPower, setShowPower] = useState(false);
  const [showSubstation, setShowSubstation] = useState(false);

  const findPolygonCenter = (coords: Position[]) => {
    const closedCoords =
      coords[0][0] === coords[coords.length - 1][0] &&
      coords[0][1] === coords[coords.length - 1][1]
        ? coords
        : [...coords, coords[0]];

    const polygon = turf.polygon([closedCoords]);
    const center = turf.centroid(polygon);
    return center.geometry.coordinates as number[];
  };

  const calculateViewParameters = (coords: Position[]) => {
    const closedCoords =
      coords[0][0] === coords[coords.length - 1][0] &&
      coords[0][1] === coords[coords.length - 1][1]
        ? coords
        : [...coords, coords[0]];

    const polygon = turf.polygon([closedCoords]);
    const area = turf.area(polygon);
    setArea(area);
    const bbox = turf.bbox(polygon);
    let zoom;
    if (area < 1000) {
      zoom = 20;
    } else if (area < 10000) {
      zoom = 18;
    } else if (area < 100000) {
      zoom = 16;
    } else if (area < 1000000) {
      zoom = 12;
    } else if (area < 10000000) {
      zoom = 10;
    } else {
      zoom = 8;
    }
    let pitch;
    if (zoom >= 16) {
      pitch = 60;
    } else if (zoom >= 12) {
      pitch = 50;
    } else {
      pitch = 45;
    }

    const bearing = turf.bearing(
      turf.point([bbox[0], bbox[1]]),
      turf.point([bbox[2], bbox[3]])
    );

    return {
      zoom,
      pitch,
      bearing: bearing,
      center: findPolygonCenter(coords),
    };
  };

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      center: center,
      zoom: zoom,
      pitch: pitch,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            maxzoom: 19,
          },
          terrainSource: {
            type: "raster-dem",
            tiles: [
              "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
            ],
            encoding: "terrarium",
            tileSize: 256,
          },
        },
        glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
        terrain: {
          source: "terrainSource",
          exaggeration: 2,
        },
        sky: {},
      },
      maxZoom: 18,
      maxPitch: 85,
      minZoom: 5,
    });

    mapRef.current = map;

    const drawControl = new MaplibreMeasureControl({
      modes: ["polygon", "delete"],
      open: true,
    });

    map.on("load", async () => {
      // Todo add pvout layer^^
      // Adding the markers
      map.addSource("places", {
        type: "geojson",
        data: geoJson,
      });

      map.addLayer({
        id: "places",
        type: "circle",
        source: "places",
        paint: {
          // Size based on MW capacity
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "capacity"],
            0,
            5,
            50,
            10,
            100,
            15,
          ],
          "circle-color": [
            "match",
            ["get", "status"],
            "operating",
            "#22c55e",
            "construction",
            "#eab308",
            "announced",
            "#3b82f6",
            "pre-construction",
            "#3b82f6",
            "shelved",
            "#ef4444",
            "#94a3b8",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "white",
        },
      });
      map.addSource("openinframap", {
        type: "vector",
        tiles: ["https://openinframap.org/tiles/{z}/{x}/{y}.pbf"],
        minzoom: 0,
        maxzoom: 14,
      });
      map.addLayer({
        id: "substations",
        source: "openinframap",
        "source-layer": "power_substation",
        layout: {
          visibility: "none",
        },
        minzoom: 10,
        type: "circle",
        paint: {
          "circle-color": "#0000ff",
          "circle-radius": 6,
        },
      });
      // Power lines
      map.addLayer({
        id: "power-lines",
        source: "openinframap",
        "source-layer": "power_line",
        type: "line",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": "#ff0000",
          "line-width": 2,
        },
      });
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
      });
      map.on("mouseleave", "places", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      map.on("mouseenter", "places", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
      });
    });

    map.addControl(drawControl, "top-left");

    const drawInstance = drawControl.getTerraDrawInstance();
    if (drawInstance) {
      drawInstance.on("finish", (id) => {
        const snapshot = drawInstance.getSnapshot();
        const feature = snapshot?.find((feature) => feature.id === id);
        if (
          feature &&
          feature.geometry &&
          feature.geometry.type === "Polygon" &&
          Array.isArray(feature.geometry.coordinates) &&
          feature.geometry.coordinates[0]
        ) {
          const currentCoords = feature.geometry.coordinates[0] as Position[];
          console.log("Current coordinates:", currentCoords);
          const viewParams = calculateViewParameters(currentCoords);
          setCoordinates(currentCoords);
          setCenter(viewParams.center as [number, number]);
          setZoom(viewParams.zoom);
          setPitch(viewParams.pitch);
          mapRef.current?.flyTo({
            center: viewParams.center as LngLatLike,
            zoom: viewParams.zoom,
            pitch: viewParams.pitch,
            bearing: viewParams.bearing,
            speed: 0.6,
            curve: 1.5,
            easing(t) {
              return t * (2 - t);
            },
            essential: true,
          });
        } else {
          setCoordinates([]);
        }
      });
    }

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      "top-right"
    );

    map.addControl(
      new maplibregl.TerrainControl({
        source: "terrainSource",
        exaggeration: 2,
      }),
      "top-right"
    );

    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      "top-right"
    );

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [initialCenter, initialZoom, initialPitch]);

  // Layer toggling
  useEffect(() => {
    if (!mapRef.current?.isStyleLoaded()) return;
    mapRef.current?.setLayoutProperty(
      "power-lines",
      "visibility",
      showPower ? "visible" : "none"
    );
    mapRef.current?.setLayoutProperty(
      "substations",
      "visibility",
      showSubstation ? "visible" : "none"
    );
  }, [showPower, showSubstation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <Legend
        handlePowerLines={setShowPower}
        handleSubstation={setShowSubstation}
      />
      {coordinates.length > 0 && (
        <CoordinateDisplay
          coordinates={coordinates}
          pitch={pitch}
          zoom={zoom}
          area={area}
        />
      )}
    </div>
  );
};

export default Map;
