import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PatternDataSchema } from '../schema'
import { useTreeviewPattern, type PatternData, type PatternEvent, type PatternOptions } from '../react'

const data = {
  items: {
    a: { label: 'Documents' },
    b: { label: 'Archive' },
  },
  relations: {
    rootKeys: ['a'],
    childrenByKey: {
      a: ['b'],
    },
  },
  state: {
    activeKey: 'a',
    expandedKeys: ['a'],
  },
} satisfies PatternData

function TreeviewDemo(props: {
  data?: PatternData
  options?: PatternOptions
  onEvent: (event: PatternEvent) => void
  exposeActions?: boolean
}) {
  const tree = useTreeviewPattern(props.data ?? data, props.onEvent, props.options)

  return (
    <div {...tree.getTreeProps()} data-testid="tree">
      {tree.items.map((item) => (
        <div key={item.key} {...item.slotProps.treeitem}>
          <button type="button" {...item.slotProps.indicator} aria-label={`toggle ${item.key}`} />
          {item.key}
        </div>
      ))}
      {props.exposeActions ? (
        <>
          <button type="button" onClick={() => tree.actions.focus('b')}>Action focus</button>
          <button type="button" onClick={() => tree.actions.select('b')}>Action select</button>
          <button type="button" onClick={() => tree.actions.toggle('a')}>Action toggle</button>
          <output data-testid="tree-state">{[
            tree.state.activeKey ?? '',
            tree.state.selectedKeys.join(','),
            tree.state.disabledKeys.join(','),
            tree.state.expandedKeys.join(','),
            tree.ids.forKey('a'),
          ].join('|')}</output>
        </>
      ) : null}
    </div>
  )
}

function TreeviewRenderItemsDemo(props: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const tree = useTreeviewPattern(props.data, props.onEvent)

  return (
    <div {...tree.rootProps}>
      {tree.renderItems.map((item) => (
        <div key={item.key} {...item.treeitemProps}>
          {item.label}
        </div>
      ))}
    </div>
  )
}

describe('useTreeviewPattern', () => {
  it('renders APG tree/treeitem props from runtime', () => {
    const events: PatternEvent[] = []
    render(<TreeviewDemo onEvent={(event) => events.push(event)} />)

    expect(screen.getByRole('tree')).toBeTruthy()
    expect(screen.getAllByRole('treeitem')).toHaveLength(2)
    expect(screen.getByText('a').getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('a').getAttribute('tabindex')).toBe('0')
  })

  it('emits select by default on item click and expand on indicator click', () => {
    const events: PatternEvent[] = []
    render(<TreeviewDemo onEvent={(event) => events.push(event)} />)

    fireEvent.click(screen.getByText('a'))
    fireEvent.click(screen.getByRole('button', { name: 'toggle a' }))

    expect(events).toEqual([
      { type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'a' },
      { type: 'expand', key: 'a', expanded: false },
    ])
  })

  it('supports React option variants without changing render code', () => {
    const events: PatternEvent[] = []
    render(<TreeviewDemo options={{ itemClickAction: 'toggleExpand', followFocus: true }} onEvent={(event) => events.push(event)} />)

    fireEvent.focus(screen.getByText('a'))
    fireEvent.click(screen.getByText('a'))

    expect(events).toEqual([
      { type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'a' },
      { type: 'expand', key: 'a', expanded: false },
    ])
  })

  it('exposes React state, ids, and imperative actions from pointer controls', () => {
    const events: PatternEvent[] = []
    render(<TreeviewDemo exposeActions onEvent={(event) => events.push(event)} />)

    expect(screen.getByTestId('tree-state').textContent).toBe('a|||a|treeitem-a')

    fireEvent.click(screen.getByRole('button', { name: 'Action focus' }))
    fireEvent.click(screen.getByRole('button', { name: 'Action select' }))
    fireEvent.click(screen.getByRole('button', { name: 'Action toggle' }))

    expect(events).toEqual([
      { type: 'focus', key: 'b' },
      { type: 'select', keys: ['b'], anchorKey: 'b', extentKey: 'b' },
      { type: 'expand', key: 'a', expanded: false },
    ])
  })

  it('does not reparse tree data for every render item state lookup', () => {
    const parse = vi.spyOn(PatternDataSchema, 'parse')

    try {
      render(<TreeviewRenderItemsDemo data={createFlatTreeData(40)} onEvent={() => undefined} />)

      expect(screen.getAllByRole('treeitem')).toHaveLength(40)
      expect(parse.mock.calls.length).toBeLessThanOrEqual(3)
    } finally {
      parse.mockRestore()
    }
  })
})

function createFlatTreeData(size: number): PatternData {
  const items: PatternData['items'] = {}
  const rootKeys: string[] = []
  const levelByKey: NonNullable<PatternData['state']>['levelByKey'] = {}
  const typeaheadTextByKey: NonNullable<PatternData['state']>['typeaheadTextByKey'] = {}

  for (let index = 0; index < size; index += 1) {
    const key = `item-${index}`
    items[key] = { label: `Item ${index}`, textValue: `Item ${index}` }
    rootKeys.push(key)
    levelByKey[key] = 1
    typeaheadTextByKey[key] = `Item ${index}`
  }

  return {
    items,
    relations: { rootKeys },
    state: {
      activeKey: rootKeys[0],
      levelByKey,
      selectedKeys: rootKeys[0] ? [rootKeys[0]] : [],
      typeaheadTextByKey,
    },
  }
}
