import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — device, browser, and OS mix scaled ~0.4 from captured snapshot.
export async function GET(_request: NextRequest) {
  const devices = [
    { device: "mobile", users: 10500, sessions: 17000 },
    { device: "desktop", users: 4920, sessions: 7800 },
    { device: "tablet", users: 780, sessions: 1200 },
  ];

  const browsers = [
    { browser: "Chrome", users: 9100, sessions: 14800 },
    { browser: "Safari", users: 3650, sessions: 5900 },
    { browser: "Edge", users: 1240, sessions: 2010 },
    { browser: "Samsung Internet", users: 720, sessions: 1170 },
    { browser: "Firefox", users: 580, sessions: 940 },
    { browser: "Opera", users: 310, sessions: 500 },
    { browser: "UC Browser", users: 240, sessions: 390 },
    { browser: "Android Webview", users: 180, sessions: 290 },
    { browser: "Yandex", users: 90, sessions: 150 },
    { browser: "Other", users: 90, sessions: 150 },
  ];

  const operatingSystems = [
    { os: "Android", users: 6900, sessions: 11200 },
    { os: "Windows", users: 3600, sessions: 5820 },
    { os: "iOS", users: 3100, sessions: 5040 },
    { os: "macOS", users: 1450, sessions: 2350 },
    { os: "Linux", users: 720, sessions: 1170 },
    { os: "Chrome OS", users: 280, sessions: 460 },
    { os: "Other", users: 150, sessions: 240 },
  ];

  return NextResponse.json({ devices, browsers, operatingSystems });
}
