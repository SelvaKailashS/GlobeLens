"use client";

import React, { useState, useTransition } from "react";
import { Sidebar, ActiveTab } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MainMap } from "@/components/map/MainMap";
import { InvestigationControls } from "@/components/dashboard/InvestigationControls";
import { StatisticsPanel } from "@/components/dashboard/StatisticsPanel";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import { ScientificInterpretationPanel } from "@/components/dashboard/ScientificInterpretationPanel";
import { OverviewView } from "@/components/views/OverviewView";
import { DataSourcesView } from "@/components/views/DataSourcesView";
import { SavedInvestigationsView } from "@/components/views/SavedInvestigationsView";
import { SettingsView } from "@/components/views/SettingsView";
import { RegionalComparisonView } from "@/components/views/RegionalComparisonView";
import { GuidedWorkflowModal } from "@/components/dashboard/GuidedWorkflowModal";
import { ExportReportModal } from "@/components/dashboard/ExportReportModal";
import { apiClient } from "@/services/apiClient";
import {
  EnvironmentalVariableId,
  InvestigationConfig,
  InvestigationResult,
} from "@/types/terratrend";
import { GEOGRAPHIC_REGIONS, REGIONS_MAP } from "@/data/regions";
import { ENVIRONMENTAL_VARIABLES } from "@/data/variables";
import { generateInvestigationData } from "@/services/dataGenerator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Map as MapIcon,
  TrendingUp,
  BarChart3,
  Layers,
  HelpCircle,
  AlertTriangle,
  Compass,
} from "lucide-react";

const INITIAL_CONFIG: InvestigationConfig = {
  variableId: "temperature",
  regionId: "amazon-basin",
  startDate: "2010-01-01",
  endDate: "2024-12-31",
  resolution: "monthly",
};

