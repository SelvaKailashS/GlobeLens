"use client";

import React from "react";
import {
  EnvironmentalVariableId,
  InvestigationConfig,
} from "@/types/terratrend";
import { GEOGRAPHIC_REGIONS } from "@/data/regions";
import { VARIABLES_LIST } from "@/data/variables";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Calendar,
  MapPin,
  Layers,
  Sparkles,
  Loader2,
  Clock,
} from "lucide-react";

interface InvestigationControlsProps {
  config: InvestigationConfig;
  onChangeConfig: (newConfig: Partial<InvestigationConfig>) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onReset: () => void;
}

export function InvestigationControls({
  config,
  onChangeConfig,
  onAnalyze,
  isAnalyzing,
  onReset,
}: InvestigationControlsProps) {
  return (
    <Card className="border-slate-800 bg-[#0d1424]/90 shadow-xl backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-sm font-semibold text-slate-100">
              Investigation Parameters
            </CardTitle>
          </div>
          <Badge variant="scientific" className="text-[10px]">
            Analysis Engine v1.0
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Environmental Variable Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Environmental Variable</span>
            </label>
            <select
              value={config.variableId}
              onChange={(e) =>
                onChangeConfig({
                  variableId: e.target.value as EnvironmentalVariableId,
                })
              }
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
            >
              {VARIABLES_LIST.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.unit})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Geographic Region Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span>Geographic Region</span>
            </label>
            <select
              value={config.regionId}
              onChange={(e) => onChangeConfig({ regionId: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
            >
              {GEOGRAPHIC_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.category})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>Start Date</span>
            </label>
            <input
              type="date"
              value={config.startDate}
              min="2000-01-01"
              max={config.endDate}
              onChange={(e) => onChangeConfig({ startDate: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
            />
          </div>

          {/* 4. End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>End Date</span>
            </label>
            <input
              type="date"
              value={config.endDate}
              min={config.startDate}
              max="2024-12-31"
              onChange={(e) => onChangeConfig({ endDate: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
            />
          </div>

          {/* 5. Temporal Resolution Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Temporal Resolution</span>
            </label>
            <div className="flex h-9 rounded-lg border border-slate-700 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => onChangeConfig({ resolution: "daily" })}
                className={`flex-1 rounded-md text-xs font-medium transition-all ${
                  config.resolution === "daily"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ resolution: "monthly" })}
                className={`flex-1 rounded-md text-xs font-medium transition-all ${
                  config.resolution === "monthly"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons & Quick Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500">Quick Ranges:</span>
            <button
              onClick={() => onChangeConfig({ startDate: "2019-01-01", endDate: "2024-12-31" })}
              className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-cyan-300 transition-colors"
            >
              Recent 5Y
            </button>
            <button
              onClick={() => onChangeConfig({ startDate: "2014-01-01", endDate: "2024-12-31" })}
              className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-cyan-300 transition-colors"
            >
              Decadal 10Y
            </button>
            <button
              onClick={() => onChangeConfig({ startDate: "2000-01-01", endDate: "2024-12-31" })}
              className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-cyan-300 transition-colors"
            >
              Full Record (2000–2024)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-md shadow-cyan-950 px-5 text-xs h-9"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Computing Statistics...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current mr-1.5" />
                  Analyze Trends
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
