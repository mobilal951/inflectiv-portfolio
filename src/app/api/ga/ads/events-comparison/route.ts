import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — events with side-by-side All / Campaign (paid) / Organic mix.
// Preserves the same row shape the dashboards consume.
export async function GET(_request: NextRequest) {
  type Row = {
    eventName: string;
    allUsers: number;
    allUsersCount: number;
    campaignUsers: number;
    campaignUsersCount: number;
    organicUsers: number;
    organicUsersCount: number;
  };

  const events: Row[] = [
    { eventName: "page_view", allUsers: 1600, allUsersCount: 14800, campaignUsers: 72, campaignUsersCount: 640, organicUsers: 410, organicUsersCount: 3500 },
    { eventName: "session_start", allUsers: 1480, allUsersCount: 14200, campaignUsers: 66, campaignUsersCount: 610, organicUsers: 380, organicUsersCount: 3300 },
    { eventName: "first_visit", allUsers: 1210, allUsersCount: 11200, campaignUsers: 58, campaignUsersCount: 540, organicUsers: 320, organicUsersCount: 2800 },
    { eventName: "user_engagement", allUsers: 980, allUsersCount: 8400, campaignUsers: 52, campaignUsersCount: 470, organicUsers: 260, organicUsersCount: 2200 },
    { eventName: "scroll", allUsers: 760, allUsersCount: 6200, campaignUsers: 38, campaignUsersCount: 320, organicUsers: 210, organicUsersCount: 1700 },
    { eventName: "click", allUsers: 540, allUsersCount: 4100, campaignUsers: 28, campaignUsersCount: 240, organicUsers: 140, organicUsersCount: 1180 },
    { eventName: "btn_Launch_App", allUsers: 410, allUsersCount: 2700, campaignUsers: 142, campaignUsersCount: 940, organicUsers: 86, organicUsersCount: 580 },
    { eventName: "btn_Try_for_Free", allUsers: 320, allUsersCount: 2100, campaignUsers: 118, campaignUsersCount: 780, organicUsers: 64, organicUsersCount: 430 },
    { eventName: "btn_Sign_Up", allUsers: 250, allUsersCount: 1700, campaignUsers: 86, campaignUsersCount: 560, organicUsers: 52, organicUsersCount: 340 },
    { eventName: "btn_hp_Login", allUsers: 220, allUsersCount: 1480, campaignUsers: 64, campaignUsersCount: 420, organicUsers: 47, organicUsersCount: 310 },
    { eventName: "btn_hp_Create_Dataset", allUsers: 190, allUsersCount: 1280, campaignUsers: 38, campaignUsersCount: 250, organicUsers: 41, organicUsersCount: 270 },
    { eventName: "btn_Try_Inflectiv", allUsers: 170, allUsersCount: 1120, campaignUsers: 32, campaignUsersCount: 210, organicUsers: 34, organicUsersCount: 220 },
    { eventName: "btn_Create_ChatBot", allUsers: 140, allUsersCount: 920, campaignUsers: 24, campaignUsersCount: 160, organicUsers: 28, organicUsersCount: 180 },
    { eventName: "btn_Create_New_Dataset", allUsers: 120, allUsersCount: 780, campaignUsers: 18, campaignUsersCount: 120, organicUsers: 24, organicUsersCount: 160 },
    { eventName: "btn_Create_Listing", allUsers: 110, allUsersCount: 720, campaignUsers: 15, campaignUsersCount: 95, organicUsers: 21, organicUsersCount: 140 },
    { eventName: "btn_Search", allUsers: 95, allUsersCount: 620, campaignUsers: 11, campaignUsersCount: 72, organicUsers: 19, organicUsersCount: 120 },
    { eventName: "btn_New_Dataset", allUsers: 82, allUsersCount: 540, campaignUsers: 9, campaignUsersCount: 58, organicUsers: 16, organicUsersCount: 100 },
    { eventName: "btn_New_Chatbot", allUsers: 71, allUsersCount: 460, campaignUsers: 7, campaignUsersCount: 46, organicUsers: 13, organicUsersCount: 84 },
    { eventName: "btn_New_Listing", allUsers: 58, allUsersCount: 380, campaignUsers: 5, campaignUsersCount: 32, organicUsers: 10, organicUsersCount: 64 },
    { eventName: "form_submit", allUsers: 47, allUsersCount: 320, campaignUsers: 8, campaignUsersCount: 54, organicUsers: 12, organicUsersCount: 78 },
  ];

  const totals = {
    allUsers: events.reduce((sum, e) => sum + e.allUsers, 0),
    campaignUsers: events.reduce((sum, e) => sum + e.campaignUsers, 0),
    organicUsers: events.reduce((sum, e) => sum + e.organicUsers, 0),
  };

  return NextResponse.json({ events, totals });
}
