"use client";

import React, { useState } from "react";
import {
  Compass,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Database,
  MapPin,
  Calendar,
  Filter,
  BarChart2,
  Activity,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GEOGRAPHIC_REGIONS } from "@/data/regions";
import { VARIABLES_LIST } from "@/data/variables";
import { InvestigationConfig } from "@/types/terratrend";

interface GuidedWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInvestigation: (config: InvestigationConfig) => void;
}

interface WorkflowStep {
  stepNumber: number;
  title: string;
  question: string;
  description: string;
  hint: string;
  category: "Scoping" | "Data Selection" | "Quality & Processing" | "Statistical Detection" | "Synthesis";
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    stepNumber: 1,
    category: "Scoping",
    title: "Define Research Question",
    question: "What environmental change do you want to investigate?",
    description: "Formulate a focused hypothesis regarding whether an Earth system variable is undergoing persistent change over time rather than routine short-term seasonal fluctuations.",
    hint: "Example: 'Has vegetation density in the Western Ghats foothills declined over the past decade?'",
  },
  {
    stepNumber: 2,
    category: "Scoping",
    title: "Select Earth System Variable",
    question: "Which physical or biological parameter directly tracks this phenomenon?",
    description: "Choose between land surface temperature, precipitation, vegetation canopy greenness, or atmospheric composition.",
    hint: "Vegetation (NDVI) tracks canopy photosynthetic vigor; LST tracks thermal radiative skin temperature.",
  },
  {
    stepNumber: 3,
    category: "Data Selection",
    title: "Choose NASA Dataset & Sensor",
    question: "Which NASA satellite mission and instrument provides verified measurements?",
    description: "Ensure the sensor has continuous, calibrated coverage across your target timeframe (e.g. MODIS on Terra/Aqua since 2000; GPM IMERG since 2014; AIRS on Aqua since 2002).",
    hint: "MOD13A2 provides 16-day composite vegetation indices screened for clouds and heavy aerosols.",
  },
  {
    stepNumber: 4,
    category: "Data Selection",
    title: "Delineate Geographic Study Region",
    question: "What is the exact spatial boundary or biome of interest?",
    description: "Define a geographic bounding box or select a registered climate region (e.g., Coimbatore Foothills, Amazon Basin, Greenland Ice Sheet).",
    hint: "Regional spatial averaging helps buffer against single-pixel cloud dropouts and localized measurement noise.",
  },
  {
    stepNumber: 5,
    category: "Data Selection",
    title: "Specify Historical Observation Window",
    question: "What multi-year timeframe captures long-term climate signals?",
    description: "A minimum of 5 to 10 years of data is recommended to distinguish meaningful decadal secular trends from inter-annual oscillations like ENSO or IOD.",
    hint: "Selecting at least 3 to 10 years provides sufficient statistical power (N >= 36 monthly observations).",
  },
  {
    stepNumber: 6,
    category: "Quality & Processing",
    title: "Determine Temporal Resolution",
    question: "Should observations be analyzed at daily, monthly, or annual intervals?",
    description: "Monthly aggregation balances temporal resolution while smoothing high-frequency atmospheric noise and day-to-day weather variance.",
    hint: "Monthly resolution is standard for climatological trend detection across satellite records.",
  },
  {
    stepNumber: 7,
    category: "Quality & Processing",
    title: "Screen Quality Flags & Valid Coverage",
    question: "Are observations filtered for clouds, snow obscuration, and sensor saturation?",
    description: "Evaluate QA bitmasks and valid data fractions. Observations obscured by thick cloud cover must be masked to prevent artificial trend distortions.",
    hint: "TerraTrend evaluates pixel QA bitmasks and requires >= 70% valid data coverage for statistical confidence.",
  },
  {
    stepNumber: 8,
    category: "Quality & Processing",
    title: "Extract Spatial Mean Time Series",
    question: "How are gridded pixels aggregated across the study region?",
    description: "Apply latitude-weighted area averaging across all valid pixels within the bounding extent for each sequential time step.",
    hint: "Area weighting accounts for the convergence of meridians toward polar latitudes in geographic coordinates.",
  },
  {
    stepNumber: 9,
    category: "Statistical Detection",
    title: "Perform Non-Parametric Trend Test",
    question: "Is there a statistically significant monotonic trend?",
    description: "Execute the Mann-Kendall test. Unlike ordinary linear regression, it does not assume normal distribution of residuals and is robust against extreme outliers.",
    hint: "A two-tailed p-value < 0.05 indicates statistical significance at the 95% confidence level.",
  },
  {
    stepNumber: 10,
    category: "Statistical Detection",
    title: "Estimate Robust Trend Magnitude",
    question: "HOW MUCH is the environmental variable changing per year and per decade?",
    description: "Calculate Sen's slope estimator (the median of all pairwise slopes). Compute Hollander-Wolfe 95% non-parametric confidence intervals.",
    hint: "Sen's slope resists outlier skew and yields a robust estimate of physical rate of change in original units.",
  },
  {
    stepNumber: 11,
    category: "Statistical Detection",
    title: "Test for Abrupt Change Points",
    question: "Did an abrupt regime shift or disturbance event occur in the record?",
    description: "Apply Pettitt's non-parametric change-point test to identify whether the time series underwent a sudden mean shift (e.g. following a mega-fire, drought, or policy change).",
    hint: "Pettitt's test identifies the single most significant breakpoint timestamp in the historical record.",
  },
  {
    stepNumber: 12,
    category: "Statistical Detection",
    title: "Decompose Seasonality & Standardized Anomalies",
    question: "How do monthly departures compare against the multi-year climatological baseline?",
    description: "Subtract multi-year monthly baseline means and divide by baseline standard deviations to compute normalized Z-score anomalies ($Z \\ge \\pm 2.0$ signifies extreme events).",
    hint: "Z-score anomaly inspection reveals whether trends are driven by chronic gradual shifts or extreme acute pulses.",
  },
  {
    stepNumber: 13,
    category: "Synthesis",
    title: "Synthesize Scientific Conclusions & Caveats",
    question: "What plain-language conclusions and caveats can be scientifically defended?",
    description: "Synthesize findings answering: What changed? Where? How much? And is it statistically significant? Include strict scientific caveats: correlation is not causation.",
    hint: "Always state data provenance, spatial resolution limits, and remind readers that statistical significance does not guarantee future continuation.",
  },
];

