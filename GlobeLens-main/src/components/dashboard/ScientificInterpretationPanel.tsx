"use client";

import React from "react";
import {
  ScientificInterpretation,
  StatisticalSummary,
  EnvironmentalVariable,
  GeographicRegion,
} from "@/types/terratrend";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Microscope,
  Info,
} from "lucide-react";

interface ScientificInterpretationProps {
  interpretation: ScientificInterpretation;
  statistics: StatisticalSummary;
  variable: EnvironmentalVariable;
  region: GeographicRegion;
}

export function ScientificInterpretationPanel({
  interpretation,
  statistics,
  variable,
  region,
}: ScientificInterpretationProps) {
  return (
    <Card className="border-slate-800 bg-[#0d1424]/90 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Microscope className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-sm font-semibold text-slate-100">
              Scientific Interpretation & Detective Diagnostic
            </CardTitle>
          </div>
          <Badge variant="scientific" className="text-[10px]">
            Synthesis Engine
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* The 4 Core Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Question 1: What changed? */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-400">
                1
              </span>
              <span>What changed?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {interpretation.whatChanged}
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 block mb-1">Key Physical Drivers:</span>
              <div className="flex flex-wrap gap-1">
                {interpretation.physicalMechanisms.map((mech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {mech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Question 2: Where did it change? */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-400">
                2
              </span>
              <span>Where did it change?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {interpretation.whereChanged}
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Climatic Classification:</span>
              <span className="font-medium text-slate-200">{region.climateContext}</span>
            </div>
          </div>

          {/* Question 3: How fast did it change? */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-400">
                3
              </span>
              <span>How fast did it change?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {interpretation.howFastChanged}
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Velocity Metric:</span>
              <span className="font-mono text-cyan-400">{statistics.rateOfChange}</span>
            </div>
          </div>

          {/* Question 4: Is the trend statistically significant? */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-400">
                4
              </span>
              <span>Is the trend statistically significant?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {interpretation.isSignificant}
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Mann-Kendall Z-score:</span>
              <span className="font-mono text-slate-200">{statistics.mannKendallZ} (p = {statistics.pValue < 0.001 ? "< 0.001" : statistics.pValue.toFixed(4)})</span>
            </div>
          </div>
        </div>

        {/* Detective Investigation Guidance */}
        <div className="rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Lightbulb className="h-4 w-4 text-cyan-400" />
            <span>Earth Systems Detective Recommended Follow-Ups</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            {interpretation.recommendedFollowUps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Scientific Integrity Disclaimer */}
        <div className="rounded-md border border-slate-800 bg-slate-950/80 p-2.5 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="text-slate-300">Scientific Integrity Notice:</strong> Explanatory placeholder text and synthesized numerical demonstrations are intended strictly for algorithmic validation and prototype review. Never cite demonstration outputs as empirical observational data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
