"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Satellite,
  Layers,
  Code2,
  Server,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { NASA_ENDPOINTS, NASA_GIBS_TILE_LAYERS } from "@/services/nasa-earthdata";
import { VARIABLES_LIST } from "@/data/variables";

export function DataSourcesView() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1424]/90 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">
            NASA Earth Science Data Sources & Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          TerraTrend is engineered for direct ingestion of NASA Earth Observing System Data and Information System (EOSDIS) products. The architecture integrates spatial tile streams (NASA GIBS), metadata discovery (NASA CMR), and a dedicated FastAPI statistical calculation microservice.
        </p>
      </div>

      {/* Integration Readiness Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Satellite className="h-4 w-4 text-cyan-400" />
          <span>Configured Satellite Missions & Sensors</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VARIABLES_LIST.map((v) => (
            <Card key={v.id} className="border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300">{v.name}</span>
                <Badge variant="scientific" className="text-[10px]">
                  {v.unit}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Sensor:</span>
                  <span className="text-slate-200 font-medium">{v.sensor}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Satellite Mission:</span>
                  <span className="text-slate-200 font-medium">{v.satellite}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Climatology Baseline:</span>
                  <span className="text-slate-400 font-mono text-[10px]">{v.baseline}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug border-t border-slate-800/80 pt-2">
                {v.description}
              </p>

              <div className="rounded bg-slate-950 p-2 text-[10px] font-mono text-cyan-400 border border-slate-800 break-all">
                GIBS Layer: {NASA_GIBS_TILE_LAYERS[v.id]?.layerIdentifier}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* NASA GIBS WMTS Architecture */}
      <Card className="border-slate-800 bg-[#0d1424]/90 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              NASA GIBS (Global Imagery Browse Services) Tile Pipeline
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-800/60">
            MapLibre GL Compatible
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          NASA GIBS provides full-resolution visual imagery from over 1,000 satellite layers using the OpenGIS Web Map Tile Service (WMTS) standard. MapLibre GL connects to these raster tiles using EPSG:3857 (Web Mercator) GoogleMapsCompatible tile matrix sets.
        </p>

        <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
          <div className="text-slate-500">// WMTS Tile Endpoint Blueprint Template</div>
          <div className="text-cyan-400 break-all">
            {NASA_ENDPOINTS.gibsWmtsBase}/[LAYER_ID]/default/[DATE]/GoogleMapsCompatible_Level8/&#123;z&#125;/&#123;y&#125;/&#123;x&#125;.png
          </div>
          <div className="text-slate-500 text-[10px] pt-1">
            Status: Endpoints mapped and schema-validated for seamless live switchover.
          </div>
        </div>
      </Card>

      {/* FastAPI Statistical Backend Contract */}
      <Card className="border-slate-800 bg-[#0d1424]/90 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              FastAPI / Python Statistical Computation Microservice
            </h3>
          </div>
          <Badge variant="scientific" className="text-[10px]">
            FastAPI Blueprint
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          For large raster extractions and intensive temporal calculations, TerraTrend connects to a Python FastAPI backend hosting Scipy, PyMannKendall, and Xarray:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-slate-300 space-y-1">
            <div className="text-purple-400 font-semibold">POST /api/v1/trend/mann-kendall</div>
            <div className="text-slate-400 text-[11px]">Inputs: GeoJSON, Variable, Date Range, Resolution</div>
            <div className="text-slate-500 text-[10px]">Returns: Tau, Z, p-value, Sen&apos;s slope, Confidence Intervals</div>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-slate-300 space-y-1">
            <div className="text-purple-400 font-semibold">GET /api/v1/raster/tiles/&#123;layer&#125;/&#123;z&#125;/&#123;x&#125;/&#123;y&#125;</div>
            <div className="text-slate-400 text-[11px]">Dynamic netCDF / GeoTIFF tile generation</div>
            <div className="text-slate-500 text-[10px]">Real-time spatial anomaly rendering for MapLibre GL</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
