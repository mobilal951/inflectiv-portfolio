import { cookies } from "next/headers";

const MAX_TOKEN_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Parse admin passwords from environment variable
// Format: {"maheen":"pass1","jaka":"pass2","bilal":"pass3"}
export function getAdminPasswords(): Record<string, string> {
  const passwordsJson = process.env.PROMO_ADMIN_PASSWORDS;
  if (!passwordsJson) {
    return {};
  }
  try {
    return JSON.parse(passwordsJson);
  } catch (e) {
    console.error("Failed to parse PROMO_ADMIN_PASSWORDS:", e);
    return {};
  }
}

// Verify password and return the user name if valid
export function verifyPassword(password: string): { valid: boolean; userName?: string } {
  const passwords = getAdminPasswords();

  for (const [userName, userPassword] of Object.entries(passwords)) {
    if (userPassword === password) {
      return { valid: true, userName };
    }
  }

  return { valid: false };
}

// Create a simple signed token (userName:timestamp:signature)
// In production, use a proper JWT library
function createToken(userName: string): string {
  const timestamp = Date.now();
  const secret = process.env.NEXTAUTH_SECRET || "promo-admin-secret";
  // Simple signature using base64 encoding of data + secret
  const data = `${userName}:${timestamp}`;
  const signature = Buffer.from(`${data}:${secret}`).toString("base64").slice(0, 16);
  return Buffer.from(`${data}:${signature}`).toString("base64");
}

// Verify and decode the token
function verifyToken(token: string): { valid: boolean; userName?: string } {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) {
      return { valid: false };
    }

    const [userName, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Check if token is expired (24 hours)
    if (Date.now() - timestamp > MAX_TOKEN_AGE) {
      return { valid: false };
    }

    // Verify signature
    const secret = process.env.NEXTAUTH_SECRET || "promo-admin-secret";
    const expectedSignature = Buffer.from(`${userName}:${timestamp}:${secret}`).toString("base64").slice(0, 16);
    if (signature !== expectedSignature) {
      return { valid: false };
    }

    // Verify user exists in password list
    const passwords = getAdminPasswords();
    if (!passwords[userName]) {
      return { valid: false };
    }

    return { valid: true, userName };
  } catch (e) {
    console.error("Token verification error:", e);
    return { valid: false };
  }
}

export { createToken };

export async function verifyPromoAdmin(): Promise<{ valid: boolean; error?: string; userName?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("promo_admin_token")?.value;

    if (!token) {
      return { valid: false, error: "Please enter the admin password to access promo codes" };
    }

    const result = verifyToken(token);

    if (!result.valid) {
      return { valid: false, error: "Session expired. Please enter the admin password again" };
    }

    return { valid: true, userName: result.userName };
  } catch (error) {
    console.error("Promo auth verification error:", error);
    return { valid: false, error: "Authentication error" };
  }
}
