"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { format, parse } from "date-fns";
import { Users, UserPlus, Eye, Clock, Globe, TrendingUp, MousePointerClick, Activity, Database, Info, LogIn } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function KPILabel({ children, hint }: { children: React.ReactNode; hint: string }) {
  return (
    <div className="flex items-center gap-1">
      <p className="text-xs sm:text-sm font-medium text-gray-500">{children}</p>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="focus:outline-none">
            <Info className="h-3.5 w-3.5 text-gray-400 hover:text-purple-500 cursor-help transition-colors" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="max-w-[220px] text-xs p-2 text-gray-600">
          {hint}
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface CountryData {
  country: string;
  activeUsers: number;
}

interface WebsiteTrafficData {
  date: string;
  activeUsers: number;
  ctaClicks: number;
}

interface DailyData {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
}

interface GAOverview {
  activeUsers: number;
  sessions: number;
  newUsers: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
}

interface RegistrationData {
  total: number;
  activeAccounts: number;
  periodTotal: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byDay: { date: string; count: number }[];
  appLogins?: { today: number; thisWeek: number; thisMonth: number };
}

export default function DashboardPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey, setLastUpdated, setRefreshing } = useDashboard();

  const [gaOverview, setGaOverview] = useState<GAOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [visitorsAllTime, setVisitorsAllTime] = useState<number>(0);
  const [sessionsAllTime, setSessionsAllTime] = useState<number>(0);
  const [countriesAllTime, setCountriesAllTime] = useState<CountryData[]>([]);
  const [countriesLast7Days, setCountriesLast7Days] = useState<CountryData[]>([]);
  const [websiteTraffic, setWebsiteTraffic] = useState<WebsiteTrafficData[]>([]);
  const [visitorsLast7Days, setVisitorsLast7Days] = useState<number>(0);
  const [newUsersLast7Days, setNewUsersLast7Days] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationData | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (contextLoading) return;

      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateParams();

      // Fetch GA data only if authenticated and property selected
      if (!isDemoMode && selectedProperty) {
        const params = new URLSearchParams({
          propertyId: selectedProperty,
          startDate,
          endDate,
        });

        // Params for last 7 days
        const last7DaysParams = new URLSearchParams({
          propertyId: selectedProperty,
          startDate: "7daysAgo",
          endDate: "today",
        });

        // Params for "all time" (last 365 days or from launch)
        const allTimeParams = new URLSearchParams({
          propertyId: selectedProperty,
          startDate: "365daysAgo",
          endDate: "today",
        });

        try {
          // Fetch all GA data in parallel
          const [trafficRes, countriesAllTimeRes, countriesLast7DaysRes, allTimeTrafficRes, last7DaysTrafficRes] = await Promise.all([
            fetch(`/api/ga/traffic?${params}`),
            fetch(`/api/ga/countries?${allTimeParams}`),
            fetch(`/api/ga/countries?${last7DaysParams}`),
            fetch(`/api/ga/traffic?${allTimeParams}`),
            fetch(`/api/ga/traffic?${last7DaysParams}`),
          ]);

          const [trafficData, countriesAllTimeData, countriesLast7DaysData, allTimeTrafficData, last7DaysTrafficData] = await Promise.all([
            trafficRes.json(),
            countriesAllTimeRes.json(),
            countriesLast7DaysRes.json(),
            allTimeTrafficRes.json(),
            last7DaysTrafficRes.json(),
          ]);

          if (trafficRes.ok) {
            setGaOverview(trafficData.overview);
            setWebsiteTraffic(trafficData.websiteTraffic || []);
            setDailyData(trafficData.dailyData || []);
          }

          if (countriesAllTimeRes.ok) {
            setCountriesAllTime(countriesAllTimeData.countries || []);
          }

          if (countriesLast7DaysRes.ok) {
            setCountriesLast7Days(countriesLast7DaysData.countries || []);
          }

          // Set visitors all time
          if (allTimeTrafficRes.ok) {
            setVisitorsAllTime(allTimeTrafficData.overview?.activeUsers || 0);
            setSessionsAllTime(allTimeTrafficData.overview?.sessions || 0);
          }

          // Set visitors in last 7 days
          if (last7DaysTrafficRes.ok) {
            setVisitorsLast7Days(last7DaysTrafficData.overview?.activeUsers || 0);
            setNewUsersLast7Days(last7DaysTrafficData.overview?.newUsers || 0);
          }
        } catch (err: any) {
          console.error("Failed to fetch GA data:", err);
          setError("Failed to fetch Google Analytics data. Please sign in.");
        }
      }

      // Fetch Firestore registrations data (using same date range)
      try {
        const regParams = new URLSearchParams({
          startDate,
          endDate,
        });
        const regRes = await fetch(`/api/firebase/registrations?${regParams}`);
        const contentType = regRes.headers.get("content-type");
        if (contentType?.includes("application/json") && regRes.ok) {
          const regData = await regRes.json();
          setRegistrations(regData);
        }
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
      }

      setLastUpdated(new Date());
      setRefreshing(false);
      setLoading(false);
    }

    fetchData();
  }, [selectedProperty, getDateParams, contextLoading, isDemoMode, refreshKey]);

  const isLoading = loading || contextLoading;

  // Format date for charts
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

  // Format number with K suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header title="Traffic Overview" />

      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Website Visitors (GA) */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-all border-0 overflow-hidden group">
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : isDemoMode ? (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Unique visitors to your website, tracked via Google Analytics">Website Visitors</KPILabel>
                    <p className="text-lg text-gray-400 mt-1">Connect GA</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Unique visitors to your website, tracked via Google Analytics">Website Visitors</KPILabel>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatNumber(visitorsAllTime)}</p>
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {formatNumber(visitorsLast7Days)} last 7d
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Visitors (GA) */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-all border-0 overflow-hidden group">
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : isDemoMode ? (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="First-time website visitors, tracked via Google Analytics. Not app signups.">New Visitors</KPILabel>
                    <p className="text-lg text-gray-400 mt-1">Connect GA</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="First-time website visitors, tracked via Google Analytics. Not app signups.">New Visitors</KPILabel>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatNumber(gaOverview?.newUsers || 0)}</p>
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {formatNumber(newUsersLast7Days)} last 7d
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-all border-0 overflow-hidden group">
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : isDemoMode ? (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Total browsing sessions on your website, tracked via Google Analytics">Sessions</KPILabel>
                    <p className="text-lg text-gray-400 mt-1">Connect GA</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Total browsing sessions on your website, tracked via Google Analytics">Sessions</KPILabel>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatNumber(sessionsAllTime)}</p>
                    <p className="text-xs text-purple-600 mt-1">
                      {formatNumber(gaOverview?.sessions || 0)} in period
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Page Views */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-all border-0 overflow-hidden group">
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : isDemoMode ? (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Total pages viewed across all website sessions, tracked via Google Analytics">Page Views</KPILabel>
                    <p className="text-lg text-gray-400 mt-1">Connect GA</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Total pages viewed across all website sessions, tracked via Google Analytics">Page Views</KPILabel>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatNumber(gaOverview?.pageViews || 0)}</p>
                    <p className="text-xs text-orange-600 mt-1">
                      Avg: {formatDuration(gaOverview?.avgSessionDuration || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform">
                    <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Registrations */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-all border-0 overflow-hidden group">
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : !registrations ? (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Total users who created an account in the app (from database)">App Users</KPILabel>
                    <p className="text-lg text-gray-400 mt-1">Loading...</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                    <Database className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Total users who created an account in the app (from database)">Total Registered</KPILabel>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatNumber(registrations.total)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Active: {formatNumber(registrations.activeAccounts || 0)}
                    </p>
                    <p className="text-xs text-cyan-600 mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +{registrations.periodTotal} new in period
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                    <Database className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Logins */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-all border-0 overflow-hidden group">
            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : !registrations?.appLogins ? (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Users who logged into the app, tracked from login streaks in the database">App Logins</KPILabel>
                    <p className="text-lg text-gray-400 mt-1">N/A</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                    <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <KPILabel hint="Users who logged into the app, tracked from login streaks in the database">App Logins</KPILabel>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{formatNumber(registrations.appLogins.thisMonth)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last 30 days
                    </p>
                    <p className="text-xs text-indigo-600 mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {registrations.appLogins.today} today, {registrations.appLogins.thisWeek} this week
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                    <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column: Charts */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Daily Traffic Chart */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2 px-5">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  Daily Website Visitors
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-5 pb-5">
                {isDemoMode ? (
                  <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Connect Google Analytics to view</p>
                    </div>
                  </div>
                ) : isLoading ? (
                  <Skeleton className="h-[250px] w-full rounded-xl" />
                ) : dailyData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">No data available</p>
                  </div>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyData.map(d => ({ ...d, formattedDate: formatDate(d.date) }))}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                          contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)" }}
                          formatter={(value) => [value as number, "Website Visitors"]}
                        />
                        <Area type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Website Traffic with CTA */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2 px-5">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <MousePointerClick className="h-4 w-4 text-purple-600" />
                  </div>
                  Traffic & CTA Clicks
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-5 pb-5">
                {isDemoMode ? (
                  <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <MousePointerClick className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Connect Google Analytics to view</p>
                    </div>
                  </div>
                ) : isLoading ? (
                  <Skeleton className="h-[250px] w-full rounded-xl" />
                ) : websiteTraffic.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">No data available</p>
                  </div>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={websiteTraffic.map(d => ({ ...d, formattedDate: formatDate(d.date) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="formattedDate"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          axisLine={{ stroke: "#e5e7eb" }}
                          tickLine={false}
                        />
                        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} width={40} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} width={40} />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)" }} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Bar yAxisId="left" dataKey="activeUsers" name="Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="ctaClicks" name="CTA Clicks" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Registrations Chart */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2 px-5">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-100 rounded-lg">
                    <Database className="h-4 w-4 text-cyan-600" />
                  </div>
                  Daily App Registrations
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-5 pb-5">
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                ) : !registrations || registrations.byDay.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">No registration data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Registration Stats */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-3 rounded-lg bg-cyan-50 text-center">
                        <p className="text-lg font-bold text-gray-800">{formatNumber(registrations.total)}</p>
                        <p className="text-xs text-gray-500">All Time</p>
                      </div>
                      <div className="p-3 rounded-lg bg-cyan-100 text-center">
                        <p className="text-lg font-bold text-cyan-700">{formatNumber(registrations.periodTotal)}</p>
                        <p className="text-xs text-gray-500">In Period</p>
                      </div>
                      <div className="p-3 rounded-lg bg-cyan-50 text-center">
                        <p className="text-lg font-bold text-gray-800">{registrations.thisWeek}</p>
                        <p className="text-xs text-gray-500">This Week</p>
                      </div>
                      <div className="p-3 rounded-lg bg-cyan-50 text-center">
                        <p className="text-lg font-bold text-gray-800">{registrations.today}</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="h-[150px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={registrations.byDay.map(d => ({ ...d, formattedDate: formatDate(d.date) }))}>
                          <defs>
                            <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 10, fill: "#6b7280" }}
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={false}
                          />
                          <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} width={30} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)" }}
                            formatter={(value) => [value as number, "Registrations"]}
                          />
                          <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRegistrations)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Countries */}
          <div className="space-y-4 sm:space-y-6">
            {isDemoMode ? (
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-6 text-center">
                  <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Visitors by Country</p>
                  <p className="text-base text-gray-500 mt-2">Connect Google Analytics to view</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* All Time Countries */}
                <Card className="bg-white shadow-sm border-0 overflow-hidden">
                  <CardHeader className="pb-2 px-5 pt-5">
                    <CardTitle className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Globe className="h-4 w-4 text-blue-600" />
                      </div>
                      Top Countries (All Time)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="space-y-2">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full rounded-lg" />
                        ))
                      ) : countriesAllTime.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No data</p>
                      ) : (
                        (() => {
                          const totalUsers = countriesAllTime.reduce((sum, c) => sum + c.activeUsers, 0);
                          return countriesAllTime.slice(0, 5).map((country, i) => {
                            const sharePercent = totalUsers > 0 ? (country.activeUsers / totalUsers) * 100 : 0;
                            return (
                              <div key={country.country} className="relative rounded-lg overflow-hidden bg-gray-50">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50" style={{ width: `${sharePercent}%` }} />
                                <div className="relative flex items-center justify-between py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-400 w-4">{i + 1}</span>
                                    <span className="text-sm font-medium text-gray-800">{country.country}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">{formatNumber(country.activeUsers)}</span>
                                    <span className="text-sm font-semibold text-blue-600 w-12 text-right">{sharePercent.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Last 7 Days Countries */}
                <Card className="bg-white shadow-sm border-0 overflow-hidden">
                  <CardHeader className="pb-2 px-5 pt-5">
                    <CardTitle className="text-sm sm:text-base font-semibold text-gray-700 flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <Globe className="h-4 w-4 text-emerald-600" />
                      </div>
                      Top Countries (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="space-y-2">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full rounded-lg" />
                        ))
                      ) : countriesLast7Days.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No data</p>
                      ) : (
                        (() => {
                          const totalUsers = countriesLast7Days.reduce((sum, c) => sum + c.activeUsers, 0);
                          return countriesLast7Days.slice(0, 5).map((country, i) => {
                            const sharePercent = totalUsers > 0 ? (country.activeUsers / totalUsers) * 100 : 0;
                            return (
                              <div key={country.country} className="relative rounded-lg overflow-hidden bg-gray-50">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-emerald-50" style={{ width: `${sharePercent}%` }} />
                                <div className="relative flex items-center justify-between py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-400 w-4">{i + 1}</span>
                                    <span className="text-sm font-medium text-gray-800">{country.country}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">{formatNumber(country.activeUsers)}</span>
                                    <span className="text-sm font-semibold text-emerald-600 w-12 text-right">{sharePercent.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 shadow-lg border-0 overflow-hidden text-white">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-white/90 mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Bounce Rate</span>
                        <span className="font-semibold">{(gaOverview?.bounceRate || 0).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Avg. Duration</span>
                        <span className="font-semibold">{formatDuration(gaOverview?.avgSessionDuration || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">Pages/Session</span>
                        <span className="font-semibold">
                          {(gaOverview?.pagesPerSession || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
