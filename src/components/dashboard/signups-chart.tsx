"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

interface SignupData {
  date: string;
  count: number;
}

interface SignupsChartProps {
  data: SignupData[];
  loading?: boolean;
}

export function SignupsChart({ data, loading }: SignupsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-4 md:px-6">
          <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
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
        <CardTitle className="text-sm sm:text-base md:text-lg">Signups on each Day</CardTitle>
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
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 13, fill: "#374151" }} tickLine={false} axisLine={false} width={35} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                formatter={(value) => [value as number, "Signups"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Signups"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 3 }}
                activeDot={{ r: 5 }}
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
    // Handle both ISO dates and yyyyMMdd format
    const date = dateString.includes("-")
      ? parseISO(dateString)
      : new Date(
          parseInt(dateString.slice(0, 4)),
          parseInt(dateString.slice(4, 6)) - 1,
          parseInt(dateString.slice(6, 8))
        );
    return format(date, "MMM d");
  } catch {
    return dateString;
  }
}
