"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Ticket,
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  X,
  Lock,
  Eye,
  EyeOff,
  Download,
  Info,
  Gift,
  Calendar,
  Infinity,
  DollarSign,
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
  expiryDate: string | null;
  createdAt: string;
  createdBy: string | null;
  totalCodes: number;
  totalRedemptions: number;
  activeCodes: number;
  status: string;
}

interface Analytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRedemptions: number;
  activePromoUsers: number;
  totalCodes: number;
  activeCodes: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FormData {
  name: string;
  codeType: "single" | "bulk";
  customCode: string;
  codePrefix: string;
  numberOfCodes: number;
  creditsToGrant: number;
  platform: "both" | "base" | "doge";
  maxUses: string;
  expiryDate: string;
  notes: string;
}

const initialFormData: FormData = {
  name: "",
  codeType: "single",
  customCode: "",
  codePrefix: "",
  numberOfCodes: 0,
  creditsToGrant: 0,
  platform: "both",
  maxUses: "",
  expiryDate: "",
  notes: "",
};

export default function PromoCodesPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [codeTypeFilter, setCodeTypeFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<{ codes: string[]; campaignName: string } | null>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // No derived state needed - credits-only system

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/promo-codes/auth");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated && data.userName) {
        setCurrentUser(data.userName);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/promo-codes/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/promo-codes/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setCurrentUser(data.userName);
        setPassword("");
        fetchData();
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (err) {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (codeTypeFilter) params.set("codeType", codeTypeFilter);
      if (platformFilter) params.set("platform", platformFilter);

      const [campaignsRes, analyticsRes] = await Promise.all([
        fetch(`/api/promo-codes/campaigns?${params}`),
        fetch("/api/promo-codes/analytics"),
      ]);

      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.campaigns);
        setPagination(data.pagination);
      } else {
        const errorData = await campaignsRes.json().catch(() => ({}));
        setError(errorData.error || `Error ${campaignsRes.status}: Failed to fetch campaigns`);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Network error: Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [search, statusFilter, codeTypeFilter, platformFilter, isAuthenticated]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const res = await fetch("/api/promo-codes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          codeType: formData.codeType,
          customCode: formData.customCode,
          codePrefix: formData.codePrefix,
          numberOfCodes: formData.numberOfCodes,
          discountType: "credits",
          discountValue: formData.creditsToGrant,
          credits: formData.creditsToGrant,
          platform: formData.platform,
          maxUses: formData.maxUses || null,
          expiryDate: formData.expiryDate || null,
          notes: formData.notes || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCreateSuccess({
          codes: data.codes.map((c: { code: string }) => c.code),
          campaignName: data.campaignName,
        });
        fetchData();
      } else {
        setCreateError(data.error || "Failed to create promo codes");
      }
    } catch (error) {
      console.error("Error creating promo codes:", error);
      setCreateError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleExportCodes = async (campaignName?: string) => {
    try {
      const params = new URLSearchParams();
      if (campaignName) params.set("campaign", campaignName);

      const res = await fetch(`/api/promo-codes/export?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `promo-codes-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCreateError(null);
    setCreateSuccess(null);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    if (status === "inactive") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          <XCircle className="h-3 w-3" /> Inactive
        </span>
      );
    }
    if (status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
          <Clock className="h-3 w-3" /> Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
        <CheckCircle className="h-3 w-3" /> Active
      </span>
    );
  };

  const formatDiscount = (discountType: string, discountValue: number) => {
    switch (discountType) {
      case "percentage":
        return (
          <div className="flex items-center gap-2">
            <span className="text-purple-500 font-medium">{discountValue}%</span>
            <span>off</span>
          </div>
        );
      case "flat":
        return (
          <div className="flex items-center gap-2">
            <span className="text-blue-500 font-medium">${discountValue}</span>
            <span>off</span>
          </div>
        );
      case "free_months":
        return (
          <div className="flex items-center gap-2">
            <span className="text-green-500 font-medium">{discountValue}</span>
            <span>free month{discountValue !== 1 ? "s" : ""}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-500" />
            <span>{discountValue.toLocaleString()} credits</span>
          </div>
        );
    }
  };

  const formatPlatform = (platform: string) => {
    const labels: Record<string, string> = { both: "All", base: "Base", doge: "Doge" };
    return labels[platform] || platform;
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 rounded-xl text-white shadow-lg w-fit mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">Promo Codes Admin</CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Enter the admin password to access promo codes management
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{authError}</p>
                </div>
              )}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <Button
                type="submit"
                disabled={authenticating || !password}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:opacity-90"
              >
                {authenticating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Access Promo Codes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 rounded-xl text-white shadow-lg">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Promo Codes</h1>
              <p className="text-sm text-gray-500">Manage promotional campaigns and codes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-700 capitalize">{currentUser}</span>
                <button
                  onClick={handleLogout}
                  className="ml-1 text-purple-400 hover:text-purple-600 transition-colors"
                  title="Logout"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <Button variant="outline" onClick={() => handleExportCodes()}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 overflow-auto">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData()}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Ticket className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Campaigns</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{analytics?.totalCampaigns || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Campaigns</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">{analytics?.activeCampaigns || 0}</p>
                  )}
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
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">{analytics?.totalRedemptions || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Promo Users</p>
                  {loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-orange-600">{analytics?.activePromoUsers || 0}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={codeTypeFilter}
                onChange={(e) => setCodeTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Types</option>
                <option value="single">Single Code</option>
                <option value="bulk">Bulk Codes</option>
              </select>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Platforms</option>
                <option value="both">Both</option>
                <option value="base">Base</option>
                <option value="doge">Doge</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => fetchData()}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setCodeTypeFilter("");
                  setPlatformFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No campaigns found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Campaign</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Usage</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Discount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Platform</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Expiry</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{campaign.name}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 capitalize">{campaign.codeType}</td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">
                            {campaign.totalRedemptions} / {campaign.totalCodes}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatDiscount(campaign.discountType, campaign.discountValue)}</td>
                        <td className="py-3 px-4 text-gray-600">{formatPlatform(campaign.platform)}</td>
                        <td className="py-3 px-4">{getStatusBadge(campaign.status)}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {campaign.expiryDate ? format(new Date(campaign.expiryDate), "MMM d, yyyy") : "Never"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => router.push(`/dashboard/promo-codes/${encodeURIComponent(campaign.name)}`)}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleExportCodes(campaign.name)}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                              title="Export codes as CSV"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchData(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {createSuccess ? "Codes Created!" : "Create Promo Campaign"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {createSuccess ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-800">
                      Successfully created {createSuccess.codes.length} code(s)
                    </span>
                  </div>
                  <p className="text-sm text-green-700">Campaign: {createSuccess.campaignName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated Codes
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {createSuccess.codes.map((code, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleExportCodes(createSuccess.campaignName)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    onClick={closeModal}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{createError}</p>
                  </div>
                )}

                {/* Campaign Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Zealy Quest - Nov 2025"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Code Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code Type *
                  </label>
                  <select
                    value={formData.codeType}
                    onChange={(e) => setFormData({ ...formData, codeType: e.target.value as "single" | "bulk" })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="single">Single Code (Multiple Uses)</option>
                    <option value="bulk">Bulk Codes (One-time Use)</option>
                  </select>
                </div>

                {/* Custom Code or Prefix */}
                {formData.codeType === "single" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Promo Code *
                    </label>
                    <input
                      type="text"
                      value={formData.customCode}
                      onChange={(e) => setFormData({ ...formData, customCode: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                      placeholder="e.g., SUMMER2024, WELCOME50"
                      required
                      maxLength={50}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Only uppercase letters, numbers, underscores, and hyphens. Min 3 chars, max 50 chars.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code Prefix (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.codePrefix}
                      onChange={(e) => setFormData({ ...formData, codePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                      placeholder="e.g., ZEALY-"
                      maxLength={20}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      If provided, each code will start with this prefix followed by random characters.
                    </p>
                  </div>
                )}

                {/* Number of Codes / Max Redemptions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.codeType === "single" ? "Max Redemptions" : "Number of Codes"} *
                  </label>
                  <input
                    type="number"
                    value={formData.numberOfCodes || ""}
                    onChange={(e) => setFormData({ ...formData, numberOfCodes: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                    min={1}
                    max={10000}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Each user can redeem a code once (enforced automatically).</p>
                </div>

                {/* Credits to Grant */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits to Grant *
                  </label>
                  <input
                    type="number"
                    value={formData.creditsToGrant || ""}
                    onChange={(e) => setFormData({ ...formData, creditsToGrant: e.target.value === "" ? 0 : parseInt(e.target.value) })}
                    min={1}
                    required
                    placeholder="e.g., 100, 500, 1000"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Number of credits added to the user&apos;s free credit pool upon redemption.
                  </p>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as FormData["platform"] })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="both">Both (Base + Doge)</option>
                    <option value="base">Base only</option>
                    <option value="doge">Doge only</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Which platform&apos;s users can redeem this code.
                  </p>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Optional notes for internal use"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"
                  >
                    {creating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Campaign"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
