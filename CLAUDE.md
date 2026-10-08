# CLAUDE.md — Hearsay Project Context

This file is the canonical reference for Claude Code sessions working on Hearsay.
Read this file first before doing anything else in a new session.

---

## ⚠️ This is Hearsay v2

This repo (`hearsay-v2`) is a **fork of v1**, created 2026-10-06 to freeze the shipped v1 and iterate freely. Full v1 git history is preserved below the fork commit.

- **v1 stays live and untouched** at https://parisa-singh.github.io/hearsay (repo `parisa-singh/hearsay`). Don't change v1 from here.
- **v2 has its OWN Cloudflare Worker** (`hearsay-v2-api`, deployed 2026-10-07) at `https://hearsay-v2-api.parisa-singh.workers.dev` — isolated from v1's `hearsay-api`. Secrets set: `GOOGLE_API_KEY`, `YOUTUBE_API_KEY`, `SERPAPI_KEY`. **Not set:** `REDDIT_CLIENT_ID`/`SECRET` and `YELP_API_KEY` (v1 trial expired). SerpAPI/YouTube quotas still shared at the **API-key level** (same keys as v1). `wrangler deploy` from v2 hits only `hearsay-v2-api`; v1 untouched.
- **Reddit is marked `working: false`** in `platforms.js` (creds pending/not approved). Effect: greyed "Down" chip, sorted to the END of the Pull-from row, and **not queried** (`useAllPlatforms` skips `working === false`). Still `integrated: true` so tests pass. To re-enable: remove the `working: false` line once creds are set. **Yelp** also effectively down (trial expired) but still queried (card hidden on error).
- ⭐ **NEXT STEP — GA4 analytics for v2.** Plumbing is ready (`src/utils/analytics.js`, `initGA` in `main.jsx`, page_view in `Layout.jsx`, `search` event in `SearchBar.jsx`), gated on `VITE_GA_MEASUREMENT_ID` (currently unset = no-op). To turn on visitor tracking: create a **dedicated v2 GA4 web stream**, then set `VITE_GA_MEASUREMENT_ID` as a **repo secret** (`gh secret set`) AND in `.env.local`, and redeploy. (Reusing v1's `G-M63F6NVM6J` works but mixes v1+v2 traffic.) GA4 then shows Users / sessions / avg engagement time + the custom `search` event.
- Base path is `/hearsay-v2/` (vite `base`, router `basename`, 404 redirect).
- **Test runner quirk**: the default `npm test` (vitest threads pool) can hit a worker-pool timeout on cold start in this OneDrive folder. Use `npx vitest run --pool=forks` — **42/42 pass**.
- Deploy pipeline is live: push to `main` → Actions → Pages. The `gh` token now has `workflow` scope (added 2026-10-06), so workflow files push from the CLI without the web-editor workaround.

---

## ⚠️ v2 Redesign (Oct 2026) — current look & behavior

v2 diverges from v1 visually and in the results UX. Key pieces:

- **Design system** (`src/index.css` tokens): layered **blue-black** bg (`--bg #06070b`) with glassy translucent panels (`.panel-glass`), **teal `--accent #4df0d0`** (+ violet/coral), hairline `--line` borders. Fonts: **Fraunces** (display, `font-display`), **Inter** (body), **JetBrains Mono** (`font-mono` labels). Loaded in `index.html`; Tailwind has `display`/`mono`/`accent`. Root div bg is transparent so the body gradient shows app-wide.
- **Narrative intro** (`src/components/intro/HearsayIntro.jsx` + `intro.css`): full-screen story — *hearsay* → splits into *hear*/*say* → *why hearsay?* → zoom-out to 4 bubbles → camera tours each (typing/glitch/radar-ping/scanline/crack) → **expands into the site**. Rendered globally from `Layout.jsx` via Zustand `introPlaying`; auto-plays **once per session** (`sessionStorage 'hs-intro-seen'`); **replay via the header "?"**. Pause/prev/next/dots/skip; respects reduced-motion.
- **Results view switcher** (`ResultsViewSwitcher.jsx`, floating text menu, `.hsview` grey/white-glow-active/hover-glow): three **distinct** views in `ResultsLayouts.jsx` — **Dashboard** (DEFAULT; at-a-glance overview: divergence + comparison + dense per-platform rows with source links), **Bento** (everything on one scroll, balanced card grid via `reviewCols`: 2→2, 3→3, 4→2+2, 5→3+2; density options removed — comfy only), **Tabbed** (Overview/Reviews/Media tabs). Cross-fade (`.view-enter`) on switch. Layout/`bentoDensity` persisted in `uiStore`.
- **Homepage**: Fraunces hero, glassy search card (teal pills + teal glowing Search button), single-row wrapping Pull-from chips, compact greyed "Coming soon" row (3 + hover "+N more"). **About page** fully restyled in the new language.
- **ComparisonChart**: bars (capped, interactive hover tooltips) beside a larger single-series radar (shown only at ≥3 rated); exports `ComparisonBlock` (handles the low-coverage note).
- **SerpAPI structured ratings**: `workers/src/utils/serpapiRating.js` reads SerpAPI rich-snippet `rating`/`reviews` (used by tripadvisor + trustpilot) so TripAdvisor/Trustpilot contribute real ratings beyond Google.

---

## Project Overview

**Hearsay** is a cross-platform review aggregator. Users search for any restaurant, product, or place and get real reviews pulled in parallel from multiple platforms — not one algorithm's version.

- Reviews from 7 integrated platforms shown side-by-side
- Algorithmic divergence detection when platforms disagree by 1.5+ stars
- Location-aware: detects or accepts manual city entry, surfaces platforms popular in that region
- Regional coming-soon chips show what's available vs. what's in progress per country
- Global / Near You tab split on results page

**No AI synthesis layer** — divergence is calculated algorithmically in `src/utils/divergence.js`.

**Live URL (v2)**: https://parisa-singh.github.io/hearsay-v2  
**Live URL (v1, frozen)**: https://parisa-singh.github.io/hearsay  
**Worker URL (v2)**: https://hearsay-v2-api.parisa-singh.workers.dev  
**GitHub (v2)**: https://github.com/parisa-singh/hearsay-v2  
**GitHub (v1)**: https://github.com/parisa-singh/hearsay  
**Builder**: Parisa Singh — https://www.linkedin.com/in/parisa-singh/

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | Vite + React 19 | |
| Language | JavaScript (not TypeScript) | ES2022+ |
| Styling | Tailwind CSS v3 | Custom keyframes: fade-in, slide-up, bounce-pin, wipe-right |
| Server state | TanStack Query v5 | `useQueries` for parallel platform fetching |
| UI state | Zustand v5 | Persist middleware for history, theme, location |
| Charts | Recharts v2 | RadarChart + bar comparison in ComparisonChart |
| Routing | React Router v7 | createBrowserRouter, basename: '/hearsay-v2' |
| Serverless API | Cloudflare Workers | itty-router v4 |
| Deployment | GitHub Actions → GitHub Pages | `npm install` + `vite build` + deploy-pages |
| Testing | Vitest + jsdom + Testing Library | `npm test` runs 34 tests |
| Analytics | Google Analytics 4 (gtag.js) | Env-gated via `VITE_GA_MEASUREMENT_ID`; page views + `search` event. No ID = no-op |

---

## Architecture

```
https://parisa-singh.github.io/hearsay   ← GitHub Pages (static Vite build)
        ↕ HTTPS fetch to Cloudflare Workers
https://hearsay-api.parisa-singh.workers.dev
        ↕
GET  /google        → Google Places API (textsearch + Place Details)
GET  /yelp          → Yelp Fusion API (Business Search + Reviews)
GET  /reddit        → Reddit OAuth API (client credentials; default-on/queried — verify secrets exist)
GET  /youtube       → YouTube Data API v3 (Search + Videos + CommentThreads)
GET  /tripadvisor   → SerpAPI (Google engine, site:tripadvisor.com, 24hr cache)
GET  /facebook      → SerpAPI (Google engine, site:facebook.com, labeled "Facebook Mentions", 24hr cache)
GET  /trustpilot    → SerpAPI (Google engine, site:trustpilot.com, 24hr cache, category-gated)
```

**Critical architectural details**:
- `vite.config.js` sets `base: '/hearsay/'` — required for GitHub Pages subdirectory hosting
- `public/404.html` contains the spa-github-pages redirect script — enables React Router on direct URL access
- Cloudflare Workers CORS: allows `https://parisa-singh.github.io` and `http://localhost:*`
- All API secrets stored via `wrangler secret put` — never in code or git
- Parallel fetching: `useQueries` — one platform failing never blocks others (`retry: 0`)
- `VITE_API_BASE_URL` must be set as a GitHub Actions repo secret for production builds
- `useAllPlatforms.js` filters to `p.integrated === true` — coming-soon platforms are never queried
- **Category-aware querying**: every search carries a `category` (`restaurant` | `product` | `place` | `business`, chosen via pills in `SearchBar.jsx`). Each route shapes/gates by category — see the "Category Handling" table below. The `category` is part of each route's cache key (or baked into the search string) so cross-category requests don't serve each other's results.
- **3 routes share SerpAPI**: TripAdvisor + Facebook + Trustpilot all call SerpAPI's Google engine against one 100-search/month budget. A single non-restaurant search can fire up to 3 SerpAPI calls (minus 24hr cache hits)
- **Per-IP rate limiting**: `workers/src/index.js` calls `checkRateLimit()` before routing (except OPTIONS). Uses Cloudflare's native `RATE_LIMITER` binding (`[[unsafe.bindings]]` in `wrangler.toml`), keyed on `CF-Connecting-IP`, 60 req/60s per IP. CORS only restrains browsers — this stops non-browser (curl) abuse of the shared quotas. **Fail-open**: missing binding/IP or a limiter error allows the request. Over-limit → `429` + `Retry-After`. Activates only on `wrangler deploy` (Workers don't deploy via CI).
- **Analytics (GA4)**: `src/utils/analytics.js` wraps gtag; init in `main.jsx`, manual `page_view` per route change in `Layout.jsx` (SPA-aware, `send_page_view:false`), custom `search` event in `SearchBar.jsx`. Reads `VITE_GA_MEASUREMENT_ID` (measurement ID `G-M63F6NVM6J`) — unset = fully disabled, no gtag script.

---

## Environment Variables

**Frontend** (`.env.local`, gitignored):
```
VITE_API_BASE_URL=https://hearsay-api.parisa-singh.workers.dev
VITE_GA_MEASUREMENT_ID=G-M63F6NVM6J   # GA4; optional — unset disables analytics entirely
```
Both must also be set as GitHub Actions repo secrets so production builds pick them up (they're baked in at build time by Vite).

**Workers** (set via `cd workers && npx wrangler secret put <NAME>`):
```
GOOGLE_API_KEY        — Google Cloud key (Places API + YouTube Data API v3 both enabled on same key)
YELP_API_KEY          — Yelp Fusion API key
YOUTUBE_API_KEY       — Same key as GOOGLE_API_KEY
SERPAPI_KEY           — SerpAPI key (TripAdvisor + Facebook + Trustpilot routes)
REDDIT_CLIENT_ID      — Reddit app client ID (status unverified — run `wrangler secret list`)
REDDIT_CLIENT_SECRET  — Reddit app client secret (status unverified)
```
The rate-limiter is **not** a secret — it's the `RATE_LIMITER` `[[unsafe.bindings]]` block in `wrangler.toml` (committed). Tune `limit`/`period` there and re-`wrangler deploy`.

---

## Platform Status

| Platform | Status | Notes |
|---|---|---|
| Google | ✅ Working | textsearch → Place Details; handles chain names well |
| Yelp | ✅ Working (limited) | 3 reviews max, 160-char truncation enforced by Yelp API. Reviews endpoint sometimes returns 4xx for non-partner keys — card shows rating + note, no review text. `sourceUrl` always returned so "See more on Yelp" link works. |
| YouTube | ✅ Working | Comments + video descriptions as review signal; 2hr cache; links back to videos |
| TripAdvisor | ✅ Working | SerpAPI; 24hr cache |
| Facebook | ✅ Working | SerpAPI fallback; labeled "Facebook Mentions"; 24hr cache |
| Reddit | ⚙️ Default-on, creds unverified | `integrated: true` + `defaultEnabled: true` in `platforms.js`, so it's queried on every search. Route uses OAuth client credentials. If secrets aren't set it fails silently (card hidden). Verify with `wrangler secret list`. |
| Trustpilot | ✅ Working | SerpAPI (Google engine, `site:trustpilot.com reviews`); parses TrustScore/stars from snippets; 24hr cache (key `trustpilot:v3:`). Category-gated: `restaurant` returns empty. No longer HTML/JSON-LD scraping. |

---

## Category Handling (per route)

Categories: `restaurant`, `product`, `place`, `business`. Each route gates and/or shapes the query. "Empty" = returns `{ reviews: [], rating: null }` without calling the upstream API.

| Platform | restaurant | product | place | business |
|---|---|---|---|---|
| Google | ✅ | ⛔ empty | ✅ | ✅ |
| Yelp | ✅ | ⛔ empty | ✅ | ✅ |
| TripAdvisor | ✅ (+city) | ⛔ empty | ✅ (+city) | ⛔ empty |
| Trustpilot | ⛔ empty | ✅ `<q> review` | ✅ (+city) | ✅ `<q> review` |
| Facebook | ✅ (+city) | ✅ `<q> review` | ✅ (+city) | ✅ (+city) |
| YouTube | ✅ (+city) | ✅ `<q> review` | ✅ (+city) | ✅ (+city) |
| Reddit | ✅ | ✅ | ✅ | ✅ |

- **Reddit ignores `category` entirely** — no gating, no query shaping. It runs for all categories and uses city→subreddit mappings (`CITY_SUBREDDITS`) only when a location is set.
- Facebook/YouTube/Trustpilot use a `buildSearchQuery(query, city, category)` helper (near-identical copies — candidate for a shared util).
- `workers/src/utils/relevanceFilter.js` (`filterReviewsForCategory`) strips physical-store/service-visit reviews when `category === 'product'`; applied by Trustpilot, Facebook, YouTube.

---

## Future API Work (Priority Order)

> **Done since last rewrite**: Trustpilot migrated to SerpAPI (no longer scraping). Reddit is now wired default-on — only the Worker secrets remain to confirm/add.

### 0. Reddit — confirm credentials
- Route: `workers/src/routes/reddit.js` — fully implemented and already default-on/queried
- If `wrangler secret list` shows no `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET`: visit reddit.com/prefs/apps → accept Responsible Builder Policy → create app → `wrangler secret put REDDIT_CLIENT_ID` + `wrangler secret put REDDIT_CLIENT_SECRET`. Until then the card fails silently on every search.

### 1. Foursquare — most actionable coming-soon for US/EU
- Has a Places API free tier at location.foursquare.com
- Would cover US/CA and EU regional chips immediately

### 2. Zomato — India/Middle East regional chip
- Public API deprecated 2020; website is JS-rendered
- Options: (a) Apply at developers.zomato.com, (b) SerpAPI may index Zomato

### 3. OpenTable — US regional chip
- Has affiliate API requiring partnership approval
- Alternative: SerpAPI

### 4. Regional platforms (low priority — require local partnerships)
- **India**: JustDial, Magicpin, Swiggy — no public APIs
- **SE Asia**: GrabFood, Agoda, Wongnai, Chope — require local developer accounts
- **Europe**: TheFork (no public API), Michelin (static data possible)
- **Middle East**: Talabat — no public API
- **LATAM**: Rappi, Degusta — no public APIs
- **China**: Dianping, Meituan, Baidu Maps, Gaode, Xiaohongshu, WeChat — require Chinese business entity, not feasible

---

## Key UI Decisions

- **Layout**: Shared `Layout.jsx` wraps all routes via React Router `<Outlet>`. `key={pathname}` on the content div triggers `animate-fade-in` on every route change.
- **Error handling**: Two complementary layers. `ErrorPage.jsx` is the router `errorElement` (full-page, own minimal header) for route/loader errors — set on the Layout route and `/results` in `App.jsx`. `ErrorBoundary.jsx` (class component) wraps `<Outlet>` *inside* the `key={pathname}` div, so render crashes show an in-chrome fallback (Header/Footer kept) and the boundary auto-resets on navigation.
- **Platform toggles**: All 7 integrated platforms are selected (green) by default. Users deselect what they don't want. Coming-soon chips appear in a second row below — grayed, unclickable, "Soon" badge.
- **Regional chips**: `getPlatformTiers(countryCode)` in `platformRegions.js` returns 7 platforms per region. Integrated ones go row 1, coming-soon go row 2. Stagger animation (`animate-slide-up` with delay) on region change. Location banner auto-dismisses after 3s.
- **No-location state**: Shows flat list of all 7 integrated platforms with no regional grouping.
- **Error/empty cards hidden**: `PlatformGrid` filters out results where `isError` is true or data has no rating AND no reviews. Loading skeletons still show.
- **Card ordering**: Working platforms (score 0) → loading (score 1) → error/empty (score 2). Sort in `platformSortScore()` in `PlatformGrid.jsx`. Error cards are hidden entirely by the filter before sorting.
- **Reviews per card**: 3 shown initially, each truncated at 120 chars with "Show more/less" (`ReviewItem.jsx`). YouTube has inline "Load more / Show less" pagination.
- **Yelp card note**: Shows "Yelp limits API previews to 3 snippets" or "Yelp review previews unavailable via API" below the review list, above the external link.
- **Divergence**: Algorithmic — `calculateDivergence()` flags 1.5+ star gap. Returns `{ detected, platform_a, platform_b, explanation }`.
- **Location reset**: Clicking Reset triggers a full-screen `animate-wipe-right` overlay (zinc-950, sweeps left→right) that calls `clearLocation()` on animation end.
- **Search history sidebar**: Right-side drawer, `w-80`, slides in from right. Stores last 20 searches (as `{q, category}`). "View all →" button on homepage opens it. "Clear all" wipes history.
- **Search categories**: Required before search — 2×2 pill grid in `SearchBar.jsx` (`restaurant`/`product`/`place`/`business`). Drives per-route category gating (see Category Handling table).
- **Media card**: YouTube video thumbnails + Google photos rendered above the review grid on results.
- **Results controls**: Share button, keyword highlighting in review text, and sort/filter on results. Cache timestamps shown with a manual refresh that re-fetches with `nocache=1` (bumps `refreshCount`, busts the Worker cache).
- **SerpAPI budget**: 100 searches/month shared between **TripAdvisor + Facebook + Trustpilot** (3 routes). All default-on — watch usage at serpapi.com/dashboard. 24hr caching helps significantly; a single non-restaurant search can fire up to 3 SerpAPI calls.
- **YouTube API quota**: ~71 full queries/day. 2hr caching.

---

## Testing

```bash
npm test          # run all tests once (vitest run)
npm run test:watch  # watch mode
```

**Test files** in `src/test/`:
- `platformRegions.test.js` — verifies all 8 regions return correct 7-platform lists, handles edge cases
- `platforms.test.js` — 7 integrated platforms, all default-enabled, coming-soon has no endpoint
- `platformGrid.test.js` — visibility filter (hides errors/empty, keeps loading+data), sort order
- `divergence.test.js` — gap detection threshold, null rating handling, explanation string format

34 tests, all passing. Run before pushing any changes to core utility functions.

---

## Development Commands

```bash
# Frontend dev server (http://localhost:5173/hearsay/)
npm run dev

# Run tests
npm test

# Frontend production build
npm run build

# Workers local dev (http://localhost:8787)
cd workers && npx wrangler dev

# Deploy Workers to production
cd workers && npx wrangler deploy

# Add/update a Worker secret
cd workers && npx wrangler secret put <KEY_NAME>

# List Worker secrets
cd workers && npx wrangler secret list

# Check GitHub Actions deploy status
gh run list --limit 5
```

---

## Deployment Process

**Frontend**: Push to `main` → GitHub Actions runs `.github/workflows/deploy.yml`:
1. `npm install` (not `npm ci` — lock file has cross-platform optional dep issues on Windows→Linux)
2. `npm run build` with `VITE_API_BASE_URL` and `VITE_GA_MEASUREMENT_ID` injected from repo secrets
3. `dist/` uploaded via `actions/upload-pages-artifact` + deployed via `actions/deploy-pages`

> Editing `.github/workflows/deploy.yml` via `git push` is blocked in this environment (token lacks `workflow` scope) — use GitHub's web editor for workflow changes. See [[reference-ops-gotchas]] in memory.

**Workers**: Manual — `cd workers && npx wrangler deploy`. Secrets go live immediately after `wrangler secret put`, no redeploy needed. **Config changes (incl. the `RATE_LIMITER` rate-limit binding) require a `wrangler deploy` to take effect** — they don't go live via CI.

---

## File Structure

```
hearsay/
├── .github/workflows/deploy.yml    ← GitHub Actions: npm install + build + deploy
├── .env.example                    ← Template for VITE_API_BASE_URL (committed)
├── .env.local                      ← Actual dev values (GITIGNORED)
├── vite.config.js                  ← base: '/hearsay/', React plugin, Vitest config
├── tailwind.config.js              ← Colors, animations (fade-in, slide-up, wipe-right, bounce-pin)
├── index.html                      ← App shell + spa-github-pages history redirect script
├── public/
│   ├── 404.html                    ← SPA routing fix for GitHub Pages direct URL access
│   └── logos/                      ← SVG logos for all platforms (integrated + coming-soon)
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx            ← Hero, search bar, platform toggle, location badge, history sidebar
│   │   ├── ResultsPage.jsx         ← Divergence alert, comparison chart, ReviewTabs
│   │   ├── AboutPage.jsx           ← Mission, Features grid, Technical notes, builder info
│   │   ├── ErrorPage.jsx           ← Router errorElement (full-page) for route/loader errors
│   │   └── NotFoundPage.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx              ← Shared wrapper (Header + ErrorBoundary-wrapped Outlet + Footer)
│   │   │   ├── ErrorBoundary.jsx       ← Class boundary around Outlet — in-chrome render-crash fallback
│   │   │   ├── Header.jsx              ← Logo, About link, GitHub link (no theme toggle)
│   │   │   ├── Footer.jsx              ← LinkedIn link, GitHub link, "Reviews sourced in real time"
│   │   │   └── SearchHistorySidebar.jsx ← Right-side drawer, last 20 searches, clear all
│   │   ├── search/
│   │   │   ├── SearchBar.jsx           ← Main search input (compact prop for ResultsPage)
│   │   │   ├── PlatformToggle.jsx      ← Regional chips (integrated row + coming-soon row)
│   │   │   └── LocationBadge.jsx       ← Detect / manual entry / change / reset with wipe animation
│   │   └── results/
│   │       ├── DivergenceAlert.jsx     ← Shown when 2+ platforms differ by 1.5+ stars
│   │       ├── ComparisonChart.jsx     ← Collapsible RadarChart + bar comparison
│   │       ├── PlatformGrid.jsx        ← Filters empty/error, sorts working-first, renders cards
│   │       ├── PlatformCard.jsx        ← Card: header, reviews, Yelp note, "See more" link
│   │       ├── ReviewItem.jsx          ← Truncated review, Show more/less, YouTube video link
│   │       ├── ReviewTabs.jsx          ← Global / Near You tab switcher
│   │       └── LocalEmptyState.jsx     ← Shown when Near You tab has no data
│   ├── hooks/
│   │   ├── useAllPlatforms.js      ← Parallel fetch for all integrated+enabled platforms
│   │   └── useLocation.js          ← Geolocation API + Nominatim reverse geocoding
│   ├── utils/
│   │   ├── api.js                  ← fetchPlatform() with 10s timeout
│   │   ├── divergence.js           ← calculateDivergence() — 1.5+ star gap detection
│   │   ├── platformRegions.js      ← getPlatformTiers(countryCode) — 7 platforms per region
│   │   ├── formatters.js           ← Rating display, relative date, text truncation
│   │   ├── sentimentColor.js       ← Rating number → Tailwind color classes
│   │   └── analytics.js            ← GA4 gtag wrapper: initGA/trackPageView/trackEvent (env-gated no-op)
│   ├── constants/
│   │   ├── platforms.js            ← PLATFORMS array — single source of truth for all platforms
│   │   │                             integrated: true = queried; integrated: false = coming-soon only
│   │   └── queryKeys.js            ← TanStack Query key factories
│   ├── store/
│   │   └── uiStore.js              ← Zustand: selectedPlatforms, searchHistory (20), historyOpen, location
│   └── test/
│       ├── setup.js                ← @testing-library/jest-dom setup
│       ├── platforms.test.js
│       ├── platformRegions.test.js
│       ├── platformGrid.test.js
│       └── divergence.test.js
└── workers/
    ├── wrangler.toml               ← name: hearsay-api, nodejs_compat, RATE_LIMITER binding
    └── src/
        ├── index.js                ← itty-router: OPTIONS first, per-IP rate limit, 7 platform routes
        ├── routes/
        │   ├── google.js           ← textsearch → Place Details (lat/lng + city; empty for product)
        │   ├── yelp.js             ← Business Search → Reviews (lat/lng + city; empty for product)
        │   ├── reddit.js           ← OAuth token → search + city subreddits (default-on; verify secrets)
        │   ├── youtube.js          ← Search → video details → commentThreads (2hr cache; buildSearchQuery)
        │   ├── tripadvisor.js      ← SerpAPI Google engine, site:tripadvisor.com (24hr; empty for product/business)
        │   ├── facebook.js         ← SerpAPI Google engine, site:facebook.com (24hr; buildSearchQuery)
        │   └── trustpilot.js       ← SerpAPI Google engine, site:trustpilot.com (24hr; empty for restaurant)
        └── utils/
            ├── cors.js             ← corsHeaders, handleOptions(), addCorsHeaders()
            ├── cache.js            ← Cloudflare Cache API wrapper with TTL
            ├── rateLimit.js        ← checkRateLimit() — native RATE_LIMITER binding, per-IP, fail-open
            ├── relevanceFilter.js  ← filterReviewsForCategory() — strips store/service reviews for products
            └── errors.js           ← errorResponse() helper
```

---

## Known Issues

- **Reddit**: Now `integrated: true` + `defaultEnabled: true`, so it's queried on every search. Credential status unverified — if `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` aren't set (check `wrangler secret list`), the call fails silently every search (card hidden). Set them or flip the platform back to coming-soon to stop the wasted request.
- **Trustpilot**: Migrated to SerpAPI (Google engine, `site:trustpilot.com`). Working. Gated to product/place/business — returns empty for restaurant. Old `v2` HTML-scrape cache keys are bypassed (now `v3:`).
- **Yelp reviews**: Hard-limited to 3 reviews, 160 chars each by Yelp's API. Reviews endpoint sometimes returns 4xx for non-partner keys. Card shows a note explaining this.
- **SerpAPI budget**: 100 searches/month shared between **TripAdvisor + Facebook + Trustpilot** (3 routes, all default-on). A single non-restaurant search can fire 3 calls — monitor at serpapi.com/dashboard. 24hr caching reduces burn rate.
- **YouTube quota**: ~71 full queries/day at free tier. 2hr caching. Avoid busting cache during dev.
- **Google textsearch**: Switched from `findplacefromtext` to `textsearch` — handles brand/chain names much better.
- **Lock file**: `package-lock.json` generated on Windows omits Linux-specific optional deps from native packages. CI uses `npm install` (not `npm ci`) to work around this.
- **Zomato**: API deprecated 2020, website JS-rendered. Shown as coming-soon chip only.
- **China platforms**: All 7 shown as coming-soon — require Chinese developer accounts/business registration.

---

## How to Resume a Session

1. Read this file completely
2. Run `git log --oneline -10` to see recent commits
3. Run `npm test` to confirm 34 tests still pass
4. Run `npm run dev` to start the frontend locally (http://localhost:5173/hearsay/)
5. Run `cd workers && npx wrangler secret list` to verify Worker secrets
6. Check live site: https://parisa-singh.github.io/hearsay
