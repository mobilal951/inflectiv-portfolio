// Shared deterministic mock data helpers for the public portfolio demo.
// Every route under src/app/api/ returns synthetic numbers shaped from real
// captured snapshots (scaled ~0.4) so the dashboards stay realistic without
// exposing production data.

// Seeded pseudo-random so the same date returns the same value across reloads.
// Uses mulberry32 — fast, deterministic, good enough for chart noise.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStringToSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Build an array of date strings YYYYMMDD (GA format) for the last N days,
// oldest first.
export function lastNDates(n: number, format: "YYYYMMDD" | "YYYY-MM-DD" = "YYYYMMDD"): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(format === "YYYYMMDD" ? `${yyyy}${mm}${dd}` : `${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

// Distribute a total across N buckets with realistic ±variance noise.
// Trend can shape an upward / downward / flat curve.
export function distribute(
  total: number,
  buckets: number,
  opts: { seed: string; variance?: number; trend?: number } = { seed: "default" }
): number[] {
  const { seed, variance = 0.35, trend = 0 } = opts;
  const rand = mulberry32(hashStringToSeed(seed));
  const baseShare = total / buckets;

  // Generate raw weights with noise + trend
  const weights: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const trendFactor = 1 + trend * (i / Math.max(1, buckets - 1));
    const noise = 1 + (rand() - 0.5) * 2 * variance;
    weights.push(Math.max(0.05, baseShare * trendFactor * noise));
  }

  // Normalize so the sum equals the requested total.
  const sum = weights.reduce((a, b) => a + b, 0);
  const scaled = weights.map((w) => (w * total) / sum);

  // Round to ints, then patch the last bucket to make the total exactly right.
  const rounded = scaled.map((v) => Math.round(v));
  const drift = total - rounded.reduce((a, b) => a + b, 0);
  if (rounded.length > 0) rounded[rounded.length - 1] += drift;
  return rounded.map((v) => Math.max(0, v));
}

// Same as distribute, but returns floats.
export function distributeFloat(
  total: number,
  buckets: number,
  opts: { seed: string; variance?: number; trend?: number } = { seed: "default" }
): number[] {
  const { seed, variance = 0.35, trend = 0 } = opts;
  const rand = mulberry32(hashStringToSeed(seed));
  const baseShare = total / buckets;
  const weights: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const trendFactor = 1 + trend * (i / Math.max(1, buckets - 1));
    const noise = 1 + (rand() - 0.5) * 2 * variance;
    weights.push(Math.max(0.05, baseShare * trendFactor * noise));
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (w * total) / sum);
}

// Tag every response so it's obvious data is synthetic if anyone inspects.
export const DEMO_NOTICE = "Synthetic data — Inflectiv public portfolio demo";
