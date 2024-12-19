import { Position } from "geojson";
import { Map as MaplibreMap } from "maplibre-gl";

export interface MapProps {
    initialCenter: [number, number];
    initialZoom?: number;
    initialPitch?: number;
    bounds?: [number, number, number, number]
}

export interface UseMapSetupProps extends Omit<MapProps, 'bounds'> {
    initialZoom: number;
    initialPitch: number;
}

export interface UseMapEventsProps {
    mapRef: React.RefObject<MaplibreMap | null>;
    setCoordinates: (coords: Position[]) => void;
    setCenter: (center: [number, number]) => void;
    setZoom: (zoom: number) => void;
    setPitch: (pitch: number) => void;
    setArea: (area: number | null) => void;
  }