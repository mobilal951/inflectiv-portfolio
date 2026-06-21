import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    connected: true,
    demo: true,
    timestamp: new Date().toISOString(),
    tokenRefreshTest: { success: true, hasAccessToken: true, expiresIn: 3600 },
    credentialsResult: {
      hasAccessToken: true,
      propertyId: "properties/448055843",
    },
    env: {
      VERCEL: "1",
      GA_REFRESH_TOKEN_SET: true,
      GA_REFRESH_TOKEN_LENGTH: 0,
      GA_PROPERTY_ID: "properties/448055843",
      GOOGLE_CLIENT_ID_SET: true,
      GOOGLE_CLIENT_SECRET_SET: true,
    },
    error: null,
  });
}
