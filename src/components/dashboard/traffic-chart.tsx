"use client";

import {
  LineChart,
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

interface TrafficData {
  date: string;
  activeUsers: number;
  sessions: number;
  newUsers: number;
  [key: string]: string | number;
}

interface TrafficChartProps {
  data: TrafficData[];
  loading?: boolean;
}

export function TrafficChart({ data, loading }: TrafficChartProps) {
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
        <CardTitle className="text-sm sm:text-base md:text-lg">Traffic Trend</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 md:px-6">
        <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 13, fill: "#374151" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 13, fill: "#374151" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
              <Line
                type="monotone"
                dataKey="activeUsers"
                name="Active Users"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                name="New Users"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
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
