"use client";

import React from "react";
import { StatisticalSummary, EnvironmentalVariable } from "@/types/terratrend";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Gauge,
  Percent,
  Sparkles,
  Info,
} from "lucide-react";

interface StatisticsPanelProps {
  statistics: StatisticalSummary;
  variable: EnvironmentalVariable;
}

export function StatisticsPanel({ statistics, variable }: StatisticsPanelProps) {
  // Determine trend direction icon and badge styling
  const getDirectionElements = () => {
    switch (statistics.directionType) {
      case "increasing":
        return {
          icon: TrendingUp,
          colorClass: "text-rose-400",
          bgClass: "bg-rose-950/40 border-rose-800/40",
          badgeVariant: "destructive" as const,
        };
      case "decreasing":
        return {
          icon: TrendingDown,
          colorClass: "text-cyan-400",
          bgClass: "bg-cyan-950/40 border-cyan-800/40",
          badgeVariant: "default" as const,
        };
      case "stable":
      default:
        return {
          icon: Minus,
          colorClass: "text-amber-400",
          bgClass: "bg-amber-950/40 border-amber-800/40",
          badgeVariant: "warning" as const,
        };
    }
  };

  const dir = getDirectionElements();
  const DirectionIcon = dir.icon;

  return (
    <div className="space-y-3">
      {/* Prominent Demonstration Value Notice Header */}
      <div className="flex items-center justify-between rounded-lg border border-amber-900/50 bg-amber-950/40 px-3.5 py-2 text-xs text-amber-200/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-300">Demonstration Statistics:</strong> Synthesized metrics computed via rigorous non-parametric Mann-Kendall and Sen&apos;s slope formulations on sample historical series.
          </span>
        </div>
        <Badge variant="warning" className="text-[10px] hidden sm:inline-flex shrink-0 font-mono">
          Sample Output
        </Badge>
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Overall Trend Direction */}
        <Card className="border-slate-800 bg-[#0d1424]/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none" />
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Overall Trend
              </span>
              <DirectionIcon className={`h-4 w-4 ${dir.colorClass}`} />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2 mt-1">
              <span className={dir.colorClass}>{statistics.direction}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-slate-400 leading-snug">
              Monotonic direction across chosen timeframe relative to {statistics.baselinePeriod}.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Trajectory:</span>
              <span className="font-mono text-slate-300">{statistics.ratePerDecade}</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Rate of Change */}
        <Card className="border-slate-800 bg-[#0d1424]/90 relative overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Rate of Change
              </span>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <CardTitle className="text-xl font-bold font-mono tracking-tight text-cyan-300 mt-1">
              {statistics.rateOfChange}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-slate-400 leading-snug">
              {statistics.confidenceInterval}
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Sen&apos;s Slope Estimator:</span>
              <span className="font-mono text-slate-300">{statistics.senSlope} {variable.unit}/step</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Statistical Significance */}
        <Card className="border-slate-800 bg-[#0d1424]/90 relative overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Statistical Significance
              </span>
              {statistics.isSignificant ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <CardTitle className="text-base font-bold tracking-tight mt-1 flex items-center gap-1.5">
              <Badge variant={statistics.isSignificant ? "success" : "warning"} className="text-[11px]">
                {statistics.isSignificant ? "p < 0.05 (Significant)" : "p ≥ 0.05 (Inconclusive)"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-slate-400 leading-snug">
              Mann-Kendall Rank Test (Z = {statistics.mannKendallZ}, S = {statistics.mannKendallS}).
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Null Hypothesis (H₀):</span>
              <span className="font-mono text-slate-300">
                {statistics.isSignificant ? "Rejected (p < 0.05)" : "Retained"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Data Coverage */}
        <Card className="border-slate-800 bg-[#0d1424]/90 relative overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Data Coverage
              </span>
              <Gauge className="h-4 w-4 text-emerald-400" />
            </div>
            <CardTitle className="text-xl font-bold font-mono tracking-tight text-emerald-300 mt-1">
              {statistics.dataCoveragePercent}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-[11px] text-slate-400 leading-snug">
              {statistics.validObservations.toLocaleString()} of {statistics.totalPoints.toLocaleString()} points valid.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Quality Rating:</span>
              <span className="font-mono text-emerald-400">High Completeness</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
