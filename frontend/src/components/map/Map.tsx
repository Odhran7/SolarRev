"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";
import { Position } from "geojson";
import Legend from "./components/Legend";
import { CoordinateDisplay } from "./components/CoordinateDisplay";
import { INITIAL_MAP_CONFIG, BASE_MAP_STYLE } from "./constants";
import { MapProps } from "./types";
import { useMapLayers } from "./hooks/useMapLayer";
import transform from "@/components/map/utils/transform";
import solarData from "@/components/map/constants/solar_projects.json";
import { useMapEvents } from "./hooks/useMapEvents";
import { useRouter } from "next/navigation";

const Map: React.FC<MapProps> = ({
  initialCenter = INITIAL_MAP_CONFIG.center,
  initialZoom = INITIAL_MAP_CONFIG.zoom,
  initialPitch = INITIAL_MAP_CONFIG.zoom,
}) => {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [coordinates, setCoordinates] = useState<Position[]>([]);
  const [zoom, setZoom] = useState(initialZoom);
  const [center, setCenter] = useState(initialCenter);
  const [pitch, setPitch] = useState(initialPitch);
  const [area, setArea] = useState<number | null>(null);

  useEffect(() => {
    // Clean up any existing map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASE_MAP_STYLE,
      center: center,
      zoom: zoom,
      pitch: pitch,
      maxZoom: 18,
      maxPitch: 85,
      minZoom: 5,
    });

    mapRef.current = map;

    map.on("load", () => {
      const geoJson = transform(solarData);
      map.addSource("places", {
        type: "geojson",
        data: geoJson,
      });

      map.addLayer({
        id: "places",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "capacity"],
            0, 5,
            50, 10,
            100, 15
          ],
          "circle-color": [
            "match",
            ["get", "status"],
            "operating", "#22c55e",
            "construction", "#eab308",
            "announced", "#3b82f6",
            "pre-construction", "#3b82f6",
            "shelved", "#ef4444",
            "#94a3b8"
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "white",
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
        mapRef.current = null;
      }
    };
  }, [router.asPath]); 

  useMapEvents({
    mapRef,
    setCoordinates,
    setCenter,
    setZoom,
    setPitch,
    setArea,
  });

  const { setShowPower, setShowSubstation } = useMapLayers(mapRef);

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