import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — top countries scaled ~0.4 from captured all-time snapshot.
// Real all-time top 5: US 6.8K (18.6%), UAE 5.6K (15.4%), Indonesia 5.4K (14.7%),
// Lithuania 4.4K (12.2%), Nigeria 3.7K (10.2%).
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "10");

  const all = [
    { country: "United States", activeUsers: 2720, sessions: 4380 },
    { country: "United Arab Emirates", activeUsers: 2240, sessions: 3610 },
    { country: "Indonesia", activeUsers: 2160, sessions: 3470 },
    { country: "Lithuania", activeUsers: 1760, sessions: 2830 },
    { country: "Nigeria", activeUsers: 1480, sessions: 2380 },
    { country: "Pakistan", activeUsers: 1110, sessions: 1790 },
    { country: "India", activeUsers: 820, sessions: 1320 },
    { country: "Germany", activeUsers: 640, sessions: 1030 },
    { country: "United Kingdom", activeUsers: 510, sessions: 820 },
    { country: "Brazil", activeUsers: 420, sessions: 680 },
    { country: "Canada", activeUsers: 360, sessions: 580 },
    { country: "Philippines", activeUsers: 300, sessions: 490 },
  ];

  return NextResponse.json({ countries: all.slice(0, limit) });
}
