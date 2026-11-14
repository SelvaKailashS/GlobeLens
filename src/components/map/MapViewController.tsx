"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";
import { GeographicRegion } from "@/types/terratrend";

interface MapViewControllerProps {
  selectedRegion: GeographicRegion;
}

export function MapViewController({ selectedRegion }: MapViewControllerProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    try {
      map.flyTo({
        center: [selectedRegion.coordinates.lng, selectedRegion.coordinates.lat],
        zoom: selectedRegion.defaultZoom,
        duration: 1600,
        essential: true,
      });
    } catch {
      // Gracefully handle unmounted map state
    }
  }, [map, isLoaded, selectedRegion]);

  return null;
}
