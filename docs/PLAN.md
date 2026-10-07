# Hearsay v2 — Improvement Plan

_As of 2026-10-06 · Parisa Singh_

Companion doc: https://claude.ai/code/artifact/2294d720-191f-4500-85af-6ce383cb6f75

---

## Goals & scope

v2 keeps v1's premise — real reviews from many platforms, side by side, with divergence computed algorithmically and **no AI synthesis** — and fixes the three weaknesses the LinkedIn-tested version exposed. Work is organized as outcome tracks plus a foundation pass.

- **Track A — Graph:** the cross-platform comparison rarely renders; make it appear reliably and read clearly.
- **Track B — Relevance:** platform choice ignores what you're searching for. Make platforms follow category and sub-category (you'd check Best Buy for electronics, never for restaurants), add more categories, and move category selection into a menu instead of pills bubbled on top.
- **Track C — Redesign:** the UI feels cluttered; a visual/density pass to declutter.
- **Track D — Analytics:** see visitors, real usage, and time on site; turn on v2's own GA4 and instrument the key events.
- **Foundation:** v2-specific cleanup that unblocks the above (base-path logo bug, separate v2 Worker, CI, test coverage).

Standing constraints carried from v1: JavaScript (not TypeScript); scoring/divergence stays algorithmic; and v2 currently **shares v1's Cloudflare Worker**, so any backend change affects live v1 until we split it (see Foundation).

---

## Diagnosis: why the graph doesn't show up

Three compounding causes, confirmed by a new characterization test (`src/test/comparisonChart.test.jsx`, 5 passing) and a Worker route audit — not guesses.

1. **Data starvation (the main cause).** The chart renders only when at least 2 platforms return a *numeric* rating. The audit shows how few do:

| Platform | Numeric rating? |
| --- | --- |
| Google | Yes |
| Yelp | Yes |
| TripAdvisor | Best-effort snippet parse (often null) |
| Trustpilot | Best-effort snippet parse (often null); empty for restaurants |
| Facebook | Always null |
| Reddit | Always null (no stars) |
| YouTube | Always null |

   So **product** searches (Google/Yelp/TripAdvisor are category-gated to empty) usually yield 0–1 ratings, so the chart never appears. Other searches usually scrape by at exactly Google + Yelp.
2. **Collapsed by default.** `open` starts `false`, so even when it qualifies you see only a "Platform Comparison" header until you click (test: the values `4.5` / `3.0` are absent until the click).
3. **Degenerate + redundant radar.** With the common 2 platforms a radar is a 2-axis sliver that looks empty; and the code renders one `<Radar>` per platform all bound to the same `rating` key, overlaying the identical polygon N times instead of comparing series (test: 3 platforms → 3 identical radar surfaces).

---

## Track A — Fix the graph

Make a comparison always visible whenever ≥2 platforms have ratings, and make it read correctly at any count. Small, self-contained, shippable first.

- **Bars as the primary visual.** The horizontal bar comparison is correct and legible for any count ≥ 2 (including the common 2). Promote it; it becomes the default view.
- **Radar only when it earns its place.** Render the radar only at ≥ 3 rated platforms, as a *single* `<Radar>` series across platform axes — remove the one-per-platform overlay.
- **Expand by default.** Start open (or show a one-line preview), so it's visible without a click.
- **Honest empty/low states.** When fewer than 2 platforms have scores, show a short "not enough rated platforms to compare" note instead of silently rendering nothing.
- **Decide rating-less platforms** (Reddit/YouTube/Facebook): either list them as "mentions, no score" or give them an algorithmic score — see Open decisions. Must stay algorithmic (no AI synthesis).

**Tests:** flip the characterization tests to assert the fixed behavior (visible-by-default, single radar ≥ 3, bars at 2), keeping them green.

---

## Track B — Category-aware platform relevance

Platforms should follow what you're actually searching for, not appear as a fixed set of 7. Today there are 4 categories as pills, and category only gates each route on/off. The target: a richer category/sub-category taxonomy that *selects and ranks* the platforms that make sense, surfaced through a menu.

- **Category taxonomy with sub-categories.** Expand the 4 flat categories into a two-level taxonomy, e.g. Product → Electronics / Appliances / Beauty / Home; Food & Drink → Restaurant / Café / Bar; Place → Hotel / Attraction; Services → Home services / Professional. (Exact list is an Open decision.)
- **Category → platform relevance map.** A single source of truth mapping each (category, sub-category) to the platforms worth querying and their rank. Electronics surfaces retailer/tech-review sources; restaurants surface Google/Yelp/TripAdvisor; you never query restaurants on a tech retailer. This replaces "all 7, always."
- **Menu instead of pills.** Replace the 2×2 pill grid in `SearchBar.jsx` with a category menu (dropdown / command-style picker) that scales to sub-categories without cluttering the hero.
- **Query shaping stays per-route** (`buildSearchQuery` already shapes by category); extend it to use sub-category.
- **New platforms are phased and optional.** Realizing retailer-specific coverage (e.g. a Best Buy-type electronics source) needs new APIs or SerpAPI queries and touches the shared budget — treat as follow-on, after the taxonomy + relevance map exist. Foursquare remains the cheapest near-term add (see v1 priorities).
- **Stays algorithmic** — relevance is a static map + ranking, no model inference.

This track also feeds Track A: better platform/category matching means more searches clear the ≥2-rating bar.

---

## Track C — Redesign to declutter

