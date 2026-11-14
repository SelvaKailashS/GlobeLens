"use client";

import React, { useState, useEffect } from "react";
import {
  GitCompare,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Sparkles,
  Download,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GEOGRAPHIC_REGIONS } from "@/data/regions";
import { ENVIRONMENTAL_VARIABLES } from "@/data/variables";
import { apiClient, ApiRegionalComparisonResponse } from "@/services/apiClient";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

export function RegionalComparisonView() {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([
    "coimbatore",
    "chennai",
    "madurai",
  ]);
  const [datasetId, setDatasetId] = useState<string>("modis_terra_aqua");
  const [variableId, setVariableId] = useState<string>("ndvi");
  const [startDate, setStartDate] = useState<string>("2020-01-01");
  const [endDate, setEndDate] = useState<string>("2023-12-31");
  const [alpha, setAlpha] = useState<number>(0.05);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ApiRegionalComparisonResponse | null>(null);

  // Trigger comparison calculation
  const executeComparison = async () => {
    if (selectedRegions.length < 2) {
      setError("Please select at least 2 study regions to compare.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.compareRegions({
        region_ids: selectedRegions,
        dataset_id: datasetId,
        variable_id: variableId,
        start_date: startDate,
        end_date: endDate,
        alpha: alpha,
      });
      setComparisonResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute regional trend comparison.");
    } finally {
      setLoading(false);
    }
  };

  // Run on initial mount
  useEffect(() => {
    executeComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRegion = (regionId: string) => {
    if (selectedRegions.includes(regionId)) {
      if (selectedRegions.length <= 2) return; // Keep at least 2
      setSelectedRegions(selectedRegions.filter((id) => id !== regionId));
    } else {
      if (selectedRegions.length >= 5) return; // Max 5
      setSelectedRegions([...selectedRegions, regionId]);
    }
  };

  // Preset region bundles
  const loadPresetBundle = (regions: string[]) => {
    setSelectedRegions(regions);
  };

  // Format chart data for slopes
  const slopeChartData = comparisonResult?.regions.map((r) => ({
    name: r.region_name.split(" ")[0], // First word for compact display
    fullName: r.region_name,
    slopePerDecade: Number(r.sens_slope_per_decade.toFixed(4)),
    isSignificant: r.is_significant,
    tau: r.mann_kendall_tau,
    pVal: r.mann_kendall_p_value,
  })) || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="rounded-xl border border-cyan-900/40 bg-gradient-to-r from-[#0c182c] via-[#0b1322] to-[#090e18] p-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <GitCompare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Regional Trend Detective & Comparative Analysis
                </h1>
                <Badge variant="scientific" className="border-cyan-500/40 text-cyan-300">
                  Milestone 9
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare environmental trends side-by-side across distinct geographical biomes and urban microclimates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={executeComparison}
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4 py-2 gap-2 shadow-lg shadow-cyan-950"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Calculating Statistics..." : "Run Comparison"}
            </Button>
          </div>
        </div>

        {/* Preset Quick Bundles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => loadPresetBundle(["coimbatore", "chennai", "madurai"])}
            className="rounded-full bg-slate-800/70 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/50 px-2.5 py-1 text-[11px] text-slate-300 transition-colors"
          >
            Tamil Nadu Trio (Coimbatore vs Chennai vs Madurai)
          </button>
          <button
            type="button"
            onClick={() => loadPresetBundle(["amazon-basin", "sahel-belt", "greenland-ice"])}
            className="rounded-full bg-slate-800/70 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/50 px-2.5 py-1 text-[11px] text-slate-300 transition-colors"
          >
            Global Climatic Triad (Amazon vs Sahel vs Greenland)
          </button>
          <button
            type="button"
            onClick={() => loadPresetBundle(["arctic-archipelago", "tibetan-plateau"])}
            className="rounded-full bg-slate-800/70 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/50 px-2.5 py-1 text-[11px] text-slate-300 transition-colors"
          >
            Cryospheric Third Pole vs Arctic
          </button>
        </div>
      </div>

      {/* Control Filters */}
      <Card className="border-slate-800 bg-[#0d1424]/90">
        <CardHeader className="pb-3 pt-4 px-5 border-b border-slate-800/60">
          <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            Comparison Controls & Selected Study Regions (2 to 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {/* Region Chips Selector */}
          <div>
            <div className="text-xs text-slate-400 mb-2 font-medium">
              Select Regions to Compare (Click to toggle):
            </div>
            <div className="flex flex-wrap gap-2">
              {GEOGRAPHIC_REGIONS.map((r) => {
                const isSelected = selectedRegions.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRegion(r.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm shadow-cyan-950"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSelected ? "bg-cyan-400" : "bg-slate-600"
                      }`}
                    />
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dataset & Variable & Temporal Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800/60">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                NASA Product / Dataset
              </label>
              <select
                value={datasetId}
                onChange={(e) => {
                  setDatasetId(e.target.value);
                  if (e.target.value === "modis_terra_aqua") setVariableId("ndvi");
                  else if (e.target.value === "gpm_imerg") setVariableId("precipitation");
                  else if (e.target.value === "merra2_reanalysis") setVariableId("t2m");
                  else if (e.target.value === "omi_aura") setVariableId("columnamounto3");
                }}
                className="w-full rounded-md border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="modis_terra_aqua">MODIS Terra/Aqua (NDVI / LST)</option>
                <option value="gpm_imerg">GPM IMERG (Precipitation)</option>
                <option value="merra2_reanalysis">MERRA-2 (2m Temperature)</option>
                <option value="omi_aura">OMI Aura (Total Ozone)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Observation Variable
              </label>
              <select
                value={variableId}
                onChange={(e) => setVariableId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {datasetId === "modis_terra_aqua" && (
                  <>
                    <option value="ndvi">NDVI (Vegetation Index)</option>
                    <option value="lst">LST (Land Surface Temp)</option>
                  </>
                )}
                {datasetId === "gpm_imerg" && (
                  <option value="precipitation">Precipitation Rate (mm/hr)</option>
                )}
                {datasetId === "merra2_reanalysis" && (
                  <option value="t2m">2-Meter Air Temperature (Kelvin)</option>
                )}
                {datasetId === "omi_aura" && (
                  <option value="columnamounto3">Total Column Ozone (Dobson Units)</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-medium">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-4 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* Comparative Plain-Language Synthesis Card */}
          <Card className="border-cyan-900/50 bg-[#0c182c]/90">
            <CardHeader className="pb-2 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Comparative Scientific Synthesis
                </CardTitle>
                <Badge variant="outline" className="border-cyan-700 text-cyan-300 text-[10px]">
                  Dynamically Computed
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4 text-xs text-slate-200 leading-relaxed space-y-3">
              <p>{comparisonResult.comparative_synthesis}</p>

              {/* Pairwise Correlation Pills */}
              {Object.keys(comparisonResult.pairwise_correlations).length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px] font-medium">
                    Pairwise Temporal Coherence:
                  </span>
                  {Object.entries(comparisonResult.pairwise_correlations).map(([pair, r]) => (
                    <span
                      key={pair}
                      className="rounded bg-slate-800/80 border border-slate-700 px-2 py-0.5 text-[11px] font-mono text-cyan-200"
                    >
                      {pair.replace("_vs_", " ↔ ")}: <strong className="text-cyan-400">{r > 0 ? `+${r}` : r}</strong>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side-by-Side Regional Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonResult.regions.map((region) => (
              <Card
                key={region.region_id}
                className="border-slate-800 bg-[#0d1424]/90 flex flex-col justify-between"
              >
                <CardHeader className="pb-3 pt-4 px-4 border-b border-slate-800/60">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-100">
                        {region.region_name}
                      </CardTitle>
                      <CardDescription className="text-[11px] text-slate-400">
                        Category: {region.category}
                      </CardDescription>
                    </div>
                    {region.is_demonstration_data ? (
                      <Badge variant="outline" className="border-amber-700 text-amber-300 text-[9px]">
                        DEMO / SYNTHETIC
                      </Badge>
                    ) : (
                      <Badge variant="scientific" className="text-[9px]">
                        LIVE NASA DATA
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs flex-1">
                  {/* Slope metric */}
                  <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      Sen&apos;s Slope (Rate of Change)
                    </div>
                    <div className="text-base font-bold text-slate-100 font-mono flex items-baseline gap-1.5">
                      <span className={region.sens_slope_per_decade >= 0 ? "text-emerald-400" : "text-amber-400"}>
                        {region.sens_slope_per_decade >= 0 ? "+" : ""}
                        {region.sens_slope_per_decade.toFixed(4)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {comparisonResult.original_units}/decade
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      95% CI: [{region.confidence_interval_95[0].toFixed(4)}, {region.confidence_interval_95[1].toFixed(4)}]
                    </div>
                  </div>

                  {/* Significance and MK tau */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded bg-slate-900/60 p-2 border border-slate-800/70">
                      <div className="text-slate-400 text-[10px]">Mann-Kendall Tau</div>
                      <div className="font-mono font-semibold text-slate-200 mt-0.5">
                        {region.mann_kendall_tau >= 0 ? "+" : ""}
                        {region.mann_kendall_tau.toFixed(3)}
                      </div>
                    </div>
                    <div className="rounded bg-slate-900/60 p-2 border border-slate-800/70">
                      <div className="text-slate-400 text-[10px]">P-Value (α=0.05)</div>
                      <div className="font-mono font-semibold text-slate-200 mt-0.5">
                        {region.mann_kendall_p_value.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* Trend status badge */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 text-[11px]">Trend Classification:</span>
                    <Badge
                      className={`text-[10px] ${
                        region.is_significant
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {region.trend_direction}
                    </Badge>
                  </div>

                  {/* Pettitt break point */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Structural Break Point:</span>
                    <span className="font-mono text-slate-300">
                      {region.pettitt_has_break && region.pettitt_break_date
                        ? region.pettitt_break_date
                        : "None detected"}
                    </span>
                  </div>

                  {/* Data coverage */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Data Coverage:</span>
                    <span className="font-mono text-cyan-300">
                      {(region.coverage_fraction * 100).toFixed(1)}% ({region.valid_observations}/{region.total_observations})
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparative Slope Chart */}
          <Card className="border-slate-800 bg-[#0d1424]/90">
            <CardHeader className="pb-2 pt-4 px-5 border-b border-slate-800/60">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Decadal Rate of Change Comparison ({comparisonResult.original_units}/decade)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slopeChartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-2.5 shadow-xl text-xs space-y-1">
                              <p className="font-semibold text-slate-200">{data.fullName}</p>
                              <p className="font-mono text-cyan-400">
                                Slope: {data.slopePerDecade} {comparisonResult.original_units}/decade
                              </p>
                              <p className="text-slate-400 text-[10px]">
                                Kendall&apos;s Tau: {data.tau} | P-Value: {data.pVal}
                              </p>
                              <p className="text-[10px] text-slate-300">
                                {data.isSignificant ? "✓ Statistically Significant" : "✗ Not Statistically Significant"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="slopePerDecade" radius={[4, 4, 0, 0]}>
                      {slopeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.slopePerDecade >= 0 ? "#10b981" : "#f59e0b"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Scientific Caveats & Limitations */}
          {comparisonResult.scientific_cautions.length > 0 && (
            <Card className="border-slate-800 bg-[#0d1424]/90">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-cyan-400" />
                  Comparative Methodology Limitations & Caveats
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                  {comparisonResult.scientific_cautions.map((caveat, idx) => (
                    <li key={idx}>{caveat}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
