import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../index'
import { resolveMenuButtonKey } from '../patterns/menu/menuButtonKeyboard'
import { useMenuButtonPattern } from '../patterns/menu/useMenuButtonPattern'

const itemKeys = ['a', 'b', 'c'] as const
const menuData = {
  items: {
    trigger: { label: 'Actions' },
    menu: { label: 'Actions menu' },
    a: { label: 'Alpha' },
    b: { label: 'Beta' },
    c: { label: 'Alpine' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['menu'] },
    ownerByKey: { menu: 'trigger' },
    childrenByKey: { menu: itemKeys },
  },
  state: {
    activeKey: 'a',
    expandedKeys: ['trigger'],
    disabledKeys: [] as string[],
  },
} satisfies PatternData

function withState(state: NonNullable<PatternData['state']>): PatternData {
  return { ...menuData, state: { ...menuData.state, ...state } }
}

describe('menu button disabled navigation', () => {
  it('skips disabled items for arrow and boundary keys', () => {
    expect(resolveMenuButtonKey('ArrowDown', itemKeys, 'a', withState({ disabledKeys: ['b'] }))).toBe('c')
    expect(resolveMenuButtonKey('ArrowUp', itemKeys, 'c', withState({ disabledKeys: ['b'] }))).toBe('a')
    expect(resolveMenuButtonKey('Home', itemKeys, 'c', withState({ disabledKeys: ['a'] }))).toBe('b')
    expect(resolveMenuButtonKey('End', itemKeys, 'a', withState({ disabledKeys: ['c'] }))).toBe('b')
  })

  it('skips disabled items during typeahead', () => {
    expect(resolveMenuButtonKey('a', itemKeys, 'a', withState({ disabledKeys: ['c'] }))).toBe('a')
    expect(resolveMenuButtonKey('a', itemKeys, 'a', withState({ disabledKeys: ['a', 'c'] }))).toBeUndefined()
  })

  it('does not activate or close a disabled active item', () => {
    const events: PatternEvent[] = []
    render(<MenuButtonKeyboardHost data={withState({ activeKey: 'a', disabledKeys: ['a'] })} onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: ' ' })

    expect(events).toEqual([])
  })
})

function MenuButtonKeyboardHost({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const menu = useMenuButtonPattern(data, onEvent, { elementIdPrefix: 'menu-test-' })
  return <div {...menu.menuProps} />
}
