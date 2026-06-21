"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/header";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Database, Bot, FileUp, Coins, Maximize2, X, Users, Ticket } from "lucide-react";
import { format, parse } from "date-fns";

interface DailyCount {
  date: string;
  count: number;
}

interface StatData {
  total: number;
  filtered: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byDay: DailyCount[];
  message?: string;
}

interface PromoCodeBreakdown {
  code: string;
  redemptions: number;
}

interface PromoStatData extends StatData {
  uniqueUsers: { total: number; filtered: number };
  discountCents: { total: number; filtered: number };
  byCode: PromoCodeBreakdown[];
}

interface ActivityResponse {
  datasets: StatData;
  agents: StatData;
  files: StatData;
  credits: StatData;
  users: StatData;
  promos: PromoStatData;
}

export default function ActivityPage() {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const { dateRange, getDateParams, refreshKey, setRefreshing, setLastUpdated } = useDashboard();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setRefreshing(true);
      setError(null);

      try {
        const { startDate, endDate } = getDateParams();
        const params = new URLSearchParams({ startDate, endDate });
        const res = await fetch(`/api/firebase/activity?${params}`);
        const contentType = res.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          setError("Firebase is not available locally. Please test on Vercel production.");
          return;
        }

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch activity stats");
        }

        setData(json);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Activity fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }

      setLoading(false);
      setRefreshing(false);
    }

    fetchData();
  }, [dateRange, refreshKey, getDateParams, setRefreshing, setLastUpdated]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const chartColorHex: Record<string, string> = {
    cyan: "#06b6d4",
    blue: "#3b82f6",
    purple: "#8b5cf6",
    emerald: "#10b981",
    orange: "#f97316",
    pink: "#ec4899",
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = parse(dateString, "yyyy-MM-dd", new Date());
      return format(date, "MMM d");
    } catch {
      return dateString;
    }
  };

  // Combine all daily data for the chart
  const chartData = data?.datasets.byDay.map((d, i) => ({
    date: formatDate(d.date),
    datasets: d.count,
    agents: data.agents.byDay[i]?.count || 0,
    files: data.files.byDay[i]?.count || 0,
  })) || [];

  // Calculate shared Y-axis max for datasets, agents, and users charts
  const datasetsMax = Math.max(...(data?.datasets.byDay.map(d => d.count) || [0]));
  const agentsMax = Math.max(...(data?.agents.byDay.map(d => d.count) || [0]));
  const usersMax = Math.max(...(data?.users.byDay.map(d => d.count) || [0]));
  const sharedYMax = Math.max(datasetsMax, agentsMax, usersMax, 1);

  const stats = [
    {
      title: "New Users",
      icon: Users,
      color: "cyan",
      data: data?.users,
    },
    {
      title: "Datasets Created",
      icon: Database,
      color: "blue",
      data: data?.datasets,
    },
    {
      title: "Agents Deployed",
      icon: Bot,
      color: "purple",
      data: data?.agents,
    },
    {
      title: "Files Uploaded",
      icon: FileUp,
      color: "emerald",
      data: data?.files,
    },
    {
      title: "Credits Used",
      icon: Coins,
      color: "orange",
      data: data?.credits,
    },
    {
      title: "Promo Redemptions",
      icon: Ticket,
      color: "pink",
      data: data?.promos,
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; light: string }> = {
    cyan: { bg: "bg-cyan-100", text: "text-cyan-600", light: "bg-cyan-50" },
    blue: { bg: "bg-blue-100", text: "text-blue-600", light: "bg-blue-50" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", light: "bg-purple-50" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", light: "bg-emerald-50" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", light: "bg-orange-50" },
    pink: { bg: "bg-pink-100", text: "text-pink-600", light: "bg-pink-50" },
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header title="Activity Stats" />

      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-auto">
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const colors = colorMap[stat.color];
            return (
              <Card key={stat.title} className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {loading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-500">{stat.title}</p>
                        <div className={`p-2 ${colors.bg} rounded-xl`}>
                          <stat.icon className={`h-4 w-4 ${colors.text}`} />
                        </div>
                      </div>
                      <p className={`text-2xl font-bold ${colors.text}`}>
                        {stat.data?.message ? "N/A" : formatNumber(stat.data?.filtered ?? stat.data?.total ?? 0)}
                      </p>
                      {!stat.data?.message && (
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          <span>All time: <b className="text-gray-700">{formatNumber(stat.data?.total || 0)}</b></span>
                        </div>
                      )}
                      {stat.data?.message && (
                        <p className="text-xs text-gray-400 mt-1">{stat.data.message}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const colors = colorMap[stat.color];
            return (
              <Card key={stat.title} className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2 px-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <div className={`p-1.5 ${colors.bg} rounded-lg`}>
                        <stat.icon className={`h-4 w-4 ${colors.text}`} />
                      </div>
                      {stat.title}
                    </CardTitle>
                    {stat.data?.byDay && stat.data.byDay.length > 0 && (
                      <button
                        onClick={() => setExpandedChart(stat.title)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Expand chart"
                      >
                        <Maximize2 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {loading ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  ) : (
                    <div className="space-y-4">
                      {/* Summary Row */}
                      <div className="grid grid-cols-4 gap-2">
                        <div className={`p-3 rounded-lg ${colors.light} text-center`}>
                          <p className="text-lg font-bold text-gray-800">{formatNumber(stat.data?.filtered ?? stat.data?.total ?? 0)}</p>
                          <p className="text-xs text-gray-500">In Range</p>
                        </div>
                        <div className={`p-3 rounded-lg ${colors.light} text-center`}>
                          <p className="text-lg font-bold text-gray-800">{formatNumber(stat.data?.total || 0)}</p>
                          <p className="text-xs text-gray-500">All Time</p>
                        </div>
                        <div className={`p-3 rounded-lg ${colors.light} text-center`}>
                          <p className="text-lg font-bold text-gray-800">{stat.data?.thisWeek || 0}</p>
                          <p className="text-xs text-gray-500">This Week</p>
                        </div>
                        <div className={`p-3 rounded-lg ${colors.light} text-center`}>
                          <p className="text-lg font-bold text-gray-800">{stat.data?.thisMonth || 0}</p>
                          <p className="text-xs text-gray-500">This Month</p>
                        </div>
                      </div>

                      {/* Mini Chart */}
                      {stat.data?.byDay && stat.data.byDay.length > 0 && (
                        <div className="h-[120px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stat.data.byDay.map(d => ({ ...d, formattedDate: formatDate(d.date) }))}>
                              <defs>
                                <linearGradient id={`color-${stat.color}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={chartColorHex[stat.color] || "#10b981"} stopOpacity={0.3} />
                                  <stop offset="95%" stopColor={chartColorHex[stat.color] || "#10b981"} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                              <YAxis
                                tick={{ fontSize: 10, fill: "#9ca3af" }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                                domain={stat.color === "cyan" || stat.color === "blue" || stat.color === "purple" ? [0, sharedYMax] : [0, "auto"]}
                              />
                              <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                              <Area
                                type="monotone"
                                dataKey="count"
                                stroke={chartColorHex[stat.color] || "#10b981"}
                                strokeWidth={2}
                                fill={`url(#color-${stat.color})`}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

        </div>

        {/* Promo Code Details */}
        {!loading && data?.promos && (
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="pb-2 px-5">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 bg-pink-100 rounded-lg">
                  <Ticket className="h-4 w-4 text-pink-600" />
                </div>
                Promo Code Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-pink-50 text-center">
                  <p className="text-lg font-bold text-gray-800">{data.promos.filtered}</p>
                  <p className="text-xs text-gray-500">Redemptions (In Range)</p>
                </div>
                <div className="p-3 rounded-lg bg-pink-50 text-center">
                  <p className="text-lg font-bold text-gray-800">{data.promos.uniqueUsers.filtered}</p>
                  <p className="text-xs text-gray-500">Unique Users (In Range)</p>
                </div>
                <div className="p-3 rounded-lg bg-pink-50 text-center">
                  <p className="text-lg font-bold text-gray-800">${(data.promos.discountCents.filtered / 100).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Discount Given (In Range)</p>
                </div>
                <div className="p-3 rounded-lg bg-pink-50 text-center">
                  <p className="text-lg font-bold text-gray-800">{data.promos.uniqueUsers.total}</p>
                  <p className="text-xs text-gray-500">Unique Users (All Time)</p>
                </div>
              </div>

              {/* Per-code breakdown */}
              {data.promos.byCode.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Codes Redeemed (In Range)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-2 px-3 font-medium text-gray-600">Code</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-600">Redemptions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.promos.byCode.map((item) => (
                          <tr key={item.code} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-2 px-3 font-mono text-xs">{item.code}</td>
                            <td className="py-2 px-3 text-right font-semibold">{item.redemptions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">No promo codes redeemed in selected range</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Expanded Chart Modal */}
      {expandedChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden">
            {(() => {
              const stat = stats.find(s => s.title === expandedChart);
              if (!stat) return null;
              const colors = colorMap[stat.color];
              return (
                <>
                  <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${colors.bg} rounded-xl`}>
                        <stat.icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">{stat.title}</h2>
                    </div>
                    <button
                      onClick={() => setExpandedChart(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                  <div className="p-6">
                    {/* Summary Row */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className={`p-4 rounded-xl ${colors.light} text-center`}>
                        <p className="text-2xl font-bold text-gray-800">{formatNumber(stat.data?.filtered ?? stat.data?.total ?? 0)}</p>
                        <p className="text-sm text-gray-500">In Range</p>
                      </div>
                      <div className={`p-4 rounded-xl ${colors.light} text-center`}>
                        <p className="text-2xl font-bold text-gray-800">{formatNumber(stat.data?.total || 0)}</p>
                        <p className="text-sm text-gray-500">All Time</p>
                      </div>
                      <div className={`p-4 rounded-xl ${colors.light} text-center`}>
                        <p className="text-2xl font-bold text-gray-800">{stat.data?.thisWeek || 0}</p>
                        <p className="text-sm text-gray-500">This Week</p>
                      </div>
                      <div className={`p-4 rounded-xl ${colors.light} text-center`}>
                        <p className="text-2xl font-bold text-gray-800">{stat.data?.thisMonth || 0}</p>
                        <p className="text-sm text-gray-500">This Month</p>
                      </div>
                    </div>
                    {/* Large Chart */}
                    {stat.data?.byDay && stat.data.byDay.length > 0 && (
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stat.data.byDay.map(d => ({ ...d, formattedDate: formatDate(d.date) }))}>
                            <defs>
                              <linearGradient id={`color-expanded-${stat.color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={stat.color === "blue" ? "#3b82f6" : stat.color === "purple" ? "#8b5cf6" : "#10b981"} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={stat.color === "blue" ? "#3b82f6" : stat.color === "purple" ? "#8b5cf6" : "#10b981"} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="formattedDate" tick={{ fontSize: 12, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                            <YAxis
                              tick={{ fontSize: 12, fill: "#6b7280" }}
                              tickLine={false}
                              axisLine={false}
                              width={40}
                              domain={stat.color === "cyan" || stat.color === "blue" || stat.color === "purple" ? [0, sharedYMax] : [0, "auto"]}
                            />
                            <Tooltip contentStyle={{ fontSize: "14px", borderRadius: "12px", padding: "10px 14px" }} />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke={stat.color === "blue" ? "#3b82f6" : stat.color === "purple" ? "#8b5cf6" : "#10b981"}
                              strokeWidth={2.5}
                              fill={`url(#color-expanded-${stat.color})`}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
