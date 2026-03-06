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

```env
SPORTSRC_API_KEY=your_api_key_here
NEXT_PUBLIC_ADSTERRA_HOST=www.highperformanceformat.com
NEXT_PUBLIC_ADSTERRA_SLOT_300X250=your_300x250_zone_key
NEXT_PUBLIC_ADSTERRA_SLOT_728X90=your_728x90_zone_key
NEXT_PUBLIC_ADSTERRA_SLOT_320X50=your_320x50_zone_key
NEXT_PUBLIC_ADSTERRA_SLOT_RIGHT_TOP=your_zone_key_top
NEXT_PUBLIC_ADSTERRA_SLOT_RIGHT_MIDDLE=your_zone_key_middle
NEXT_PUBLIC_ADSTERRA_SLOT_RIGHT_BOTTOM=your_zone_key_bottom
```

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
- 404 handling with “Match not available (may be finished/removed)”
- 503 handling with “Data updating, retrying…” and retry behavior
- Client-only favorites in localStorage with quick filter
- Responsive mobile-first layout + loading skeletons + empty states
