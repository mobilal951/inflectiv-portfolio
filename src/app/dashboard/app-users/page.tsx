"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Mail, Wallet, Search, Database, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface FirestoreUser {
  user_id: string;
  email: string | null;
  name: string;
  provider?: string;
}

interface UsersResponse {
  users: { id: string; data: FirestoreUser; authType: "zklogin" | "wallet" }[];
  total: number;
  returned: number;
  stats: {
    totalZklogin: number;
    totalWallet: number;
    pageZklogin: number;
    pageWallet: number;
  };
  byAuthProvider: { provider: string; count: number }[];
}

const AUTH_COLORS: Record<string, string> = {
  google: "#4285F4",
  zklogin: "#8B5CF6",
  wallet: "#F97316",
  sui_wallet: "#06B6D4",
  dogecoin: "#C2A633",
  local: "#6B7280",
  unknown: "#9CA3AF",
};

const AUTH_LABELS: Record<string, string> = {
  google: "Google",
  zklogin: "zkLogin",
  wallet: "EVM Wallet",
  sui_wallet: "Sui Wallet",
  dogecoin: "Dogecoin",
  local: "Local",
  unknown: "Unknown",
};

export default function FirestoreUsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });

        if (search) {
          params.set("search", search);
        }

        const res = await fetch(`/api/firebase/users?${params}`);

        // Handle authentication redirect
        if (res.status === 401) {
          setError("Authentication required. Please log in.");
          return;
        }

        const contentType = res.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          // Server error - likely Firebase/Turbopack issue on Windows
          setError("Firebase is not available locally on Windows due to Turbopack limitations. Please test on Vercel production.");
          return;
        }

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch users");
        }

        setData(json);
      } catch (err) {
        console.error("Firebase users fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }

      setLoading(false);
    }

    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [search, limit]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };


  return (
    <div className="flex flex-col h-full min-h-screen">
      <Header title="App Users" />

      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {loading && !data ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.total || 0)}</p>
                    <p className="text-xs text-gray-400">All registered users</p>
                  </div>
                  <div className="p-2.5 bg-blue-100 rounded-xl">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {loading && !data ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Email Based Users</p>
                    <p className="text-2xl font-bold text-purple-600">{formatNumber(data?.stats?.totalZklogin || 0)}</p>
                    <p className="text-xs text-gray-400">
                      {data?.total ? ((data.stats.totalZklogin / data.total) * 100).toFixed(1) : 0}% of total
                    </p>
                  </div>
                  <div className="p-2.5 bg-purple-100 rounded-xl">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {loading && !data ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Wallet Users</p>
                    <p className="text-2xl font-bold text-orange-600">{formatNumber(data?.stats?.totalWallet || 0)}</p>
                    <p className="text-xs text-gray-400">
                      {data?.total ? ((data.stats.totalWallet / data.total) * 100).toFixed(1) : 0}% of total
                    </p>
                  </div>
                  <div className="p-2.5 bg-orange-100 rounded-xl">
                    <Wallet className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {loading && !data ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Showing</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatNumber(data?.returned || 0)}</p>
                    <p className="text-xs text-gray-400">of {formatNumber(data?.total || 0)} users</p>
                  </div>
                  <div className="p-2.5 bg-emerald-100 rounded-xl">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <CardContent className="p-4">
              {loading && !data ? (
                <Skeleton className="h-16 w-full" />
              ) : data?.byAuthProvider && data.byAuthProvider.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <PieChartIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-xs text-gray-500">Auth Providers</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-[80px] w-[80px] flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.byAuthProvider}
                            dataKey="count"
                            nameKey="provider"
                            cx="50%"
                            cy="50%"
                            innerRadius={22}
                            outerRadius={38}
                            paddingAngle={2}
                          >
                            {data.byAuthProvider.map((entry, index) => (
                              <Cell key={index} fill={AUTH_COLORS[entry.provider] || AUTH_COLORS.unknown} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [
                              formatNumber(value as number),
                              AUTH_LABELS[name as string] || name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      {data.byAuthProvider.map((item) => (
                        <div key={item.provider} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: AUTH_COLORS[item.provider] || AUTH_COLORS.unknown }}
                            />
                            <span className="text-gray-600 truncate">{AUTH_LABELS[item.provider] || item.provider}</span>
                          </div>
                          <span className="font-semibold text-gray-900 ml-2">{formatNumber(item.count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Auth Providers</p>
                    <p className="text-sm text-gray-400 mt-2">No data</p>
                  </div>
                  <div className="p-2.5 bg-indigo-100 rounded-xl">
                    <PieChartIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Controls */}
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email, name, or user ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
                <option value={250}>250 rows</option>
                <option value={500}>500 rows</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-2 px-5">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              User List
              {data && <span className="text-sm font-normal text-gray-500">({data.returned} of {formatNumber(data.total)})</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-5">
            {loading && !data ? (
              <div className="space-y-2 px-5">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-5 font-medium text-gray-600">#</th>
                      <th className="text-left py-3 px-5 font-medium text-gray-600">Type</th>
                      <th className="text-left py-3 px-5 font-medium text-gray-600">Name / Wallet</th>
                      <th className="text-left py-3 px-5 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-5 font-medium text-gray-600">User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.users.map((user, index) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-5 text-gray-400">{index + 1}</td>
                        <td className="py-3 px-5">
                          {user.authType === "wallet" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              <Wallet className="h-3 w-3" />
                              Wallet
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              <Mail className="h-3 w-3" />
                              Email
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5 font-medium text-gray-900">
                          {user.data.name?.startsWith("0x") ? (
                            <span className="font-mono text-xs">{user.data.name.slice(0, 10)}...{user.data.name.slice(-8)}</span>
                          ) : (
                            user.data.name || "-"
                          )}
                        </td>
                        <td className="py-3 px-5 text-gray-600">
                          {user.data.email || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-5">
                          <span className="font-mono text-xs text-gray-500">{user.id.slice(0, 8)}...</span>
                        </td>
                      </tr>
                    ))}
                    {data?.users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
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
