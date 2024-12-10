"use client";
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { osm } from "pigeon-maps/providers";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components";
import { useState } from "react";

export default function Home() {
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMapClick = ({ latlng }) => {
    if (isDrawing) {
      setDrawingPoints([...drawingPoints, latlng]);
    }
  };

  const resetDrawing = () => {};

  const completeDrawing = () => {};

  return (
    <div>
      <Navbar />
      <Card className="mx-auto">
        <CardHeader className="text-center">
          <CardTitle>SolarRev</CardTitle>
          <CardDescription>Draw a polygon and get an estimate!</CardDescription>
        </CardHeader>
      </Card>

      <Map
        provider={osm}
        height={800}
        width={850}
        defaultCenter={[53.4495, -7.503]}
        defaultZoom={7}
        onClick={handleMapClick}
        animate={true}
      >
        <div className="absolute top-4 right-4 flex gap-2">
          {!isDrawing ? (
            <button
              onClick={() => setIsDrawing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Start Drawing
            </button>
          ) : (
            <>
              <button
                onClick={completeDrawing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete
              </button>
              <button
                onClick={resetDrawing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reset
              </button>
            </>
          )}
        </div>
        <ZoomControl />
        {drawingPoints.map((point, index) => (
          <Marker key={index} width={20} anchor={point} color="#2563eb" />
        ))}
        <Marker width={50} anchor={[53.35014, -6.266155]} />
      </Map>
    </div>
  );
}
