import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Landmarks } from './Landmarks'
import { buildLandmarkData, landmarkVariants, type LandmarkVariantKey } from './landmarksData'

function LandmarksHost() {
  const [variant, setVariant] = useState<LandmarkVariantKey>('search')

  return (
    <div>
      <button type="button" onClick={() => setVariant('form')}>Show form</button>
      <button type="button" onClick={() => setVariant('region')}>Show region</button>
      <Landmarks data={buildLandmarkData(variant, landmarkVariants[variant])} onEvent={() => undefined} />
    </div>
  )
}

describe('Landmarks input coverage', () => {
  it('renders form and region variants from pointer input', () => {
    render(<LandmarksHost />)

    expect(screen.getByRole('search', { name: 'Site' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Show form' }))
    expect(screen.getByRole('form', { name: 'Contact' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Show region' }))
    expect(screen.getByRole('region', { name: 'Status' })).toBeTruthy()
  })
})
