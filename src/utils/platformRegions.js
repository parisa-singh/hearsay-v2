const EU = ['GB','IE','DE','FR','IT','ES','NL','SE','NO','DK','FI','AT','BE','CH','PL','PT','GR']
const US_CA = ['US', 'CA']
const SEA = ['TH', 'VN', 'SG', 'MY', 'ID', 'PH']
const MIDDLE_EAST = ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB']
const LATAM = ['BR', 'MX', 'CO', 'AR', 'PE', 'CL', 'EC']

export function getPlatformTiers(countryCode) {
  const code = countryCode?.toUpperCase() ?? null

  if (!code) {
    return { platforms: null }
  }

  if (US_CA.includes(code)) {
    return {
      platforms: ['google', 'yelp', 'tripadvisor', 'facebook', 'opentable', 'nextdoor', 'foursquare'],
    }
  }

  if (EU.includes(code)) {
    return {
      platforms: ['google', 'tripadvisor', 'thefork', 'facebook', 'yelp', 'michelin', 'foursquare'],
    }
  }

  if (code === 'CN') {
    return {
      platforms: ['dianping', 'meituan', 'baidumaps', 'gaode', 'xiaohongshu', 'tripadvisor', 'wechat'],
    }
  }

  if (code === 'IN') {
    return {
      platforms: ['google', 'tripadvisor', 'facebook', 'justdial', 'magicpin', 'zomato', 'swiggy'],
    }
  }

  if (MIDDLE_EAST.includes(code)) {
    return {
      platforms: ['google', 'tripadvisor', 'facebook', 'opentable', 'foursquare', 'zomato', 'talabat'],
    }
  }

  if (SEA.includes(code)) {
    return {
      platforms: ['google', 'tripadvisor', 'facebook', 'grabfood', 'agoda', 'wongnai', 'chope'],
    }
  }

  if (LATAM.includes(code)) {
    return {
      platforms: ['google', 'tripadvisor', 'facebook', 'thefork', 'foursquare', 'rappi', 'degusta'],
    }
  }

  // Default: everything else — show global integrated platforms
  return {
    platforms: ['google', 'yelp', 'youtube', 'trustpilot', 'reddit', 'tripadvisor', 'facebook'],
  }
}

// Category → relevant platforms. The same idea as getPlatformTiers, but keyed
// on what the user is searching for rather than where they are. When a category
// is selected it drives the Pull-from row (and which platforms are queried);
// vendor/retailer platforms only appear for product & electronics.
const CATEGORY_PLATFORMS = {
  restaurant:  ['google', 'yelp', 'tripadvisor', 'facebook', 'youtube', 'reddit'],
  place:       ['google', 'tripadvisor', 'yelp', 'facebook', 'trustpilot', 'youtube'],
  business:    ['google', 'trustpilot', 'yelp', 'facebook', 'youtube', 'reddit'],
  product:     ['amazon', 'walmart', 'target', 'ebay', 'etsy', 'aliexpress', 'trustpilot', 'youtube', 'reddit'],
  electronics: ['bestbuy', 'newegg', 'amazon', 'apple', 'samsung', 'trustpilot', 'youtube', 'reddit'],
}

// Returns the ordered platform-id list for a category, or null when the
// category is unknown (so callers fall back to the location/default tiers).
export function getCategoryPlatforms(category) {
  return CATEGORY_PLATFORMS[category] ?? null
}
