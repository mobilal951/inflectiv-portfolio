"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie,
  LabelList,
} from "recharts";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DollarSign,
  MousePointerClick,
  Target,
  TrendingDown,
  Filter,
  Check,
  X,
  Eye,
  Users,
  Globe,
  ArrowRight,
  Megaphone,
  BarChart3,
  ArrowDown,
  ExternalLink,
  Clock,
  MousePointer,
  Info,
  ArrowRightLeft,
  Activity,
  Zap,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface AdsOverview {
  clicks: number;
  cost: number;
  impressions: number;
  cpc: number;
  ctr: number;
  conversions: number;
  costPerConversion: number;
}

interface DailyData {
  date: string;
  campaign: string;
  clicks: number;
  cost: number;
  impressions: number;
  conversions: number;
}

interface CampaignData {
  campaign: string;
  clicks: number;
  cost: number;
  impressions: number;
  conversions: number;
  costPerConversion: number;
  ctr: number;
  cpc: number;
}

interface ChannelSummary {
  channel: string;
  activeUsers: number;
  sessions: number;
  newUsers: number;
  percentage: number;
}

interface TrafficByChannelData {
  dailyData: Record<string, unknown>[];
  channels: string[];
  summary: ChannelSummary[];
  totalUsers: number;
}

interface FunnelStep {
  stage: string;
  value: number;
  description: string;
}

interface LandingPage {
  page: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgDuration: number;
  pagesPerSession: number;
}

interface CtaEvent {
  eventName: string;
  eventCount: number;
}

interface JourneyData {
  funnel: FunnelStep[];
  landingPages: LandingPage[];
  ctaEvents: CtaEvent[];
  totalCtaClicks: number;
}

interface ChannelMetrics {
  channel: string;
  activeUsers: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  pagesPerSession: number;
  engagementRate: number;
  engagedSessions: number;
  ctaClicks: number;
  percentOfTotal: number;
}

interface ComparisonData {
  paid: ChannelMetrics;
  organic: ChannelMetrics;
  direct: ChannelMetrics;
  totalUsers: number;
  allChannels: ChannelMetrics[];
}

interface EventComparison {
  eventName: string;
  allUsers: number;
  allUsersCount: number;
  campaignUsers: number;
  campaignUsersCount: number;
  organicUsers: number;
  organicUsersCount: number;
}

interface EventsComparisonData {
  events: EventComparison[];
  totals: {
    allUsers: number;
    campaignUsers: number;
    organicUsers: number;
  };
}

// ── Channel Colors ────────────────────────────────────────────────────

const CHANNEL_COLORS: Record<string, string> = {
  "Organic Search": "#10b981",
  "Paid Search": "#3b82f6",
  Direct: "#8b5cf6",
  Referral: "#f59e0b",
  Social: "#ec4899",
  Email: "#06b6d4",
  Display: "#f97316",
  "Organic Social": "#a855f7",
  "(Other)": "#6b7280",
  Unassigned: "#9ca3af",
};

function getChannelColor(channel: string): string {
  return CHANNEL_COLORS[channel] || "#6b7280";
}

// ── Page Component ────────────────────────────────────────────────────

