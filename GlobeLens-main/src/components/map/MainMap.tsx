"use client";

import React, { useState } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MarkerPopup,
  MapGeoJSON,
} from "@/components/ui/map";
import { MapViewController } from "@/components/map/MapViewController";
import {
  EnvironmentalVariable,
  EnvironmentalVariableId,
  GeographicRegion,
} from "@/types/terratrend";
import { GEOGRAPHIC_REGIONS } from "@/data/regions";
import { ENVIRONMENTAL_VARIABLES, VARIABLES_LIST } from "@/data/variables";
import { NASA_GIBS_TILE_LAYERS } from "@/services/nasa-earthdata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Thermometer,
  CloudRain,
  Trees,
  Wind,
  Info,
  Compass,
  RotateCcw,
  Maximize2,
  Radio,
  ExternalLink,
} from "lucide-react";

interface MainMapProps {
  selectedRegion: GeographicRegion;
  onSelectRegion: (regionId: string) => void;
  selectedVariableId: EnvironmentalVariableId;
  onSelectVariable: (variableId: EnvironmentalVariableId) => void;
  className?: string;
}

export function MainMap({
  selectedRegion,
  onSelectRegion,
  selectedVariableId,
  onSelectVariable,
  className = "h-[480px] w-full",
}: MainMapProps) {
  const [showSimulatedRasterMesh, setShowSimulatedRasterMesh] = useState(false);
  const activeVariable: EnvironmentalVariable = ENVIRONMENTAL_VARIABLES[selectedVariableId];
  const gibsConfig = NASA_GIBS_TILE_LAYERS[selectedVariableId];

  // Helper icons for variables
  const getVariableIcon = (id: EnvironmentalVariableId) => {
    switch (id) {
      case "temperature":
        return Thermometer;
      case "precipitation":
        return CloudRain;
      case "vegetation":
        return Trees;
      case "air_quality":
        return Wind;
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl ${className}`}>
      {/* Interactive MapCN Map wrapper */}
      <Map
        center={[selectedRegion.coordinates.lng, selectedRegion.coordinates.lat]}
        zoom={selectedRegion.defaultZoom}
        className="h-full w-full"
      >
        {/* Cinematic smooth view fly-to controller */}
        <MapViewController selectedRegion={selectedRegion} />

        {/* Standard Map Controls (Zoom, Compass, Fullscreen) */}
        <MapControls position="top-right" showZoom showCompass showFullscreen />

        {/* Selected Region GeoJSON Boundary Polygon */}
        <MapGeoJSON
          id={`region-boundary-${selectedRegion.id}`}
          data={selectedRegion.boundaryGeoJson}
          fillPaint={{
            "fill-color": activeVariable.color,
            "fill-opacity": 0.22,
          }}
          linePaint={{
            "line-color": activeVariable.color,
            "line-width": 2.5,
            "line-dasharray": [2, 1],
          }}
        />

        {/* Markers for all 8 study regions across the globe */}
        {GEOGRAPHIC_REGIONS.map((region) => {
          const isSelected = region.id === selectedRegion.id;
          return (
            <MapMarker
              key={region.id}
              longitude={region.coordinates.lng}
              latitude={region.coordinates.lat}
              onClick={() => onSelectRegion(region.id)}
            >
              <MarkerContent>
                <div
                  className={`group relative flex h-7 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-lg transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 font-semibold ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950 scale-105"
                      : "bg-slate-900/90 text-slate-200 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: isSelected ? "#080c14" : activeVariable.color,
                    }}
                  />
                  <span className="text-[11px] whitespace-nowrap">{region.name}</span>
                </div>
              </MarkerContent>

              <MarkerTooltip>
                <div className="rounded-md border border-slate-700 bg-slate-900/95 p-2 text-slate-100 shadow-xl backdrop-blur-md">
                  <div className="font-semibold text-xs text-cyan-300">{region.name}</div>
                  <div className="text-[10px] text-slate-400">{region.location}</div>
                  <div className="mt-1 text-[10px] text-slate-300">
                    Category: <span className="font-medium text-slate-100">{region.category}</span>
                  </div>
                  <div className="text-[9px] text-cyan-400/90 mt-1">Click to investigate region</div>
                </div>
              </MarkerTooltip>

              <MarkerPopup>
                <div className="p-3 text-slate-200 max-w-xs bg-slate-900 rounded-lg border border-slate-700 shadow-2xl">
                  <h4 className="font-semibold text-xs text-cyan-300">{region.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{region.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Area:</span>
                      <span className="text-slate-300 font-mono">{region.areaKm2.toLocaleString("en-US")} km²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Phenomena:</span>
                      <span className="text-slate-300 text-right truncate max-w-[150px]">{region.targetPhenomena}</span>
                    </div>
                  </div>
                </div>
              </MarkerPopup>
            </MapMarker>
          );
        })}
      </Map>

      {/* Top Floating Controls: Environmental Layer Selector */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-800/90 bg-slate-950/85 p-1.5 shadow-xl backdrop-blur-md">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Layers className="h-3 w-3 text-cyan-400" />
          Layer:
        </span>
        {VARIABLES_LIST.map((variable) => {
          const Icon = getVariableIcon(variable.id);
          const isSelected = variable.id === selectedVariableId;
          return (
            <button
              key={variable.id}
              onClick={() => onSelectVariable(variable.id)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-slate-800 text-cyan-300 border border-cyan-500/60 shadow-sm"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <Icon
                className="h-3.5 w-3.5"
                style={{ color: isSelected ? variable.color : undefined }}
              />
              <span>{variable.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Top Center: Demonstration Layer Disclaimer Badge */}
      <div className="absolute right-14 top-3 z-10 hidden sm:flex items-center gap-1.5 rounded-md border border-amber-900/60 bg-amber-950/80 px-2.5 py-1 text-[11px] text-amber-300 shadow-md backdrop-blur-md">
        <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="font-medium">Demonstration Layer:</span>
        <span className="text-amber-200/90 truncate max-w-[200px] md:max-w-none">
          Sample {activeVariable.shortName} spatial anomalies
        </span>
      </div>

      {/* Bottom Left: Scientific Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 w-72 rounded-lg border border-slate-800/90 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">{activeVariable.name}</span>
          <span className="font-mono text-[10px] text-cyan-400">{activeVariable.unit}</span>
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">
          Sensor: <span className="text-slate-300">{activeVariable.sensor}</span>
        </p>

        {/* Colormap Bar */}
        <div className="mt-2.5 space-y-1">
          <div
            className="h-2.5 w-full rounded-sm"
            style={{
              background: `linear-gradient(to right, ${activeVariable.colorScale.min}, ${activeVariable.colorScale.mid}, ${activeVariable.colorScale.max})`,
            }}
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>{activeVariable.colorScale.labelMin}</span>
            <span>{activeVariable.colorScale.labelMid}</span>
            <span>{activeVariable.colorScale.labelMax}</span>
          </div>
        </div>

        {/* Active Region Coordinate HUD */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-mono">
            {selectedRegion.coordinates.lat >= 0 ? `${selectedRegion.coordinates.lat.toFixed(2)}°N` : `${Math.abs(selectedRegion.coordinates.lat).toFixed(2)}°S`},{" "}
            {selectedRegion.coordinates.lng >= 0 ? `${selectedRegion.coordinates.lng.toFixed(2)}°E` : `${Math.abs(selectedRegion.coordinates.lng).toFixed(2)}°W`}
          </span>
          <span className="text-slate-500">Zoom: {selectedRegion.defaultZoom}x</span>
        </div>
      </div>

      {/* Bottom Right: Future NASA GIBS Raster Tile Simulator Toggle */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-1.5">
        <button
          onClick={() => setShowSimulatedRasterMesh(!showSimulatedRasterMesh)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium shadow-lg backdrop-blur-md transition-all ${
            showSimulatedRasterMesh
              ? "border-cyan-500 bg-cyan-950/90 text-cyan-200 shadow-cyan-950"
              : "border-slate-800 bg-slate-950/85 text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
          title="Toggle NASA GIBS Web Mercator (EPSG:3857) raster overlay architecture preview"
        >
          <Radio className={`h-3.5 w-3.5 ${showSimulatedRasterMesh ? "text-cyan-400 animate-pulse" : ""}`} />
          <span>NASA GIBS Raster Blueprint</span>
          <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
            EPSG:3857
          </Badge>
        </button>

        {showSimulatedRasterMesh && (
          <div className="w-80 rounded-lg border border-cyan-800/80 bg-slate-950/95 p-3 text-[11px] text-slate-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between font-semibold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-cyan-400" />
                NASA GIBS Tile Pipeline
              </span>
              <Badge variant="scientific" className="text-[9px]">Ready</Badge>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 leading-snug">
              Architecture configured to overlay live NASA WMTS raster tiles into MapLibre GL.
            </p>
            <div className="mt-2 space-y-1 font-mono text-[9px] bg-slate-900/90 p-2 rounded border border-slate-800 text-slate-300 break-all">
              <div className="text-cyan-400">Layer: {gibsConfig.layerIdentifier}</div>
              <div className="text-slate-400">MatrixSet: {gibsConfig.tileMatrixSet}</div>
              <div className="text-slate-500 truncate">Template: {gibsConfig.wmtsTemplateUrl}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
