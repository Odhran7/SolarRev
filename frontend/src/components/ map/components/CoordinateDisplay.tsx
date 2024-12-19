import React from "react";
import { Position } from "geojson";

interface CoordinateDisplayProps {
  coordinates: Position[];
  pitch: number;
  zoom: number;
  area: number | null;
}

export function CoordinateDisplay({
  coordinates,
  pitch,
  zoom,
  area,
}: CoordinateDisplayProps) {
  return (
    <div className="absolute top-4 right-24 bg-white p-2 rounded shadow z-20 max-w-[400px] break-words">
      <div>Coordinates: {coordinates.toString()}</div>
      <div>Pitch: {pitch}°</div>
      <div>Zoom: {zoom}</div>
      {area && <div>Area: {area.toFixed(2)} m²</div>}
    </div>
  );
}
