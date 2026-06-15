import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../index'
import { useMenuButtonPattern } from '../patterns/menu/useMenuButtonPattern'

const menuData = {
  items: {
    trigger: { label: 'Actions' },
    menu: { label: 'Actions menu' },
    first: { label: 'First' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['menu'] },
    ownerByKey: { menu: 'trigger' },
    childrenByKey: { menu: ['first'] },
  },
  state: {
    activeKey: 'first',
    expandedKeys: ['trigger'],
  },
} satisfies PatternData

describe('menu button trigger Escape', () => {
  it('closes an expanded menu without emitting dismiss when focus remains on the trigger', () => {
    const events: PatternEvent[] = []
    render(<MenuButtonTriggerHost data={menuData} onEvent={(event) => events.push(event)} />)

    const trigger = screen.getByRole('button', { name: 'Actions' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Escape' })

    expect(events).toEqual([{ type: 'expand', key: 'trigger', expanded: false }])
    expect(document.activeElement).toBe(trigger)
  })
})

function MenuButtonTriggerHost({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const menu = useMenuButtonPattern(data, onEvent, { elementIdPrefix: 'menu-test-' })
  return <button type="button" {...menu.triggerProps}>Actions</button>
}
