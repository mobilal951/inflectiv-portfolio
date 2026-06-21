"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SourceData {
  channel: string;
  sessions: number;
  [key: string]: string | number;
}

interface SourcesChartProps {
  data: SourceData[];
  loading?: boolean;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export function SourcesChart({ data, loading }: SourcesChartProps) {
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
        <CardTitle className="text-sm sm:text-base md:text-lg">Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 md:px-6">
        <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="sessions"
                nameKey="channel"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
