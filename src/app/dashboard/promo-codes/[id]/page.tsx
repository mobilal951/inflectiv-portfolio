"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Ticket,
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  RefreshCw,
  AlertCircle,
  Tag,
  Gift,
  Calendar,
  BarChart3,
  Infinity,
  DollarSign,
  Edit,
  Save,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Campaign {
  id: string;
  name: string;
  codeType: string;
  discountType: string;
  discountValue: number;
  credits: number;
  platform: string;
  scope: string | null;
  targetPlanId: string | null;
  maxUses: number | null;
  expiryDate: string | null;
  createdAt: string;
  createdBy: string | null;
  status: string;
  totalCodes: number;
  totalRedemptions: number;
  activeCodes: number;
  usedCodes: number;
  uniqueUsers: number;
}

interface PromoCode {
  id: string;
  code: string;
  maxRedemptions: number | null;
  currentRedemptions: number;
  status: string;
  createdAt: string;
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const campaignName = decodeURIComponent(id);
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    is_active: true,
    expires_at: "",
    description: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promo-codes/campaigns/${encodeURIComponent(campaignName)}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        setCodes(data.codes || []);
        setFormData({
          is_active: data.campaign.status === "active",
          expires_at: data.campaign.expiryDate
            ? new Date(data.campaign.expiryDate).toISOString().slice(0, 10)
            : "",
          description: data.campaign.name || "",
        });
      } else if (res.status === 404) {
        setError("Campaign not found");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to load campaign");
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Network error: Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [campaignName]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/promo-codes/campaigns/${encodeURIComponent(campaignName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: formData.is_active,
          expires_at: formData.expires_at || null,
          description: formData.description || null,
        }),
      });

      if (res.ok) {
        await fetchData();
        setEditMode(false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update campaign");
      }
    } catch (err) {
      console.error("Error updating campaign:", err);
      alert("Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleExportCodes = async () => {
    try {
      const params = new URLSearchParams();
      params.set("campaign", campaignName);
      const res = await fetch(`/api/promo-codes/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${campaignName}-codes-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "inactive") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-600 rounded-full">
          <XCircle className="h-4 w-4" /> Inactive
        </span>
      );
    }
    if (status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-600 rounded-full">
          <Clock className="h-4 w-4" /> Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-100 text-green-600 rounded-full">
        <CheckCircle className="h-4 w-4" /> Active
      </span>
    );
  };

  const formatDiscount = (type: string, value: number) => {
    switch (type) {
      case "percentage": return `${value}% off`;
      case "flat": return `$${value} off`;
      case "free_months": return `${value} free month${value !== 1 ? "s" : ""}`;
      default: return `${value.toLocaleString()} Credits`;
    }
  };

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "percentage": return <Tag className="h-5 w-5 text-purple-500" />;
      case "flat": return <Tag className="h-5 w-5 text-blue-500" />;
      case "free_months": return <Tag className="h-5 w-5 text-green-500" />;
      default: return <Coins className="h-5 w-5 text-amber-500" />;
    }
  };

  const getDiscountLabel = (type: string) => {
    switch (type) {
      case "percentage": return "Discount";
      case "flat": return "Discount";
      case "free_months": return "Free Months";
      default: return "Credits";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-gray-50/50 p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full mt-6" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-gray-50/50 p-6">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">{error || "Campaign not found"}</p>
        <Link href="/dashboard/promo-codes">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/promo-codes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 rounded-xl text-white shadow-lg">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">{campaign.name}</h1>
                  {getStatusBadge(campaign.status)}
                </div>
                <p className="text-sm text-gray-500">Campaign Details</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCodes}>
              <Download className="h-4 w-4 mr-2" />
              Export Codes
            </Button>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Ticket className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Codes</p>
                  <p className="text-2xl font-bold text-gray-900">{campaign.totalCodes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Redemptions</p>
                  <p className="text-2xl font-bold text-purple-600">{campaign.totalRedemptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unique Users</p>
                  <p className="text-2xl font-bold text-green-600">{campaign.uniqueUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Used Codes</p>
                  <p className="text-2xl font-bold text-orange-600">{campaign.usedCodes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-600" />
                Campaign Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Tag className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Code Type</p>
                  <p className="font-semibold capitalize">{campaign.codeType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-amber-100 rounded-lg">
                  {getDiscountIcon(campaign.discountType)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">{getDiscountLabel(campaign.discountType)}</p>
                  <p className="font-semibold">{formatDiscount(campaign.discountType, campaign.discountValue)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Created</p>
                  <p className="font-semibold">{format(new Date(campaign.createdAt), "MMM d, yyyy")}</p>
                  {campaign.createdBy && (
                    <p className="text-sm text-gray-500">by {campaign.createdBy}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Expires</p>
                  {editMode ? (
                    <input
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="mt-1 px-3 py-1 border rounded-lg text-sm"
                    />
                  ) : (
                    <p className="font-semibold">
                      {campaign.expiryDate ? format(new Date(campaign.expiryDate), "MMM d, yyyy") : "Never"}
                    </p>
                  )}
                </div>
              </div>

              {(campaign.name || editMode) && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Description</p>
                  {editMode ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Campaign description..."
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{campaign.name}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Campaign Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 uppercase font-medium">Code Usage Rate</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {campaign.totalCodes > 0
                        ? `${Math.round((campaign.usedCodes / campaign.totalCodes) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Users className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 uppercase font-medium">Avg. Redemptions per Code</p>
                    <p className="text-2xl font-bold text-green-900">
                      {campaign.totalCodes > 0
                        ? (campaign.totalRedemptions / campaign.totalCodes).toFixed(1)
                        : "0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 uppercase font-medium">Active Codes</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {campaign.activeCodes} / {campaign.totalCodes}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Codes Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Promo Codes</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {codes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Ticket className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No codes found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Redemptions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr key={code.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {code.code}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {code.currentRedemptions} / {code.maxRedemptions || "∞"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              code.status === "active"
                                ? "bg-green-100 text-green-800"
                                : code.status === "expired"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {code.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(new Date(code.createdAt), "MMM d, yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {codes.length > 0 && (
              <p className="mt-4 text-sm text-gray-500 text-center">
                Showing all {codes.length} code{codes.length !== 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
