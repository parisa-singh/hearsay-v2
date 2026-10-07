import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'

// Recharts' ResponsiveContainer measures its parent; in jsdom that is 0x0,
// so the chart never paints. Mock it to inject a fixed size into the child
// chart so the SVG actually renders under test.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    ResponsiveContainer: ({ children }) =>
      React.cloneElement(children, { width: 400, height: 300 }),
  }
})

import ComparisonChart from '../components/results/ComparisonChart'

afterEach(cleanup)

function rated(id, displayName, brandColor, rating) {
  return { platform: { id, displayName, brandColor }, data: { rating }, isError: false }
}

const google = rated('google', 'Google', '#4285F4', 4.5)
const yelp = rated('yelp', 'Yelp', '#FF1A1A', 3.0)
const reddit = rated('reddit', 'Reddit', '#FF4500', 2.0)

describe('ComparisonChart', () => {
  it('renders nothing when fewer than 2 platforms have a rating', () => {
    const { container } = render(<ComparisonChart results={[google]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('ignores rows with null rating or isError when counting', () => {
    const { container } = render(
      <ComparisonChart
        results={[
          google,
          { platform: { id: 'yelp', displayName: 'Yelp', brandColor: '#f00' }, data: { rating: null }, isError: false },
          { platform: { id: 'reddit', displayName: 'Reddit', brandColor: '#f50' }, data: { rating: 3.0 }, isError: true },
        ]}
      />
    )
    // Only Google qualifies -> under the 2-platform threshold -> nothing.
    expect(container).toBeEmptyDOMElement()
  })

  it('is EXPANDED by default: bar values are visible without a click', () => {
    render(<ComparisonChart results={[google, yelp]} />)
    expect(screen.getByText('Platform Comparison')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('3.0')).toBeInTheDocument()
  })

  it('collapses when the header is clicked', () => {
    render(<ComparisonChart results={[google, yelp]} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Platform Comparison'))
    expect(screen.queryByText('4.5')).not.toBeInTheDocument()
  })

  it('shows bars sorted highest-first with correct values', () => {
    render(<ComparisonChart results={[yelp, google]} />)
    const values = screen.getAllByText(/^[0-9]\.[0-9]$/).map(el => el.textContent)
    expect(values).toEqual(['4.5', '3.0']) // Google (4.5) before Yelp (3.0)
  })

  it('does NOT render a radar with exactly 2 platforms (bars only, no degenerate sliver)', () => {
    const { container } = render(<ComparisonChart results={[google, yelp]} />)
    expect(container.querySelectorAll('.recharts-radar').length).toBe(0)
  })

  it('renders a SINGLE radar series at >=3 platforms (no per-platform overlay)', () => {
    const { container } = render(<ComparisonChart results={[google, yelp, reddit]} />)
    // One <Radar> -> one .recharts-radar group, regardless of platform count.
    expect(container.querySelectorAll('.recharts-radar').length).toBe(1)
    // All three still appear as bars.
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('3.0')).toBeInTheDocument()
    expect(screen.getByText('2.0')).toBeInTheDocument()
  })
})
