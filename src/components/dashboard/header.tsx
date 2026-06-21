"use client";

import { useDashboard } from "./dashboard-context";
import { DateRangePicker } from "./date-range-picker";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { PropertySelector } from "./property-selector";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const {
    properties,
    selectedProperty,
    setSelectedProperty,
    dateRange,
    setDateRange,
    loading,
    isDemoMode,
    refresh,
    refreshing,
    lastUpdated,
  } = useDashboard();

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-4 sm:px-6 py-2">
          <div className="flex items-center gap-2 text-amber-700 text-xs sm:text-sm">
            <div className="p-1 bg-amber-100 rounded-full">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <span>
              <strong>Demo Mode:</strong> Connect Google Analytics to see real data
            </span>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 py-4 sm:py-5">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-4 sm:hidden">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Updated {formatLastUpdated(lastUpdated)}
              </p>
            </div>
            <Button
              size="sm"
              onClick={refresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:opacity-90 text-white font-medium shadow-lg shadow-purple-500/20"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <PropertySelector
              properties={properties}
              value={selectedProperty}
              onChange={setSelectedProperty}
              loading={loading}
            />
            <div className="flex-1">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden sm:flex lg:hidden flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Last updated at {formatLastUpdated(lastUpdated)}
              </p>
            </div>
            <Button
              onClick={refresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:opacity-90 text-white font-semibold px-5 shadow-lg shadow-purple-500/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <PropertySelector
              properties={properties}
              value={selectedProperty}
              onChange={setSelectedProperty}
              loading={loading}
            />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
              <div className="hidden xl:flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 rounded-full">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span className="text-xs font-medium text-purple-600">Live</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Last updated at {formatLastUpdated(lastUpdated)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <PropertySelector
              properties={properties}
              value={selectedProperty}
              onChange={setSelectedProperty}
              loading={loading}
            />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button
              size="lg"
              onClick={refresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:opacity-90 text-white font-semibold px-6 shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl hover:shadow-purple-500/30"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
