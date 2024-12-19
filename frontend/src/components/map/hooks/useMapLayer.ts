import { useState, useEffect } from "react";

export function useMapLayers(mapRef: React.RefObject<maplibregl.Map | null>) {
    const [showPower, setShowPower] = useState(false);
    const [showSubstation, setShowSubstation] = useState(false);
  
    useEffect(() => {
      if (!mapRef.current?.isStyleLoaded()) return;
      
      mapRef.current?.setLayoutProperty(
        "power-lines",
        "visibility",
        showPower ? "visible" : "none"
      );
      mapRef.current?.setLayoutProperty(
        "substations",
        "visibility",
        showSubstation ? "visible" : "none"
      );
    }, [showPower, showSubstation]);
  
    return { showPower, showSubstation, setShowPower, setShowSubstation };
  }