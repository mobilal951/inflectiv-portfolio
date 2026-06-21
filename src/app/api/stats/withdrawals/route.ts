import { NextRequest, NextResponse } from "next/server";

// Portfolio demo - withdrawal/payout requests + seller earnings summary.
const SELLERS = [
  { id: 1001, name: "Acme Holdings", email: "billing@acme-holdings.example" },
  { id: 1002, name: "Northbay Capital", email: "ops@northbaycap.example" },
  { id: 1003, name: "Pacific Crest", email: "team@pacificcrest.example" },
  { id: 1004, name: "Lambda Research", email: "admin@lambda-research.example" },
  { id: 1005, name: "Atlas Media", email: "accounts@atlasmedia.example" },
  { id: 1006, name: "Ironwood Labs", email: "hello@ironwood-labs.example" },
  { id: 1007, name: "Vela Studio", email: "studio@velastudio.example" },
  { id: 1008, name: "Quartz Collective", email: "ops@quartzcollective.example" },
];

export async function GET(_request: NextRequest) {
  const totalRequests = 86;
  const pendingRequests = 14;
  const completedRequests = 62;
  const rejectedRequests = 10;
  const totalAmountRequested = 4280000;
  const pendingAmount = 720000;
  const totalPendingEarnings = 940000;
  const totalPaidOut = 3560000;

  const statuses = ["completed", "completed", "pending", "completed", "rejected", "completed", "pending"];
  const destTypes = ["bank_transfer", "stripe", "paypal", "crypto_wallet"];

  const payoutRequests = Array.from({ length: 14 }).map((_, i) => {
    const seller = SELLERS[i % SELLERS.length];
    const created = new Date();
    created.setDate(created.getDate() - i * 2);
    const status = statuses[i % statuses.length];
    const processed = status === "pending" ? null : new Date(created.getTime() + 86400000 * 2).toISOString();
    return {
      id: "po_" + (1000 + i),
      userId: seller.id,
      userName: seller.name,
      userEmail: seller.email,
      amountCents: 12000 + ((i * 13) % 80) * 1500,
      destinationType: destTypes[i % destTypes.length],
      destinationDetails: { last4: String(1000 + (i * 17) % 9000) },
      provider: ["stripe", "wise", "paypal", "circle"][i % 4],
      status,
      adminNotes: status === "rejected" ? "Invalid bank details" : null,
      processedAt: processed,
      createdAt: created.toISOString(),
      updatedAt: (processed ?? created.toISOString()),
    };
  });

  const sellerEarnings = SELLERS.map((s, i) => ({
    id: i + 1,
    sellerId: s.id,
    userName: s.name,
    userEmail: s.email,
    totalEarningsCents: 480000 - i * 28000,
    pendingPayoutCents: 120000 - i * 6000,
    totalPaidCents: 360000 - i * 22000,
    totalSalesCount: 142 - i * 8,
    lastSaleAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    lastPayoutAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
  }));

  return NextResponse.json({
    overview: {
      totalRequests,
      pendingRequests,
      completedRequests,
      rejectedRequests,
      totalAmountRequested,
      pendingAmount,
      totalPendingEarnings,
      totalPaidOut,
    },
    byStatus: [
      { status: "completed", count: completedRequests },
      { status: "pending", count: pendingRequests },
      { status: "rejected", count: rejectedRequests },
    ],
    byDestination: [
      { destination: "bank_transfer", count: 42 },
      { destination: "stripe", count: 22 },
      { destination: "paypal", count: 14 },
      { destination: "crypto_wallet", count: 8 },
    ],
    payoutRequests,
    sellerEarnings,
  });
}
