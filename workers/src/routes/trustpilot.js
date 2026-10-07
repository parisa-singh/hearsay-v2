import { getCached, setCached } from '../utils/cache.js'
import { errorResponse } from '../utils/errors.js'
import { filterReviewsForCategory } from '../utils/relevanceFilter.js'
import { extractRating, extractReviewCount } from '../utils/serpapiRating.js'

const SERPAPI_BASE = 'https://serpapi.com/search'
const CACHE_TTL = 24 * 3600

// Trustpilot covers online businesses, products, and services (and travel
// businesses/hotels under "place"). It has no meaningful data for individual
// restaurants, so that category is gated out — the inverse of TripAdvisor.
function buildSearchQuery(query, city, category) {
  switch (category) {
    case 'product':
      return `${query} review`
    case 'place':
      return city ? `${query} ${city}` : query
    case 'business':
      return `${query} review`
    default:
      return query
  }
}

export async function trustpilotHandler(request, env) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const city = searchParams.get('city')
  const category = searchParams.get('category')
  const nocache = searchParams.get('nocache') === '1'

  if (!query) return errorResponse('Missing query parameter', 400)

  if (category === 'restaurant') {
    return Response.json({ platform: 'trustpilot', reviews: [], reviewCount: null, rating: null })
  }

  const searchQuery = buildSearchQuery(query, city, category)
  // Versioned + category-scoped key: the response is filtered per category, so
  // category must be part of the key or cross-category requests collide.
  const cacheKey = `trustpilot:v3:${category ?? 'any'}:${searchQuery}`
  const cached = await getCached(cacheKey, nocache)
  if (cached) return Response.json(cached)

  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: `${searchQuery} site:trustpilot.com reviews`,
      api_key: env.SERPAPI_KEY,
      num: '5',
    })
    const res = await fetch(`${SERPAPI_BASE}?${params}`)
    const data = await res.json()

    if (data.error) throw new Error(data.error)

    const results = (data.organic_results ?? []).filter(r =>
      r.link?.includes('trustpilot.com')
    )

    const reviews = filterReviewsForCategory(
      results.slice(0, 4).map(r => ({
        text: r.snippet ?? r.title ?? '',
        rating: extractRating(r, parseRatingFromSnippet),
        author: null,
        date: null,
        url: r.link ?? null,
      })),
      category
    )

    // Prefer SerpAPI's structured TrustScore/rating; fall back to prose parse.
    const ratingResult = results.find(r => extractRating(r, parseRatingFromSnippet) !== null)
    const rating = ratingResult ? extractRating(ratingResult, parseRatingFromSnippet) : null
    const reviewCount = ratingResult ? extractReviewCount(ratingResult) : null

    const response = {
      platform: 'trustpilot',
      name: query,
      rating,
      reviewCount,
      sourceUrl: results[0]?.link ?? null,
      reviews,
    }

    await setCached(cacheKey, response, CACHE_TTL)
    return Response.json(response)
  } catch (err) {
    return errorResponse(`Trustpilot error: ${err.message}`)
  }
}

function parseRatingFromSnippet(text) {
  if (!text) return null
  const trustScore = text.match(/TrustScore\s+(\d+(?:\.\d+)?)/i)
  if (trustScore) return parseFloat(trustScore[1])
  const outOf = text.match(/(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*5/i)
  if (outOf) return parseFloat(outOf[1])
  const stars = text.match(/(\d+(?:\.\d+)?)\s*stars?/i)
  if (stars) return parseFloat(stars[1])
  return null
}
