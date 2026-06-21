"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    isNew?: boolean;
  };
  loading?: boolean;
  accentColor?: "blue" | "purple" | "orange" | "green";
}

const accentColors = {
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-400 to-orange-500",
  green: "from-emerald-500 to-emerald-600",
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
  accentColor = "purple",
}: KPICardProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {formatValue(value)}
            </p>
            <div className="flex items-center gap-2">
              {trend && (
                trend.isNew ? (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full text-blue-700 bg-blue-50">
                    New
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full",
                      trend.isPositive
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-red-700 bg-red-50"
                    )}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(trend.value).toFixed(1)}%
                  </span>
                )
              )}
              {subtitle && (
                <p className="text-xs text-gray-400 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {Icon && (
            <div className={cn(
              "p-2.5 sm:p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
              accentColors[accentColor],
              accentColor === "blue" && "shadow-blue-500/25",
              accentColor === "purple" && "shadow-purple-500/25",
              accentColor === "orange" && "shadow-orange-500/25",
              accentColor === "green" && "shadow-emerald-500/25",
            )}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatValue(value: string | number): string {
  if (typeof value === "number") {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toLocaleString();
  }
  return value;
}
