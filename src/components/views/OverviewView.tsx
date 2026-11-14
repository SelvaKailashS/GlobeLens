"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GEOGRAPHIC_REGIONS } from "@/data/regions";
import { VARIABLES_LIST } from "@/data/variables";
import {
  Satellite,
  Compass,
  TrendingUp,
  MapPin,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Database,
  BarChart3,
} from "lucide-react";

interface OverviewViewProps {
  onExploreRegion: (regionId: string) => void;
  onExploreVariable: (variableId: any) => void;
  onGoToDashboard: () => void;
}

export function OverviewView({
  onExploreRegion,
  onExploreVariable,
  onGoToDashboard,
}: OverviewViewProps) {
  return (
    <div className="space-y-6">
      {/* Hero Mission Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-[#0a1329] to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="scientific" className="text-xs">
              NASA Space Apps Challenge 2024
            </Badge>
            <Badge variant="outline" className="text-xs text-slate-300">
              Earth Systems Detective
            </Badge>
            <Badge variant="warning" className="text-xs">
              Demonstration Platform
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            TerraTrend: Unlocking Earth System Dynamics
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            TerraTrend empowers researchers, students, and citizens to investigate global environmental trends, identify localized biophysical anomalies, and test whether historical changes across biomes are statistically significant or part of natural climate oscillations.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button onClick={onGoToDashboard} className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950 text-xs">
              Launch Interactive Detective Dashboard
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3 Core Workflow Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-[#0d1424]/90 p-5 space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-slate-100">1. Spatial Exploration (MapCN)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Navigate high-resolution vector and raster datasets via MapCN and MapLibre GL. Inspect study regions, regional boundaries, and layer overlays without vendor lock-in.
          </p>
        </Card>

        <Card className="border-slate-800 bg-[#0d1424]/90 p-5 space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-slate-100">2. Time-Series Trajectories (Recharts)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Plot multi-decadal historical observation points with confidence intervals, seasonal cycles, and anomaly departures across configurable dates and resolutions.
          </p>
        </Card>

        <Card className="border-slate-800 bg-[#0d1424]/90 p-5 space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-950 border border-purple-800/60 text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-sm text-slate-100">3. Non-Parametric Hypothesis Testing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run Mann-Kendall rank correlation tests and Sen&apos;s slope estimators to scientifically verify whether an environmental shift is statistically significant (p &lt; 0.05).
          </p>
        </Card>
      </div>

      {/* Featured Global Study Hotspots */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span>Monitored Global Study Hotspots</span>
          </h3>
          <span className="text-xs text-slate-500">8 Key Biomes Configured</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GEOGRAPHIC_REGIONS.map((region) => (
            <div
              key={region.id}
              onClick={() => {
                onExploreRegion(region.id);
                onGoToDashboard();
              }}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-[#0d1424]/80 p-3.5 hover:border-cyan-500/60 hover:bg-slate-900/90 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {region.category}
                </Badge>
                <span className="text-[10px] text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  Investigate →
                </span>
              </div>
              <h4 className="mt-2 text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                {region.name}
              </h4>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {region.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
