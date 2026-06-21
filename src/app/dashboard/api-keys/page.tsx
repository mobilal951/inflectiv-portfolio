"use client";

import { useState, useEffect, useCallback } from "react";

interface ApiKeyStats {
  overview: {
    totalKeys: number;
    activeKeys: number;
    inactiveKeys: number;
    expiredKeys: number;
    newThisMonth: number;
    uniqueUsers: number;
    recentlyUsed: number;
    neverUsed: number;
  };
  byStatus: { status: string; count: number }[];
  topUsers: { userId: string; username: string | null; fullName: string | null; keyCount: number; activeCount: number }[];
  dailyKeys: { date: string; count: number }[];
  recentKeys: {
    id: string;
    userId: string;
    username: string | null;
    name: string | null;
    keyPrefix: string | null;
    datasetName: string | null;
    isActive: boolean;
    createdAt: string;
    lastUsedAt: string | null;
    expiresAt: string | null;
  }[];
  message?: string;
}

export default function ApiKeysPage() {
  const [stats, setStats] = useState<ApiKeyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stats/api-keys");
      if (!response.ok) {
        throw new Error("Failed to fetch API key statistics");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return "-"; }
  };

  const truncateId = (id: string | number | null | undefined) => {
    if (id === null || id === undefined) return "-";
    const str = String(id);
    if (str.length < 8) return str;
    return `${str.slice(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Key Statistics</h1>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {stats?.message && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            {stats.message}
          </div>
        )}

        {stats && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Total API Keys</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.overview.totalKeys)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Active Keys</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatNumber(stats.overview.activeKeys)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Inactive Keys</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{formatNumber(stats.overview.inactiveKeys)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">New This Month</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{formatNumber(stats.overview.newThisMonth)}</p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Unique Users</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(stats.overview.uniqueUsers)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Expired Keys</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatNumber(stats.overview.expiredKeys)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Used (Last 7 Days)</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">{formatNumber(stats.overview.recentlyUsed)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Never Used</h3>
                <p className="text-2xl font-bold text-orange-600 mt-2">{formatNumber(stats.overview.neverUsed)}</p>
              </div>
            </div>

            {/* Status & Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Keys by Status</h3>
                <div className="space-y-4">
                  {stats.byStatus.map((status, index) => {
                    const total = stats.overview.totalKeys;
                    const percentage = total > 0 ? (status.count / total) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-700 capitalize">{status.status}</span>
                          <span className="font-semibold">{formatNumber(status.count)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${status.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Users by Key Count</h3>
                {stats.topUsers.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topUsers.map((user, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{user.fullName || user.username || truncateId(user.userId)}</span>
                          {(user.fullName || user.username) && (
                            <span className="text-xs text-gray-400 ml-2">({user.username || `ID: ${user.userId}`})</span>
                          )}
                          <div className="text-sm text-gray-500">{user.activeCount} active / {user.keyCount} total</div>
                        </div>
                        <span className="text-lg font-semibold text-blue-600">{formatNumber(user.keyCount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No users found</p>
                )}
              </div>
            </div>

            {/* Daily Keys Chart */}
            {stats.dailyKeys.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Keys Created (Last 30 Days)</h3>
                <div className="flex gap-1">
                  {stats.dailyKeys.map((day, index) => {
                    const maxCount = Math.max(...stats.dailyKeys.map(d => d.count));
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 min-w-[16px] flex flex-col items-center" title={`${day.date}: ${day.count} keys`}>
                        <div className="h-24 w-full flex items-end justify-center">
                          <div className="w-3 bg-blue-500 rounded-t" style={{ height: `${height}%`, minHeight: day.count > 0 ? "4px" : "0" }} />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(day.date).getDate()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent API Keys */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent API Keys</h3>
              {stats.recentKeys.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key Prefix</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dataset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentKeys.map((key, idx) => (
                        <tr key={key.id || idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-700">{key.username || truncateId(key.userId)}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-700">{key.keyPrefix || "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{key.datasetName || "-"}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${key.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {key.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(key.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No API keys found</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
