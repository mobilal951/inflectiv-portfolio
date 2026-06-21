"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parse } from "date-fns";

interface WebsiteTrafficData {
  date: string;
  activeUsers: number;
  ctaClicks: number;
  [key: string]: string | number;
}

interface WebsiteTrafficChartProps {
  data: WebsiteTrafficData[];
  loading?: boolean;
}

export function WebsiteTrafficChart({ data, loading }: WebsiteTrafficChartProps) {
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

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }));

  return (
    <Card>
      <CardHeader className="px-3 sm:px-4 md:px-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">Website Traffic</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 md:px-6">
        <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 13, fill: "#374151" }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 13, fill: "#374151" }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 13, fill: "#374151" }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
              <Bar
                yAxisId="left"
                dataKey="activeUsers"
                name="Active Users"
                fill="#3b82f6"
                radius={[2, 2, 0, 0]}
                label={{ position: 'top', fill: '#374151', fontSize: 10 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ctaClicks"
                name="CTA Clicks"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string): string {
  try {
    const date = parse(dateString, "yyyyMMdd", new Date());
    return format(date, "MMM d");
  } catch {
    return dateString;
  }
}
