"use client";

import { useState, useEffect, useCallback } from "react";

interface CreditStats {
  overview: {
    usersWithCredits: number;
    totalBalance: number;
    totalEarned: number;
    totalSpent: number;
    earnedThisMonth: number;
    spentThisMonth: number;
    totalTransactions: number;
  };
  byType: {
    type: string;
    earned: number;
    spent: number;
    balance: number;
  }[];
  topConsumers: {
    userId: string;
    totalSpent: number;
    transactionCount: number;
  }[];
  recentTransactions: {
    id: string;
    userId: string;
    creditType: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string;
  }[];
  dailyUsage: {
    date: string;
    earned: number;
    spent: number;
  }[];
  pools: {
    id: string;
    name: string;
    totalCredits: number;
    allocatedCredits: number;
    createdAt: string;
  }[];
  message?: string;
}

export default function CreditsPage() {
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stats/credits");
      if (!response.ok) {
        throw new Error("Failed to fetch credit statistics");
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const truncateId = (id: string | null | undefined) => {
    if (!id || id.length < 8) return id || "-";
    return `${id.slice(0, 8)}...`;
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Credit Usage Statistics
          </h1>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
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
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Users with Credits
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.overview.usersWithCredits)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Balance
                </h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {formatNumber(stats.overview.totalBalance)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Earned (All Time)
                </h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  +{formatNumber(stats.overview.totalEarned)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Spent (All Time)
                </h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  -{formatNumber(stats.overview.totalSpent)}
                </p>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Earned This Month
                </h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  +{formatNumber(stats.overview.earnedThisMonth)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Spent This Month
                </h3>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  -{formatNumber(stats.overview.spentThisMonth)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Transactions
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.overview.totalTransactions)}
                </p>
              </div>
            </div>

            {/* Credit Types & Top Consumers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Credits by Type
                </h3>
                {stats.byType.length > 0 ? (
                  <div className="space-y-3">
                    {stats.byType.map((type, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {type.type || "default"}
                          </span>
                          <div className="text-sm text-gray-500">
                            <span className="text-green-600">+{formatNumber(type.earned)}</span>
                            {" / "}
                            <span className="text-red-600">-{formatNumber(type.spent)}</span>
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-purple-600">
                          {formatNumber(type.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No credit types found</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Credit Consumers
                </h3>
                {stats.topConsumers.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topConsumers.map((consumer, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <span className="font-mono text-sm text-gray-700">
                            {truncateId(consumer.userId)}
                          </span>
                          <div className="text-sm text-gray-500">
                            {consumer.transactionCount} transactions
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-red-600">
                          -{formatNumber(consumer.totalSpent)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No consumers found</p>
                )}
              </div>
            </div>

            {/* Credit Pools */}
            {stats.pools.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Credit Pools
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pool Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.pools.map((pool) => (
                        <tr key={pool.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{pool.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatNumber(pool.totalCredits)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatNumber(pool.allocatedCredits)}</td>
                          <td className="px-6 py-4 text-sm text-green-600 font-medium">{formatNumber(pool.totalCredits - pool.allocatedCredits)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(pool.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Transactions
              </h3>
              {stats.recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentTransactions.map((tx, idx) => (
                        <tr key={tx.id || idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-mono text-gray-700">{truncateId(tx.userId)}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {tx.creditType || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            <span className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
                              {tx.amount >= 0 ? "+" : ""}{formatNumber(tx.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{tx.description || "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(tx.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No transactions found</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