The results page competes for attention: search bar, title, refresh, share, divergence alert, comparison chart, media card, and the platform grid all stack at once. Goal is a clear visual hierarchy and less simultaneous noise — best done after A and B settle the structure.

- **Results hierarchy.** Lead with the answer (divergence + comparison), then reviews. Demote secondary controls (share, refresh, sort/filter) into a compact toolbar rather than inline buttons.
- **Calmer platform grid.** Consistent card chrome, tighter spacing, and clear grouping; let cards breathe without the page feeling long.
- **Home declutter.** Pair the new category menu (Track B) with a simpler hero; move platform/region chips so they inform rather than crowd.
- **Design-system pass.** One spacing scale, type scale, and color token set so pages feel consistent; keep the existing dark aesthetic.
- **Mobile first.** Verify the denser layout holds from phone width up (v1 had a responsive pass; re-check after changes).

No new frameworks — Tailwind + existing components; this is composition and polish, not a rewrite.

---

## Track D — Analytics & engagement

See who visits, who actually uses the site, and how long they stay. v1 already wires GA4 (page views + a custom `search` event); v2 has GA4 intentionally unset so its traffic doesn't mix into v1. This track turns v2's analytics on with its own property and instruments the three signals you asked for.

- **Turn on GA4 for v2** with a dedicated data stream / measurement ID (`VITE_GA_MEASUREMENT_ID` as repo secret + `.env.local`), kept separate from v1.
- **Visitors — how many came.** GA4 Users / New users and sessions (captured automatically once GA4 is on).
- **Real usage — how many engage.** GA4 engaged sessions plus the custom `search` event (a search is the true "used it" signal). Add a few events: platform toggle, opening the comparison graph, clicking through to a review source.
- **Time on site — how long.** GA4 average engagement time per session / per user.
- **Seeing it.** Default to the GA4 dashboard (zero build); optionally a small in-app/admin metrics view later if you want the numbers inside Hearsay (Open decision).

Privacy: GA4 only, env-gated (unset = no tracking), same as v1.

---

## Foundation & cleanup

v2-specific groundwork that unblocks the tracks. Small, do early.

- **Base-path logo bug.** `platforms.js` hardcodes `logo: '/hearsay/logos/…'`; in v2 the base is `/hearsay-v2/`, so these only load by accidentally hitting v1's deployment. Make logo paths base-relative (via `import.meta.env.BASE_URL` or Vite asset imports).
- **Separate v2 Worker.** Stand up `hearsay-v2-api` so Track B's route/query changes don't redeploy onto live v1. Re-run `wrangler secret put` for the new Worker; point v2's `VITE_API_BASE_URL` at it. (Note: SerpAPI/YouTube quotas stay shared at the API-key level unless new keys are issued.)
- **CI Node bump.** `deploy.yml` uses Node 20 (GitHub is forcing it onto Node 24 and warning); bump `node-version` to `24`.
- **Test runner default.** Default `npm test` (vitest threads pool) times out cold in the OneDrive folder; set `pool: 'forks'` in `vite.config.js` test config so `npm test` is reliable (currently needs `--pool=forks`).
- **Test coverage.** Add tests for the category→platform relevance map, the SearchBar menu, and the fixed chart behavior.

---

## Phasing & sequence

Proposed order — reorder freely. Each phase is independently shippable.

1. **Foundation quick wins** — logo base-path fix, CI Node 24, `pool: 'forks'` default, and **turn on v2 GA4** (Track D basics: visitors + time on site, zero build). Low risk, unblocks the rest.
2. **Track A — graph fix** — fast, visible win; mostly `ComparisonChart.jsx` + `ResultsPage.jsx` gate, no backend.
3. **Separate v2 Worker** — do before any backend change so Track B can't disturb live v1.
4. **Track B — taxonomy + menu + relevance map (frontend)** — taxonomy, category menu, and the category→platform map; then extend per-route query shaping by sub-category.
5. **Track B follow-on — new platforms** — retailer/electronics sources (API or SerpAPI); gated on access + budget.
6. **Track C — redesign** — after A + B settle structure, do the density/visual pass.
7. **Track D — instrumentation** — add custom events (toggle, graph-open, source-click) and an optional in-app metrics view; can land any time after GA4 is on.

Dependencies: 3 gates 4/5; A benefits from B (more searches clear the ≥2-rating bar); C is best last so it isn't redone as structure changes.

---

## Open decisions

Answers here let me lock scope and start Phase 1. None block the Foundation + Track A work.

1. **Category taxonomy** — which categories and sub-categories do you want? I can propose a starter set (Food & Drink, Product, Place, Services, Media) with sub-categories for you to edit.
2. **Rating-less platforms in the graph** — show Reddit/YouTube/Facebook as "mentions, no score," or derive an algorithmic score (e.g. from review counts/keywords, no AI)? Affects Track A's final shape.
3. **Separate v2 Worker** — stand it up now (Phase 3), or keep sharing v1's Worker until Track B actually needs backend changes?
4. **New retailer/electronics platforms** — worth pursuing API access (and some SerpAPI budget), or keep v2 to the current 7 + Foursquare for now?
5. **Redesign direction** — any reference apps, colors, or brand feel you want for Track C, or is "cleaner version of today's dark theme" the brief?
6. **Menu style** — simple dropdown, or a command-style searchable picker for categories/sub-categories?
7. **Analytics (Track D)** — dedicated v2 GA4 property (recommended) vs reuse v1's; and GA4 dashboard only, or also a small in-app metrics view?
