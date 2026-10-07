// Extract a real aggregate rating from a SerpAPI Google "organic_results" entry.
//
// SerpAPI surfaces a page's structured rich-snippet rating (e.g. TripAdvisor's
// bubble score, Trustpilot's TrustScore) in detected_extensions / a top-level
// `rating` field. The old routes ignored these and regex-parsed prose snippets,
// which usually fail. We prefer the structured value and keep the snippet parse
// as a last resort.

function detectedExtensions(result) {
  return (
    result?.rich_snippet?.top?.detected_extensions ??
    result?.rich_snippet?.bottom?.detected_extensions ??
    null
  )
}

// Returns a 0–5 number, or null. Values outside 0–5 are rejected rather than
// guessed at (we don't know the source scale), so we never show a bogus rating.
export function extractRating(result, snippetParser) {
  if (!result) return null

  const candidates = [result.rating, detectedExtensions(result)?.rating]
  for (const c of candidates) {
    if (typeof c === 'number' && !Number.isNaN(c) && c >= 0 && c <= 5) return c
  }

  if (typeof snippetParser === 'function') return snippetParser(result.snippet)
  return null
}

// Best-effort review count from the same structured fields.
export function extractReviewCount(result) {
  const ext = detectedExtensions(result)
  const candidates = [ext?.reviews, result?.reviews]
  for (const c of candidates) {
    if (typeof c === 'number' && !Number.isNaN(c) && c >= 0) return c
  }
  return null
}
