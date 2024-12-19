import { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const INITIAL_MAP_CONFIG = {
    center: [-8.2439, 53.4129] as [number, number],
    zoom: 7,
    pitch: 45,
    maxZoom: 18,
    maxPitch: 85,
    minZoom: 5,
  } as const;
  
  export const TERRAIN_CONFIG = {
    source: "terrainSource",
    exaggeration: 2,
  } as const;

export const MAP_STYLE: StyleSpecification = {
version: 8,
sources: {
    osm: {
    type: "raster",
    tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
    tileSize: 256,
    attribution: "&copy; OpenStreetMap Contributors",
    maxzoom: 19,
    },
},
layers: [
    {
    id: "osm",
    type: "raster",
    source: "osm",
    },
],
};