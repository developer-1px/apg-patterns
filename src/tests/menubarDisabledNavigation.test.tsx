import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { reducePatternData, type PatternData, type PatternEvent } from '../index'
import { registerKernelBuiltins } from '../kernel/kernelBuiltins'
import { menubarDefinition } from '../patterns/menu/menubarDefinition'
import { useMenubarPattern } from '../patterns/menu/useMenubarPattern'

registerKernelBuiltins()

const rootKeys = ['file', 'edit', 'view'] as const
const fileChildren = ['new', 'open', 'close'] as const

const menubarData = {
  items: {
    file: { label: 'File' },
    edit: { label: 'Edit' },
    view: { label: 'View' },
    new: { label: 'New' },
    open: { label: 'Open' },
    close: { label: 'Close' },
  },
  refs: { label: 'Application menu' },
  relations: {
    rootKeys,
    childrenByKey: { file: fileChildren },
  },
  state: {
    activeKey: 'file',
    expandedKeys: [],
    disabledKeys: [] as string[],
  },
} satisfies PatternData

function withState(state: NonNullable<PatternData['state']>): PatternData {
  return { ...menubarData, state: { ...menubarData.state, ...state } }
}

describe('menubar disabled navigation', () => {
  it('skips disabled root items in reducer navigation', () => {
    const data = withState({ activeKey: 'file', disabledKeys: ['edit'] })

    expect(reducePatternData(menubarDefinition, data, { type: 'navigate', direction: 'next' }).state?.activeKey).toBe('view')
    expect(reducePatternData(menubarDefinition, data, { type: 'navigate', direction: 'last' }).state?.activeKey).toBe('view')
    expect(reducePatternData(menubarDefinition, withState({ activeKey: 'view', disabledKeys: ['edit'] }), { type: 'navigate', direction: 'previous' }).state?.activeKey).toBe('file')
  })

  it('uses the first enabled child for reducer submenu entry', () => {
    const data = withState({ activeKey: 'file', disabledKeys: ['new'] })
    const allChildrenDisabled = withState({ activeKey: 'file', disabledKeys: ['new', 'open', 'close'] })

    expect(reducePatternData(menubarDefinition, data, { type: 'navigate', direction: 'down' }).state?.activeKey).toBe('open')
    expect(reducePatternData(menubarDefinition, allChildrenDisabled, { type: 'navigate', direction: 'down' }).state?.activeKey).toBe('file')
  })

  it('skips disabled root siblings and submenu children in React item keyboard handlers', () => {
    const events: PatternEvent[] = []
    render(<MenubarHost data={withState({ disabledKeys: ['edit', 'new'] })} onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'File' }), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'File' }), { key: 'ArrowDown' })

    expect(events).toEqual([
      { type: 'focus', key: 'view', meta: { reason: 'keyboard' } },
      { type: 'expand', key: 'file', expanded: true },
      { type: 'focus', key: 'open', meta: { reason: 'keyboard' } },
    ])
  })

  it('does not emit focus or activation events from disabled items', () => {
    const events: PatternEvent[] = []
    render(<MenubarHost data={withState({ activeKey: 'edit', disabledKeys: ['edit'] })} onEvent={(event) => events.push(event)} />)

    fireEvent.focus(screen.getByRole('menuitem', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Edit' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Edit' }), { key: ' ' })

    expect(events).toEqual([])
  })

  it('skips disabled root items during typeahead', () => {
    const events: PatternEvent[] = []
    render(<MenubarHost data={withState({ activeKey: 'file', disabledKeys: ['view'] })} onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menubar'), { key: 'v' })

    expect(events).toEqual([])
  })
})

function MenubarHost({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const menubar = useMenubarPattern(data, onEvent, { elementIdPrefix: 'menubar-test-' })
  return (
    <div {...menubar.rootProps}>
      {menubar.rootItems.map((item) => (
        <div key={item.key} {...item.itemProps}>
          {item.label}
        </div>
      ))}
      {menubar.itemsFor('file').map((item) => (
        <div key={item.key} {...item.itemProps}>
          {item.label}
        </div>
      ))}
    </div>
  )
}
