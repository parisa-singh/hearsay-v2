import { getCached, setCached } from '../utils/cache.js'
import { errorResponse } from '../utils/errors.js'
import { filterReviewsForCategory } from '../utils/relevanceFilter.js'
import { extractRating, extractReviewCount } from '../utils/serpapiRating.js'

const SERPAPI_BASE = 'https://serpapi.com/search'
const CACHE_TTL = 24 * 3600

// Vendors/retailers only carry product reviews. Restaurant/place/business
// searches never hit this route (the frontend gates by category), but guard
// here too so a stray call returns empty instead of wasting a SerpAPI search.
const ALLOWED_CATEGORIES = new Set(['product', 'electronics'])

// Only known retailer domains are allowed — `site` comes from the client, and
// this stops the shared SerpAPI budget being pointed at an arbitrary site.
const ALLOWED_SITES = new Set([
  'amazon.com',
  'walmart.com',
  'target.com',
  'ebay.com',
  'etsy.com',
  'aliexpress.com',
  'bestbuy.com',
  'newegg.com',
  'apple.com',
  'samsung.com',
])

function parseRatingFromSnippet(text) {
  if (!text) return null
  const outOf = text.match(/(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*5/i)
  if (outOf) return parseFloat(outOf[1])
  const stars = text.match(/(\d+(?:\.\d+)?)\s*stars?/i)
  if (stars) return parseFloat(stars[1])
  const rated = text.match(/rating:?\s*(\d+(?:\.\d+)?)/i)
  if (rated) return parseFloat(rated[1])
  return null
}

export async function vendorHandler(request, env) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const category = searchParams.get('category')
  const site = searchParams.get('site')
  const nocache = searchParams.get('nocache') === '1'

  if (!query) return errorResponse('Missing query parameter', 400)
  if (!site) return errorResponse('Missing site parameter', 400)

  const empty = { platform: site, name: query, rating: null, reviewCount: null, reviews: [] }

  if (!ALLOWED_CATEGORIES.has(category)) return Response.json(empty)
  if (!ALLOWED_SITES.has(site)) return Response.json(empty)

  const searchQuery = `${query} review`
  const cacheKey = `vendor:v1:${site}:${searchQuery}`
  const cached = await getCached(cacheKey, nocache)
  if (cached) return Response.json(cached)

  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: `${searchQuery} site:${site}`,
      api_key: env.SERPAPI_KEY,
      num: '6',
    })
    const res = await fetch(`${SERPAPI_BASE}?${params}`)
    const data = await res.json()

    if (data.error) throw new Error(data.error)

    const results = (data.organic_results ?? []).filter(r => r.link?.includes(site))

    const reviews = filterReviewsForCategory(
      results.slice(0, 4).map(r => ({
        text: r.snippet ?? r.title ?? '',
        rating: extractRating(r, parseRatingFromSnippet),
        author: null,
        date: null,
        url: r.link ?? null,
      })),
      category === 'electronics' ? 'product' : category
    )

    const ratingResult = results.find(r => extractRating(r, parseRatingFromSnippet) !== null)
    const rating = ratingResult ? extractRating(ratingResult, parseRatingFromSnippet) : null
    const reviewCount = ratingResult ? extractReviewCount(ratingResult) : null

    const response = {
      platform: site,
      name: query,
      rating,
      reviewCount,
      sourceUrl: results[0]?.link ?? null,
      reviews,
    }

    await setCached(cacheKey, response, CACHE_TTL)
    return Response.json(response)
  } catch (err) {
    return errorResponse(`Vendor (${site}) error: ${err.message}`)
  }
}
