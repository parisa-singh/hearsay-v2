import { getCached, setCached } from '../utils/cache.js'
import { errorResponse } from '../utils/errors.js'
import { extractRating, extractReviewCount } from '../utils/serpapiRating.js'

const SERPAPI_BASE = 'https://serpapi.com/search'
const CACHE_TTL = 24 * 3600 // 24hr — SerpAPI budget is tight

export async function tripadvisorHandler(request, env) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const city = searchParams.get('city')
  const category = searchParams.get('category')
  const nocache = searchParams.get('nocache') === '1'

  if (!query) return errorResponse('Missing query parameter', 400)

  if (category === 'product' || category === 'business') {
    return Response.json({ platform: 'tripadvisor', reviews: [], reviewCount: null, rating: null })
  }

  const searchQuery = city ? `${query} ${city}` : query
  const cacheKey = `tripadvisor:${searchQuery}`
  const cached = await getCached(cacheKey, nocache)
  if (cached) return Response.json(cached)

  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: `${searchQuery} site:tripadvisor.com reviews`,
      api_key: env.SERPAPI_KEY,
      num: '5',
    })
    const res = await fetch(`${SERPAPI_BASE}?${params}`)
    const data = await res.json()

    if (data.error) throw new Error(data.error)

    const results = data.organic_results ?? []

    const reviews = results.slice(0, 4).map(r => ({
      text: r.snippet ?? r.title ?? '',
      rating: extractRating(r, parseRatingFromSnippet),
      author: null,
      date: null,
      url: r.link ?? null,
    }))

    // Prefer SerpAPI's structured rich-snippet rating; fall back to prose parse.
    const ratingResult = results.find(r => extractRating(r, parseRatingFromSnippet) !== null)
    const rating = ratingResult ? extractRating(ratingResult, parseRatingFromSnippet) : null
    const reviewCount = ratingResult ? extractReviewCount(ratingResult) : null

    const response = {
      platform: 'tripadvisor',
      name: query,
      rating,
      reviewCount,
      reviews,
    }

    await setCached(cacheKey, response, CACHE_TTL)
    return Response.json(response)
  } catch (err) {
    return errorResponse(`TripAdvisor error: ${err.message}`)
  }
}

function parseRatingFromSnippet(text) {
  if (!text) return null
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*5/i)
  if (match) return parseFloat(match[1])
  const starMatch = text.match(/(\d+(?:\.\d+)?)\s*stars?/i)
  if (starMatch) return parseFloat(starMatch[1])
  return null
}
