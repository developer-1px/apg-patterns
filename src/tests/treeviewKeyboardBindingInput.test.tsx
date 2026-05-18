import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternOptions } from '../index'
import '../index'
import { resolveTreeviewKeyboardBinding } from '../patterns/treeview/runtimeCompatibility'

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
    <div
      role="tree"
      tabIndex={0}
      onKeyDown={(event) => {
        const binding = resolveTreeviewKeyboardBinding(event, 'docs', data, options)
        setResult(binding ? `${binding.preventDefault}:${binding.events.map((item) => item.type).join(',')}` : 'none')
      }}
    >
      <div role="treeitem">Docs</div>
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
  })
})
