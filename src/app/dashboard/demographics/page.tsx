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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AgeData {
  ageGroup: string;
  users: number;
}

interface GenderData {
  gender: string;
  users: number;
  [key: string]: string | number;
}

interface DeviceData {
  device: string;
  users: number;
  [key: string]: string | number;
}

interface InterestData {
  interest: string;
  users: number;
}

interface ChannelData {
  channel: string;
  sessions: number;
  activeUsers: number;
  newUsers: number;
}

const GENDER_COLORS = ["#3b82f6", "#93c5fd"];
const DEVICE_COLORS = ["#3b82f6", "#60a5fa", "#93c5fd"];

export default function DemographicsPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey, setLastUpdated, setRefreshing } = useDashboard();

  const [ageData, setAgeData] = useState<AgeData[]>([]);
  const [genderData, setGenderData] = useState<GenderData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [interestsData, setInterestsData] = useState<InterestData[]>([]);
  const [channelsData, setChannelsData] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty || contextLoading) return;

      setLoading(true);
      setError(null);

      if (isDemoMode) {
        const mockAgeData: AgeData[] = [
          { ageGroup: "18-24", users: 2800 },
          { ageGroup: "25-34", users: 1200 },
          { ageGroup: "35-44", users: 400 },
          { ageGroup: "45-54", users: 150 },
          { ageGroup: "55-64", users: 50 },
          { ageGroup: "65+", users: 20 },
        ];

        const mockGenderData: GenderData[] = [
          { gender: "Male", users: 5934 },
          { gender: "Female", users: 4076 },
        ];

        const mockDeviceData: DeviceData[] = [
          { device: "Desktop", users: 4980 },
          { device: "Mobile", users: 4960 },
          { device: "Tablet", users: 60 },
        ];

        const mockInterestsData: InterestData[] = [
          { interest: "Technology/Technophiles", users: 1500 },
          { interest: "Lifestyles & Hobbies/Shutterbugs", users: 1000 },
          { interest: "Technology/Social Media Enthusiasts", users: 624 },
          { interest: "Banking & Finance/Avid Investors", users: 582 },
          { interest: "Technology/Mobile Enthusiasts", users: 562 },
          { interest: "News & Politics/Avid News Readers", users: 480 },
          { interest: "News & Politics/Avid News Readers...", users: 462 },
        ];

        const mockChannelsData: ChannelData[] = [
          { channel: "Direct", sessions: 6700, activeUsers: 5421, newUsers: 4200 },
          { channel: "Paid Search", sessions: 6500, activeUsers: 8152, newUsers: 5100 },
          { channel: "Referral", sessions: 4700, activeUsers: 7278, newUsers: 3500 },
          { channel: "Organic Social", sessions: 2800, activeUsers: 5206, newUsers: 2100 },
          { channel: "Organic Search", sessions: 2100, activeUsers: 3195, newUsers: 1600 },
          { channel: "Unassigned", sessions: 1800, activeUsers: 1386, newUsers: 1200 },
          { channel: "Cross-network", sessions: 401, activeUsers: 0, newUsers: 300 },
        ];

        await new Promise((resolve) => setTimeout(resolve, 500));

        setAgeData(mockAgeData);
        setGenderData(mockGenderData);
        setDeviceData(mockDeviceData);
        setInterestsData(mockInterestsData);
        setChannelsData(mockChannelsData);
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
        const response = await fetch(`/api/ga/demographics?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setAgeData(data.age || []);
        setGenderData(data.gender || []);
        setDeviceData(data.device || []);
        setInterestsData(data.interests || []);
        setChannelsData(data.channels || []);
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

  const genderTotal = genderData.reduce((sum, item) => sum + item.users, 0);
  const deviceTotal = deviceData.reduce((sum, item) => sum + item.users, 0);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Demographics" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Row 1: Gender, Age, Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Gender Donut Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              {isLoading ? (
                <Skeleton className="h-[160px] sm:h-[200px] w-full" />
              ) : (
                <>
                  <div className="h-[140px] sm:h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          dataKey="users"
                          nameKey="gender"
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {genderData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatNumber(value as number), "Users"]}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 sm:gap-8 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    {genderData.map((item, index) => (
                      <div key={item.gender} className="text-center">
                        <div className="flex items-center gap-1.5 sm:gap-2 justify-center mb-0.5 sm:mb-1">
                          <span
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                            style={{ backgroundColor: GENDER_COLORS[index % GENDER_COLORS.length] }}
                          ></span>
                          <span className="text-xs sm:text-sm font-medium text-gray-600">{item.gender}</span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                          {genderTotal > 0 ? ((item.users / genderTotal) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Age Horizontal Bar Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">Age Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              {isLoading ? (
                <Skeleton className="h-[200px] sm:h-[250px] w-full" />
              ) : (
                <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: "#374151" }}
                        tickFormatter={formatNumber}
                        axisLine={{ stroke: "#e5e7eb" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="ageGroup"
                        tick={{ fontSize: 12, fill: "#1f2937" }}
                        width={40}
                        axisLine={{ stroke: "#e5e7eb" }}
                      />
                      <Tooltip
                        formatter={(value) => [formatNumber(value as number), "Users"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                      />
                      <Bar dataKey="users" fill="#3b82f6" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#374151', fontSize: 11 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className="shadow-sm md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">Notes</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              <ul className="text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-3">
                {isDemoMode ? (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span className="text-gray-400">Connect Google Analytics to view real data</span>
                  </li>
                ) : (
                  <>
                    {genderData.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>
                          <strong>{genderData[0]?.gender}</strong> users make up{" "}
                          <strong>{genderTotal > 0 ? ((genderData[0]?.users / genderTotal) * 100).toFixed(1) : 0}%</strong>
                        </span>
                      </li>
                    )}
                    {ageData.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>
                          <strong>{ageData[0]?.ageGroup}</strong> is the largest age group
                        </span>
                      </li>
                    )}
                    {deviceData.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>
                          <strong>{deviceData[0]?.device}</strong> is most used
                        </span>
                      </li>
                    )}
                    {channelsData.length > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>
                          <strong>{channelsData[0]?.channel}</strong> drives most sessions
                        </span>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Device, Interests, Session Primary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Device Donut Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">Device Category</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6">
              {isLoading ? (
                <Skeleton className="h-[160px] sm:h-[200px] w-full" />
              ) : (
                <>
                  <div className="h-[140px] sm:h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          dataKey="users"
                          nameKey="device"
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {deviceData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [formatNumber(value as number), "Users"]}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex-wrap">
                    {deviceData.map((item, index) => (
                      <div key={item.device} className="text-center">
                        <div className="flex items-center gap-1.5 sm:gap-2 justify-center mb-0.5 sm:mb-1">
                          <span
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                            style={{ backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length] }}
                          ></span>
                          <span className="text-xs sm:text-sm font-medium text-gray-600">{item.device}</span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                          {deviceTotal > 0 ? ((item.users / deviceTotal) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Interests Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">User Interests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Interest</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={2} className="px-3 sm:px-4 py-2"><Skeleton className="h-4 sm:h-5 w-full" /></td>
                        </tr>
                      ))
                    ) : (
                      interestsData.slice(0, 5).map((item, index) => (
                        <tr key={item.interest} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-gray-700 truncate max-w-[120px] sm:max-w-[200px]" title={item.interest}>
                            {item.interest}
                          </td>
                          <td className="text-right py-2 sm:py-2.5 px-3 sm:px-4 text-gray-900 font-medium">{formatNumber(item.users)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Channels Table */}
          <Card className="shadow-sm md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-700">Traffic Channels</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td colSpan={2} className="px-3 sm:px-4 py-2"><Skeleton className="h-4 sm:h-5 w-full" /></td>
                        </tr>
                      ))
                    ) : (
                      channelsData.slice(0, 5).map((item, index) => (
                        <tr key={item.channel} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-gray-700">{item.channel}</td>
                          <td className="text-right py-2 sm:py-2.5 px-3 sm:px-4 text-gray-900 font-medium">{formatNumber(item.sessions)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
