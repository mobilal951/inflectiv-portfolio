"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parse } from "date-fns";
import { Activity, Clock, MousePointerClick, TrendingUp, Zap, FileText } from "lucide-react";

interface EngagementMetrics {
  engagementRate: number;
  engagedSessions: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  totalSessions: number;
  bounceRate: number;
  totalEngagementDuration: number;
}

interface DailyEngagement {
  date: string;
  engagementRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
}

export default function EngagementPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey } = useDashboard();

  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [dailyData, setDailyData] = useState<DailyEngagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (contextLoading || isDemoMode || !selectedProperty) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { startDate, endDate } = getDateParams();

      try {
        const params = new URLSearchParams({
          propertyId: selectedProperty,
          startDate,
          endDate,
        });

        const res = await fetch(`/api/ga/engagement?${params}`);
        const data = await res.json();

        if (res.ok) {
          setMetrics(data.metrics || null);
          setDailyData(data.byDay || []);
        }
      } catch (err) {
        console.error("Failed to fetch engagement data:", err);
      }

      setLoading(false);
    }

    fetchData();
  }, [selectedProperty, getDateParams, contextLoading, isDemoMode, refreshKey]);

  const isLoading = loading || contextLoading;

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    try {
      if (dateString.includes("-")) {
        return format(new Date(dateString), "d-MMM");
      }
      const date = parse(dateString, "yyyyMMdd", new Date());
      return format(date, "d-MMM");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header title="User Engagement" />

      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-auto">
        {isDemoMode ? (
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-12 text-center">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">Connect Google Analytics to view engagement data</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Engagement Rate</p>
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                          <Zap className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">{(metrics?.engagementRate || 0).toFixed(1)}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Engaged Sessions</p>
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <MousePointerClick className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics?.engagedSessions || 0)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Avg. Duration</p>
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <Clock className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{formatDuration(metrics?.avgSessionDuration || 0)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Pages/Session</p>
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                          <FileText className="h-3.5 w-3.5 text-orange-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{(metrics?.pagesPerSession || 0).toFixed(2)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Total Sessions</p>
                        <div className="p-1.5 bg-cyan-100 rounded-lg">
                          <Activity className="h-3.5 w-3.5 text-cyan-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-cyan-600">{formatNumber(metrics?.totalSessions || 0)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Bounce Rate</p>
                        <div className="p-1.5 bg-red-100 rounded-lg">
                          <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{(metrics?.bounceRate || 0).toFixed(1)}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Engagement Trend Chart */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2 px-5">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  Engagement Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-5 pb-5">
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : dailyData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">No data available</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData.map((d) => ({ ...d, formattedDate: formatDate(d.date) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="formattedDate"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          axisLine={{ stroke: "#e5e7eb" }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          axisLine={{ stroke: "#e5e7eb" }}
                          tickLine={false}
                          width={40}
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          axisLine={{ stroke: "#e5e7eb" }}
                          tickLine={false}
                          width={40}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                          }}
                          formatter={(value, name) => {
                            const v = value as number;
                            if (name === "Engagement Rate") return [`${v.toFixed(1)}%`, name];
                            if (name === "Avg. Duration") return [formatDuration(v), name];
                            return [v.toFixed(2), name];
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="engagementRate"
                          name="Engagement Rate"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", r: 3 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="pagesPerSession"
                          name="Pages/Session"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={{ fill: "#f97316", r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 shadow-lg border-0 text-white">
              <CardContent className="p-5">
                <h3 className="font-semibold text-white/90 mb-3">Understanding Engagement Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-white">Engagement Rate</p>
                    <p className="text-white/70 text-xs mt-1">
                      Percentage of sessions that were engaged (lasted &gt;10s, had conversion, or 2+ page views)
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-white">Engaged Sessions</p>
                    <p className="text-white/70 text-xs mt-1">
                      Total number of sessions that met the engagement criteria
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-white">Bounce Rate</p>
                    <p className="text-white/70 text-xs mt-1">
                      Percentage of sessions that were not engaged (opposite of engagement rate)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
