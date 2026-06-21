"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LogIn,
  UserPlus,
  CreditCard,
  Crown,
  BookOpen,
  Rocket,
  TrendingUp,
} from "lucide-react";

const EVENT_CATEGORIES = {
  authentication: {
    title: "Authentication",
    icon: LogIn,
    color: "#3b82f6",
    events: ["btn_google_signin", "btn_wallet_signin", "btn_Sign_In", "btn_verification_code"],
  },
  registration: {
    title: "Registration",
    icon: UserPlus,
    color: "#10b981",
    events: ["btn_Header_Register_Now", "btn_Get_Started_free", "btn_start_for_free", "user_onboard", "paid_user_onboard"],
  },
  pricing: {
    title: "Pricing",
    icon: CreditCard,
    color: "#f59e0b",
    events: ["btn_Header_Pricing", "btn_Buy_Large", "btn_Buy_Medium", "btn_Buy_Small", "btn_Need_Credits"],
  },
  subscription: {
    title: "Subscriptions",
    icon: Crown,
    color: "#8b5cf6",
    events: ["btn_Upgrade_Basic", "btn_Upgrade_Pro", "subscribed_basic", "subscribed_pro"],
  },
  resources: {
    title: "Resources",
    icon: BookOpen,
    color: "#ec4899",
    events: ["btn_Header_Resources", "btn_Resources_Blogs", "btn_Resources_FAQs", "btn_Resources_Guidelines", "btn_View_Articles", "btn_View_FAQs"],
  },
  appActions: {
    title: "App Actions",
    icon: Rocket,
    color: "#06b6d4",
    events: ["btn_Start_Project", "btn_LaunchApp_Blogpage", "logo_user_dashboard"],
  },
  engagement: {
    title: "Engagement",
    icon: TrendingUp,
    color: "#84cc16",
    events: ["engaged_user", "power_user"],
  },
};

interface EventData {
  eventName: string;
  eventCount: number;
  [key: string]: string | number;
}

export default function EventsPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey, setLastUpdated, setRefreshing } = useDashboard();

  const [eventData, setEventData] = useState<Record<string, EventData[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty || contextLoading) return;

      setLoading(true);
      setError(null);

      if (isDemoMode) {
        const demoData: Record<string, EventData[]> = {};
        Object.entries(EVENT_CATEGORIES).forEach(([key, category]) => {
          demoData[key] = category.events.map((event) => ({
            eventName: event,
            eventCount: Math.floor(Math.random() * 500) + 50,
          }));
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
        setEventData(demoData);
        setLastUpdated(new Date());
        setRefreshing(false);
        setLoading(false);
        return;
      }

      const { startDate, endDate } = getDateParams();
      const allEvents = Object.values(EVENT_CATEGORIES).flatMap((c) => c.events);

      const params = new URLSearchParams({
        propertyId: selectedProperty,
        startDate,
        endDate,
        events: allEvents.join(","),
      });

      try {
        const response = await fetch(`/api/ga/events?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        const organizedData: Record<string, EventData[]> = {};
        Object.entries(EVENT_CATEGORIES).forEach(([key, category]) => {
          organizedData[key] = category.events.map((eventName) => {
            const found = data.events?.find((e: EventData) => e.eventName === eventName);
            return { eventName, eventCount: found?.eventCount || 0 };
          });
        });

        setEventData(organizedData);
        setLastUpdated(new Date());
        setRefreshing(false);
      } catch (err: any) {
        setError(err.message);
        setRefreshing(false);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedProperty, getDateParams, contextLoading, isDemoMode, refreshKey]);

  const isLoading = loading || contextLoading;

  const formatEventName = (name: string): string => {
    return name.replace(/^btn_/, "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="User Events" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Category Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
          {Object.entries(EVENT_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            const total = eventData[key]?.reduce((sum, e) => sum + e.eventCount, 0) || 0;

            return (
              <Card key={key} className="shadow-sm">
                <CardContent className="p-2.5 sm:p-3 md:pt-4">
                  {isLoading ? (
                    <Skeleton className="h-12 sm:h-16 w-full" />
                  ) : (
                    <div className="text-center">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mx-auto mb-1 sm:mb-2" style={{ color: category.color }} />
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{total.toLocaleString()}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{category.title}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {Object.entries(EVENT_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            const events = eventData[key] || [];

            return (
              <Card key={key} className="shadow-sm">
                <CardHeader className="pb-2 px-3 sm:px-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" style={{ color: category.color }} />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 sm:px-3 md:px-6">
                  {isLoading ? (
                    <Skeleton className="h-[150px] sm:h-[180px] md:h-[220px] lg:h-[260px] w-full" />
                  ) : (
                    <div className="h-[150px] sm:h-[180px] md:h-[220px] lg:h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={events} layout="vertical" margin={{ left: 0, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" tick={{ fontSize: 12, fill: "#374151" }} />
                          <YAxis
                            dataKey="eventName"
                            type="category"
                            tick={{ fontSize: 11, fill: "#1f2937" }}
                            width={90}
                            tickFormatter={formatEventName}
                          />
                          <Tooltip
                            formatter={(value) => [(value as number).toLocaleString(), "Events"]}
                            labelFormatter={formatEventName}
                            contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
                          />
                          <Bar dataKey="eventCount" fill={category.color} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#374151', fontSize: 10 }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Events Table */}
        <Card className="shadow-sm">
          <CardHeader className="px-3 sm:px-4 md:px-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">All Events</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-2 md:px-6">
            {isLoading ? (
              <div className="space-y-2 px-3 sm:px-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 sm:h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Event</th>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(EVENT_CATEGORIES).flatMap(([key, category]) =>
                      (eventData[key] || []).slice(0, 3).map((event, index) => (
                        <tr key={`${key}-${index}`} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">{formatEventName(event.eventName)}</td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">
                            <span
                              className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              {category.title}
                            </span>
                          </td>
                          <td className="text-right py-2 sm:py-3 px-3 sm:px-4">{event.eventCount.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
