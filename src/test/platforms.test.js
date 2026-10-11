import { describe, it, expect } from 'vitest'
import { PLATFORMS, PLATFORM_MAP } from '../constants/platforms'

const integrated = PLATFORMS.filter(p => p.integrated)
const comingSoon = PLATFORMS.filter(p => !p.integrated)
const coreIntegrated = integrated.filter(p => !p.vendor)
const vendors = PLATFORMS.filter(p => p.vendor)

describe('PLATFORMS constant', () => {
  it('has 7 core (non-vendor) integrated platforms', () => {
    expect(coreIntegrated).toHaveLength(7)
  })

  it('all vendor platforms are integrated and share the vendor endpoint with a site', () => {
    expect(vendors.length).toBeGreaterThan(0)
    vendors.forEach(p => {
      expect(p.integrated, `${p.id} should be integrated`).toBe(true)
      expect(p.endpoint, `${p.id} should use the vendor endpoint`).toBe('vendor')
      expect(p.site, `${p.id} should have a site`).toBeTruthy()
    })
  })

  it('all integrated platforms have defaultEnabled: true', () => {
    integrated.forEach(p => {
      expect(p.defaultEnabled, `${p.id} should be defaultEnabled`).toBe(true)
    })
  })

  it('all integrated platforms have an endpoint', () => {
    integrated.forEach(p => {
      expect(p.endpoint, `${p.id} should have an endpoint`).toBeTruthy()
    })
  })

  it('no coming-soon platform has an endpoint', () => {
    comingSoon.forEach(p => {
      expect(p.endpoint, `${p.id} should not have an endpoint`).toBeUndefined()
    })
  })

  it('all platforms have required fields', () => {
    PLATFORMS.forEach(p => {
      expect(p.id).toBeTruthy()
      expect(p.displayName).toBeTruthy()
      expect(p.logo).toBeTruthy()
      expect(p.brandColor).toBeTruthy()
      expect(typeof p.integrated).toBe('boolean')
    })
  })

  it('integrated platforms include google, yelp, reddit, youtube, tripadvisor, facebook, trustpilot', () => {
    const ids = integrated.map(p => p.id)
    expect(ids).toContain('google')
    expect(ids).toContain('yelp')
    expect(ids).toContain('reddit')
    expect(ids).toContain('youtube')
    expect(ids).toContain('tripadvisor')
    expect(ids).toContain('facebook')
    expect(ids).toContain('trustpilot')
  })

  it('PLATFORM_MAP contains all platform ids', () => {
    PLATFORMS.forEach(p => {
      expect(PLATFORM_MAP[p.id]).toBeDefined()
      expect(PLATFORM_MAP[p.id].id).toBe(p.id)
    })
  })
})
