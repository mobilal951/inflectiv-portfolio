# Inflectiv Analytics Dashboard — Portfolio Demo

Public, read-only portfolio fork of the Inflectiv analytics + admin dashboard.

**Original:** built at [BIG IMMERSIVE](https://www.bigimmersive.com) by [Muhammad Bilal](https://bilal-pf.vercel.app).
The production dashboard ties together Google Analytics (web traffic), Firebase (app users + activity), Neon Postgres (subscriptions, credits, promo codes, withdrawals), and Google Ads — behind a NextAuth admin gate.

**This fork:**
- Same UI, same routes, same state machines — visitors see the dashboard exactly as it works in production.
- All API routes have been rewritten to return shaped synthetic data instead of hitting real Google Analytics / Firebase / Postgres. Numbers are scaled ~0.4× the captured real values so trends and proportions are preserved without exposing production metrics.
- Password gate is intentionally kept; a floating bubble on the password screen shows the demo password.
- "Sign in with Google" is also kept on the GA-connect dialog but short-circuited — clicking it just acknowledges demo mode rather than running real OAuth.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind v4 + tw-animate-css
- Recharts + Nivo (charts)
- Radix UI primitives
- NextAuth (kept for UI parity; not used to gate access in the demo)
- Vercel Functions (Node.js runtime)

## Sections
- **Analytics:** Traffic Overview, Top Pages, Countries, Acquisition, Devices & Browsers, User Types, Engagement, Google Ads
- **App Data:** App Users, Activity Stats
- **Admin:** Promo Codes (CRUD + campaigns + bulk + CSV export), Subscriptions, Credits, API Keys, Datasets, Withdrawals

## Demo password
`inflectiv_stats26` — shown in the floating bubble on the login screen, tap to auto-fill.

## Running locally
```bash
npm install
npm run dev
```
No env vars required — every API route in `src/app/api/` returns synthetic data via the `src/lib/mock-data.ts` helpers.

## Links
- Portfolio: https://bilal-pf.vercel.app
- LinkedIn: https://www.linkedin.com/in/mobilal951
