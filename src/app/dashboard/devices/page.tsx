"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Monitor, Smartphone, Tablet, Globe, Cpu } from "lucide-react";

interface DeviceData {
  device: string;
  users: number;
  sessions: number;
  [key: string]: string | number;
}

interface BrowserData {
  browser: string;
  users: number;
  sessions: number;
}

interface OSData {
  os: string;
  users: number;
  sessions: number;
}

const DEVICE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const BROWSER_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#06b6d4"];

export default function DevicesPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey } = useDashboard();

  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [browsers, setBrowsers] = useState<BrowserData[]>([]);
  const [operatingSystems, setOperatingSystems] = useState<OSData[]>([]);
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

        const res = await fetch(`/api/ga/devices?${params}`);
        const data = await res.json();

        if (res.ok) {
          setDevices(data.devices || []);
          setBrowsers(data.browsers || []);
          setOperatingSystems(data.operatingSystems || []);
        }
      } catch (err) {
        console.error("Failed to fetch device data:", err);
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

  const getDeviceIcon = (device: string) => {
    const lower = device.toLowerCase();
    if (lower.includes("mobile")) return <Smartphone className="h-4 w-4" />;
    if (lower.includes("tablet")) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const totalDeviceUsers = devices.reduce((sum, d) => sum + d.users, 0);
  const totalBrowserUsers = browsers.reduce((sum, b) => sum + b.users, 0);
  const totalOSUsers = operatingSystems.reduce((sum, o) => sum + o.users, 0);

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header title="Devices & Browsers" />

      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-auto">
        {isDemoMode ? (
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-12 text-center">
              <Monitor className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">Connect Google Analytics to view device data</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Device Category Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2 px-5">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Monitor className="h-4 w-4 text-blue-600" />
                    </div>
                    Device Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {isLoading ? (
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                  ) : devices.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <p className="text-sm text-gray-500">No data available</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="h-[200px] w-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={devices}
                              dataKey="users"
                              nameKey="device"
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                            >
                              {devices.map((_, index) => (
                                <Cell key={index} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatNumber(value as number)} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-2">
                        {devices.map((device, i) => {
                          const percent = totalDeviceUsers > 0 ? (device.users / totalDeviceUsers) * 100 : 0;
                          return (
                            <div key={device.device} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }}
                                />
                                <span className="text-gray-600">{getDeviceIcon(device.device)}</span>
                                <span className="text-sm font-medium text-gray-800 capitalize">{device.device}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="text-sm text-gray-600">{formatNumber(device.users)}</span>
                                  <span className="text-xs text-gray-400 ml-1">users</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm text-gray-600">{formatNumber(device.sessions)}</span>
                                  <span className="text-xs text-gray-400 ml-1">sessions</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600 w-12 text-right">{percent.toFixed(1)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Browser Chart */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2 px-5">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Globe className="h-4 w-4 text-purple-600" />
                    </div>
                    Browsers
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {isLoading ? (
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                  ) : browsers.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <p className="text-sm text-gray-500">No data available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {browsers.slice(0, 8).map((browser, i) => {
                        const percent = totalBrowserUsers > 0 ? (browser.users / totalBrowserUsers) * 100 : 0;
                        return (
                          <div key={browser.browser} className="relative rounded-lg overflow-hidden bg-gray-50">
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-purple-100 to-purple-50"
                              style={{ width: `${percent}%` }}
                            />
                            <div className="relative flex items-center justify-between py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: BROWSER_COLORS[i % BROWSER_COLORS.length] }}
                                />
                                <span className="text-sm font-medium text-gray-800">{browser.browser}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">{formatNumber(browser.users)}</span>
                                <span className="text-sm font-semibold text-purple-600 w-12 text-right">{percent.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Operating Systems */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2 px-5">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Cpu className="h-4 w-4 text-emerald-600" />
                  </div>
                  Operating Systems
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {isLoading ? (
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                ) : operatingSystems.length === 0 ? (
                  <div className="h-[100px] flex items-center justify-center">
                    <p className="text-sm text-gray-500">No data available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {operatingSystems.slice(0, 10).map((os, i) => {
                      const percent = totalOSUsers > 0 ? (os.users / totalOSUsers) * 100 : 0;
                      return (
                        <div key={os.os} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-center">
                          <p className="text-lg font-bold text-gray-800">{percent.toFixed(1)}%</p>
                          <p className="text-sm font-medium text-gray-600 mt-1">{os.os}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatNumber(os.users)} users</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
