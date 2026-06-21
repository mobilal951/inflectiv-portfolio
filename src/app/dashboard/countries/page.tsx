"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CountryData {
  country: string;
  activeUsers: number;
  sessions: number;
}

export default function CountriesPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey, setLastUpdated, setRefreshing } = useDashboard();

  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty || contextLoading) return;

      setLoading(true);
      setError(null);

      if (isDemoMode) {
        const mockCountries: CountryData[] = [
          { country: "United States", activeUsers: 4521, sessions: 6234 },
          { country: "United Kingdom", activeUsers: 2134, sessions: 3456 },
          { country: "Germany", activeUsers: 1876, sessions: 2543 },
          { country: "France", activeUsers: 1234, sessions: 1876 },
          { country: "Canada", activeUsers: 987, sessions: 1432 },
          { country: "Australia", activeUsers: 876, sessions: 1234 },
          { country: "Netherlands", activeUsers: 654, sessions: 987 },
          { country: "Spain", activeUsers: 543, sessions: 765 },
          { country: "Italy", activeUsers: 432, sessions: 654 },
          { country: "Brazil", activeUsers: 321, sessions: 543 },
          { country: "India", activeUsers: 287, sessions: 432 },
          { country: "Japan", activeUsers: 234, sessions: 345 },
        ];

        await new Promise((resolve) => setTimeout(resolve, 500));
        setCountries(mockCountries);
        setLastUpdated(new Date());
        setRefreshing(false);
        setLoading(false);
        return;
      }

      const { startDate, endDate } = getDateParams();
      const params = new URLSearchParams({
        propertyId: selectedProperty,
        startDate,
        endDate,
        limit: "20",
      });

      try {
        const response = await fetch(`/api/ga/countries?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setCountries(data.countries);
        setLastUpdated(new Date());
        setRefreshing(false);
      } catch (err: any) {
        setError(err.message);
        setRefreshing(false);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedProperty, getDateParams, contextLoading, isDemoMode, refreshKey]);

  const isLoading = loading || contextLoading;

  const totalUsers = countries.reduce((sum, c) => sum + c.activeUsers, 0);
  const totalSessions = countries.reduce((sum, c) => sum + c.sessions, 0);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Countries" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Countries</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              ) : (
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{countries.length}</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
              ) : (
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{totalUsers.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Sessions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
              ) : (
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{totalSessions.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Countries Chart */}
        <Card className="shadow-sm">
          <CardHeader className="px-3 sm:px-4 md:px-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Traffic by Country</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-3 md:px-6">
            {isLoading ? (
              <Skeleton className="h-[300px] sm:h-[400px] md:h-[500px] w-full" />
            ) : (
              <div className="h-[300px] sm:h-[400px] md:h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countries.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "#374151" }} />
                    <YAxis
                      dataKey="country"
                      type="category"
                      tick={{ fontSize: 12, fill: "#374151" }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Bar dataKey="activeUsers" name="Users" fill="#3b82f6" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#374151', fontSize: 10 }} />
                    <Bar dataKey="sessions" name="Sessions" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#374151', fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Countries Table */}
        <Card className="shadow-sm">
          <CardHeader className="px-3 sm:px-4 md:px-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Country Details</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-2 md:px-6">
            {isLoading ? (
              <div className="space-y-2 px-3 sm:px-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 sm:h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Country</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground hidden sm:table-cell">Sessions</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((country, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium">{country.country}</td>
                        <td className="text-right py-2 sm:py-3 px-3 sm:px-4">{country.activeUsers.toLocaleString()}</td>
                        <td className="text-right py-2 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">{country.sessions.toLocaleString()}</td>
                        <td className="text-right py-2 sm:py-3 px-3 sm:px-4">
                          {totalUsers > 0 ? ((country.activeUsers / totalUsers) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
