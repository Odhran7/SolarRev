"use client";

import React from "react";
import Map from "@/components/map/Map";

export default function MapPage() {
  return (
    <div className="h-full w-full">
      <Map
        initialCenter={[-8.2439, 53.4129]}
        initialPitch={45}
        initialZoom={7}
      />
    </div>
  );
}