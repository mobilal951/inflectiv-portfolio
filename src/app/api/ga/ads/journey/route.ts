import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — Ads funnel (Ad Clicks -> Site Visits -> CTA Clicks -> Conversions),
// paid landing pages, and CTA event mix for the paid channel.
export async function GET(_request: NextRequest) {
  const funnel = [
    { stage: "Ad Clicks", value: 1840, description: "Users who clicked on ads" },
    { stage: "Site Visits", value: 1620, description: "Sessions from paid traffic" },
    { stage: "CTA Clicks", value: 480, description: "CTA button clicks from ad users" },
    { stage: "Conversions", value: 92, description: "Completed conversions from ads" },
  ];

  const landingPages = [
    { page: "/app", sessions: 720, users: 640, bounceRate: 24.2, avgDuration: 1640, pagesPerSession: 4.6 },
    { page: "/", sessions: 410, users: 380, bounceRate: 32.1, avgDuration: 1120, pagesPerSession: 3.8 },
    { page: "/pricing", sessions: 220, users: 200, bounceRate: 41.8, avgDuration: 640, pagesPerSession: 2.7 },
    { page: "/datasets", sessions: 140, users: 130, bounceRate: 38.5, avgDuration: 720, pagesPerSession: 3.1 },
    { page: "/chatbots", sessions: 90, users: 85, bounceRate: 36.0, avgDuration: 690, pagesPerSession: 2.9 },
    { page: "/signup", sessions: 40, users: 38, bounceRate: 22.5, avgDuration: 410, pagesPerSession: 2.1 },
  ];

  const ctaEvents = [
    { eventName: "btn_Launch_App", eventCount: 142 },
    { eventName: "btn_Try_for_Free", eventCount: 118 },
    { eventName: "btn_Sign_Up", eventCount: 86 },
    { eventName: "btn_hp_Login", eventCount: 64 },
    { eventName: "btn_hp_Create_Dataset", eventCount: 38 },
    { eventName: "btn_Try_Inflectiv", eventCount: 32 },
  ];

  const totalCtaClicks = ctaEvents.reduce((sum, e) => sum + e.eventCount, 0);

  return NextResponse.json({ funnel, landingPages, ctaEvents, totalCtaClicks });
}
