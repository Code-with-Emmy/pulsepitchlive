# Live Score + Streaming (SportSRC V2)

Production-ready Next.js App Router app for multi-sport live scores and stream embeds.

## Stack

- Next.js (App Router) + TypeScript
- TailwindCSS
- SWR for client polling
- Server-side SportSRC V2 proxy via Next Route Handlers

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in project root:


`NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_CODE` should contain the exact Social Bar snippet from your Adsterra dashboard so it can be injected once near the end of the page.
Leave any native slot env blank if you want to suppress that placement.

3. Run dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tailwind

Tailwind is enabled via `@import "tailwindcss"` in [`/Users/aierthinc/Desktop/livefooty/app/globals.css`](/Users/aierthinc/Desktop/livefooty/app/globals.css) and `@tailwindcss/postcss` in `postcss.config.mjs`.

## API Proxy Routes

- `GET /api/sports` -> SportSRC `?type=sports` (`revalidate: 3600`)
- `GET /api/matches?sport=&status=&date=` -> SportSRC `?type=matches...` (`revalidate: 15`)
- `GET /api/match/:id` -> SportSRC `?type=detail&id=...` (`revalidate: 15`)

All upstream requests send:

- `X-API-KEY: process.env.SPORTSRC_API_KEY`

API key is never exposed client-side.

## Behaviors

- Live refresh every 15 seconds (SWR)
- Tabs: Live / Upcoming / Finished
- Date filter
- Match cards with teams, scores, status, league/time
- Match detail with stream source selector + iframe player
- Homepage ad layout: no ad above hero, one native slot after featured matches, optional second native slot after the next content section, delayed Social Bar
- Match detail ad layout: no ad above player, one native slot below the player, one lower-page native slot near related matches, delayed Social Bar
- 404 handling with “Match not available (may be finished/removed)”
- 503 handling with “Data updating, retrying…” and retry behavior
- Client-only favorites in localStorage with quick filter
- Responsive mobile-first layout + loading skeletons + empty states
