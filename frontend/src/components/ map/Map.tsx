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
  bounds = [-10.76, 51.35, -5.34, 55.45],
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [coordinates, setCoordinates] = useState<Position[]>([]);
  const [zoom, setZoom] = useState(initialZoom);
  const [center, setCenter] = useState(initialCenter);
  const [pitch, setPitch] = useState(initialPitch);
  const [area, setArea] = useState<number | null>(null);

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

  const getMarkerSize = (capacity: number) => {
    if (capacity >= 100) return 24;
    if (capacity >= 50) return 20;
    if (capacity >= 20) return 16;
    return 12;
  };
  const getStatusColor = (status: string) => {
    if (status.includes("operating")) return "#22c55e"; // green
    if (status.includes("construction")) return "#eab308"; // yellow
    if (status.includes("announced") || status.includes("pre-construction"))
      return "#3b82f6"; // blue
    if (status.includes("shelved")) return "#ef4444"; // red
    return "#94a3b8"; // gray default
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
      zoom = 14;
    } else if (area < 10000000) {
      zoom = 12;
    } else {
      zoom = 10;
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
      maxBounds: bounds,
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
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'capacity'],
            0, 5,    // 0 MW = 5px radius
            50, 10,  // 50 MW = 10px radius
            100, 15  // 100+ MW = 15px radius
          ],
          // Color based on status
          'circle-color': [
            'match',
            ['get', 'status'],
            'operating', '#22c55e',
            'construction', '#eab308',
            'announced', '#3b82f6',
            'pre-construction', '#3b82f6',
            'shelved', '#ef4444',
            '#94a3b8'  // default color
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': 'white'
        }
      });
    
      const legend = document.createElement("div");
      legend.className =
        "absolute bottom-4 right-4 bg-white p-4 rounded shadow";
      legend.innerHTML = `
        <div class="text-sm font-bold mb-2">Solar Farm Status</div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full" style="background-color: #22c55e"></div>
            <span class="text-sm">Operating</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full" style="background-color: #eab308"></div>
            <span class="text-sm">Under Construction</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full" style="background-color: #3b82f6"></div>
            <span class="text-sm">Announced/Pre-construction</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full" style="background-color: #ef4444"></div>
            <span class="text-sm">Shelved</span>
          </div>
        </div>
        <div class="text-sm font-bold mt-4 mb-2">Capacity</div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full border-2 border-gray-400"></div>
            <span class="text-sm">≥ 100 MW</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full border-2 border-gray-400"></div>
            <span class="text-sm">50-99 MW</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full border-2 border-gray-400"></div>
            <span class="text-sm">20-49 MW</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full border-2 border-gray-400"></div>
            <span class="text-sm">< 20 MW</span>
          </div>
        </div>
      `;
      mapContainer.current.appendChild(legend);

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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {coordinates.length > 0 && (
        <div className="absolute top-4 left-24 bg-white p-2 rounded shadow z-20 w-full">
          <div>Coordinates: {coordinates.toString()}</div>
          <div>Pitch: {pitch}°</div>
          <div>Zoom: {zoom}</div>
          {area && <div>Area: {area}</div>}
        </div>
      )}
    </div>
  );
};

export default Map;
