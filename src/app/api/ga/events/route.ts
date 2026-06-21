import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — event counts mix CTA events with standard GA events.
// The real GTM CTA names are kept so the dashboards render the right labels.
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventsParam = searchParams.get("events");

  const all: { eventName: string; eventCount: number }[] = [
    { eventName: "page_view", eventCount: 1600 },
    { eventName: "session_start", eventCount: 1480 },
    { eventName: "first_visit", eventCount: 1210 },
    { eventName: "user_engagement", eventCount: 980 },
    { eventName: "scroll", eventCount: 760 },
    { eventName: "click", eventCount: 540 },
    { eventName: "btn_Launch_App", eventCount: 410 },
    { eventName: "btn_Try_for_Free", eventCount: 320 },
    { eventName: "btn_Sign_Up", eventCount: 250 },
    { eventName: "btn_hp_Login", eventCount: 220 },
    { eventName: "btn_hp_Create_Dataset", eventCount: 190 },
    { eventName: "btn_Try_Inflectiv", eventCount: 170 },
    { eventName: "btn_Create_ChatBot", eventCount: 140 },
    { eventName: "btn_Create_New_Dataset", eventCount: 120 },
    { eventName: "btn_Create_Listing", eventCount: 110 },
    { eventName: "btn_Search", eventCount: 95 },
    { eventName: "btn_New_Dataset", eventCount: 82 },
    { eventName: "btn_New_Chatbot", eventCount: 71 },
    { eventName: "btn_New_Listing", eventCount: 58 },
    { eventName: "form_submit", eventCount: 47 },
    { eventName: "file_download", eventCount: 32 },
    { eventName: "video_start", eventCount: 24 },
  ];

  let events = all;
  if (eventsParam) {
    const allowed = new Set(eventsParam.split(","));
    events = all.filter((e) => allowed.has(e.eventName));
  }

  return NextResponse.json({ events });
}
