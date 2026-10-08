import { useQueries } from '@tanstack/react-query'
import { fetchPlatform } from '../utils/api'
import { queryKeys } from '../constants/queryKeys'
import { useUIStore } from '../store/uiStore'
import { PLATFORMS } from '../constants/platforms'

export function useAllPlatforms(query, category = null, refreshCount = 0) {
  const { isPlatformEnabled, location } = useUIStore()

  const enabledPlatforms = PLATFORMS.filter(
    p => p.integrated && p.working !== false && isPlatformEnabled(p.id)
  )

  const locationParams = location
    ? { lat: location.lat, lng: location.lng, city: location.city, country: location.country }
    : {}

  const extraParams = refreshCount > 0 ? { nocache: '1' } : {}

  const queries = useQueries({
    queries: enabledPlatforms.map(platform => ({
      queryKey: queryKeys.platform(platform.id, query, location, category, refreshCount),
      queryFn: () => fetchPlatform(platform.endpoint, { query, category, ...locationParams, ...extraParams }),
      enabled: Boolean(query),
      staleTime: 5 * 60 * 1000,
      retry: 0,
    })),
  })

  const results = enabledPlatforms.map((platform, i) => ({
    platform,
    data: queries[i]?.data ?? null,
    isLoading: queries[i]?.isLoading ?? false,
    isError: queries[i]?.isError ?? false,
    error: queries[i]?.error ?? null,
  }))

  const isAnyLoading = results.some(r => r.isLoading)
  const successfulResults = results.filter(r => r.data && !r.isError)

  return { results, isAnyLoading, successfulResults }
}
