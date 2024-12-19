import { useEffect } from "react";
import { Position } from "geojson";
import * as turf from "@turf/turf";
import { UseMapEventsProps } from "../types";
import { MaplibreMeasureControl } from "@watergis/maplibre-gl-terradraw";
import { LngLatLike } from "maplibre-gl";

type FeatureId = string | number;

export function useMapEvents({
  mapRef,
  setCoordinates,
  setCenter,
  setZoom,
  setPitch,
  setArea,
}: UseMapEventsProps) {
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
    setArea(area);
    const bbox = turf.bbox(polygon);
    let zoom;
    if (area < 10000) {
      // < 1 hectare
      zoom = 17;
    } else if (area < 100000) {
      // < 10 hectares
      zoom = 16;
    } else if (area < 500000) {
      // < 50 hectares
      zoom = 15;
    } else if (area < 1000000) {
      // < 100 hectares
      zoom = 14;
    } else if (area < 2000000) {
      // < 200 hectares
      zoom = 13;
    } else if (area < 5000000) {
      // < 500 hectares
      zoom = 13;
    } else if (area < 10000000) {
      // < 1000 hectares
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
    const map = mapRef.current;
    if (!map) return;

    const drawControl = new MaplibreMeasureControl({
      modes: ["polygon", "delete"],
      open: true,
    });

    map.addControl(drawControl, "top-left");
    const drawInstance = drawControl.getTerraDrawInstance();

    const handleFinish = (id: FeatureId) => {
      const snapshot = drawInstance?.getSnapshot();
      const feature = snapshot?.find((feature) => feature.id === id);

      if (
        feature?.geometry?.type === "Polygon" &&
        Array.isArray(feature.geometry.coordinates) &&
        feature.geometry.coordinates[0]
      ) {
        const currentCoords = feature.geometry.coordinates[0] as Position[];
        console.log(currentCoords);
        const viewParams = calculateViewParameters(currentCoords);

        setCoordinates(currentCoords);
        setCenter(viewParams.center as [number, number]);
        setZoom(viewParams.zoom);
        setPitch(viewParams.pitch);

        map.flyTo({
          center: viewParams.center as LngLatLike,
          zoom: viewParams.zoom,
          pitch: viewParams.pitch,
          bearing: viewParams.bearing,
          speed: 0.6,
          curve: 1.5,
          easing: (t) => t * (2 - t),
          essential: true,
        });
      } else {
        setCoordinates([]);
      }
    };

    if (drawInstance) {
      drawInstance.on("finish", handleFinish);
    }

    // Cleanup
    return () => {
      if (drawInstance) {
        drawInstance.off("finish", handleFinish);
      }
      map.removeControl(drawControl);
    };
  }, [mapRef, setCoordinates, setCenter, setZoom, setPitch, setArea]);
}
