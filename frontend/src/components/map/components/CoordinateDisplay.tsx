"use client";

import React, { useState } from "react";
import { Position } from "geojson";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [open, setOpen] = useState(true);
  return (
    <div className="absolute top-4 right-24 bg-white p-2 rounded shadow z-20 max-w-[400px] break-words">
      <button
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
        onClick={() => setOpen(!open)}
      >
        {!open ? (
          <div className="flex items-center font-sm font-semibold">
            Show
            <ChevronUp size={20} />
          </div>
        ) : (
          <ChevronDown size={20} />
        )}
      </button>
      <div>Coordinates: {coordinates.toString()}</div>
      <div>Pitch: {pitch}°</div>
      <div>Zoom: {zoom}</div>
      {area && <div>Area: {area.toFixed(2)} m²</div>}
    </div>
  );
}
