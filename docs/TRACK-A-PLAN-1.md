# Track A — Fix the Graph (Plan 1)

_As of 2026-10-06 · Parisa Singh_

Parent plan: [`docs/PLAN.md`](./PLAN.md) · Status: **implemented, tests green, not yet committed**

---

## Objective

Make the cross-platform comparison **appear reliably** and **read clearly** at any platform
count ≥ 2. This was the "the graph isn't actually showing up" bug.

---

## Root cause (recap)

Three compounding causes, confirmed by a characterization test + a Worker route audit:

1. **Data starvation** — only Google & Yelp reliably return a numeric `rating`; TripAdvisor/Trustpilot
   are best-effort; Facebook/Reddit/YouTube are always `null`. The chart gates on `≥ 2` numeric
   ratings, so many searches (especially products) never qualified.
2. **Collapsed by default** — `open` started `false`; the body was hidden until clicked.
3. **Degenerate + redundant radar** — with the common 2 platforms a radar is a 2-axis sliver that
   looks empty, and the code rendered one `<Radar>` per platform all bound to the same `rating`
   key (identical polygons overlaid, not a real comparison).

Plan 1 fixes causes **2 and 3** directly and softens **1** with an honest low-coverage note.
Cause 1's deeper fix (more platforms contributing a score) is Track B + an Open decision.

---

## Changes made

### 1. `src/components/results/ComparisonChart.jsx` (rewritten)

| Before | After |
| --- | --- |
| `open` defaults to `false` (collapsed) | `open` defaults to `true` (expanded) |
| Radar is the primary visual, always rendered | **Bar comparison is primary**, always rendered |
| One `<Radar>` per platform, all `dataKey="rating"` (identical overlay) | **One** `<Radar>` series total; rendered **only when ≥ 3 platforms** |
| Radar shown even at 2 platforms (degenerate sliver) | At 2 platforms: **bars only**, no radar |
| Per-platform brand colors on radar (meaningless for one shape) | Single accent color (`#34d399`) on radar; brand colors stay on the bars |

Behavior:
- Returns `null` when `< 2` platforms have a non-null, non-error rating (unchanged guard).
- Bars are sorted highest-rating first.
- Radar is secondary, below the bars, separated by a divider, only at ≥ 3 ratings.
- Collapse toggle retained (users can still hide it).

### 2. `src/pages/ResultsPage.jsx` (honest low-coverage note)

Added a small note shown when results exist but fewer than 2 have numeric ratings:

> "Only N platform(s) returned a numeric rating — at least 2 are needed to show the comparison.
> The reviews below still apply."

This removes the silent "nothing renders" confusion that made the graph feel broken.

### 3. `src/test/comparisonChart.test.jsx` (flipped to assert fixed behavior)

Previously these were *characterization* tests documenting the bug. Now they assert the fix.

---

## Decisions

- **Bars, not radar, as the default comparison.** Bars are correct and legible for any count ≥ 2,
  including the common 2-platform case. The radar is kept only as a secondary "shape" view when it
  actually reads as one (≥ 3 axes).
- **Single radar series.** A radar comparing platforms is one polygon across platform-axes, so it is
  one `<Radar>`, one color. Per-platform color belongs on the bars.
- **Expanded by default.** The comparison is the point of the results page.
- **Deferred:** whether rating-less platforms (Reddit/YouTube/Facebook) should appear in the
  comparison as "mentions, no score" or get an algorithmic score. This is Open decision #2 in
  `PLAN.md` and would further address data starvation. Not in Plan 1.

---

## Tests

`src/test/comparisonChart.test.jsx` — 7 tests, all passing:

1. renders nothing with < 2 rated platforms
2. ignores rows with `null` rating or `isError`
3. **expanded by default** — bar values visible with no click
4. collapses when the header is clicked
5. bars sorted highest-first with correct values
6. **no radar at exactly 2 platforms** (bars only)
7. **single radar series at ≥ 3 platforms** (no per-platform overlay)

Full suite: **41 tests passing** (34 prior + 7 here). Production build: clean.

Run: `npx vitest run --pool=forks` (the `--pool=forks` works around a cold-start
threads-pool timeout in the OneDrive folder; making it the default is a Foundation item).

---

## How to verify visually

1. `npm run dev` → http://localhost:5173/hearsay-v2/
2. Search a well-known restaurant (e.g. a chain) with the **Restaurant** category — Google + Yelp
   should both return ratings → the **Platform Comparison** shows expanded, bars visible immediately.
