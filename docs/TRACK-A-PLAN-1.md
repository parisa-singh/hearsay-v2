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
- [ ] Commit + push to `hearsay-v2` (awaiting go-ahead)
- [ ] Follow-up (Track B / Open decision #2): raise rating coverage so more searches clear the
      ≥ 2 bar — the remaining part of data starvation
