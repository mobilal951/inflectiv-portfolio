"use client";

import { useState, useEffect, useCallback } from "react";

interface DatasetStats {
  overview: {
    totalDatasets: number;
    publicDatasets: number;
    privateDatasets: number;
    newThisMonth: number;
    uniqueOwners: number;
    totalViews: number;
    totalDownloads: number;
  };
  leaderboards: {
    mostVisited: { id: string; name: string; ownerId: string; views: number; downloads: number; rating: number | null; isPublic: boolean }[];
    topRated: { id: string; name: string; ownerId: string; rating: number | null; ratingCount: number; isPublic: boolean }[];
    mostDownloaded: { id: string; name: string; ownerId: string; downloads: number; views: number; isPublic: boolean }[];
    mostUsed: { id: string; name: string; ownerId: string; usageCount: number; isPublic: boolean }[];
  };
  byCategory: { category: string; count: number }[];
  topOwners: { ownerId: string; datasetCount: number; totalViews: number; totalDownloads: number }[];
  dailyDatasets: { date: string; count: number }[];
  marketplaceListings: { id: string; datasetId: string; name: string; price: number | null; isActive: boolean; purchaseCount: number; createdAt: string }[];
  recentDatasets: { id: string; name: string; ownerId: string; views: number; downloads: number; rating: number | null; isPublic: boolean; createdAt: string }[];
  message?: string;
}

type LeaderboardTab = "mostVisited" | "topRated" | "mostDownloaded" | "mostUsed";

export default function DatasetsPage() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("mostVisited");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stats/datasets");
      if (!response.ok) throw new Error("Failed to fetch dataset statistics");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return "-"; }
  };

  const truncateId = (id: string | number | null | undefined) => {
    if (id === null || id === undefined) return "-";
    const str = String(id);
    if (str.length < 8) return str;
    return `${str.slice(0, 8)}...`;
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) return "-";
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <span className="text-yellow-500">
        {"★".repeat(fullStars)}{hasHalf && "½"}{"☆".repeat(5 - fullStars - (hasHalf ? 1 : 0))}
        <span className="text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </span>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading statistics...</div></div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dataset Leaderboard</h1>
          <button onClick={fetchStats} disabled={loading} className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {stats?.message && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">{stats.message}</div>
        )}

        {stats && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Total Datasets</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.overview.totalDatasets)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Public Datasets</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatNumber(stats.overview.publicDatasets)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Private Datasets</h3>
                <p className="text-3xl font-bold text-gray-600 mt-2">{formatNumber(stats.overview.privateDatasets)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">New This Month</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{formatNumber(stats.overview.newThisMonth)}</p>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Unique Owners</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(stats.overview.uniqueOwners)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Total Views</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatNumber(stats.overview.totalViews)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase">Total Downloads</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">{formatNumber(stats.overview.totalDownloads)}</p>
              </div>
            </div>

            {/* Leaderboard Tabs */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {[
                    { key: "mostVisited", label: "Most Visited" },
                    { key: "topRated", label: "Top Rated" },
                    { key: "mostDownloaded", label: "Most Downloaded" },
                    { key: "mostUsed", label: "Most Used" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as LeaderboardTab)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === tab.key ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-6">
                {activeTab === "mostVisited" && (
                  <div className="space-y-3">
                    {stats.leaderboards.mostVisited.length > 0 ? stats.leaderboards.mostVisited.map((dataset, index) => (
                      <div key={dataset.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{dataset.name || "-"}{!dataset.isPublic && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Private</span>}</h4>
                            <p className="text-sm text-gray-500">{dataset.downloads} downloads</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{formatNumber(dataset.views)}</p>
                          <p className="text-sm text-gray-500">views</p>
                        </div>
                      </div>
                    )) : <p className="text-gray-500 text-center py-8">No data available</p>}
                  </div>
                )}

                {activeTab === "topRated" && (
                  <div className="space-y-3">
                    {stats.leaderboards.topRated.length > 0 ? stats.leaderboards.topRated.map((dataset, index) => (
                      <div key={dataset.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{dataset.name || "-"}</h4>
                            <p className="text-sm text-gray-500">{dataset.ratingCount} reviews</p>
                          </div>
                        </div>
                        <div className="text-right">{renderStars(dataset.rating)}</div>
                      </div>
                    )) : <p className="text-gray-500 text-center py-8">No rated datasets</p>}
                  </div>
                )}

                {activeTab === "mostDownloaded" && (
                  <div className="space-y-3">
                    {stats.leaderboards.mostDownloaded.length > 0 ? stats.leaderboards.mostDownloaded.map((dataset, index) => (
                      <div key={dataset.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{dataset.name || "-"}</h4>
                            <p className="text-sm text-gray-500">{formatNumber(dataset.views)} views</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{formatNumber(dataset.downloads)}</p>
                          <p className="text-sm text-gray-500">downloads</p>
                        </div>
                      </div>
                    )) : <p className="text-gray-500 text-center py-8">No data available</p>}
                  </div>
                )}

                {activeTab === "mostUsed" && (
                  <div className="space-y-3">
                    {stats.leaderboards.mostUsed.length > 0 ? stats.leaderboards.mostUsed.map((dataset, index) => (
                      <div key={dataset.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</span>
                          <h4 className="font-medium text-gray-900">{dataset.name || "-"}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{formatNumber(dataset.usageCount)}</p>
                          <p className="text-sm text-gray-500">uses</p>
                        </div>
                      </div>
                    )) : <p className="text-gray-500 text-center py-8">No usage data available</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Categories & Top Owners */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datasets by Category</h3>
                {stats.byCategory.length > 0 ? (
                  <div className="space-y-3">
                    {stats.byCategory.map((cat, index) => {
                      const maxCount = Math.max(...stats.byCategory.map(c => c.count));
                      const percentage = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-700 capitalize">{cat.category}</span>
                            <span className="font-semibold">{formatNumber(cat.count)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-gray-500">No categories found</p>}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Dataset Owners</h3>
                {stats.topOwners.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topOwners.map((owner, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-mono text-sm text-gray-700">{truncateId(owner.ownerId)}</span>
                          <div className="text-sm text-gray-500">{formatNumber(owner.totalViews)} views / {formatNumber(owner.totalDownloads)} downloads</div>
                        </div>
                        <span className="text-lg font-semibold text-indigo-600">{owner.datasetCount} datasets</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-500">No owners found</p>}
              </div>
            </div>

            {/* Marketplace Listings */}
            {stats.marketplaceListings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Listings</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dataset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchases</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.marketplaceListings.map((listing, idx) => (
                        <tr key={listing.id || idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{listing.name || "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{listing.price ? `$${listing.price.toFixed(2)}` : "Free"}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${listing.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {listing.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-purple-600 font-semibold">{formatNumber(listing.purchaseCount)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(listing.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Datasets */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Datasets</h3>
              {stats.recentDatasets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentDatasets.map((dataset, idx) => (
                        <tr key={dataset.id || idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{dataset.name || "-"}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-700">{truncateId(dataset.ownerId)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dataset.isPublic ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {dataset.isPublic ? "Public" : "Private"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatNumber(dataset.views)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatNumber(dataset.downloads)}</td>
                          <td className="px-6 py-4 text-sm">{renderStars(dataset.rating)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(dataset.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-gray-500">No datasets found</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
