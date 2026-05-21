import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternOptions } from '../../../../src/react'
import { renderAriaTree, renderHtmlTree } from './inspect'
import { initialData } from './treeContract'

function InspectHost() {
  const [mode, setMode] = useState<'aria' | 'html'>('aria')
  const [focusStrategy, setFocusStrategy] = useState<PatternOptions['focusStrategy']>('rovingTabIndex')
  const [data, setData] = useState<PatternData>(initialData)
  const options: PatternOptions = { focusStrategy, elementIdPrefix: 'inspect-treeitem-' }
  const output = mode === 'aria' ? renderAriaTree(data, options) : renderHtmlTree(data, options)

  return (
    <div>
      <button type="button" onClick={() => setMode('html')}>HTML inspect</button>
      <button type="button" onClick={() => setFocusStrategy('ariaActiveDescendant')}>Active descendant</button>
      <button
        type="button"
        onClick={() => setData((current) => ({
          ...current,
          state: {
            ...current.state,
            expandedKeys: [],
            activeKey: 'demo',
          },
          refs: {
            ...current.refs,
            labelledBy: 'tree-label',
          },
        }))}
      >
        Collapse docs
      </button>
      <pre>{output}</pre>
    </div>
  )
}

describe('treeview inspect from pointer input', () => {
  it('renders ARIA and HTML inspection output after clicks', () => {
    render(<InspectHost />)

    expect(screen.getByText(/> treeitem docs "Docs"/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'HTML inspect' }))
    expect(screen.getByText(/<div role="tree"/)).toBeTruthy()
    expect(screen.getByText(/<button aria-label="toggle docs">\-/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Active descendant' }))
    expect(screen.getByText(/aria-activedescendant="inspect-treeitem-docs"/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Collapse docs' }))
    expect(screen.getByText(/aria-activedescendant="inspect-treeitem-demo"/)).toBeTruthy()
    expect(screen.getByText(/<button aria-label="toggle docs">\+/)).toBeTruthy()
    expect(screen.queryByText(/Runtime/)).toBeNull()
  })
})
