import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — demographics scaled ~0.4 from captured snapshot.
// Filtered "unknown" buckets already removed and age labels normalized
// to match the original route's post-processing.
export async function GET(_request: NextRequest) {
  const age = [
    { ageGroup: "18-24", users: 1620 },
    { ageGroup: "25-34", users: 4480 },
    { ageGroup: "35-44", users: 3380 },
    { ageGroup: "45-54", users: 1810 },
    { ageGroup: "55-64", users: 940 },
    { ageGroup: "65+", users: 470 },
  ];

  const gender = [
    { gender: "Male", users: 9220 },
    { gender: "Female", users: 5800 },
  ];

  const device = [
    { device: "Mobile", users: 10500, sessions: 17000 },
    { device: "Desktop", users: 4920, sessions: 7800 },
    { device: "Tablet", users: 780, sessions: 1200 },
  ];

  const interests = [
    { interest: "Technology / Software", users: 5240 },
    { interest: "Business & Productivity", users: 3810 },
    { interest: "AI & Machine Learning", users: 3120 },
    { interest: "Data & Analytics", users: 2470 },
    { interest: "Finance & Investing", users: 1880 },
    { interest: "Marketing & Advertising", users: 1410 },
    { interest: "Education", users: 1180 },
    { interest: "Entertainment", users: 940 },
    { interest: "Gaming", users: 610 },
    { interest: "Sports", users: 320 },
  ];

  const channels = [
    { channel: "Direct", activeUsers: 8100, sessions: 13000, newUsers: 66 },
    { channel: "Organic Search", activeUsers: 4050, sessions: 6500, newUsers: 33 },
    { channel: "Organic Social", activeUsers: 1620, sessions: 2600, newUsers: 13 },
    { channel: "Referral", activeUsers: 970, sessions: 1560, newUsers: 8 },
    { channel: "Paid Search", activeUsers: 730, sessions: 1170, newUsers: 6 },
    { channel: "Email", activeUsers: 490, sessions: 780, newUsers: 4 },
    { channel: "AI Assistant", activeUsers: 240, sessions: 390, newUsers: 1 },
  ];

  return NextResponse.json({ age, gender, device, interests, channels });
}
