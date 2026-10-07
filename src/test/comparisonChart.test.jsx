import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import React from 'react'

// Recharts' ResponsiveContainer measures its parent; in jsdom that is 0x0,
// so the chart never paints. Mock it to a fixed box and inject width/height
// into the child chart so the SVG actually renders under test.
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

describe('ComparisonChart', () => {
  it('renders nothing when fewer than 2 platforms have a rating', () => {
    const { container } = render(
      <ComparisonChart results={[rated('google', 'Google', '#4285F4', 4.5)]} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('ignores rows with null rating or isError when counting', () => {
    const { container } = render(
      <ComparisonChart
        results={[
          rated('google', 'Google', '#4285F4', 4.5),
          { platform: { id: 'yelp', displayName: 'Yelp', brandColor: '#f00' }, data: { rating: null }, isError: false },
          { platform: { id: 'reddit', displayName: 'Reddit', brandColor: '#f50' }, data: { rating: 3.0 }, isError: true },
        ]}
      />
    )
    // Only Google qualifies -> under the 2-platform threshold -> nothing.
    expect(container).toBeEmptyDOMElement()
  })

  it('CHARACTERIZATION: with >=2 rated platforms the chart is COLLAPSED by default', () => {
    render(
      <ComparisonChart
        results={[
          rated('google', 'Google', '#4285F4', 4.5),
          rated('yelp', 'Yelp', '#FF1A1A', 3.0),
        ]}
      />
    )
    // Header toggle is present...
    expect(screen.getByText('Platform Comparison')).toBeInTheDocument()
    // ...but the comparison body (bar rows / rating values) is NOT rendered until clicked.
    expect(screen.queryByText('4.5')).not.toBeInTheDocument()
    expect(screen.queryByText('3.0')).not.toBeInTheDocument()
  })

  it('shows per-platform bars with correct values once expanded', () => {
    render(
      <ComparisonChart
        results={[
          rated('google', 'Google', '#4285F4', 4.5),
          rated('yelp', 'Yelp', '#FF1A1A', 3.0),
        ]}
      />
    )
    fireEvent.click(screen.getByText('Platform Comparison'))
    // Bar-comparison rows render the numeric values and names.
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('3.0')).toBeInTheDocument()
    expect(screen.getAllByText('Google').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Yelp').length).toBeGreaterThan(0)
  })

  it('CHARACTERIZATION: radar renders one <Radar> surface PER platform, all bound to the same "rating" key (redundant overlay, not a true multi-series comparison)', () => {
    const { container } = render(
      <ComparisonChart
        results={[
          rated('google', 'Google', '#4285F4', 4.5),
          rated('yelp', 'Yelp', '#FF1A1A', 3.0),
          rated('reddit', 'Reddit', '#FF4500', 2.0),
        ]}
      />
    )
    fireEvent.click(screen.getByText('Platform Comparison'))
    // Recharts renders each <Radar> as a .recharts-radar group. With the current
    // code there is one per platform even though all share dataKey="rating",
    // so every polygon traces the SAME 3 points — documenting the overlay bug.
    const radars = container.querySelectorAll('.recharts-radar')
    expect(radars.length).toBe(3)
  })
})
