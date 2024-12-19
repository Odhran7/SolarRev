import "maplibre-gl/dist/maplibre-gl.css";
import { StyleSpecification } from "maplibre-gl";

export const INITIAL_MAP_CONFIG = {
  center: [-8.2439, 53.4129] as [number, number],
  zoom: 7,
  pitch: 45,
  maxZoom: 18,
  maxPitch: 85,
  minZoom: 5,
} as const;

export const BASE_MAP_STYLE: StyleSpecification = {
  version: 8 as const,
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
    openinframap: {
      type: "vector",
      tiles: ["https://openinframap.org/tiles/{z}/{x}/{y}.pbf"],
      minzoom: 0,
      maxzoom: 14,
    }
  },
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
    {
      id: "substations",
      source: "openinframap",
      "source-layer": "power_substation",
      layout: { visibility: "none" },
      minzoom: 10,
      type: "circle",
      paint: {
        "circle-color": "#0000ff",
        "circle-radius": 6,
      },
    },
    {
      id: "power-lines",
      source: "openinframap",
      "source-layer": "power_line",
      type: "line",
      layout: { visibility: "none" },
      paint: {
        "line-color": "#ff0000",
        "line-width": 2,
      },
    }
  ],
  terrain: {
    source: "terrainSource",
    exaggeration: 2,
  },
  sky: {},
};