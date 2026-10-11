# Hearsay

> What are people *really* saying?

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-222?logo=github&logoColor=white)](https://parisa-singh.github.io/hearsay)

**Hearsay** is a cross-platform review aggregator that queries the platforms relevant to your search — 7 major review sites, plus major retailers for products/electronics — in parallel and shows their reviews side-by-side, giving you the full, unfiltered picture instead of a skewed view from a single source.

The name is intentional: *hearsay* means word of mouth, what people are saying — which is exactly what reviews are.

**No AI synthesis.** Hearsay never rewrites, summarizes, or "decides" for you. Disagreement between platforms is detected **algorithmically** (a 1.5+ star gap), so the divergence you see is a fact about the data, not an opinion from a model.

**[Live Demo →](https://parisa-singh.github.io/hearsay-v2)**

---

## What It Does

1. You search for anything — a restaurant, product, electronics, place, or business — and pick a category
2. Hearsay queries the platforms relevant to that category in parallel (`useQueries` — one platform failing never blocks the rest): review sites (**Google, Yelp, Reddit, YouTube, TripAdvisor, Facebook, Trustpilot**) for restaurants/places/businesses, and **retailers (Amazon, Walmart, Target, eBay, Etsy, AliExpress, Best Buy, Newegg, Apple, Samsung)** for products/electronics
3. The **Pull-from** row adapts to the category you pick (what you're searching), the same way it adapts to your location (where you are)
4. Results are split into **Global Reviews** and **Near You** (location-aware, via geolocation or manual city entry)
5. Reviews are shown **side-by-side per platform** — no single algorithm's verdict
6. A **Divergence Alert** fires when two platforms disagree by 1.5+ stars — computed in `src/utils/divergence.js`, no AI
7. A **comparison chart** (radar + bars) visualizes how ratings spread across platforms
8. **Regional coming-soon chips** show what's available vs. in-progress per country

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 19 |
| Language | JavaScript (ES2022+) |
| Styling | Tailwind CSS v3 |
| Server state | TanStack Query v5 (`useQueries` for parallel fetching) |
| UI state | Zustand v5 (persisted history, location) |
| Charts | Recharts v2 |
| Routing | React Router v7 |
| Serverless API | Cloudflare Workers (itty-router) |
| Analytics | Google Analytics 4 (env-gated) |
| Testing | Vitest + jsdom + Testing Library (43 tests) |
| Deployment | GitHub Actions → GitHub Pages |

---

## Architecture

```
GitHub Pages (static Vite build)
        ↕ HTTPS fetch
Cloudflare Workers (API proxy layer — per-IP rate limited, response caching)
        ↕
Google Places · Yelp · Reddit · YouTube · SerpAPI (TripAdvisor / Facebook / Trustpilot / vendor retailers)
```

- All API secrets live in Cloudflare Workers environment — never in client-side code.
- The Worker rate-limits per IP (`CF-Connecting-IP`, 60 req/60s, fail-open) so the shared API quotas can't be drained by non-browser clients — CORS alone only restrains browsers.
- Responses are cached via the Cloudflare Cache API (SerpAPI routes 24h, YouTube 2h) to protect quotas and cut latency.

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/parisa-singh/hearsay-v2.git
cd hearsay-v2

# 2. Install frontend dependencies
npm install

# 3. Create local env file
cp .env.example .env.local
# Fill in VITE_API_BASE_URL (your Worker URL); VITE_GA_MEASUREMENT_ID is optional

# 4. Start dev server (http://localhost:5173/hearsay-v2/)
npm run dev

# 5. (Separate terminal) Start Workers locally
cd workers
npx wrangler dev

# Run tests
npm test
```

### Required Environment Variables

| Variable | Where | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `.env.local` + repo secret | Cloudflare Workers base URL |
| `VITE_GA_MEASUREMENT_ID` | `.env.local` + repo secret | GA4 measurement ID (optional — unset disables analytics) |
| `GOOGLE_API_KEY` | Wrangler secret | Google Places + YouTube Data API v3 (same key) |
| `YELP_API_KEY` | Wrangler secret | Yelp Fusion API key |
| `REDDIT_CLIENT_ID` | Wrangler secret | Reddit app client ID |
| `REDDIT_CLIENT_SECRET` | Wrangler secret | Reddit app client secret |
| `YOUTUBE_API_KEY` | Wrangler secret | Same key as `GOOGLE_API_KEY` |
| `SERPAPI_KEY` | Wrangler secret | SerpAPI key (TripAdvisor + Facebook + Trustpilot + vendor retailers) |

The per-IP rate limiter is configured (not a secret) via the `RATE_LIMITER` binding in `workers/wrangler.toml`.

---

## Deployment

Frontend deploys automatically to GitHub Pages on every push to `main` via GitHub Actions (`VITE_*` vars injected from repo secrets at build time).

Workers deploy manually — this is also what activates any `wrangler.toml` change, including the rate-limit binding:
```bash
cd workers && npx wrangler deploy
```

---

## Project Background

Hearsay grew out of research into AI bias and information diversity — the observation that the source you use shapes the answer you get, often invisibly. This applies to search engines, review platforms, and AI systems alike. By aggregating across sources and surfacing divergences explicitly — *algorithmically, without an AI deciding for you* — Hearsay makes that bias visible rather than hidden.

Built by [Parisa Singh](https://github.com/parisa-singh), CS + Business, UMass Amherst.

---

*"The truth is rarely pure and never simple." — Oscar Wilde*