export default function TerraTrendDashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("explore-map");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [config, setConfig] = useState<InvestigationConfig>(INITIAL_CONFIG);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string>("connecting");
  const [isPending, startTransition] = useTransition();

  // Current investigation output result
  const [result, setResult] = useState<InvestigationResult>(() =>
    generateInvestigationData(INITIAL_CONFIG)
  );

  // Check backend health on initial mount
  React.useEffect(() => {
    apiClient
      .getHealth()
      .then((h) => {
        setBackendStatus(`online (${h.datasets_registered} datasets, ${h.regions_registered} regions)`);
      })
      .catch(() => {
        setBackendStatus("offline (demo mode)");
      });
  }, []);

  // Handle configuration changes
  const handleConfigChange = (newValues: Partial<InvestigationConfig>) => {
    const updated = { ...config, ...newValues };
    setConfig(updated);
    // Instant reactive recalculation for smooth exploration
    const updatedResult = generateInvestigationData(updated);
    setResult(updatedResult);
  };

  // Handle "Analyze Trends" trigger connecting to Python FastAPI backend
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const baseResult = generateInvestigationData(config);

    try {
      // Map observations to backend API model
      const points = baseResult.timeSeries.map((pt) => ({
        timestamp: new Date(pt.timestamp).toISOString(),
        latitude: baseResult.region.coordinates.lat,
        longitude: baseResult.region.coordinates.lng,
        value: pt.observed,
        is_valid: true,
      }));

      // Call live Python backend
      const analysis = await apiClient.runAnalysis({
        points,
        variable_id: config.variableId,
        variable_name: baseResult.variable.name,
        region_id: config.regionId,
        region_name: baseResult.region.name,
        original_units: baseResult.variable.unit,
        alpha: 0.05,
      });

      // Update result with authoritative backend calculations
      if (analysis.sens_slope && analysis.mann_kendall) {
        baseResult.statistics.annualSlope = analysis.sens_slope.slope;
        baseResult.statistics.ratePerDecade = `${analysis.sens_slope.rate_per_decade >= 0 ? "+" : ""}${analysis.sens_slope.rate_per_decade.toFixed(3)} ${baseResult.variable.unit}/decade`;
        baseResult.statistics.senSlope = analysis.sens_slope.slope;
        baseResult.statistics.pValue = analysis.mann_kendall.p_value;
        baseResult.statistics.mannKendallZ = analysis.mann_kendall.z_score;
        baseResult.statistics.mannKendallS = analysis.mann_kendall.s_statistic;
        baseResult.statistics.isSignificant = analysis.is_statistically_significant;
        baseResult.statistics.confidenceInterval = `95% CI: [${analysis.sens_slope.confidence_interval_95[0].toFixed(3)}, ${analysis.sens_slope.confidence_interval_95[1].toFixed(3)}]`;
        baseResult.interpretation.scientificImplication = analysis.plain_language_interpretation;
      }
      setResult(baseResult);
    } catch (err) {
      console.warn("Backend analysis call failed; using local calibrated model:", err);
      setResult(baseResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset to default
  const handleReset = () => {
    setConfig(INITIAL_CONFIG);
    const defaultResult = generateInvestigationData(INITIAL_CONFIG);
    setResult(defaultResult);
  };

  // Quick region selection
  const handleSelectRegion = (regionId: string) => {
    handleConfigChange({ regionId });
  };

  // Quick variable selection
  const handleSelectVariable = (variableId: EnvironmentalVariableId) => {
    handleConfigChange({ variableId });
  };

  // Load a preset investigation
  const handleLoadInvestigation = (presetConfig: InvestigationConfig) => {
    setConfig(presetConfig);
    const presetResult = generateInvestigationData(presetConfig);
    setResult(presetResult);
    setActiveTab("explore-map");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#080c14] text-slate-100">
      {/* 1. Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 2. Top Navigation */}
        <TopNav
          selectedRegion={result.region}
          onSelectRegion={handleSelectRegion}
          selectedVariableId={config.variableId}
          dateRange={{ start: config.startDate, end: config.endDate }}
          onOpenGuidedWorkflow={() => setIsWorkflowModalOpen(true)}
          onOpenExportReport={() => setIsExportModalOpen(true)}
        />

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 space-y-6">
          {/* TAB: Explore Map & Main Scientific Dashboard */}
          {activeTab === "explore-map" && (
            <div className="space-y-6 max-w-[1600px] mx-auto">
              {/* C. Interactive Main Map Section (Centerpiece with MapCN & MapLibre) */}
              <section aria-label="Interactive Scientific Map" className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-semibold tracking-tight text-slate-100">
                      Geographic Observation & Anomaly Map
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="hidden sm:inline font-mono">
                      Region: <span className="text-cyan-300 font-semibold">{result.region.name}</span>
                    </span>
                    <Badge variant="scientific" className="text-[10px]">
                      MapCN / MapLibre GL
                    </Badge>
                  </div>
                </div>

                <MainMap
                  selectedRegion={result.region}
                  onSelectRegion={handleSelectRegion}
                  selectedVariableId={config.variableId}
                  onSelectVariable={handleSelectVariable}
                  className="h-[460px] md:h-[520px] w-full"
                />
              </section>

              {/* D. Investigation Controls Panel */}
              <section aria-label="Investigation Controls">
                <InvestigationControls
                  config={config}
                  onChangeConfig={handleConfigChange}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  onReset={handleReset}
                />
              </section>

              {/* E. Statistics Panel */}
              <section aria-label="Statistical Summary">
                <StatisticsPanel
                  statistics={result.statistics}
                  variable={result.variable}
                />
              </section>

              {/* F. Time-Series Chart */}
              <section aria-label="Historical Time-Series">
                <TimeSeriesChart
                  data={result.timeSeries}
                  variable={result.variable}
                  regionName={result.region.name}
                />
              </section>

              {/* G. Scientific Interpretation Panel */}
              <section aria-label="Scientific Interpretation">
                <ScientificInterpretationPanel
                  interpretation={result.interpretation}
                  statistics={result.statistics}
                  variable={result.variable}
                  region={result.region}
                />
              </section>
            </div>
          )}

          {/* TAB: Overview */}
          {activeTab === "overview" && (
            <div className="max-w-[1600px] mx-auto">
              <OverviewView
                onExploreRegion={handleSelectRegion}
                onExploreVariable={handleSelectVariable}
                onGoToDashboard={() => setActiveTab("explore-map")}
              />
            </div>
          )}

          {/* TAB: Deep Trend Analysis */}
          {activeTab === "trend-analysis" && (
            <div className="max-w-[1600px] mx-auto space-y-6">
              <div className="rounded-xl border border-slate-800 bg-[#0d1424]/90 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-base font-semibold text-slate-100">
                    In-Depth Non-Parametric Trend Analysis
                  </h2>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluate monotonic trends, Sen&apos;s non-parametric slope distributions, and Mann-Kendall rank correlation scores calculated for {result.region.name}.
                </p>
              </div>

              <StatisticsPanel
                statistics={result.statistics}
                variable={result.variable}
              />

              <TimeSeriesChart
                data={result.timeSeries}
                variable={result.variable}
                regionName={result.region.name}
              />

              <ScientificInterpretationPanel
                interpretation={result.interpretation}
                statistics={result.statistics}
                variable={result.variable}
                region={result.region}
              />
            </div>
          )}

          {/* TAB: Regional Comparison (Milestone 9) */}
          {activeTab === "regional-comparison" && (
            <div className="max-w-[1600px] mx-auto">
              <RegionalComparisonView />
            </div>
          )}

          {/* TAB: Data Sources */}
          {activeTab === "data-sources" && (
            <div className="max-w-[1600px] mx-auto">
              <DataSourcesView />
            </div>
          )}

          {/* TAB: Saved Investigations */}
          {activeTab === "saved-investigations" && (
            <div className="max-w-[1600px] mx-auto">
              <SavedInvestigationsView
                onLoadInvestigation={handleLoadInvestigation}
              />
            </div>
          )}

          {/* TAB: Settings */}
          {activeTab === "settings" && (
            <div className="max-w-[1600px] mx-auto">
              <SettingsView />
            </div>
          )}
        </main>
      </div>

      {/* 13-Step Guided Workflow Modal */}
      <GuidedWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onApplyInvestigation={(cfg) => {
          setConfig(cfg);
          const r = generateInvestigationData(cfg);
          setResult(r);
          setActiveTab("explore-map");
        }}
      />

      {/* Export Report / Research Dossier Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={result}
      />
    </div>
  );
}
