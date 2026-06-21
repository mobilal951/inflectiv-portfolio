import { NextResponse } from "next/server";

// Portfolio demo — synthetic user directory. Names and emails are invented;
// numbers are scaled ~0.4 from the real captured snapshot (Total ~16.7K -> ~6.7K).
type AuthType = "zklogin" | "wallet";

interface DemoUser {
  id: string;
  data: {
    user_id: string;
    email: string | null;
    name: string;
    provider?: string;
  };
  authType: AuthType;
}

const FIRST_NAMES = [
  "Aisha", "Bilal", "Carla", "Dimitri", "Elena", "Farhan", "Gina", "Hiro",
  "Imani", "Jonas", "Kira", "Leila", "Mateo", "Nadia", "Otis", "Priya",
  "Quentin", "Rashid", "Sana", "Tomas", "Uma", "Viktor", "Wren", "Xian",
  "Yuki", "Zara",
];

const LAST_NAMES = [
  "Acosta", "Bauer", "Chen", "Dasilva", "Eze", "Falk", "Garcia", "Hassan",
  "Iqbal", "Jansen", "Khan", "Larsen", "Mehta", "Nakamura", "Okafor",
  "Petersen", "Quraishi", "Rivera", "Sato", "Tanaka", "Uddin", "Vargas",
  "Wong", "Xu", "Yamamoto", "Zhou",
];

const PROVIDERS = ["google", "google", "google", "github", "wallet", "sui_wallet", "dogecoin"];

function buildUsers(count: number): DemoUser[] {
  const users: DemoUser[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const provider = PROVIDERS[(i * 3) % PROVIDERS.length];
    const isWallet = provider === "wallet" || provider === "sui_wallet" || provider === "dogecoin";
    const walletAddr = isWallet
      ? `0x${(Math.abs(((i + 1) * 9301 + 49297) * 233280) % 0xffffffffff).toString(16).padStart(10, "0")}${(i * 31).toString(16).padStart(6, "0")}`
      : null;
    users.push({
      id: String(1000 + i),
      data: {
        user_id: walletAddr || String(1000 + i),
        email: isWallet ? null : `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
        name: `${first} ${last}`,
        provider,
      },
      authType: isWallet ? "wallet" : "zklogin",
    });
  }
  return users;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const search = searchParams.get("search");
  const limit = limitParam ? parseInt(limitParam) : 100;

  const totalCount = 6700;
  const totalWallet = 1830;
  const totalZklogin = totalCount - totalWallet;

  let users = buildUsers(Math.min(limit, totalCount));

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.data.email?.toLowerCase().includes(q) ||
        u.data.name.toLowerCase().includes(q) ||
        u.id.includes(q)
    );
  }

  const pageZklogin = users.filter((u) => u.authType === "zklogin").length;
  const pageWallet = users.filter((u) => u.authType === "wallet").length;

  return NextResponse.json({
    users,
    total: totalCount,
    returned: users.length,
    stats: { totalZklogin, totalWallet, pageZklogin, pageWallet },
    byAuthProvider: [
      { provider: "google", count: 3580 },
      { provider: "github", count: 1290 },
      { provider: "wallet", count: 920 },
      { provider: "sui_wallet", count: 610 },
      { provider: "dogecoin", count: 300 },
    ],
  });
}
