import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Accordion, Listbox, Tree, type PatternData, type PatternEvent } from '../index'

describe('preset React components', () => {
  it('renders a tree and emits branch toggle events', () => {
    const events: PatternEvent[] = []
    const data: PatternData<{ label: string; href?: string }> = {
      items: {
        root: { label: 'Root' },
        child: { label: 'Child', href: '/child' },
      },
      relations: {
        rootKeys: ['root'],
        childrenByKey: { root: ['child'] },
      },
      state: {
        activeKey: 'root',
        expandedKeys: ['root'],
      },
    }

    render(<Tree data={data} onEvent={(event) => events.push(event)} />)

    expect(screen.getByRole('tree')).toBeTruthy()
    expect(screen.getByRole('treeitem', { name: /Root/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Child' }).getAttribute('href')).toBe('/child')

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Root' }))

    expect(events).toEqual([{ type: 'expand', key: 'root', expanded: false }])
  })

  it('renders a listbox and lets callers customize option content', () => {
    const events: PatternEvent[] = []
    const data: PatternData<{ label: string; kind?: string }> = {
      items: {
        alpha: { label: 'Alpha', kind: 'letter' },
        beta: { label: 'Beta', kind: 'letter' },
      },
      relations: { rootKeys: ['alpha', 'beta'] },
      state: { activeKey: 'alpha', selectedKeys: ['alpha'] },
    }

    render(<Listbox data={data} onEvent={(event) => events.push(event)} renderOption={(item, dataItem) => `${item.label} ${dataItem.kind}`} />)

    expect(screen.getByRole('listbox')).toBeTruthy()
    fireEvent.click(screen.getByRole('option', { name: 'Beta letter' }))

    expect(events).toEqual([
      { type: 'focus', key: 'beta' },
      { type: 'select', keys: ['beta'], anchorKey: 'beta', extentKey: 'beta' },
    ])
  })

  it('renders an accordion with panel content from controlled panel items', () => {
    const events: PatternEvent[] = []
    const data: PatternData<{ label: string; content?: string }> = {
      items: {
        shipping: { label: 'Shipping' },
        shippingPanel: { label: 'Shipping details', content: 'Ships in two business days.' },
      },
      relations: {
        rootKeys: ['shipping'],
        controlsByKey: { shipping: ['shippingPanel'] },
        ownerByKey: { shippingPanel: 'shipping' },
      },
      state: {
        activeKey: 'shipping',
        expandedKeys: ['shipping'],
      },
    }

    render(<Accordion data={data} onEvent={(event) => events.push(event)} />)

    expect(screen.getByRole('group')).toBeTruthy()
    expect(screen.getByRole('region').textContent).toBe('Ships in two business days.')

    fireEvent.click(screen.getByRole('button', { name: 'Shipping' }))

    expect(events).toEqual([{ type: 'expand', key: 'shipping', expanded: false }])
  })
})
