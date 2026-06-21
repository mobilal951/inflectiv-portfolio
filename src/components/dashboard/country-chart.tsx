"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CountryData {
  country: string;
  activeUsers: number;
  sessions: number;
}

interface CountryChartProps {
  data: CountryData[];
  loading?: boolean;
  title?: string;
}

export function CountryChart({
  data,
  loading,
  title = "Traffic by Country",
}: CountryChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-4 md:px-6">
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
        </CardHeader>
        <CardContent className="px-2 sm:px-4 md:px-6">
          <Skeleton className="h-[200px] sm:h-[250px] md:h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-3 sm:px-4 md:px-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 md:px-6">
        <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 13, fill: "#374151" }} />
              <YAxis
                dataKey="country"
                type="category"
                tick={{ fontSize: 13, fill: "#374151" }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
              <Bar
                dataKey="activeUsers"
                name="Users"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                label={{ position: 'right', fill: '#374151', fontSize: 11 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
