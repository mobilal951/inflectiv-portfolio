"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { subDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

interface Property {
  id: string;
  name: string;
  account: string;
}

interface DashboardContextType {
  properties: Property[];
  selectedProperty: string | null;
  setSelectedProperty: (id: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  loading: boolean;
  error: string | null;
  getDateParams: () => { startDate: string; endDate: string };
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGAConnected: boolean;
  isDemoMode: boolean;
  refreshKey: number;
  refresh: () => void;
  refreshing: boolean;
  lastUpdated: Date | null;
  setLastUpdated: (date: Date) => void;
  setRefreshing: (value: boolean) => void;
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = React.useState<string | null>(
    null
  );
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [isGAConnected, setIsGAConnected] = React.useState(false);

  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.isAdmin || false;
  // Demo mode only when GA is not connected
  const isDemoMode = !isGAConnected;

  const refresh = React.useCallback(() => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Fetch properties - no auth needed, uses stored admin credentials
  React.useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      setError(null);

      try {
        // Fetch real properties using stored admin credentials
        const response = await fetch("/api/ga/properties");
        const data = await response.json();

        if (!response.ok) {
          // GA not connected - admin needs to connect
          setIsGAConnected(false);
          setError(data.error || "GA not connected");
          setLoading(false);
          return;
        }

        // GA is connected
        setIsGAConnected(true);
        setProperties(data.properties);

        // Auto-select first property
        if (data.properties.length > 0) {
          const saved = localStorage.getItem("selectedProperty");
          const validSaved = data.properties.find(
            (p: Property) => p.id === saved
          );
          setSelectedProperty(validSaved?.id || data.properties[0].id);
        }
      } catch (err: any) {
        setIsGAConnected(false);
        setError(err.message || "Failed to connect to GA");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLastUpdated(new Date());
      }
    }

    fetchProperties();
  }, [refreshKey]);

  // Save selected property to localStorage
  React.useEffect(() => {
    if (selectedProperty) {
      localStorage.setItem("selectedProperty", selectedProperty);
    }
  }, [selectedProperty]);

  const getDateParams = React.useCallback(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return { startDate: "30daysAgo", endDate: "today" };
    }
    return {
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
    };
  }, [dateRange]);

  return (
    <DashboardContext.Provider
      value={{
        properties,
        selectedProperty,
        setSelectedProperty,
        dateRange,
        setDateRange,
        loading,
        error,
        getDateParams,
        isAuthenticated,
        isAdmin,
        isGAConnected,
        isDemoMode,
        refreshKey,
        refresh,
        refreshing,
        lastUpdated,
        setLastUpdated,
        setRefreshing,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
