"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parse } from "date-fns";
import { Users, UserPlus, UserCheck, RefreshCw } from "lucide-react";

interface NewVsReturning {
  new: number;
  returning: number;
  newSessions: number;
  returningSessions: number;
}

interface DailyData {
  date: string;
  newUsers: number;
  returningUsers: number;
}

const COLORS = ["#10b981", "#3b82f6"];

export default function UsersPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey } = useDashboard();

  const [newVsReturning, setNewVsReturning] = useState<NewVsReturning | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
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

        const res = await fetch(`/api/ga/users?${params}`);
        const data = await res.json();

        if (res.ok) {
          setNewVsReturning(data.newVsReturning || null);
          setDailyData(data.byDay || []);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
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

  const totalUsers = (newVsReturning?.new || 0) + (newVsReturning?.returning || 0);
  const newPercent = totalUsers > 0 ? ((newVsReturning?.new || 0) / totalUsers) * 100 : 0;
  const returningPercent = totalUsers > 0 ? ((newVsReturning?.returning || 0) / totalUsers) * 100 : 0;

  const pieData = [
    { name: "New Users", value: newVsReturning?.new || 0 },
    { name: "Returning Users", value: newVsReturning?.returning || 0 },
  ];

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header title="New vs Returning Users" />

      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-auto">
        {isDemoMode ? (
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">Connect Google Analytics to view user data</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(totalUsers)}</p>
                      </div>
                      <div className="p-2.5 bg-blue-100 rounded-xl">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">New Users</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatNumber(newVsReturning?.new || 0)}</p>
                        <p className="text-xs text-gray-400">{newPercent.toFixed(1)}% of total</p>
                      </div>
                      <div className="p-2.5 bg-emerald-100 rounded-xl">
                        <UserPlus className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Returning Users</p>
                        <p className="text-2xl font-bold text-blue-600">{formatNumber(newVsReturning?.returning || 0)}</p>
                        <p className="text-xs text-gray-400">{returningPercent.toFixed(1)}% of total</p>
                      </div>
                      <div className="p-2.5 bg-blue-100 rounded-xl">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Returning Visitors %</p>
                        <p className="text-2xl font-bold text-purple-600">{returningPercent.toFixed(1)}%</p>
                        <p className="text-xs text-gray-400">Had visited before</p>
                      </div>
                      <div className="p-2.5 bg-purple-100 rounded-xl">
                        <UserCheck className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Daily Trend */}
              <Card className="bg-white shadow-sm border-0 lg:col-span-2">
                <CardHeader className="pb-2 px-5">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    Daily New vs Returning Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-5 pb-5">
                  {isLoading ? (
                    <Skeleton className="h-[280px] w-full rounded-xl" />
                  ) : dailyData.length === 0 ? (
                    <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">No data available</p>
                    </div>
                  ) : (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData.map((d) => ({ ...d, formattedDate: formatDate(d.date) }))}>
                          <defs>
                            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={false}
                          />
                          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} width={40} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                          <Area
                            type="monotone"
                            dataKey="newUsers"
                            name="New Users"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorNew)"
                          />
                          <Area
                            type="monotone"
                            dataKey="returningUsers"
                            name="Returning Users"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorReturning)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2 px-5">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {isLoading ? (
                    <Skeleton className="h-[280px] w-full rounded-xl" />
                  ) : totalUsers === 0 ? (
                    <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">No data available</p>
                    </div>
                  ) : (
                    <div className="h-[280px] flex flex-col items-center justify-center">
                      <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={2}
                            >
                              {pieData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatNumber(value as number)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex gap-6 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-sm text-gray-600">New ({newPercent.toFixed(0)}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-sm text-gray-600">Returning ({returningPercent.toFixed(0)}%)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
