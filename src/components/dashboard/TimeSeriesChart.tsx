"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { TimeSeriesPoint, EnvironmentalVariable } from "@/types/terratrend";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Calendar,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Info,
  Sliders,
} from "lucide-react";

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  variable: EnvironmentalVariable;
  regionName: string;
}

export function TimeSeriesChart({ data, variable, regionName }: TimeSeriesChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [showConfidenceBounds, setShowConfidenceBounds] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"1y" | "5y" | "10y" | "all">("all");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter points according to selected time range preset
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeFilter === "all") return data;

    const lastTimestamp = data[data.length - 1].timestamp;
    let cutoffYears = 5;
    if (timeFilter === "1y") cutoffYears = 1;
    if (timeFilter === "5y") cutoffYears = 5;
    if (timeFilter === "10y") cutoffYears = 10;

    const cutoffTimestamp = lastTimestamp - cutoffYears * 365.25 * 24 * 60 * 60 * 1000;
    return data.filter((d) => d.timestamp >= cutoffTimestamp);
  }, [data, timeFilter]);

  // Compute nice Y-domain
  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return [-1, 1];
    let min = Infinity;
    let max = -Infinity;
    filteredData.forEach((d) => {
      if (d.observed < min) min = d.observed;
      if (d.observed > max) max = d.observed;
      if (d.upperConfidence > max) max = d.upperConfidence;
      if (d.lowerConfidence < min) min = d.lowerConfidence;
    });
    const padding = (max - min) * 0.1 || 0.5;
    return [Math.floor((min - padding) * 10) / 10, Math.ceil((max + padding) * 10) / 10];
  }, [filteredData]);

  // Format date ticks for clean readability
  const formatTick = (tickStr: string) => {
    if (!tickStr) return "";
    const parts = tickStr.split("-");
    if (parts.length < 2) return tickStr;
    const year = parts[0];
    const month = parts[1];
    if (timeFilter === "1y") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;
    }
    return `${year}-${month}`;
  };

  return (
    <Card className="border-slate-800 bg-[#0d1424]/90 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <CardTitle className="text-sm font-semibold text-slate-100">
                Historical Time-Series & Trend Analysis
              </CardTitle>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {variable.name} ({variable.unit}) across {regionName} • Baseline: {variable.baseline}
            </p>
          </div>

          {/* Demonstration Notice Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-[10px]">
              Demonstration Time-Series
            </Badge>
          </div>
        </div>

        {/* Toolbar: Time Range Presets & Overlays */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
          {/* Time range buttons */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-0.5">
            <button
              onClick={() => setTimeFilter("1y")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                timeFilter === "1y" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              1 Year
            </button>
            <button
              onClick={() => setTimeFilter("5y")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                timeFilter === "5y" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              5 Years
            </button>
            <button
              onClick={() => setTimeFilter("10y")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                timeFilter === "10y" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              10 Years
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                timeFilter === "all" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Full Series
            </button>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTrendLine(!showTrendLine)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                showTrendLine
                  ? "border-cyan-500/60 bg-cyan-950/40 text-cyan-300"
                  : "border-slate-800 bg-slate-900 text-slate-500"
              }`}
            >
              {showTrendLine ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              <span>Trend Line</span>
            </button>

            <button
              onClick={() => setShowConfidenceBounds(!showConfidenceBounds)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                showConfidenceBounds
                  ? "border-slate-700 bg-slate-800 text-slate-300"
                  : "border-slate-800 bg-slate-900 text-slate-500"
              }`}
            >
              {showConfidenceBounds ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              <span>95% Confidence Band</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Recharts Container */}
        <div className="h-80 w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filteredData}
                margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={variable.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={variable.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={45}
                />

                <YAxis
                  domain={yDomain}
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${val}`}
                  label={{
                    value: variable.unit,
                    angle: -90,
                    position: "insideLeft",
                    fill: "#64748b",
                    fontSize: 10,
                    offset: 12,
                  }}
                />

                <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload as TimeSeriesPoint;
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[210px]">
                        <div className="flex items-center justify-between font-mono text-slate-400 pb-1 border-b border-slate-800 text-[11px]">
                          <span>{d.date}</span>
                          <span className="text-[10px] text-cyan-400">Sample Observation</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Observed Value:</span>
                          <span className="font-mono font-semibold" style={{ color: variable.color }}>
                            {d.observed.toFixed(3)} {variable.unit}
                          </span>
                        </div>
                        {showTrendLine && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Trend Projection:</span>
                            <span className="font-mono text-cyan-300">
                              {d.trend.toFixed(3)} {variable.unit}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                          <span className="text-slate-500">Anomaly Deviation:</span>
                          <span className={`font-mono ${d.anomaly >= 0 ? "text-rose-400" : "text-cyan-400"}`}>
                            {d.anomaly >= 0 ? `+${d.anomaly.toFixed(3)}` : d.anomaly.toFixed(3)} {variable.unit}
                          </span>
                        </div>
                        {d.isInterpolated && (
                          <div className="text-[10px] text-amber-400 italic">
                            * Cloud cover interpolated composite
                          </div>
                        )}
                      </div>
                    );
                  }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  height={24}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
                />

                {/* 95% Confidence Interval Band */}
                {showConfidenceBounds && (
                  <Area
                    type="monotone"
                    dataKey="upperConfidence"
                    stroke="none"
                    fill="url(#confidenceBand)"
                    name="95% Confidence Bound"
                  />
                )}

                {/* Actual Historical Synthesized Observations */}
                <Line
                  type="monotone"
                  dataKey="observed"
                  stroke={variable.color}
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#080c14", strokeWidth: 2, fill: variable.color }}
                  name={`Observed ${variable.shortName}`}
                />

                {/* Non-parametric Trend Line */}
                {showTrendLine && (
                  <Line
                    type="linear"
                    dataKey="trend"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    name="Mann-Kendall / Sen's Slope Trend"
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
              Loading chart visualization...
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-cyan-400" />
            <span>X-Axis: Observation Date • Y-Axis: {variable.unit}</span>
          </div>
          <span>Modeled on NASA Earth Observations • For demonstration purposes</span>
        </div>
      </CardContent>
    </Card>
  );
}
