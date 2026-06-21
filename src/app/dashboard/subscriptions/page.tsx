"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Users, TrendingUp, TrendingDown, RefreshCw, CheckCircle, Clock, AlertCircle, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscriptionStats {
  overview: {
    total: number;
    active: number;
    newThisMonth: number;
    canceledThisMonth: number;
    churnRate: number;
  };
  byStatus: Array<{ status: string; count: number }>;
  byPlan: Array<{ plan: string; count: number }>;
  byPaymentMethod: Array<{ method: string; count: number }>;
  byBillingPeriod: Array<{ period: string; count: number }>;
  recentSubscriptions: Array<{
    id: string;
    userId: string;
    userName: string | null;
    userEmail: string | null;
    plan: string;
    status: string;
    billingPeriod: string;
    paymentMethod: string;
    createdAt: string;
    periodStart: string | null;
    periodEnd: string | null;
  }>;
  dailySubscriptions: Array<{ date: string; count: number }>;
  message?: string;
}

export default function SubscriptionsPage() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats/subscriptions");
      if (!res.ok) throw new Error("Failed to fetch subscription stats");
      const data = await res.json();
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return "-"; }
  };

  const truncateId = (id: string | null | undefined) => {
    if (!id || id.length < 8) return id || "-";
    return `${id.slice(0, 8)}...`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "canceled": case "cancelled": return <X className="h-4 w-4 text-red-500" />;
      case "past_due": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "canceled": case "cancelled": return "bg-red-100 text-red-800";
      case "past_due": return "bg-yellow-100 text-yellow-800";
      case "trialing": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Statistics</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of subscription metrics and trends</p>
        </div>
        <Button onClick={fetchStats} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {stats?.message && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">{stats.message}</div>
      )}

      {stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.total.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.overview.active.toLocaleString()}</div>
                <p className="text-xs text-gray-500">{stats.overview.total > 0 ? ((stats.overview.active / stats.overview.total) * 100).toFixed(1) : 0}% of total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">New This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.overview.newThisMonth.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Canceled This Month</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overview.canceledThisMonth.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Churn Rate</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.overview.churnRate}%</div>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* By Status */}
            <Card>
              <CardHeader><CardTitle className="text-lg">By Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.byStatus.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm capitalize">{item.status}</span>
                    </div>
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                ))}
                {stats.byStatus.length === 0 && <p className="text-gray-500 text-sm">No data</p>}
              </CardContent>
            </Card>

            {/* By Plan */}
            <Card>
              <CardHeader><CardTitle className="text-lg">By Plan</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.byPlan.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{item.plan || "Unknown"}</span>
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                ))}
                {stats.byPlan.length === 0 && <p className="text-gray-500 text-sm">No data</p>}
              </CardContent>
            </Card>

            {/* By Payment Method */}
            <Card>
              <CardHeader><CardTitle className="text-lg">By Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.byPaymentMethod.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{item.method}</span>
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                ))}
                {stats.byPaymentMethod.length === 0 && <p className="text-gray-500 text-sm">No data</p>}
              </CardContent>
            </Card>

            {/* By Billing Period */}
            <Card>
              <CardHeader><CardTitle className="text-lg">By Billing Period</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.byBillingPeriod.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{item.period}</span>
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                ))}
                {stats.byBillingPeriod.length === 0 && <p className="text-gray-500 text-sm">No data</p>}
              </CardContent>
            </Card>
          </div>

          {/* Recent Subscriptions Table */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Recent Subscriptions</CardTitle></CardHeader>
            <CardContent>
              {stats.recentSubscriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-gray-500">User</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Plan</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Billing</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Payment</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSubscriptions.map((sub, i) => (
                        <tr key={sub.id || i} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <Link
                              href={`/dashboard/user/${sub.userId}`}
                              className="group flex flex-col hover:text-blue-600"
                            >
                              <span className="font-medium text-sm flex items-center gap-1">
                                {sub.userName || "Unknown User"}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                              <span className="text-xs text-gray-500">{sub.userEmail || truncateId(sub.userId)}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-2">{sub.plan || "-"}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                              {getStatusIcon(sub.status)}
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 capitalize">{sub.billingPeriod || "-"}</td>
                          <td className="py-3 px-2 capitalize">{sub.paymentMethod || "-"}</td>
                          <td className="py-3 px-2">{formatDate(sub.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No recent subscriptions</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
