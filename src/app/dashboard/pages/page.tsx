"use client";

import { useEffect, useState, useCallback } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ArrowUpRight, Clock, TrendingDown, Users, Eye, MousePointerClick, BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function Tip({ children, text }: { children: React.ReactNode; text: string }) {
  const [open, setOpen] = useState(false);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only toggle on touch devices or narrow screens
    if (window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild onClick={handleTap}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

interface PageData {
  path: string;
  pageViews: number;
  users: number;
}

interface LandingPageData {
  page: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgDuration: number;
}

export default function PagesPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey } = useDashboard();

  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPageData[]>([]);
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

        const res = await fetch(`/api/ga/pages?${params}`);
        const data = await res.json();

        if (res.ok) {
          setTopPages(data.topPages || []);
          setLandingPages(data.landingPages || []);
        }
      } catch (err) {
        console.error("Failed to fetch pages data:", err);
      }

      setLoading(false);
    }

    fetchData();
  }, [selectedProperty, getDateParams, contextLoading, isDemoMode, refreshKey]);

  const isLoading = loading || contextLoading;

  // Totals for context
  const totalUsers = topPages.reduce((sum, p) => sum + p.users, 0);
  const totalViews = topPages.reduce((sum, p) => sum + p.pageViews, 0);
  const totalSessions = landingPages.reduce((sum, p) => sum + p.sessions, 0);
  const avgBounceRate = landingPages.length > 0
    ? landingPages.reduce((sum, p) => sum + p.bounceRate * p.sessions, 0) / totalSessions
    : 0;

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const truncatePath = (path: string, maxLen = 40): string => {
    if (path.length <= maxLen) return path;
    return path.substring(0, maxLen) + "...";
  };

  return (
    <TooltipProvider>
    <div className="flex flex-col h-full min-h-screen">
      <Header title="Top Pages" />

      <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-auto">
        {isDemoMode ? (
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500">Connect Google Analytics to view page data</p>
            </CardContent>
          </Card>
        ) : (
          <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white shadow-sm border-0">
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Tip text="Total unique visitors across all pages in the selected date range. A user visiting multiple pages is counted once.">
                <Card className="bg-white shadow-sm border-0 cursor-help">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Users className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">Total Users</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalUsers)}</p>
                  </CardContent>
                </Card>
                </Tip>
                <Tip text="Total number of pages loaded across all users. One user viewing 3 pages counts as 3 page views.">
                <Card className="bg-white shadow-sm border-0 cursor-help">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Eye className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">Total Page Views</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalViews)}</p>
                  </CardContent>
                </Card>
                </Tip>
                <Tip text="Total entry sessions — how many times users started a visit by landing on any page. Reflects how often people enter your site.">
                <Card className="bg-white shadow-sm border-0 cursor-help">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <MousePointerClick className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">Total Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalSessions)}</p>
                  </CardContent>
                </Card>
                </Tip>
                <Tip text="Weighted average bounce rate across all landing pages. Bounce = user left after viewing only one page without interaction.">
                <Card className="bg-white shadow-sm border-0 cursor-help">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <BarChart3 className="h-3.5 w-3.5 text-orange-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500">Avg Bounce Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{avgBounceRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>
                </Tip>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Pages by Views */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2 px-5">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  Most Viewed Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : topPages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No data available</p>
                ) : (
                  <div className="space-y-2">
                    {topPages.map((page, i) => {
                      const maxViews = topPages[0]?.pageViews || 1;
                      const widthPercent = (page.pageViews / maxViews) * 100;
                      return (
                        <div key={`${page.path}-${i}`} className="relative rounded-lg overflow-hidden bg-gray-50">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50"
                            style={{ width: `${widthPercent}%` }}
                          />
                          <div className="relative flex items-center justify-between py-2.5 px-3 h-11">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xs font-medium text-gray-400 w-5">{i + 1}</span>
                              <span className="text-sm font-medium text-gray-800 truncate" title={page.path}>
                                {truncatePath(page.path)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
                              <Tip text={`This page accounts for ${totalViews > 0 ? ((page.pageViews / totalViews) * 100).toFixed(1) : 0}% of all page views in the selected period`}>
                              <span className="text-xs font-medium text-blue-500/70 w-10 text-right cursor-help">
                                {totalViews > 0 ? ((page.pageViews / totalViews) * 100).toFixed(1) : 0}%
                              </span>
                              </Tip>
                              <Tip text={`${page.users.toLocaleString()} unique visitors viewed this page in the selected period`}>
                              <span className="text-sm text-gray-500 cursor-help">{formatNumber(page.users)} users</span>
                              </Tip>
                              <Tip text={`${page.pageViews.toLocaleString()} total times this page was loaded (includes repeat views by same user)`}>
                              <span className="text-sm font-semibold text-blue-600 w-16 text-right cursor-help">
                                {formatNumber(page.pageViews)} views
                              </span>
                              </Tip>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Landing Pages */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2 px-5">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  </div>
                  Landing Pages (Entry Points)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : landingPages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No data available</p>
                ) : (
                  <div className="space-y-2">
                    {landingPages.map((page, i) => {
                      const maxSessions = landingPages[0]?.sessions || 1;
                      const widthPercent = (page.sessions / maxSessions) * 100;
                      return (
                        <div key={`${page.page}-${i}`} className="relative rounded-lg overflow-hidden bg-gray-50">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-emerald-50"
                            style={{ width: `${widthPercent}%` }}
                          />
                          <div className="relative flex items-center justify-between py-2.5 px-3 h-11">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xs font-medium text-gray-400 w-5">{i + 1}</span>
                              <span className="text-sm font-medium text-gray-800 truncate" title={page.page}>
                                {truncatePath(page.page)}
                              </span>
                              <Tip text={`This page accounts for ${totalSessions > 0 ? ((page.sessions / totalSessions) * 100).toFixed(1) : 0}% of all entry sessions in the selected period`}>
                              <span className="text-xs font-medium text-emerald-500/70 shrink-0 cursor-help">
                                {totalSessions > 0 ? ((page.sessions / totalSessions) * 100).toFixed(1) : 0}%
                              </span>
                              </Tip>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-xs whitespace-nowrap">
                              <Tip text={`Average time users spent on the site after landing on this page`}>
                              <span className="text-gray-500 flex items-center gap-1 cursor-help">
                                <Clock className="h-3 w-3" />
                                {formatDuration(page.avgDuration)}
                              </span>
                              </Tip>
                              <Tip text={`${page.bounceRate.toFixed(1)}% of users left the site after viewing only this page without any interaction`}>
                              <span className="text-orange-600 flex items-center gap-1 cursor-help">
                                <TrendingDown className="h-3 w-3" />
                                {page.bounceRate.toFixed(0)}%
                              </span>
                              </Tip>
                              <Tip text={`${page.sessions.toLocaleString()} total sessions where this was the first page a user landed on`}>
                              <span className="font-semibold text-emerald-600 w-14 text-right text-sm cursor-help">
                                {formatNumber(page.sessions)}
                              </span>
                              </Tip>
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
          </>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}
