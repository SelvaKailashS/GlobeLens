"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvestigationConfig, SavedInvestigation } from "@/types/terratrend";
import {
  BookmarkCheck,
  Play,
  Calendar,
  MapPin,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface SavedInvestigationsViewProps {
  onLoadInvestigation: (config: InvestigationConfig) => void;
}

const PRESET_INVESTIGATIONS: SavedInvestigation[] = [
  {
    id: "inv-amazon-drought",
    title: "Amazonian Thermal Stress & Evaporative Drought Anomaly",
    regionName: "Amazon Rainforest Basin",
    variableName: "Land Surface Temperature Anomaly",
    dateRange: "2015-01-01 to 2024-12-31",
    keyFinding: "Accelerating thermal anomalies with recurrent dry season drought pulses during 2016 and 2023 El Niño events.",
    significance: "Statistically Significant (p < 0.001, Z = 4.12)",
    createdAt: "2024-10-12",
    config: {
      variableId: "temperature",
      regionId: "amazon-basin",
      startDate: "2015-01-01",
      endDate: "2024-12-31",
      resolution: "monthly",
    },
  },
  {
    id: "inv-greenland-melt",
    title: "Greenland Ice Sheet Cryospheric Warming Velocity",
    regionName: "Greenland Ice Sheet (Interior & Margin)",
    variableName: "Land Surface Temperature Anomaly",
    dateRange: "2000-01-01 to 2024-12-31",
    keyFinding: "Rapid surface warming (+0.58 °C / decade) expanding the summer ablation margin and driving albedo loss.",
    significance: "Statistically Significant (p < 0.001, Z = 5.28)",
    createdAt: "2024-10-14",
    config: {
      variableId: "temperature",
      regionId: "greenland-ice",
      startDate: "2000-01-01",
      endDate: "2024-12-31",
      resolution: "monthly",
    },
  },
  {
    id: "inv-sahel-greening",
    title: "Sahel Belt Post-Drought Greening Dynamics",
    regionName: "Sahel Transition Belt",
    variableName: "Normalized Difference Vegetation Index",
    dateRange: "2005-01-01 to 2024-12-31",
    keyFinding: "Monsoonal intensification driving positive vegetative canopy recovery across the central semi-arid corridor.",
    significance: "Statistically Significant (p = 0.004, Z = 2.87)",
    createdAt: "2024-10-15",
    config: {
      variableId: "vegetation",
      regionId: "sahel-belt",
      startDate: "2005-01-01",
      endDate: "2024-12-31",
      resolution: "monthly",
    },
  },
  {
    id: "inv-colorado-megadrought",
    title: "Western US Colorado Basin Persistent Hydrologic Deficit",
    regionName: "Western US Colorado Basin",
    variableName: "Total Precipitation Deviation",
    dateRange: "2000-01-01 to 2023-12-31",
    keyFinding: "Persistent multidecadal precipitation deficit (-14.2 mm/decade) coupled with reduced snowpack runoff.",
    significance: "Statistically Significant (p = 0.012, Z = -2.52)",
    createdAt: "2024-10-16",
    config: {
      variableId: "precipitation",
      regionId: "western-us-basin",
      startDate: "2000-01-01",
      endDate: "2023-12-31",
      resolution: "monthly",
    },
  },
];

export function SavedInvestigationsView({
  onLoadInvestigation,
}: SavedInvestigationsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1424]/90 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Saved Scientific Investigations & Case Studies
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Review saved Earth Systems Trend Detective investigation templates. Load a pre-configured investigation directly into the active dashboard to inspect spatial patterns, evaluate statistical hypotheses, and review diagnostic findings.
        </p>
      </div>

      {/* Grid of Saved Investigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESET_INVESTIGATIONS.map((inv) => (
          <Card
            key={inv.id}
            className="border-slate-800 bg-slate-900/80 p-5 space-y-4 hover:border-cyan-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="scientific" className="text-[10px] mb-1.5">
                  Investigation Report
                </Badge>
                <h3 className="font-semibold text-sm text-slate-100 leading-snug">
                  {inv.title}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Study Region:</span>
                <span className="font-medium text-slate-200 truncate">{inv.regionName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">Variable:</span>
                <span className="font-medium text-cyan-300 truncate">{inv.variableName}</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[10px] text-slate-500">Date Range:</span>
                <span className="font-mono text-[11px] text-slate-300">{inv.dateRange}</span>
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[10px] text-slate-500">Significance:</span>
                <span className="text-[11px] font-medium text-emerald-400">{inv.significance}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Finding:</strong> {inv.keyFinding}
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Created: {inv.createdAt}</span>
              <Button
                size="sm"
                onClick={() => onLoadInvestigation(inv.config)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs gap-1.5"
              >
                <span>Load Investigation</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
