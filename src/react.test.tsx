import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTreeviewPattern, type PatternData, type PatternEvent } from './index'

const data = {
  items: {
    a: { label: 'Documents' },
    b: { label: 'Archive' },
  },
  relations: {
    rootKeys: ['a'],
    childrenByKey: {
      a: ['b'],
      b: [],
    },
  },
  state: {
    activeKey: 'a',
    expandedKeys: ['a'],
  },
} satisfies PatternData

function TreeviewDemo(props: {
  data?: PatternData
  options?: Parameters<typeof useTreeviewPattern>[0]['options']
  onEvent: (event: PatternEvent) => void
}) {
  const tree = useTreeviewPattern({
    data: props.data ?? data,
    options: props.options,
    onEvent: props.onEvent,
  })

  return (
    <div {...tree.getTreeProps()} data-testid="tree">
      {tree.items.map((item) => (
        <div key={item.key} {...item.slotProps.treeitem}>
          <button type="button" {...item.slotProps.indicator} aria-label={`toggle ${item.key}`} />
          {item.key}
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
      { type: 'focus', key: 'a' },
      { type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'a' },
      { type: 'focus', key: 'a' },
      { type: 'expand', key: 'a', expanded: false },
    ])
  })

  it('supports React option variants without changing render code', () => {
    const events: PatternEvent[] = []
    render(<TreeviewDemo options={{ itemClickAction: 'toggleExpand', followFocus: true }} onEvent={(event) => events.push(event)} />)

    fireEvent.focus(screen.getByText('a'))
    fireEvent.click(screen.getByText('a'))

    expect(events).toEqual([
      { type: 'focus', key: 'a' },
      { type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'a' },
      { type: 'focus', key: 'a' },
      { type: 'expand', key: 'a', expanded: false },
    ])
  })
})
