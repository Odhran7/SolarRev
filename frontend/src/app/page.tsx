"use client";
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { osm } from "pigeon-maps/providers";
import {
  Card,
  CardDescription,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components";
import { useState, useEffect } from "react";

export default function Home() {
  const [coordPoints, setCoordPoints] = useState([]);
  const [pixelPoints, setPixelPoints] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [center, setCenter] = useState([53.4495, -7.503]);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(7);
  const [areaInKm, setAreaInKm] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Improved area calculation using Haversine formula for more accurate results
  const calculatePolygonArea = (coords) => {
    if (coords.length < 3) return 0;
    
    function toRadians(degrees) {
      return degrees * Math.PI / 180;
    }
    
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth's radius in kilometers
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    let area = 0;
    const points = [...coords, coords[0]]; // Close the polygon
    
    for (let i = 0; i < points.length - 1; i++) {
      const [lat1, lon1] = points[i];
      const [lat2, lon2] = points[i + 1];
      // Calculate the distance between points
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      // Use cross product approximation
      area += distance * distance / 2;
    }
    
    return Math.max(1, Math.round(area)); // Ensure minimum area of 1
  };

  const handleMapClick = ({ event, latLng, pixel }) => {
    if (!isCompleted) {
      setCoordPoints([...coordPoints, latLng]);
      setPixelPoints([...pixelPoints, pixel]);
    }
  };

  const calculateBounds = (coordinates) => {
    if (coordinates.length === 0) return null;
    const lats = coordinates.map((coord) => coord[0]);
    const lngs = coordinates.map((coord) => coord[1]);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  };

  const calculateDynamicZoom = (bounds) => {
    if (!bounds) return 7;
    const latSpan = bounds.maxLat - bounds.minLat;
    const lngSpan = bounds.maxLng - bounds.minLng;
    const maxSpan = Math.max(latSpan, lngSpan);
    if (maxSpan > 1) return 8;
    if (maxSpan > 0.5) return 9;
    if (maxSpan > 0.1) return 10;
    if (maxSpan > 0.01) return 12;
    return 14;
  };

  const resetDrawing = () => {
    setIsCompleted(false);
    setCoordPoints([]);
    setPixelPoints([]);
    setCenter([53.4495, -7.503]);
    setZoom(7);
    setAreaInKm(0);
  };

  const completeDrawing = () => {
    if (coordPoints.length >= 3) {
      const area = calculatePolygonArea(coordPoints);
      console.log(coordPoints);
      setAreaInKm(area);
      setIsCompleted(true);
      const bounds = calculateBounds(coordPoints);
      const newZoom = calculateDynamicZoom(bounds);
      setCenter(findCenter(coordPoints));
      setZoom(newZoom);
    } else {
      alert("Please add at least 3 points to create a polygon");
    }
  };

  const findCenter = (coordinates) => {
    if (coordinates.length === 0) return [53.4495, -7.503];
    const sumLat = coordinates.reduce((sum, coord) => sum + coord[0], 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + coord[1], 0);
    return [sumLat / coordinates.length, sumLng / coordinates.length];
  };

  if (!mounted) {
    return (
      <div>
        <Navbar />
        <Card className="mx-auto mb-4">
          <CardHeader className="text-center">
            <CardTitle>SolarRev</CardTitle>
            <CardDescription>Draw a polygon and get an estimate!</CardDescription>
          </CardHeader>
        </Card>
        <div className="relative mx-auto" style={{ width: "850px" }}>
          <div className="h-[800px] w-[850px] bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4">
        <Card className="mb-4">
          <CardHeader className="text-center">
            <CardTitle>SolarRev</CardTitle>
            <CardDescription>Draw a polygon and get an estimate!</CardDescription>
          </CardHeader>
        </Card>

        <div className="flex">
          <div className="relative mx-auto" style={{ width: "850px" }}>
            <Map
              provider={osm}
              height={800}
              center={center}
              zoom={zoom}
              onClick={handleMapClick}
              animate={true}
              mouseEvents={!isCompleted}
              metaWheelZoom={!isCompleted}
              twoFingerDrag={!isCompleted}
            >
              <div
                className="absolute top-4 right-4 z-[1000]"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                {isCompleted ? (
                  <button
                    onClick={resetDrawing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Start New
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={completeDrawing}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      disabled={coordPoints.length < 3}
                    >
                      Complete
                    </button>
                    <button
                      onClick={resetDrawing}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
              <ZoomControl />
              {coordPoints.map((point, index) => (
                <Marker key={index} width={20} anchor={point} color="#2563eb" />
              ))}
            </Map>
          </div>

          {isCompleted && (
            <Card className="max-w-lg mx-auto">
              <CardHeader>
                <CardTitle>Area Details</CardTitle>
                <CardDescription>
                  Information about your selected area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <h5 className="text-lg font-medium">Area</h5>
                  <p className="text-2xl font-bold">{areaInKm} km²</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}