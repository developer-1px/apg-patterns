import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PatternDataSchema } from '../index'

function ValidationHost() {
  const [paths, setPaths] = useState<string[]>([])

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const result = PatternDataSchema.safeParse({
            items: {
              known: { label: 'Known' },
            },
            relations: {
              rootKeys: ['missing-root'],
              childrenByKey: { 'missing-parent': ['missing-child'] },
              ownerByKey: { 'missing-owned': 'missing-owner' },
              controlsByKey: { 'missing-controller': ['missing-controlled'] },
              rowKeys: ['missing-row'],
              columnKeys: ['missing-column'],
              cells: [{ rowKey: 'missing-cell-row', columnKey: 'missing-cell-column', cellKey: 'missing-cell' }],
            },
            refs: {
              domainIdByKey: { 'missing-domain': 'domain' },
              pointerByKey: { 'missing-pointer': 'pointer' },
            },
          })
          setPaths(result.success ? [] : result.error.issues.map((issue) => issue.path.join('.')))
        }}
      >
        Validate refs
      </button>
      <output>{paths.join('|')}</output>
    </div>
  )
}

describe('pattern data validation from pointer input', () => {
  it('reports unknown relation and ref keys after a click', () => {
    render(<ValidationHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Validate refs' }))

    expect(screen.getByText(/relations\.rootKeys\.0/)).toBeTruthy()
    expect(screen.getByText(/relations\.childrenByKey\.missing-parent/)).toBeTruthy()
    expect(screen.getByText(/relations\.childrenByKey\.missing-parent\.0/)).toBeTruthy()
    expect(screen.getByText(/relations\.ownerByKey\.missing-owned/)).toBeTruthy()
    expect(screen.getByText(/relations\.controlsByKey\.missing-controller\.0/)).toBeTruthy()
    expect(screen.getByText(/relations\.rowKeys\.0/)).toBeTruthy()
    expect(screen.getByText(/relations\.columnKeys\.0/)).toBeTruthy()
    expect(screen.getByText(/relations\.cells\.0\.cellKey/)).toBeTruthy()
    expect(screen.getByText(/refs\.domainIdByKey\.missing-domain/)).toBeTruthy()
    expect(screen.getByText(/refs\.pointerByKey\.missing-pointer/)).toBeTruthy()
  })
})