export default function AdsOverviewPage() {
  const {
    selectedProperty,
    setSelectedProperty,
    getDateParams,
    dateRange,
    loading: contextLoading,
    isDemoMode,
    refreshKey,
    setLastUpdated,
    setRefreshing,
  } = useDashboard();

  // Property IDs
  const APP_PROPERTY = "properties/501072751";
  const WEBSITE_PROPERTY = "properties/448055843";
  const isWebsiteProperty = selectedProperty === WEBSITE_PROPERTY;

  // Existing ads data
  const [overview, setOverview] = useState<AdsOverview | null>(null);
  const [previousOverview, setPreviousOverview] = useState<AdsOverview | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");
  const [hasConversionData, setHasConversionData] = useState(true);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // New data states
  const [trafficByChannel, setTrafficByChannel] = useState<TrafficByChannelData | null>(null);
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [eventsComparison, setEventsComparison] = useState<EventsComparisonData | null>(null);
  const [newDataLoading, setNewDataLoading] = useState(true);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "journey" | "comparison">("overview");

  // ── Fetch original ads data ───────────────────────────────────────

  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty || contextLoading) return;

      setLoading(true);
      setNewDataLoading(true);
      setError(null);

      if (isDemoMode) {
        const mockOverview: AdsOverview = {
          clicks: 12543,
          cost: 4523.67,
          impressions: 543210,
          cpc: 0.36,
          ctr: 2.31,
          conversions: 876,
          costPerConversion: 5.16,
        };

        const mockCampaignNames = ["Brand Awareness", "Product Launch", "Retargeting", "Competitor Keywords", "Display Network"];
        const mockDailyData: DailyData[] = [];
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
          mockCampaignNames.forEach((campaign) => {
            mockDailyData.push({
              date: dateStr,
              campaign,
              clicks: Math.floor(50 + Math.random() * 50),
              cost: Math.floor(20 + Math.random() * 30),
              impressions: Math.floor(3000 + Math.random() * 2000),
              conversions: Math.floor(5 + Math.random() * 10),
            });
          });
        }

        const mockCampaigns: CampaignData[] = [
          { campaign: "Brand Awareness", clicks: 4532, cost: 1234.56, impressions: 234567, conversions: 345, costPerConversion: 3.58, ctr: 1.93, cpc: 0.27 },
          { campaign: "Product Launch", clicks: 3210, cost: 1567.89, impressions: 156789, conversions: 234, costPerConversion: 6.70, ctr: 2.05, cpc: 0.49 },
          { campaign: "Retargeting", clicks: 2876, cost: 876.54, impressions: 98765, conversions: 187, costPerConversion: 4.69, ctr: 2.91, cpc: 0.30 },
          { campaign: "Competitor Keywords", clicks: 1234, cost: 543.21, impressions: 54321, conversions: 76, costPerConversion: 7.15, ctr: 2.27, cpc: 0.44 },
          { campaign: "Display Network", clicks: 691, cost: 301.47, impressions: 89012, conversions: 34, costPerConversion: 8.87, ctr: 0.78, cpc: 0.44 },
        ];

        // Mock traffic by channel
        setTrafficByChannel({
          dailyData: [],
          channels: ["Organic Search", "Paid Search", "Direct", "Referral", "Social"],
          summary: [
            { channel: "Organic Search", activeUsers: 8500, sessions: 12000, newUsers: 5000, percentage: 42.5 },
            { channel: "Paid Search", activeUsers: 5200, sessions: 7800, newUsers: 4800, percentage: 26.0 },
            { channel: "Direct", activeUsers: 3800, sessions: 4500, newUsers: 1200, percentage: 19.0 },
            { channel: "Referral", activeUsers: 1500, sessions: 2100, newUsers: 1000, percentage: 7.5 },
            { channel: "Social", activeUsers: 1000, sessions: 1400, newUsers: 800, percentage: 5.0 },
          ],
          totalUsers: 20000,
        });

        // Mock journey data
        setJourneyData({
          funnel: [
            { stage: "Ad Clicks", value: 12543, description: "Users who clicked on ads" },
            { stage: "Site Visits", value: 7800, description: "Sessions from paid traffic" },
            { stage: "CTA Clicks", value: 2340, description: "CTA button clicks from ad users" },
            { stage: "Conversions", value: 876, description: "Completed conversions from ads" },
          ],
          landingPages: [
            { page: "/", sessions: 3200, users: 2800, bounceRate: 35, avgDuration: 120, pagesPerSession: 3.2 },
            { page: "/pricing", sessions: 1800, users: 1600, bounceRate: 28, avgDuration: 180, pagesPerSession: 4.1 },
            { page: "/features", sessions: 1200, users: 1000, bounceRate: 42, avgDuration: 90, pagesPerSession: 2.5 },
            { page: "/blog/ai-tools", sessions: 800, users: 700, bounceRate: 55, avgDuration: 60, pagesPerSession: 1.8 },
            { page: "/register", sessions: 500, users: 450, bounceRate: 20, avgDuration: 200, pagesPerSession: 5.0 },
          ],
          ctaEvents: [
            { eventName: "btn_Get_Started_free", eventCount: 890 },
            { eventName: "btn_Header_Pricing", eventCount: 520 },
            { eventName: "btn_start_for_free", eventCount: 380 },
            { eventName: "btn_Sign_In", eventCount: 310 },
            { eventName: "btn_google_signin", eventCount: 240 },
          ],
          totalCtaClicks: 2340,
        });

        // Mock comparison data
        setComparisonData({
          paid: { channel: "Paid Search", activeUsers: 5200, sessions: 7800, bounceRate: 38, avgSessionDuration: 145, pagesPerSession: 3.4, engagementRate: 62, engagedSessions: 4836, ctaClicks: 2340, percentOfTotal: 26.0 },
          organic: { channel: "Organic Search", activeUsers: 8500, sessions: 12000, bounceRate: 45, avgSessionDuration: 110, pagesPerSession: 2.8, engagementRate: 55, engagedSessions: 6600, ctaClicks: 1560, percentOfTotal: 42.5 },
          direct: { channel: "Direct", activeUsers: 3800, sessions: 4500, bounceRate: 52, avgSessionDuration: 90, pagesPerSession: 2.2, engagementRate: 48, engagedSessions: 2160, ctaClicks: 0, percentOfTotal: 19.0 },
          totalUsers: 20000,
          allChannels: [],
        });

        // Mock events comparison
        setEventsComparison({
          events: [
            { eventName: "page_view", allUsers: 45200, allUsersCount: 18500, campaignUsers: 12800, campaignUsersCount: 5100, organicUsers: 18400, organicUsersCount: 8200 },
            { eventName: "session_start", allUsers: 22100, allUsersCount: 18500, campaignUsers: 6200, campaignUsersCount: 5100, organicUsers: 9800, organicUsersCount: 8200 },
            { eventName: "user_engagement", allUsers: 18900, allUsersCount: 15200, campaignUsers: 5400, campaignUsersCount: 4300, organicUsers: 7600, organicUsersCount: 6100 },
            { eventName: "scroll", allUsers: 14500, allUsersCount: 12000, campaignUsers: 4100, campaignUsersCount: 3400, organicUsers: 5800, organicUsersCount: 4800 },
            { eventName: "click", allUsers: 11200, allUsersCount: 9800, campaignUsers: 3800, campaignUsersCount: 3200, organicUsers: 4200, organicUsersCount: 3600 },
            { eventName: "first_visit", allUsers: 8900, allUsersCount: 8900, campaignUsers: 4600, campaignUsersCount: 4600, organicUsers: 2400, organicUsersCount: 2400 },
            { eventName: "btn_Launch_App", allUsers: 3200, allUsersCount: 2800, campaignUsers: 1800, campaignUsersCount: 1500, organicUsers: 890, organicUsersCount: 760 },
            { eventName: "btn_Try_for_Free", allUsers: 2100, allUsersCount: 1900, campaignUsers: 1200, campaignUsersCount: 1050, organicUsers: 560, organicUsersCount: 480 },
            { eventName: "btn_Sign_Up", allUsers: 1600, allUsersCount: 1400, campaignUsers: 920, campaignUsersCount: 800, organicUsers: 380, organicUsersCount: 320 },
            { eventName: "btn_Create_ChatBot", allUsers: 890, allUsersCount: 780, campaignUsers: 520, campaignUsersCount: 450, organicUsers: 210, organicUsersCount: 180 },
          ],
          totals: { allUsers: 128590, campaignUsers: 41340, organicUsers: 50240 },
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
        setOverview(mockOverview);
        setDailyData(mockDailyData);
        setCampaigns(mockCampaigns);
        setLastUpdated(new Date());
        setRefreshing(false);
        setLoading(false);
        setNewDataLoading(false);
        return;
      }

      const { startDate, endDate } = getDateParams();
      const params = new URLSearchParams({
        propertyId: selectedProperty,
        startDate,
        endDate,
      });

      // Calculate previous period dates for comparison
      let prevParams: URLSearchParams | null = null;
      if (dateRange?.from && dateRange?.to) {
        const durationMs = dateRange.to.getTime() - dateRange.from.getTime();
        const prevEnd = new Date(dateRange.from.getTime() - 86400000);
        const prevStart = new Date(prevEnd.getTime() - durationMs);
        const fmt = (d: Date) => d.toISOString().split("T")[0];
        prevParams = new URLSearchParams({
          propertyId: selectedProperty,
          startDate: fmt(prevStart),
          endDate: fmt(prevEnd),
        });
      }

      try {
        // Fetch all data in parallel
        const fetches: Promise<Response>[] = [
          fetch(`/api/ga/ads?${params}`),
          fetch(`/api/ga/traffic-by-channel?${params}`),
          fetch(`/api/ga/ads/journey?${params}`),
          fetch(`/api/ga/ads/comparison?${params}`),
          fetch(`/api/ga/ads/events-comparison?${params}`),
        ];
        if (prevParams) {
          fetches.push(fetch(`/api/ga/ads?${prevParams}`));
        }

        const responses = await Promise.all(fetches);

        // Parse ads data
        const adsData = await responses[0].json();
        if (!responses[0].ok) throw new Error(adsData.error);

        setOverview(adsData.overview);
        setCurrencyCode(adsData.currencyCode || "USD");
        setHasConversionData(adsData.hasConversionData !== false);
        setDailyData(adsData.dailyData);
        setCampaigns(adsData.campaigns);

        // Parse traffic-by-channel data
        if (responses[1].ok) {
          const channelData = await responses[1].json();
          setTrafficByChannel(channelData);
        }

        // Parse journey data
        if (responses[2].ok) {
          const journey = await responses[2].json();
          setJourneyData(journey);
        }

        // Parse comparison data
        if (responses[3].ok) {
          const comparison = await responses[3].json();
          setComparisonData(comparison);
        }

        // Parse events comparison data
        if (responses[4].ok) {
          const eventsComp = await responses[4].json();
          setEventsComparison(eventsComp);
        }

        // Parse previous period
        if (prevParams && responses[5]) {
          const prevData = await responses[5].json();
          if (responses[5].ok) {
            setPreviousOverview(prevData.overview);
          }
        }

        setLastUpdated(new Date());
        setRefreshing(false);
      } catch (err: any) {
        setError(err.message);
        setRefreshing(false);
      } finally {
        setLoading(false);
        setNewDataLoading(false);
      }
    }

    fetchData();
  }, [selectedProperty, getDateParams, dateRange, contextLoading, isDemoMode, refreshKey]);

  const isLoading = loading || contextLoading;

  // ── Campaign filter logic ──────────────────────────────────────────

  const availableCampaigns = useMemo(() => {
    return campaigns
      .map((c) => c.campaign)
      .filter((name) => name && name !== "(not set)");
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (selectedCampaigns.length === 0) return campaigns;
    return campaigns.filter((c) => selectedCampaigns.includes(c.campaign));
  }, [campaigns, selectedCampaigns]);

  const filteredOverview = useMemo(() => {
    if (selectedCampaigns.length === 0 || !overview) return overview;

    const filtered = filteredCampaigns.reduce(
      (acc, c) => ({
        clicks: acc.clicks + c.clicks,
        cost: acc.cost + c.cost,
        impressions: acc.impressions + c.impressions,
        conversions: acc.conversions + c.conversions,
      }),
      { clicks: 0, cost: 0, impressions: 0, conversions: 0 }
    );

    return {
      ...filtered,
      cpc: filtered.clicks > 0 ? filtered.cost / filtered.clicks : 0,
      ctr: filtered.impressions > 0 ? (filtered.clicks / filtered.impressions) * 100 : 0,
      costPerConversion: filtered.conversions > 0 ? filtered.cost / filtered.conversions : 0,
    };
  }, [overview, filteredCampaigns, selectedCampaigns]);

  const toggleCampaign = (campaign: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaign)
        ? prev.filter((c) => c !== campaign)
        : [...prev, campaign]
    );
  };

  const filteredChartData = useMemo(() => {
    const filtered = selectedCampaigns.length === 0
      ? dailyData
      : dailyData.filter((d) => selectedCampaigns.includes(d.campaign));

    const byDate = new Map<string, { clicks: number; cost: number; impressions: number; conversions: number }>();
    for (const row of filtered) {
      const existing = byDate.get(row.date) || { clicks: 0, cost: 0, impressions: 0, conversions: 0 };
      existing.clicks += row.clicks;
      existing.cost += row.cost;
      existing.impressions += row.impressions;
      existing.conversions += row.conversions;
      byDate.set(row.date, existing);
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        ...data,
      }));
  }, [dailyData, selectedCampaigns]);

  // ── Helpers ────────────────────────────────────────────────────────

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${month}/${day}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const chartData = filteredChartData.map((d) => ({
    ...d,
    formattedDate: formatDate(d.date),
  }));

  const computeTrend = (
    current: number | undefined,
    previous: number | undefined,
    lowerIsBetter = false,
  ): { value: number; isPositive: boolean; isNew?: boolean } | undefined => {
    if (current == null || previous == null) return undefined;
    if (previous === 0 && current === 0) return undefined;
    if (previous === 0) return { value: 0, isPositive: true, isNew: true };
    const pctChange = ((current - previous) / previous) * 100;
    const isPositive = lowerIsBetter ? pctChange < 0 : pctChange > 0;
    return { value: pctChange, isPositive };
  };

  // ── Tab config ───────────────────────────────────────────────────
  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Globe },
    { id: "campaigns" as const, label: "Campaigns", icon: Megaphone },
    { id: "journey" as const, label: "User Journey", icon: ArrowRight },
    { id: "comparison" as const, label: "Paid vs Organic", icon: BarChart3 },
  ];

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 min-h-full">
      <Header title="Ads & Traffic Analytics" />

      <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {isWebsiteProperty && !isDemoMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">No ad campaigns active on Inflectiv Website</p>
                <p className="text-xs text-blue-600 mt-0.5">Ad campaigns are currently running on Inflectiv App only. Switch to see ad performance data.</p>
              </div>
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setSelectedProperty(APP_PROPERTY)}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Switch to App
              </Button>
            </div>
          )}
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm px-3 sm:px-4 md:px-6 py-2">
          <div className="flex gap-1.5 sm:gap-2 bg-gray-100 rounded-xl p-1 sm:p-1.5 max-w-fit overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? "text-blue-600" : ""}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ──────────────────────────────────────────── */}
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">

        {/* ═══════════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (<>
          {/* Traffic Source Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Globe className="h-5 w-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Traffic Sources
              </h2>
              <span className="text-xs text-muted-foreground ml-1">Where your users come from</span>
            </div>

          {/* Channel summary cards */}
          {isLoading || newDataLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : trafficByChannel ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {/* Total traffic card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 opacity-75" />
                    <p className="text-xs font-medium opacity-75">Total Traffic</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {trafficByChannel.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs opacity-60 mt-0.5">all sources</p>
                </CardContent>
              </Card>

              {/* Channel cards */}
              {trafficByChannel.summary.slice(0, 4).map((ch) => (
                <Card key={ch.channel} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getChannelColor(ch.channel) }}
                      />
                      <p className="text-xs font-medium text-gray-500 truncate">{ch.channel}</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {ch.activeUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ch.percentage.toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {/* Traffic source stacked bar chart */}
          {!isLoading && !newDataLoading && trafficByChannel && trafficByChannel.summary.length > 0 && (
            <Card className="shadow-sm mt-3 sm:mt-4 border-0">
              <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                <CardTitle className="text-sm sm:text-base font-medium text-gray-700">
                  Traffic Distribution by Source
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 md:px-6">
                {/* Horizontal stacked bar */}
                <div className="space-y-2">
                  <div className="flex h-10 rounded-lg overflow-hidden">
                    {trafficByChannel.summary.map((ch) => (
                      <div
                        key={ch.channel}
                        className="relative group flex items-center justify-center transition-all hover:opacity-90"
                        style={{
                          width: `${Math.max(ch.percentage, 2)}%`,
                          backgroundColor: getChannelColor(ch.channel),
                        }}
                        title={`${ch.channel}: ${ch.activeUsers.toLocaleString()} users (${ch.percentage.toFixed(1)}%)`}
                      >
                        {ch.percentage > 8 && (
                          <span className="text-white text-xs font-medium truncate px-1">
                            {ch.percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {trafficByChannel.summary.map((ch) => (
                      <div key={ch.channel} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getChannelColor(ch.channel) }}
                        />
                        <span>{ch.channel}</span>
                        <span className="text-gray-400">({ch.activeUsers.toLocaleString()})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ad Performance Summary — compact overview cards */}
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Megaphone className="h-5 w-5 text-purple-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Ad Performance</h2>
            <span className="text-xs text-muted-foreground ml-1">Quick summary</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <KPICard title="Total Spend" value={filteredOverview ? formatCurrency(filteredOverview.cost) : "$0"} subtitle="Ad spend" icon={DollarSign} loading={isLoading} trend={computeTrend(filteredOverview?.cost, previousOverview?.cost, true)} />
            <KPICard title="Clicks" value={filteredOverview?.clicks || 0} subtitle={`CTR: ${filteredOverview?.ctr.toFixed(2) || 0}%`} icon={MousePointerClick} loading={isLoading} trend={computeTrend(filteredOverview?.clicks, previousOverview?.clicks)} />
            <KPICard title="Impressions" value={filteredOverview?.impressions || 0} subtitle="Total impressions" icon={Eye} loading={isLoading} trend={computeTrend(filteredOverview?.impressions, previousOverview?.impressions)} />
            <KPICard title="Conversions" value={hasConversionData ? (filteredOverview?.conversions || 0) : "N/A"} subtitle={hasConversionData ? "From Google Ads" : "No tracking"} icon={Target} loading={isLoading} trend={hasConversionData ? computeTrend(filteredOverview?.conversions, previousOverview?.conversions) : undefined} />
          </div>
        </div>

        </>)}

        {/* ═══════════════════════════════════════════════════════════════
            TAB: CAMPAIGNS
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "campaigns" && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-purple-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Campaign Breakdown</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-7">Detailed performance metrics for each ad campaign</p>
              </div>
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2" disabled={isLoading || availableCampaigns.length === 0}>
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {selectedCampaigns.length > 0 && (
                      <span className="ml-1 rounded-full bg-blue-500 text-white px-2 py-0.5 text-xs">{selectedCampaigns.length}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Select Campaigns</h4>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedCampaigns(availableCampaigns)} className="text-xs text-blue-600 hover:underline">Select All</button>
                        <button onClick={() => setSelectedCampaigns([])} className="text-xs text-gray-500 hover:underline">Clear</button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {availableCampaigns.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-2">No campaigns available</p>
                    ) : (
                      availableCampaigns.map((campaign) => (
                        <button key={campaign} onClick={() => toggleCampaign(campaign)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left text-sm">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${selectedCampaigns.includes(campaign) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                            {selectedCampaigns.includes(campaign) && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className="truncate">{campaign}</span>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Selected campaigns tags */}
            {selectedCampaigns.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mb-3">
                {selectedCampaigns.slice(0, 3).map((campaign) => (
                  <span key={campaign} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    <span className="truncate max-w-[100px]">{campaign}</span>
                    <button onClick={() => toggleCampaign(campaign)} className="hover:bg-blue-200 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {selectedCampaigns.length > 3 && <span className="text-xs text-muted-foreground">+{selectedCampaigns.length - 3} more</span>}
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4">
              <KPICard title="Total Spend" value={filteredOverview ? formatCurrency(filteredOverview.cost) : "$0"} subtitle="Ad spend" icon={DollarSign} loading={isLoading} trend={computeTrend(filteredOverview?.cost, previousOverview?.cost, true)} />
              <KPICard title="Impressions" value={filteredOverview?.impressions || 0} subtitle="Total impressions" icon={Eye} loading={isLoading} trend={computeTrend(filteredOverview?.impressions, previousOverview?.impressions)} />
              <KPICard title="Clicks" value={filteredOverview?.clicks || 0} subtitle={`CTR: ${filteredOverview?.ctr.toFixed(2) || 0}%`} icon={MousePointerClick} loading={isLoading} trend={computeTrend(filteredOverview?.clicks, previousOverview?.clicks)} />
              <KPICard title="Conversions" value={hasConversionData ? (filteredOverview?.conversions || 0) : "N/A"} subtitle={hasConversionData ? "From Google Ads" : "No tracking"} icon={Target} loading={isLoading} trend={hasConversionData ? computeTrend(filteredOverview?.conversions, previousOverview?.conversions) : undefined} />
              <KPICard title="Cost / Conv." value={hasConversionData && filteredOverview?.costPerConversion ? formatCurrency(filteredOverview.costPerConversion) : "N/A"} subtitle={`CPC: ${formatCurrency(filteredOverview?.cpc || 0)}`} icon={TrendingDown} loading={isLoading} trend={hasConversionData ? computeTrend(filteredOverview?.costPerConversion, previousOverview?.costPerConversion, true) : undefined} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <Card className="shadow-sm border-0">
                <CardHeader className="px-3 sm:px-4 md:px-6">
                  <CardTitle className="text-sm sm:text-base font-medium text-gray-700">Spend Over Time</CardTitle>
                </CardHeader>
                <CardContent className="px-2 sm:px-3 md:px-6">
                  {isLoading ? <Skeleton className="h-[200px] sm:h-[250px] w-full" /> : (
                    <div className="h-[200px] sm:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorCostCamp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} formatter={(value) => [formatCurrency(value as number), "Spend"]} />
                          <Area type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCostCamp)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="shadow-sm border-0">
                <CardHeader className="px-3 sm:px-4 md:px-6">
                  <CardTitle className="text-sm sm:text-base font-medium text-gray-700">Clicks & Impressions</CardTitle>
                </CardHeader>
                <CardContent className="px-2 sm:px-3 md:px-6">
                  {isLoading ? <Skeleton className="h-[200px] sm:h-[250px] w-full" /> : (
                    <div className="h-[200px] sm:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} interval="preserveStartEnd" />
                          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                          <Bar yAxisId="right" dataKey="impressions" name="Impressions" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Full campaign table */}
            <Card className="shadow-sm border-0">
              <CardContent className="px-0 sm:px-2 md:px-6 pt-4">
                {isLoading ? (
                  <div className="space-y-2 px-3 sm:px-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 sm:h-10 w-full" />)}</div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No campaign data available for the selected period</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Campaign</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">Spend</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">Impressions</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">Clicks</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">Conv.</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">CTR</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">CPC</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">Cost/Conv</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCampaigns.filter((c) => c.campaign !== "(not set)").map((campaign, index) => (
                          <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium truncate max-w-[200px]">{campaign.campaign}</td>
                            <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{formatCurrency(campaign.cost)}</td>
                            <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{campaign.impressions.toLocaleString()}</td>
                            <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{campaign.clicks.toLocaleString()}</td>
                            <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{campaign.conversions.toLocaleString()}</td>
                            <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{campaign.ctr.toFixed(2)}%</td>
                            <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{formatCurrency(campaign.cpc)}</td>
                            <td className="text-right py-2 sm:py-3 px-2 sm:px-4">{campaign.costPerConversion > 0 ? formatCurrency(campaign.costPerConversion) : "\u2014"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB: USER JOURNEY
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "journey" && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="h-5 w-5 text-green-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              User Journey from Ads
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 ml-7">Track how users move from ad click to conversion</p>

          {isLoading || newDataLoading ? (
            <Skeleton className="h-48 w-full rounded-lg" />
          ) : journeyData ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Funnel visualization */}
              <Card className="shadow-sm border-0">
                <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium text-gray-700">
                    Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 md:px-6">
                  <div className="space-y-3">
                    {journeyData.funnel.map((step, idx) => {
                      const maxValue = journeyData.funnel[0]?.value || 1;
                      const widthPct = Math.max((step.value / maxValue) * 100, 8);
                      const dropoff = idx > 0
                        ? journeyData.funnel[idx - 1].value > 0
                          ? ((journeyData.funnel[idx - 1].value - step.value) / journeyData.funnel[idx - 1].value * 100)
                          : 0
                        : 0;
                      const colors = [
                        "from-blue-500 to-blue-600",
                        "from-indigo-500 to-indigo-600",
                        "from-purple-500 to-purple-600",
                        "from-green-500 to-green-600",
                      ];

                      return (
                        <div key={step.stage}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">{step.stage}</span>
                              {idx > 0 && dropoff > 0 && (
                                <span className="text-xs text-red-500 flex items-center gap-0.5">
                                  <ArrowDown className="h-3 w-3" />
                                  {dropoff.toFixed(1)}% drop
                                </span>
                              )}
                            </div>
                            <span className="text-sm sm:text-base font-bold text-gray-900">
                              {step.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${colors[idx]} rounded-full flex items-center justify-end pr-3 transition-all duration-500`}
                              style={{ width: `${widthPct}%` }}
                            >
                              {widthPct > 15 && (
                                <span className="text-white text-xs font-medium">
                                  {((step.value / maxValue) * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* CTA Events & Landing Pages side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Top CTA Actions from Ads */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-purple-500" />
                      Top CTA Actions (from Ads)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 md:px-6">
                    {journeyData.ctaEvents.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">No CTA data for paid traffic</p>
                    ) : (
                      <div className="space-y-2">
                        {journeyData.ctaEvents.slice(0, 8).map((evt) => {
                          const maxEvt = journeyData.ctaEvents[0]?.eventCount || 1;
                          return (
                            <div key={evt.eventName} className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs sm:text-sm text-gray-700 truncate">
                                    {evt.eventName.replace(/^btn_/, "").replace(/_/g, " ")}
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold text-gray-900 ml-2 flex-shrink-0">
                                    {evt.eventCount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                  <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${(evt.eventCount / maxEvt) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Landing Pages from Ads */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      Top Landing Pages (from Ads)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 sm:px-2 md:px-6">
                    {journeyData.landingPages.length === 0 ? (
                      <p className="text-sm text-gray-400 py-4 text-center">No landing page data</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Page</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Sessions</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden sm:table-cell">Bounce</th>
                              <th className="text-right py-2 px-2 font-medium text-muted-foreground hidden md:table-cell">Avg Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {journeyData.landingPages.slice(0, 6).map((lp, i) => (
                              <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-2 px-3 font-medium truncate max-w-[120px] sm:max-w-[200px]" title={lp.page}>
                                  {lp.page}
                                </td>
                                <td className="text-right py-2 px-2">{lp.sessions.toLocaleString()}</td>
                                <td className="text-right py-2 px-2 hidden sm:table-cell">
                                  <span className={lp.bounceRate > 50 ? "text-red-500" : lp.bounceRate > 35 ? "text-yellow-600" : "text-green-600"}>
                                    {lp.bounceRate.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="text-right py-2 px-2 hidden md:table-cell">{formatDuration(lp.avgDuration)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB: PAID VS ORGANIC
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "comparison" && (<>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-5 w-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Campaign vs Organic Comparison
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 ml-7">Compare event performance between campaign and organic traffic</p>

          {isLoading || newDataLoading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-[350px] w-full rounded-lg" />
            </div>
          ) : eventsComparison ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Summary KPI row — matches Section 1 card style */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 opacity-75" />
                      <p className="text-xs font-medium opacity-75">All Users</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold">{eventsComparison.totals.allUsers.toLocaleString()}</p>
                    <p className="text-xs opacity-60 mt-0.5">total events</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <p className="text-xs font-medium text-gray-500">Campaign</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{eventsComparison.totals.campaignUsers.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {eventsComparison.totals.allUsers > 0
                        ? `${((eventsComparison.totals.campaignUsers / eventsComparison.totals.allUsers) * 100).toFixed(1)}% of total`
                        : "—"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <p className="text-xs font-medium text-gray-500">Organic</p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{eventsComparison.totals.organicUsers.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {eventsComparison.totals.allUsers > 0
                        ? `${((eventsComparison.totals.organicUsers / eventsComparison.totals.allUsers) * 100).toFixed(1)}% of total`
                        : "—"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Side-by-side charts: Campaign and Organic on their own scales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Campaign Events chart */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Campaign Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-1 sm:px-2 md:px-4">
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={eventsComparison.events.slice(0, 8).map((e) => ({
                            name: e.eventName.replace(/^btn_/, "").replace(/_/g, " "),
                            value: e.campaignUsers,
                          }))}
                          layout="vertical"
                          margin={{ left: 0, right: 50, top: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} width={100} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                            formatter={(value: number | undefined) => [value != null ? value.toLocaleString() : "0", "Campaign"]}
                          />
                          <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18}>
                            <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: "#3b82f6", fontWeight: 600 }} formatter={(v: unknown) => { const n = Number(v); return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Organic Events chart */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Organic Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-1 sm:px-2 md:px-4">
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={eventsComparison.events.slice(0, 8).map((e) => ({
                            name: e.eventName.replace(/^btn_/, "").replace(/_/g, " "),
                            value: e.organicUsers,
                          }))}
                          layout="vertical"
                          margin={{ left: 0, right: 50, top: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} width={100} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                            formatter={(value: number | undefined) => [value != null ? value.toLocaleString() : "0", "Organic"]}
                          />
                          <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18}>
                            <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: "#10b981", fontWeight: 600 }} formatter={(v: unknown) => { const n = Number(v); return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Channel Engagement Metrics Table */}
              {comparisonData && (
                <Card className="shadow-sm border-0">
                  <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      Channel Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left py-3 px-3 sm:px-4 font-semibold text-gray-700">Metric</th>
                            <th className="text-center py-3 px-3 sm:px-4 font-semibold">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                <span className="text-blue-700">Paid Search</span>
                              </div>
                            </th>
                            <th className="text-center py-3 px-3 sm:px-4 font-semibold">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="text-emerald-700">Organic Search</span>
                              </div>
                            </th>
                            <th className="text-center py-3 px-3 sm:px-4 font-semibold hidden md:table-cell">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                <span className="text-purple-700">Direct</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { metric: "Users", icon: <Users className="h-3.5 w-3.5 text-gray-400" />, paid: comparisonData.paid.activeUsers.toLocaleString(), organic: comparisonData.organic.activeUsers.toLocaleString(), direct: comparisonData.direct.activeUsers.toLocaleString() },
                            { metric: "% of Total", icon: <BarChart3 className="h-3.5 w-3.5 text-gray-400" />, paid: `${comparisonData.paid.percentOfTotal.toFixed(1)}%`, organic: `${comparisonData.organic.percentOfTotal.toFixed(1)}%`, direct: `${comparisonData.direct.percentOfTotal.toFixed(1)}%` },
                            { metric: "Sessions", icon: <Globe className="h-3.5 w-3.5 text-gray-400" />, paid: comparisonData.paid.sessions.toLocaleString(), organic: comparisonData.organic.sessions.toLocaleString(), direct: comparisonData.direct.sessions.toLocaleString() },
                            { metric: "Bounce Rate", icon: <ArrowDown className="h-3.5 w-3.5 text-gray-400" />, paid: `${comparisonData.paid.bounceRate.toFixed(1)}%`, organic: `${comparisonData.organic.bounceRate.toFixed(1)}%`, direct: `${comparisonData.direct.bounceRate.toFixed(1)}%`, lowerBetter: true },
                            { metric: "Avg Session Duration", icon: <Clock className="h-3.5 w-3.5 text-gray-400" />, paid: formatDuration(comparisonData.paid.avgSessionDuration), organic: formatDuration(comparisonData.organic.avgSessionDuration), direct: formatDuration(comparisonData.direct.avgSessionDuration) },
                            { metric: "Pages / Session", icon: <ExternalLink className="h-3.5 w-3.5 text-gray-400" />, paid: comparisonData.paid.pagesPerSession.toFixed(1), organic: comparisonData.organic.pagesPerSession.toFixed(1), direct: comparisonData.direct.pagesPerSession.toFixed(1) },
                            { metric: "Engagement Rate", icon: <MousePointerClick className="h-3.5 w-3.5 text-gray-400" />, paid: `${comparisonData.paid.engagementRate.toFixed(1)}%`, organic: `${comparisonData.organic.engagementRate.toFixed(1)}%`, direct: `${comparisonData.direct.engagementRate.toFixed(1)}%` },
                            { metric: "CTA Clicks", icon: <MousePointer className="h-3.5 w-3.5 text-gray-400" />, paid: comparisonData.paid.ctaClicks.toLocaleString(), organic: comparisonData.organic.ctaClicks.toLocaleString(), direct: comparisonData.direct.ctaClicks > 0 ? comparisonData.direct.ctaClicks.toLocaleString() : "\u2014" },
                          ].map((row, idx) => {
                            const vals = [
                              parseFloat(String(comparisonData.paid[getMetricKey(row.metric)] || 0)),
                              parseFloat(String(comparisonData.organic[getMetricKey(row.metric)] || 0)),
                              parseFloat(String(comparisonData.direct[getMetricKey(row.metric)] || 0)),
                            ];
                            return (
                              <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-gray-700">
                                  <div className="flex items-center gap-1.5">
                                    {row.icon}
                                    <span>{row.metric}</span>
                                  </div>
                                </td>
                                <td className="text-center py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-blue-700">{row.paid}</td>
                                <td className="text-center py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-emerald-700">{row.organic}</td>
                                <td className="text-center py-2.5 sm:py-3 px-3 sm:px-4 font-semibold text-purple-700 hidden md:table-cell">{row.direct}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Two-column: Event share donut + CTA comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Event volume share donut */}
                <Card className="shadow-sm border-0 self-start">
                  <CardContent className="px-3 sm:px-4 md:px-6 pt-4 pb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Event Volume Share</p>
                    {(() => {
                      const otherVal = Math.max(0, eventsComparison.totals.allUsers - eventsComparison.totals.campaignUsers - eventsComparison.totals.organicUsers);
                      const pieData = [
                        { name: "Campaign", value: eventsComparison.totals.campaignUsers },
                        { name: "Organic", value: eventsComparison.totals.organicUsers },
                        ...(otherVal > 0 ? [{ name: "Other", value: otherVal }] : []),
                      ];
                      const PIE_COLORS = ["#3b82f6", "#10b981", "#d1d5db"];
                      const total = pieData.reduce((s, d) => s + d.value, 0);
                      return (
                        <div>
                          <div className="h-[140px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={35}
                                  outerRadius={60}
                                  paddingAngle={3}
                                  dataKey="value"
                                  label={false}
                                  labelLine={false}
                                >
                                  {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                                  formatter={(value: number | undefined) => [value != null ? value.toLocaleString() : "0", "Events"]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-1">
                            {pieData.map((entry, i) => {
                              const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
                              return (
                                <div key={entry.name} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                                    <span className="text-gray-600">{entry.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">{entry.value.toLocaleString()}</span>
                                    <span className="text-gray-400 w-10 text-right">{pct}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* CTA-specific events comparison */}
                <Card className="shadow-sm border-0 lg:col-span-2">
                  <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                    <CardTitle className="text-sm sm:text-base font-medium text-gray-700 flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-purple-500" />
                      CTA Events: Campaign vs Organic
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-4 md:px-6">
                    {(() => {
                      const ctaEvents = eventsComparison.events.filter((e) => e.eventName.startsWith("btn_"));
                      if (ctaEvents.length === 0) {
                        return <p className="text-sm text-muted-foreground py-4 text-center">No CTA events found</p>;
                      }
                      return (
                        <div className="space-y-3">
                          {ctaEvents.slice(0, 8).map((evt) => {
                            const total = evt.campaignUsers + evt.organicUsers;
                            const campPct = total > 0 ? (evt.campaignUsers / total) * 100 : 0;
                            const orgPct = total > 0 ? (evt.organicUsers / total) * 100 : 0;
                            return (
                              <div key={evt.eventName}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[180px]">
                                    {evt.eventName.replace(/^btn_/, "").replace(/_/g, " ")}
                                  </span>
                                  <div className="flex items-center gap-4 ml-2 flex-shrink-0 text-xs">
                                    <span className="font-semibold text-blue-600">{evt.campaignUsers.toLocaleString()}</span>
                                    <span className="font-semibold text-emerald-600">{evt.organicUsers.toLocaleString()}</span>
                                  </div>
                                </div>
                                {/* Stacked proportion bar */}
                                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                                  {campPct > 0 && (
                                    <div
                                      className="bg-blue-500 flex items-center justify-center transition-all"
                                      style={{ width: `${campPct}%` }}
                                    >
                                      {campPct > 20 && <span className="text-[9px] text-white font-medium">{campPct.toFixed(0)}%</span>}
                                    </div>
                                  )}
                                  {orgPct > 0 && (
                                    <div
                                      className="bg-emerald-500 flex items-center justify-center transition-all"
                                      style={{ width: `${orgPct}%` }}
                                    >
                                      {orgPct > 20 && <span className="text-[9px] text-white font-medium">{orgPct.toFixed(0)}%</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-4 pt-2 border-t text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                              Campaign
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              Organic
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Full events comparison table */}
              <Card className="shadow-sm border-0">
                <CardHeader className="px-3 sm:px-4 md:px-6 pb-2">
                  <CardTitle className="text-sm sm:text-base font-medium text-gray-700">
                    Detailed Event Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 sm:px-2 md:px-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Event Name</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">
                            <span className="hidden sm:inline">All Users</span>
                            <span className="sm:hidden">All</span>
                          </th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-muted-foreground hidden sm:inline">Campaign</span>
                              <span className="text-muted-foreground sm:hidden">Camp.</span>
                            </div>
                          </th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-muted-foreground hidden sm:inline">Organic</span>
                              <span className="text-muted-foreground sm:hidden">Org.</span>
                            </div>
                          </th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground hidden md:table-cell">Campaign %</th>
                          <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground hidden lg:table-cell">Organic %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventsComparison.events.slice(0, 15).map((evt, idx) => {
                          const campPct = evt.allUsers > 0 ? ((evt.campaignUsers / evt.allUsers) * 100) : 0;
                          const orgPct = evt.allUsers > 0 ? ((evt.organicUsers / evt.allUsers) * 100) : 0;
                          const isCta = evt.eventName.startsWith("btn_");
                          return (
                            <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium">
                                <div className="flex items-center gap-1.5">
                                  {isCta && <Zap className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                                  <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                    {evt.eventName.replace(/_/g, " ")}
                                  </span>
                                </div>
                              </td>
                              <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-muted-foreground">{evt.allUsers.toLocaleString()}</td>
                              <td className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-blue-600">{evt.campaignUsers.toLocaleString()}</td>
                              <td className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-emerald-600">{evt.organicUsers.toLocaleString()}</td>
                              <td className="text-right py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">
                                <div className="flex items-center justify-end gap-1.5">
                                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(campPct, 100)}%` }} />
                                  </div>
                                  <span className="text-xs text-gray-500 w-12 text-right">{campPct.toFixed(1)}%</span>
                                </div>
                              </td>
                              <td className="text-right py-2 sm:py-3 px-2 sm:px-4 hidden lg:table-cell">
                                <div className="flex items-center justify-end gap-1.5">
                                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(orgPct, 100)}%` }} />
                                  </div>
                                  <span className="text-xs text-gray-500 w-12 text-right">{orgPct.toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        </>)}

        </div>
    </div>
  );
}

// Helper to map display metric name to data key
function getMetricKey(metricName: string): keyof ChannelMetrics {
  const map: Record<string, keyof ChannelMetrics> = {
    "Users": "activeUsers",
    "% of Total": "percentOfTotal",
    "Sessions": "sessions",
    "Bounce Rate": "bounceRate",
    "Avg Session Duration": "avgSessionDuration",
    "Pages / Session": "pagesPerSession",
    "Engagement Rate": "engagementRate",
    "CTA Clicks": "ctaClicks",
  };
  return map[metricName] || "activeUsers";
}
