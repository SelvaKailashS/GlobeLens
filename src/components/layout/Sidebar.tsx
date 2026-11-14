"use client";

import React from "react";
import {
  Globe2,
  Map as MapIcon,
  TrendingUp,
  Database,
  BookmarkCheck,
  Settings,
  Satellite,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ActiveTab =
  | "overview"
  | "explore-map"
  | "trend-analysis"
  | "regional-comparison"
  | "data-sources"
  | "saved-investigations"
  | "settings";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navItems = [
    {
      id: "overview" as ActiveTab,
      label: "Overview",
      icon: Globe2,
      badge: "Summary",
    },
    {
      id: "explore-map" as ActiveTab,
      label: "Explore Map",
      icon: MapIcon,
      badge: "Core Map",
    },
    {
      id: "trend-analysis" as ActiveTab,
      label: "Trend Analysis",
      icon: TrendingUp,
      badge: "Stats",
    },
    {
      id: "regional-comparison" as ActiveTab,
      label: "Regional Comparison",
      icon: GitCompare,
      badge: "Multi-Region",
    },
    {
      id: "data-sources" as ActiveTab,
      label: "Data Sources",
      icon: Database,
      badge: "NASA GIBS",
    },
    {
      id: "saved-investigations" as ActiveTab,
      label: "Saved Investigations",
      icon: BookmarkCheck,
      badge: "3",
    },
    {
      id: "settings" as ActiveTab,
      label: "Settings",
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-800 bg-[#0a0f1d] transition-all duration-300 z-30 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-950">
              <Satellite className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-slate-100">TerraTrend</span>
                <span className="text-[10px] bg-cyan-900/50 text-cyan-300 border border-cyan-700/40 px-1 py-0.2 rounded font-mono">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                Earth Systems Detective
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Satellite className="h-5 w-5" />
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* Challenge Notice */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>NASA Space Apps 2024</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400 leading-snug">
            Challenge: <span className="text-slate-200">Be an Earth Systems Trend Detective!</span>
          </p>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-2.5 py-4 overflow-y-auto">
        <div className={cn("px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500", collapsed && "sr-only")}>
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all text-left",
                isActive
                  ? "bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-mono",
                        isActive
                          ? "bg-cyan-900/80 text-cyan-200"
                          : "bg-slate-800/90 text-slate-400"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mission Telemetry Status */}
      <div className="p-3 border-t border-slate-800 bg-[#080d19]">
        {!collapsed ? (
          <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Demonstration Mode
              </span>
              <span className="text-[10px] font-mono text-cyan-400">MapLibre GL</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Sample datasets active. Architecture staged for live NASA Earthdata & GIBS ingestion.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
              <span>Basemap</span>
              <span className="font-mono text-slate-300">CARTO Dark</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Demonstration Mode Active (MapLibre GL)">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
