"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, Clock, CheckCircle, X, AlertCircle, RefreshCw, ExternalLink, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface WithdrawalStats {
  overview: {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    rejectedRequests: number;
    totalAmountRequested: number;
    pendingAmount: number;
    totalPendingEarnings: number;
    totalPaidOut: number;
  };
  byStatus: Array<{ status: string; count: number }>;
  byDestination: Array<{ destination: string; count: number }>;
  payoutRequests: Array<{
    id: string;
    userId: number;
    userName: string | null;
    userEmail: string | null;
    amountCents: number;
    destinationType: string;
    destinationDetails: Record<string, unknown>;
    provider: string | null;
    status: string;
    adminNotes: string | null;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  sellerEarnings: Array<{
    id: number;
    sellerId: number;
    userName: string | null;
    userEmail: string | null;
    totalEarningsCents: number;
    pendingPayoutCents: number;
    totalPaidCents: number;
    totalSalesCount: number;
    lastSaleAt: string | null;
    lastPayoutAt: string | null;
  }>;
}

export default function WithdrawalsPage() {
  const [stats, setStats] = useState<WithdrawalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats/withdrawals");
      if (!res.ok) throw new Error("Failed to fetch withdrawal stats");
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

  const formatCents = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return "-"; }
  };

  const truncateId = (id: string | null | undefined) => {
    if (!id || id.length < 8) return id || "-";
    return `${id.slice(0, 8)}...`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": case "failed": return <X className="h-4 w-4 text-red-500" />;
      case "processing": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "pending": return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "failed": return "bg-red-100 text-red-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-orange-100 text-orange-800";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
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
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Payout requests and seller earnings overview</p>
        </div>
        <Button onClick={fetchStats} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.totalRequests}</div>
                <p className="text-xs text-gray-500">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.overview.pendingRequests}</div>
                <p className="text-xs text-gray-500">{formatCents(stats.overview.pendingAmount)} pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Earnings</CardTitle>
                <Wallet className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{formatCents(stats.overview.totalPendingEarnings)}</div>
                <p className="text-xs text-gray-500">Awaiting withdrawal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Paid Out</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCents(stats.overview.totalPaidOut)}</div>
                <p className="text-xs text-gray-500">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
                {stats.byStatus.length === 0 && <p className="text-gray-500 text-sm">No data</p>}
              </CardContent>
            </Card>

            {/* By Destination */}
            <Card>
              <CardHeader><CardTitle className="text-lg">By Destination</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {stats.byDestination.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{item.destination.replace(/_/g, " ")}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
                {stats.byDestination.length === 0 && <p className="text-gray-500 text-sm">No data</p>}
              </CardContent>
            </Card>
          </div>

          {/* Payout Requests Table */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Payout Requests</CardTitle></CardHeader>
            <CardContent>
              {stats.payoutRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-gray-500">User</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Amount</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Account Holder</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Bank Name</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">SWIFT / BIC</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">IBAN</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Account No.</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Routing No.</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Country</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Destination</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Provider</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Requested</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Processed</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Admin Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.payoutRequests.map((pr, i) => {
                        const d = pr.destinationDetails || {};
                        return (
                          <tr key={pr.id || i} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <Link
                                href={`/dashboard/user/${pr.userId}`}
                                className="group flex flex-col hover:text-blue-600"
                              >
                                <span className="font-medium text-sm flex items-center gap-1">
                                  {pr.userName || "Unknown User"}
                                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                                <span className="text-xs text-gray-500">{pr.userEmail || `User #${pr.userId}`}</span>
                              </Link>
                            </td>
                            <td className="py-3 px-2 font-semibold">{formatCents(pr.amountCents)}</td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>
                                {getStatusIcon(pr.status)}
                                {pr.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">{String(d.account_holder_name || "-")}</td>
                            <td className="py-3 px-2 whitespace-nowrap">{String(d.bank_name || "-")}</td>
                            <td className="py-3 px-2 font-mono text-xs whitespace-nowrap">{String(d.swift_code || "-")}</td>
                            <td className="py-3 px-2 font-mono text-xs whitespace-nowrap">{String(d.iban_masked || "-")}</td>
                            <td className="py-3 px-2 font-mono text-xs whitespace-nowrap">{String(d.account_number_masked || "-")}</td>
                            <td className="py-3 px-2 font-mono text-xs whitespace-nowrap">{String(d.routing_number || "-")}</td>
                            <td className="py-3 px-2 whitespace-nowrap">{String(d.country || "-")}</td>
                            <td className="py-3 px-2 capitalize whitespace-nowrap">{pr.destinationType.replace(/_/g, " ")}</td>
                            <td className="py-3 px-2 capitalize">{pr.provider || "-"}</td>
                            <td className="py-3 px-2 text-gray-500 whitespace-nowrap">{formatDate(pr.createdAt)}</td>
                            <td className="py-3 px-2 text-gray-500 whitespace-nowrap">{formatDate(pr.processedAt)}</td>
                            <td className="py-3 px-2 text-gray-500 max-w-[200px] truncate">{pr.adminNotes || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No payout requests</p>
              )}
            </CardContent>
          </Card>

          {/* Seller Earnings Table */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Seller Earnings</CardTitle></CardHeader>
            <CardContent>
              {stats.sellerEarnings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Seller</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Total Earnings</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Pending Payout</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Total Paid</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Sales</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">Last Sale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.sellerEarnings.map((se, i) => (
                        <tr key={se.id || i} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <Link
                              href={`/dashboard/user/${se.sellerId}`}
                              className="group flex flex-col hover:text-blue-600"
                            >
                              <span className="font-medium text-sm flex items-center gap-1">
                                {se.userName || "Unknown Seller"}
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </span>
                              <span className="text-xs text-gray-500">{se.userEmail || `User #${se.sellerId}`}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-2 font-semibold">{formatCents(se.totalEarningsCents)}</td>
                          <td className="py-3 px-2 font-semibold text-orange-600">{formatCents(se.pendingPayoutCents)}</td>
                          <td className="py-3 px-2 font-semibold text-green-600">{formatCents(se.totalPaidCents)}</td>
                          <td className="py-3 px-2">{se.totalSalesCount}</td>
                          <td className="py-3 px-2 text-gray-500">{formatDate(se.lastSaleAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No seller earnings data</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
