"use client";

import React from "react";
import {
  FileText,
  Printer,
  Download,
  X,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvestigationResult } from "@/types/terratrend";
import { exportInvestigationAsCsv, exportInvestigationAsJson } from "@/services/exportService";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: InvestigationResult;
}

export function ExportReportModal({
  isOpen,
  onClose,
  result,
}: ExportReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl border border-slate-700 bg-[#090f1e] p-6 shadow-2xl text-slate-100 space-y-6 my-8 max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:bg-white print:text-black">
        {/* Modal Action Bar (hidden in print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              Investigation Summary & Research Dossier
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => exportInvestigationAsCsv(result)}
              variant="outline"
              size="sm"
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button
              onClick={() => exportInvestigationAsJson(result)}
              variant="outline"
              size="sm"
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> JSON
            </Button>
            <Button
              onClick={handlePrint}
              size="sm"
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5 shadow-md shadow-cyan-950 font-medium"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6 print:space-y-4 print:text-black">
          {/* Header */}
          <div className="border-b border-slate-800 pb-4 print:border-gray-300 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider print:text-gray-600">
                  TerraTrend Scientific Report · NASA Space Apps Challenge
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-slate-100 print:text-black">
                  Earth Systems Trend Investigation Dossier
                </h1>
              </div>
              <Badge variant="scientific" className="print:hidden">
                {result.statistics.isDemoData ? "Demonstration Data" : "Verified NASA Data"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 print:text-gray-700 font-mono">
              <span>Region: <strong className="text-slate-200 print:text-black">{result.region.name}</strong></span>
              <span>Variable: <strong className="text-slate-200 print:text-black">{result.variable.name}</strong></span>
              <span>Period: <strong className="text-slate-200 print:text-black">{result.config.startDate} to {result.config.endDate}</strong></span>
              <span>Generated: {result.generatedAt}</span>
            </div>
          </div>

          {/* Core Findings Grid (What, Where, How Much, Is It Significant) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-3.5 print:border-gray-300 print:bg-gray-50 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 print:text-gray-600">1. What is Changing?</div>
              <div className="text-sm font-semibold text-cyan-300 print:text-blue-800">
                {result.interpretation.whatChanged}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-3.5 print:border-gray-300 print:bg-gray-50 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 print:text-gray-600">2. Where is it Changing?</div>
              <div className="text-sm font-semibold text-slate-200 print:text-black">
                {result.region.name} ({result.region.category})
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-3.5 print:border-gray-300 print:bg-gray-50 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 print:text-gray-600">3. How Much? (Sen&apos;s Slope)</div>
              <div className="text-sm font-semibold font-mono text-emerald-400 print:text-green-800">
                {result.statistics.ratePerDecade}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-3.5 print:border-gray-300 print:bg-gray-50 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 print:text-gray-600">4. Statistically Significant?</div>
              <div className="text-sm font-semibold text-purple-300 print:text-purple-800">
                {result.statistics.statisticalSignificance} (p={result.statistics.pValue.toFixed(4)})
              </div>
            </div>
          </div>

          {/* Statistical Breakdown Table */}
          <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-4 print:border-gray-300 print:bg-white space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400 print:text-black">
              Comprehensive Statistical Diagnostics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <div className="border border-slate-800/80 rounded p-2 print:border-gray-200">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">Mann-Kendall Tau</span>
                <span className="font-mono font-semibold text-slate-200 print:text-black">{result.statistics.mannKendallZ > 0 ? "+" : ""}{(result.statistics.mannKendallZ / 4).toFixed(3)}</span>
              </div>
              <div className="border border-slate-800/80 rounded p-2 print:border-gray-200">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">P-Value (Two-Tailed)</span>
                <span className="font-mono font-semibold text-slate-200 print:text-black">{result.statistics.pValue.toFixed(5)}</span>
              </div>
              <div className="border border-slate-800/80 rounded p-2 print:border-gray-200">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">95% Confidence Interval</span>
                <span className="font-mono font-semibold text-slate-200 print:text-black text-[11px]">{result.statistics.confidenceInterval}</span>
              </div>
              <div className="border border-slate-800/80 rounded p-2 print:border-gray-200">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">R-Squared (OLS)</span>
                <span className="font-mono font-semibold text-slate-200 print:text-black">{result.statistics.rSquared.toFixed(3)}</span>
              </div>
              <div className="border border-slate-800/80 rounded p-2 print:border-gray-200">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">Data Coverage</span>
                <span className="font-mono font-semibold text-cyan-300 print:text-black">{result.statistics.dataCoveragePercent.toFixed(1)}%</span>
              </div>
              <div className="border border-slate-800/80 rounded p-2 print:border-gray-200">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">Valid Observations</span>
                <span className="font-mono font-semibold text-slate-200 print:text-black">{result.statistics.validObservations} / {result.statistics.totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Scientific Interpretation & Mechanisms */}
          <div className="rounded-lg border border-slate-800 bg-[#0d1527] p-4 print:border-gray-300 print:bg-white space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400 print:text-black">
              Scientific Interpretation & Proposed Physical Mechanisms
            </h3>
            <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed">
              {result.interpretation.scientificImplication}
            </p>
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 print:text-gray-700">Contributing Drivers & Climate Teleconnections:</span>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300 print:text-gray-800">
                {result.interpretation.physicalMechanisms.map((mech, idx) => (
                  <li key={idx}>{mech}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Data Provenance & Methodology Notice */}
          <div className="rounded-lg border border-slate-800 bg-[#0c1220] p-4 print:border-gray-200 print:bg-gray-50 text-[11px] text-slate-400 print:text-gray-700 space-y-1.5 font-mono">
            <div className="font-bold text-slate-300 print:text-black uppercase">Data Provenance & Traceability:</div>
            <div>Sensor/Mission: {result.variable.sensor} on {result.variable.satellite}</div>
            <div>Baseline Reference: {result.variable.baseline}</div>
            <div>Processing Facility: NASA EOSDIS / LP DAAC / GES DISC</div>
            <div>Methodology: Hirsch-Slack Seasonal Mann-Kendall rank correlation & Sen&apos;s robust median slope estimator.</div>
            <div className="text-[10px] text-slate-500 pt-1">
              * Note: Statistical significance establishes observational evidence of persistent historical monotonic change; it does not constitute mechanical causality or guarantee future continuation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
