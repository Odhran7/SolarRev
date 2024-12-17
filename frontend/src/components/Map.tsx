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

interface MapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  initialPitch?: number;
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
      maxZoom: 18,
      maxPitch: 85,
    });

    mapRef.current = map;

    const drawControl = new MaplibreMeasureControl({
      modes: ["polygon", "delete"],
      open: true,
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
        <div className="absolute top-4 left-24 bg-white p-2 rounded shadow z-20">
          <div>Coordinates: {coordinates.toString()}</div>
          <div>Pitch: {pitch}°</div>
          <div>Zoom: {zoom}</div>
        </div>
      )}
    </div>
  );
};

export default Map;
