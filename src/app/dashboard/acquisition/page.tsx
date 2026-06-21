"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ResponsivePie } from "@nivo/pie";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SourceData {
  channel: string;
  activeUsers: number;
  sessions: number;
  newUsers: number;
  [key: string]: string | number;
}


const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function PieChartWithLabels({ sources }: { sources: SourceData[] }) {
  const pieData = useMemo(() =>
    [...sources]
      .sort((a, b) => b.sessions - a.sessions)
      .filter((s) => s.sessions > 0)
      .map((s, i) => ({
        id: s.channel,
        label: s.channel,
        value: s.sessions,
        color: COLORS[i % COLORS.length],
      })),
    [sources]
  );

  return (
    <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
      <ResponsivePie
        data={pieData}
        colors={{ datum: "data.color" }}
        margin={{ top: 30, right: 120, bottom: 30, left: 120 }}
        sortByValue
        padAngle={1}
        cornerRadius={2}
        activeOuterRadiusOffset={6}
        arcLinkLabelsSkipAngle={5}
        arcLinkLabelsTextColor="#374151"
        theme={{ labels: { text: { fontSize: 13, fontWeight: 600 } } }}
        arcLinkLabelsThickness={1}
        arcLinkLabelsColor={{ from: "color" }}
        arcLinkLabelsDiagonalLength={16}
        arcLinkLabelsStraightLength={24}
        arcLinkLabelsTextOffset={4}
        arcLabelsSkipAngle={15}
        arcLabelsTextColor="#ffffff"
        valueFormat={(v) => {
          const total = pieData.reduce((s, d) => s + d.value, 0);
          return `${((v / total) * 100).toFixed(0)}%`;
        }}
        tooltip={({ datum }) => {
          const total = pieData.reduce((s, d) => s + d.value, 0);
          const pct = ((datum.value / total) * 100).toFixed(1);
          return (
            <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: datum.color }} />
                <span className="font-medium text-gray-700">{datum.label}</span>
              </div>
              <div className="text-gray-500 mt-1">{datum.value.toLocaleString()} sessions ({pct}%)</div>
            </div>
          );
        }}
      />
    </div>
  );
}

export default function AcquisitionPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey, setLastUpdated, setRefreshing } = useDashboard();

  const [sources, setSources] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty || contextLoading) return;

      setLoading(true);
      setError(null);

      if (isDemoMode) {
        const mockSources: SourceData[] = [
          { channel: "Organic Search", activeUsers: 5432, sessions: 7654, newUsers: 1234 },
          { channel: "Direct", activeUsers: 3210, sessions: 4567, newUsers: 876 },
          { channel: "Social", activeUsers: 2345, sessions: 3210, newUsers: 654 },
          { channel: "Referral", activeUsers: 1234, sessions: 1876, newUsers: 432 },
          { channel: "Email", activeUsers: 232, sessions: 427, newUsers: 125 },
        ];

        await new Promise((resolve) => setTimeout(resolve, 500));
        setSources(mockSources);
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
      });

      try {
        const response = await fetch(`/api/ga/sources?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setSources(data.sources);
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Acquisition" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Traffic Sources Pie Chart */}
          <Card className="shadow-sm">
            <CardHeader className="px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 md:px-6">
              {isLoading ? (
                <Skeleton className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full" />
              ) : (
                <PieChartWithLabels sources={sources} />
              )}
            </CardContent>
          </Card>

          {/* Traffic Sources Bar Chart */}
          <Card className="shadow-sm">
            <CardHeader className="px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">Users by Channel</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 md:px-6">
              {isLoading ? (
                <Skeleton className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full" />
              ) : (
                <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sources} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#374151" }} />
                      <YAxis dataKey="channel" type="category" tick={{ fontSize: 12, fill: "#374151" }} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="activeUsers" name="Users" fill="#3b82f6" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#374151', fontSize: 10 }} />
                      <Bar dataKey="newUsers" name="New Users" fill="#8b5cf6" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#374151', fontSize: 10 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Channel Details Table */}
        <Card className="shadow-sm">
          <CardHeader className="px-3 sm:px-4 md:px-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">Channel Details</CardTitle>
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
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Channel</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Users</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground hidden sm:table-cell">New</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium">{source.channel}</td>
                        <td className="text-right py-2 sm:py-3 px-3 sm:px-4">{source.activeUsers.toLocaleString()}</td>
                        <td className="text-right py-2 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">{source.newUsers.toLocaleString()}</td>
                        <td className="text-right py-2 sm:py-3 px-3 sm:px-4">{source.sessions.toLocaleString()}</td>
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
