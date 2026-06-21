// GA credentials with hybrid storage
// Uses environment variables for production (Vercel) and file storage for local dev

import fs from "fs";
import path from "path";

interface StoredCredentials {
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  propertyId: string;
  savedAt: string;
}

interface GACredentials {
  accessToken: string;
  propertyId: string;
}

// Path to store credentials (in project root, excluded from git)
const CREDENTIALS_FILE = path.join(process.cwd(), ".ga-credentials.json");

// Check if running on Vercel (production)
const IS_VERCEL = process.env.VERCEL === "1";

// Admin email whitelist - only these users can save GA credentials
export const ADMIN_EMAILS = [
  "admin@bigimmersive.com",
  // Add more admin emails here
];

// Refresh access token using Google OAuth
async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number } | { error: string }> {
  try {
    console.log("RefreshToken Debug - client_id set:", !!process.env.GOOGLE_CLIENT_ID);
    console.log("RefreshToken Debug - client_secret set:", !!process.env.GOOGLE_CLIENT_SECRET);
    console.log("RefreshToken Debug - refresh_token length:", refreshToken?.length);

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Token refresh failed:", JSON.stringify(data));
      return { error: `Failed to refresh token: ${data.error || data.error_description || 'Unknown error'}` };
    }

    console.log("RefreshToken Debug - Success, got access_token");
    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { error: "Failed to refresh token" };
  }
}

// Get stored GA credentials (used by all visitors)
export async function getAdminGACredentials(): Promise<GACredentials | null> {
  try {
    // On Vercel: Use environment variable for refresh token
    if (IS_VERCEL) {
      const refreshToken = process.env.GA_REFRESH_TOKEN;
      const propertyId = process.env.GA_PROPERTY_ID;

      console.log("GA Debug - IS_VERCEL:", IS_VERCEL);
      console.log("GA Debug - GA_REFRESH_TOKEN set:", !!refreshToken, "length:", refreshToken?.length);
      console.log("GA Debug - GA_PROPERTY_ID:", propertyId);

      if (!refreshToken) {
        console.log("No GA_REFRESH_TOKEN environment variable set");
        return null;
      }

      // Always refresh token on Vercel since we can't store the access token
      console.log("GA Debug - Attempting token refresh...");
      const refreshed = await refreshAccessToken(refreshToken);

      if ("error" in refreshed) {
        console.error("Failed to refresh token on Vercel:", refreshed.error);
        return null;
      }

      console.log("GA Debug - Token refresh successful!");
      return {
        accessToken: refreshed.accessToken,
        propertyId: propertyId || "",
      };
    }

    // Local development: Use file storage
    if (!fs.existsSync(CREDENTIALS_FILE)) {
      console.log("No GA credentials file found");
      return null;
    }

    const fileContent = fs.readFileSync(CREDENTIALS_FILE, "utf-8");
    const credentials: StoredCredentials = JSON.parse(fileContent);

    if (!credentials.accessToken || !credentials.refreshToken) {
      console.log("Invalid credentials in file");
      return null;
    }

    // Check if token is expired (with 5 min buffer)
    if (Date.now() > credentials.expiresAt - 5 * 60 * 1000) {
      console.log("Token expired, refreshing...");

      const refreshed = await refreshAccessToken(credentials.refreshToken);

      if ("error" in refreshed) {
        console.error("Failed to refresh admin token:", refreshed.error);
        return null;
      }

      // Update stored credentials
      const updatedCredentials: StoredCredentials = {
        ...credentials,
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt,
        savedAt: new Date().toISOString(),
      };

      fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(updatedCredentials, null, 2));
      console.log("Token refreshed and saved");

      return {
        accessToken: refreshed.accessToken,
        propertyId: credentials.propertyId || process.env.GA_PROPERTY_ID || "",
      };
    }

    return {
      accessToken: credentials.accessToken,
      propertyId: credentials.propertyId || process.env.GA_PROPERTY_ID || "",
    };
  } catch (error) {
    console.error("Error getting admin GA credentials:", error);
    return null;
  }
}

// Save admin GA credentials (only admins can do this)
export async function saveAdminGACredentials(
  email: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
  propertyId?: string
): Promise<{ success: boolean; error?: string }> {
  // Check if user is admin
  if (!ADMIN_EMAILS.includes(email)) {
    return { success: false, error: `Only authorized admins can save GA credentials` };
  }

  try {
    const credentials: StoredCredentials = {
      email,
      accessToken,
      refreshToken,
      expiresAt,
      propertyId: propertyId || process.env.GA_PROPERTY_ID || `properties/501072751`,
      savedAt: new Date().toISOString(),
    };

    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
    console.log("GA credentials saved for:", email);

    return { success: true };
  } catch (error) {
    console.error("Error saving GA credentials:", error);
    return { success: false, error: "Failed to save credentials" };
  }
}

// Check if GA is connected (credentials exist and are valid)
export async function isGAConnected(): Promise<boolean> {
  const credentials = await getAdminGACredentials();
  return credentials !== null;
}

// Clear stored credentials
export function clearGACredentials(): void {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      fs.unlinkSync(CREDENTIALS_FILE);
      console.log("GA credentials cleared");
    }
  } catch (error) {
    console.error("Error clearing GA credentials:", error);
  }
}

export { refreshAccessToken };
