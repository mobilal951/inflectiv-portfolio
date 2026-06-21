"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Tag,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface UserDetails {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  subscriptions: Array<{
    id: string;
    plan: string;
    status: string;
    billingPeriod: string | null;
    paymentMethod: string | null;
    createdAt: string;
    periodStart: string | null;
    periodEnd: string | null;
    canceledAt: string | null;
  }>;
  promoRedemptions: Array<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    credits: number;
    redeemedAt: string;
  }>;
  creditBalance: number;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [data, setData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to fetch user details");
      }
      const userData = await res.json();
      setData(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "canceled":
      case "cancelled":
        return <X className="h-4 w-4 text-red-500" />;
      case "past_due":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      case "trialing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPerk = (discountType: string, discountValue: number, credits: number) => {
    if (discountType === "percentage") {
      if (discountValue === 100) return "Lifetime Free";
      return `${discountValue}% off`;
    }
    if (discountType === "credits") {
      return `${credits || discountValue} free months`;
    }
    if (discountType === "flat_usd") {
      return `$${(discountValue / 100).toFixed(2)} off`;
    }
    return "-";
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, subscriptions, promoRedemptions, creditBalance } = data;
  const activeSubscription = subscriptions.find((s) => s.status === "active");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "User"}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.name || user.username || "Unknown User"}
              </h1>
              <p className="text-gray-500 text-sm">{user.email || "No email"}</p>
            </div>
          </div>
        </div>
        <Button onClick={fetchUser} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">User ID</CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono break-all">{user.id}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{formatDate(user.createdAt)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {activeSubscription?.plan || "No active plan"}
            </div>
            {activeSubscription && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  activeSubscription.status
                )}`}
              >
                {getStatusIcon(activeSubscription.status)}
                {activeSubscription.status}
              </span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Credit Balance</CardTitle>
            <Coins className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{creditBalance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription History ({subscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Plan</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Billing</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Payment</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Created</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Period End</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{sub.plan || "-"}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            sub.status
                          )}`}
                        >
                          {getStatusIcon(sub.status)}
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 capitalize">{sub.billingPeriod || "-"}</td>
                      <td className="py-3 px-2 capitalize">{sub.paymentMethod || "-"}</td>
                      <td className="py-3 px-2">{formatDate(sub.createdAt)}</td>
                      <td className="py-3 px-2">{formatDate(sub.periodEnd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No subscription history</p>
          )}
        </CardContent>
      </Card>

      {/* Promo Code Redemptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Promo Code Redemptions ({promoRedemptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {promoRedemptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Code</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Perk</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Redeemed</th>
                  </tr>
                </thead>
                <tbody>
                  {promoRedemptions.map((redemption) => (
                    <tr key={redemption.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-mono font-medium">{redemption.code}</td>
                      <td className="py-3 px-2">
                        {formatPerk(
                          redemption.discountType,
                          redemption.discountValue,
                          redemption.credits
                        )}
                      </td>
                      <td className="py-3 px-2">{formatDate(redemption.redeemedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No promo codes redeemed</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
