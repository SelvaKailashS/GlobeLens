"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Layers,
  User,
  Compass,
  CheckCircle2,
  Bell,
  Sparkles,
} from "lucide-react";
import { GEOGRAPHIC_REGIONS } from "@/data/regions";
import { ENVIRONMENTAL_VARIABLES } from "@/data/variables";
import { GeographicRegion, EnvironmentalVariableId } from "@/types/terratrend";
import { Badge } from "@/components/ui/badge";

interface TopNavProps {
  selectedRegion: GeographicRegion;
  onSelectRegion: (regionId: string) => void;
  selectedVariableId: EnvironmentalVariableId;
  dateRange: { start: string; end: string };
  onOpenQuickSearch?: () => void;
}

export function TopNav({
  selectedRegion,
  onSelectRegion,
  selectedVariableId,
  dateRange,
}: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredRegions = GEOGRAPHIC_REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeVariable = ENVIRONMENTAL_VARIABLES[selectedVariableId];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#0a0f1d]/90 px-4 md:px-6 backdrop-blur-md">
      {/* Title & Primary Metadata */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-semibold tracking-tight text-slate-100 flex items-center gap-2">
              <span>TerraTrend</span>
              <span className="text-slate-500 font-normal">/</span>
              <span className="text-cyan-400 font-medium hidden sm:inline">Earth Systems Detective</span>
            </h1>
            <Badge variant="scientific" className="text-[10px] hidden lg:inline-flex">
              NASA Science Platform
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>NASA Space Apps 2024</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">MODIS / GPM / OMI Synthesized</span>
          </div>
        </div>
      </div>

      {/* Search Field & Selected Region Dropdown */}
      <div className="flex items-center gap-3">
        {/* Search Input with Popover */}
        <div className="relative w-48 sm:w-64 md:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search study region or biome..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 top-11 z-50 rounded-lg border border-slate-700 bg-slate-900 p-1.5 shadow-xl">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-500">
                Matching Regions ({filteredRegions.length})
              </div>
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        onSelectRegion(region.id);
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{region.name}</span>
                        <span className="text-[10px] text-slate-400">{region.location}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px]">
                        {region.category}
                      </Badge>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-center text-xs text-slate-400">
                    No matching geographic region found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Region Pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs">
          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">Active Study Region</span>
            <span className="font-medium text-slate-200 max-w-[130px] md:max-w-[180px] truncate leading-tight">
              {selectedRegion.name}
            </span>
          </div>
        </div>

        {/* User / Investigator Placeholder */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-200">Dr. E. Vance</span>
            <span className="text-[10px] text-slate-400">Lead Investigator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
