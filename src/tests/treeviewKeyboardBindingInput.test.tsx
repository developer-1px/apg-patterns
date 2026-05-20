import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { KeyInput, PatternData, PatternOptions } from '../index'
import '../index'
import { resolveTreeviewKeyboardBinding, resolveTreeviewNavigationTarget } from '../patterns/treeview/runtimeCompatibility'

const data = {
  items: {
    docs: { label: 'Docs' },
    adr: { label: 'ADR' },
  },
  relations: {
    rootKeys: ['docs'],
    childrenByKey: { docs: ['adr'] },
  },
  state: {
    activeKey: 'docs',
    expandedKeys: ['docs'],
  },
} satisfies PatternData

const options = { itemClickAction: 'select' } satisfies PatternOptions

function KeyboardBindingHost() {
  const [result, setResult] = useState('')

  return (
    <div>
      <div
        role="tree"
        tabIndex={0}
        onKeyDown={(event) => {
          const binding = resolveTreeviewKeyboardBinding(event as unknown as KeyInput, 'docs', data, options)
          setResult(binding ? `${binding.preventDefault}:${binding.events.map((item) => item.type).join(',')}` : 'none')
        }}
      >
        <div role="treeitem">Docs</div>
      </div>
      <button
        type="button"
        onClick={() => {
          const values = [
            resolveTreeviewNavigationTarget({ type: 'navigate', direction: 'first' }, 'docs', data),
            resolveTreeviewNavigationTarget({ type: 'navigate', direction: 'parent' }, 'adr', data),
            resolveTreeviewNavigationTarget({ type: 'navigate', direction: 'rowStart' }, 'docs', data),
          ]
          setResult(values.map(String).join('|'))
        }}
      >
        Resolve tree navigation
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('treeview keyboard binding from keyboard input', () => {
  it('resolves matching keyboard cases and ignores unmatched keys', () => {
    render(<KeyboardBindingHost />)
    const tree = screen.getByRole('tree')

    fireEvent.keyDown(tree, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(screen.getByText('true:navigate')).toBeTruthy()

    fireEvent.keyDown(tree, { key: 'Enter', code: 'Enter' })
    expect(screen.getByText('true:select')).toBeTruthy()

    fireEvent.keyDown(tree, { key: 'F9', code: 'F9' })
    expect(screen.getByText('none')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve tree navigation' }))
    expect(screen.getByText('docs|docs|null')).toBeTruthy()
  })
})