3. A query that returns ≥ 3 ratings additionally shows the single radar below the bars.
4. A product search (few/no numeric ratings) shows the low-coverage note instead of a blank gap.

---

## Status & follow-ups

- [x] Rewrite `ComparisonChart.jsx` (bars primary, single radar ≥ 3, expanded by default)
- [x] Add honest low-coverage note to `ResultsPage.jsx`
- [x] Flip tests to assert fixed behavior (7 passing)
- [x] Full suite (41) + build verified
- [x] Commit + push to `hearsay-v2` (commit `4467ef7`, deployed live)
- [ ] Follow-up (Track B / Open decision #2): raise rating coverage so more searches clear the
      ≥ 2 bar — the remaining part of data starvation

---

## Update (2026-10-06): the graph still didn't show — it's the data layer

After the UI fix deployed, a live search ("nobu", restaurant) still showed no graph. Testing the
shared Worker directly revealed only **1** platform returns a numeric rating, so the ≥2 gate can't trip:

| Platform | Live result for "nobu" | Why |
| --- | --- | --- |
| Google | rating 4.3 ✓ | working |
| Yelp | HTTP 500 `TRIAL_EXPIRED` | Yelp Fusion API trial expired (billing — affects v1 too) |
| TripAdvisor | rating `null` | route only regex-parsed prose snippets (no number in them) |
| Trustpilot | rating `null` | same; also restaurant-gated |
| Reddit | error (HTML, not JSON) | OAuth creds failing — erroring every search |
| YouTube / Facebook | `null` | no star signal (expected) |

So the "no graph" was **data starvation**, acute because Yelp (the reliable 2nd rating) is down.

### Decisions on this round

- **SerpAPI structured ratings (implemented).** TripAdvisor + Trustpilot now read SerpAPI's
  structured rich-snippet rating (`detected_extensions.rating` / top-level `rating`) via a new shared
  helper `workers/src/utils/serpapiRating.js`, falling back to the old prose regex. This recovers a
  *real* aggregate rating for many queries — a legitimate 2nd/3rd source. (Not every query has one.)
- **No fabricated 1–5 for comment-only platforms.** Reddit/YouTube/Facebook have no star signal
  (YouTube hides dislikes; Facebook deprecated page star ratings; Reddit upvotes measure popularity,
  not quality). The only way to a number is sentiment NLP = the AI-synthesis layer Hearsay avoids, and
  it would mislead by sitting a made-up score next to Google's real one. They stay "mentions, no score".
- **Sentiment lean (planned next — Parisa's idea).** Instead of a fake number, show a coarse,
  honestly-labeled **review lean** (Positive / Mixed / Negative) for comment-only platforms, computed
  algorithmically with a keyword/lexicon pass (no LLM), rendered as a small diverging bar. Kept
  separate from star ratings and **excluded from divergence**. See "Next increment" below.
- **Backend changes go to a separate v2 Worker first** (Parisa's choice), so v1 is untouched.
  `workers/wrangler.toml` renamed `hearsay-api` → `hearsay-v2-api` (rate-limiter namespace → 2001).

### To bring the v2 Worker online (interactive — needs Parisa)

The backend code is committed but **not deployed** (needs Cloudflare auth + the secret values, which
can't be read back from v1's Worker). Steps, run in this session with the `!` prefix:

1. `! cd workers && npx wrangler login` (opens browser auth)
2. `! cd workers && npx wrangler deploy` → creates `hearsay-v2-api`, prints its URL
3. Set secrets on the new Worker (each is interactive):
   `! cd workers && npx wrangler secret put GOOGLE_API_KEY` (repeat for `SERPAPI_KEY`, `YOUTUBE_API_KEY`,
   `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`; `YELP_API_KEY` only once renewed)
4. Point v2 at the new Worker: update `VITE_API_BASE_URL` (repo secret + `.env.local`) to
   `https://hearsay-v2-api.parisa-singh.workers.dev`, then redeploy the frontend.

### Next increment (Track A — Plan 2)

- Add the algorithmic **review-lean** signal in the Worker (`lean: 'positive'|'mixed'|'negative'` +
  counts) for comment-only platforms, and a small diverging-bar visual in `ComparisonChart` /
  `PlatformCard`, clearly labeled and separate from star ratings.
