"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Shield,
  Key,
  Server,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { NASA_ENDPOINTS, checkNasaBackendHealth } from "@/services/nasa-earthdata";

export function SettingsView() {
  const [fastApiUrl, setFastApiUrl] = useState(NASA_ENDPOINTS.fastApiBackendUrl);
  const [ursToken, setUrsToken] = useState("");
  const [pThreshold, setPThreshold] = useState("0.05");
  const [isTesting, setIsTesting] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setBackendStatus(null);
    try {
      const res = await checkNasaBackendHealth();
      setBackendStatus(res.message);
    } catch {
      setBackendStatus("Connection check failed.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1424]/90 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Platform Settings & Integration Hub
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Configure rendering engines, statistical test parameters, and credentials for connecting NASA Earthdata and FastAPI services.
        </p>
      </div>

      {/* Map & Rendering Engine */}
      <Card className="border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-sm font-semibold text-slate-100">
              Interactive Map Engine (MapCN & MapLibre GL)
            </CardTitle>
          </div>
          <Badge variant="scientific" className="text-[10px]">
            MapLibre v6
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Active Basemap</span>
            <div className="font-medium text-slate-200">CARTO Dark Matter (Vector/Raster)</div>
            <p className="text-[10px] text-slate-400">Zero-config theme-aware tiles via MapCN</p>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Coordinate Reference System</span>
            <div className="font-medium text-slate-200">Web Mercator (EPSG:3857 / WGS84)</div>
            <p className="text-[10px] text-slate-400">Standard for NASA GIBS WMTS alignment</p>
          </div>
        </div>
      </Card>

      {/* Statistical Analysis Configuration */}
      <Card className="border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-sm font-semibold text-slate-100">
              Statistical Testing Parameters
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] text-emerald-300">
            Non-Parametric
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Significance Alpha Threshold (p-value cutoff)
            </label>
            <select
              value={pThreshold}
              onChange={(e) => setPThreshold(e.target.value)}
              className="h-9 w-full sm:w-64 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="0.01">p &lt; 0.01 (99% Statistical Confidence)</option>
              <option value="0.05">p &lt; 0.05 (95% Statistical Confidence - Standard)</option>
              <option value="0.10">p &lt; 0.10 (90% Statistical Confidence)</option>
            </select>
            <p className="text-[10px] text-slate-400">
              Controls the null hypothesis rejection criterion for the Mann-Kendall rank test.
            </p>
          </div>
        </div>
      </Card>

      {/* NASA Earthdata & Backend Connection Settings */}
      <Card className="border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-purple-400" />
            <CardTitle className="text-sm font-semibold text-slate-100">
              NASA Earthdata & FastAPI Backend Integrations
            </CardTitle>
          </div>
          <Badge variant="scientific" className="text-[10px]">
            Future Hookup
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              FastAPI Python Backend URL
            </label>
            <input
              type="text"
              value={fastApiUrl}
              onChange={(e) => setFastApiUrl(e.target.value)}
              placeholder="http://localhost:8000/api/v1"
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              NASA Earthdata Login (URS) Bearer Token (Optional)
            </label>
            <input
              type="password"
              value={ursToken}
              onChange={(e) => setUrsToken(e.target.value)}
              placeholder="URS Token for NASA Earthdata CMR API"
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400">
              Token is kept purely in client memory and not transmitted to third parties.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isTesting ? "animate-spin" : ""}`} />
              Test API Pipeline Connection
            </Button>
            {backendStatus && (
              <span className="text-xs text-cyan-400 font-mono">
                {backendStatus}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-6">
          Save Preferences
        </Button>
        {savedSuccess && (
          <span className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}