export function GuidedWorkflowModal({
  isOpen,
  onClose,
  onApplyInvestigation,
}: GuidedWorkflowModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedVariable, setSelectedVariable] = useState<string>("temperature");
  const [selectedRegion, setSelectedRegion] = useState<string>("amazon-basin");
  const [startDate, setStartDate] = useState<string>("2010-01-01");
  const [endDate, setEndDate] = useState<string>("2024-12-31");
  const [resolution, setResolution] = useState<"daily" | "monthly">("monthly");

  if (!isOpen) return null;

  const currentStep = WORKFLOW_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === WORKFLOW_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) setCurrentStepIndex(currentStepIndex + 1);
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentStepIndex(currentStepIndex - 1);
  };

  const handleFinishAndApply = () => {
    onApplyInvestigation({
      variableId: selectedVariable as any,
      regionId: selectedRegion,
      startDate,
      endDate,
      resolution,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-cyan-800/60 bg-[#090f1d] p-6 shadow-2xl text-slate-100 space-y-5 my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  13-Step Earth Systems Trend Detective Workflow
                </h2>
                <Badge variant="scientific" className="text-[10px]">
                  Step {currentStep.stepNumber} of 13
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                NASA Space Apps Challenge scientific investigation methodology
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Category: <strong className="text-cyan-300">{currentStep.category}</strong></span>
            <span>{Math.round(((currentStepIndex + 1) / 13) * 100)}% Complete</span>
          </div>
          <div className="grid grid-cols-13 gap-1 h-2 w-full rounded-full bg-slate-900 overflow-hidden">
            {WORKFLOW_STEPS.map((s, idx) => (
              <div
                key={s.stepNumber}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-full cursor-pointer transition-colors ${
                  idx < currentStepIndex
                    ? "bg-cyan-500"
                    : idx === currentStepIndex
                    ? "bg-cyan-300 ring-2 ring-cyan-400"
                    : "bg-slate-800"
                }`}
                title={`Step ${s.stepNumber}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Step Main Content Card */}
        <div className="rounded-xl border border-slate-800 bg-[#0d1527] p-5 space-y-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              Step {currentStep.stepNumber}
            </div>
            <h3 className="text-lg font-bold text-slate-100">{currentStep.title}</h3>
            <div className="text-sm font-semibold text-cyan-200 pt-1">
              {currentStep.question}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {currentStep.description}
            </p>
          </div>

          {/* Interactive controls for relevant steps */}
          {currentStep.stepNumber === 2 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="text-xs text-slate-400 font-medium">Select Variable:</label>
              <div className="grid grid-cols-2 gap-2">
                {VARIABLES_LIST.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariable(v.id)}
                    className={`rounded-lg p-2.5 text-left border text-xs font-medium transition-all ${
                      selectedVariable === v.id
                        ? "bg-cyan-950/80 border-cyan-500 text-cyan-200"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-[10px] text-slate-400">{v.sensor} · {v.unit}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep.stepNumber === 4 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="text-xs text-slate-400 font-medium">Select Study Region:</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              >
                {GEOGRAPHIC_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentStep.stepNumber === 5 && (
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Scientific Tip Box */}
          <div className="rounded-lg bg-cyan-950/40 border border-cyan-800/40 p-3 text-xs text-cyan-200 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Scientist&apos;s Tip:</strong> {currentStep.hint}
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={isFirst}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Previous Step
          </Button>

          <div className="flex items-center gap-2">
            {!isLast ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs gap-1.5"
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinishAndApply}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 shadow-lg shadow-emerald-950 font-semibold"
              >
                <Play className="h-4 w-4" /> Launch Investigation in Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
