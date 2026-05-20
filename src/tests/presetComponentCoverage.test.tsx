import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Accordion,
  Breadcrumb,
  Button,
  Checkbox,
  Link,
  Listbox,
  Meter,
  RadioGroup,
  Switch,
  Toolbar,
  Tree,
  type PatternData,
  type PatternEvent,
} from '../index'

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

  it('renders a button and emits press plus activate events', () => {
    const events: PatternEvent[] = []
    const data: PatternData = {
      items: { save: { label: 'Save' } },
      relations: { rootKeys: ['save'] },
    }

    render(<Button data={data} onEvent={(event) => events.push(event)} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(events).toEqual([
      { type: 'press', key: 'save', pressed: true },
      { type: 'activate', key: 'save' },
    ])
  })

  it('renders checkboxes and switches with their APG roles', () => {
    const events: PatternEvent[] = []
    const checkboxData: PatternData = {
      items: { terms: { label: 'Accept terms' } },
      relations: { rootKeys: ['terms'] },
      state: { checkedByKey: { terms: false } },
    }
    const switchData: PatternData = {
      items: { wifi: { label: 'Wi-Fi' } },
      relations: { rootKeys: ['wifi'] },
      state: { checkedByKey: { wifi: false } },
    }

    render(
      <>
        <Checkbox data={checkboxData} onEvent={(event) => events.push(event)} />
        <Switch data={switchData} onEvent={(event) => events.push(event)} />
      </>,
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Accept terms' }))
    fireEvent.click(screen.getByRole('switch', { name: 'Wi-Fi' }))

    expect(events).toEqual([
      { type: 'check', key: 'terms', checked: true },
      { type: 'check', key: 'wifi', checked: true },
    ])
  })

  it('renders radio groups and toolbars as managed collections', () => {
    const events: PatternEvent[] = []
    const radioData: PatternData = {
      items: {
        small: { label: 'Small' },
        large: { label: 'Large' },
      },
      relations: { rootKeys: ['small', 'large'] },
      refs: { label: 'Size' },
      state: { activeKey: 'small', selectedKeys: ['small'] },
    }
    const toolbarData: PatternData = {
      items: {
        bold: { label: 'Bold' },
        italic: { label: 'Italic' },
      },
      relations: { rootKeys: ['bold', 'italic'] },
      refs: { label: 'Formatting' },
      state: { activeKey: 'bold', selectedKeys: ['bold'] },
    }

    render(
      <>
        <RadioGroup data={radioData} onEvent={(event) => events.push(event)} />
        <Toolbar data={toolbarData} onEvent={(event) => events.push(event)} />
      </>,
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Large' }))
    fireEvent.click(screen.getByRole('button', { name: 'Italic' }))

    expect(screen.getByRole('radiogroup', { name: 'Size' })).toBeTruthy()
    expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeTruthy()
    expect(events).toEqual([
      { type: 'focus', key: 'large' },
      { type: 'select', keys: ['large'], anchorKey: 'large', extentKey: 'large' },
      { type: 'focus', key: 'italic' },
      { type: 'select', keys: ['italic'], anchorKey: 'italic', extentKey: 'italic' },
    ])
  })

  it('renders meter values without requiring caller-owned APG markup', () => {
    const data: PatternData = {
      items: { quota: { label: 'Storage quota' } },
      relations: { rootKeys: ['quota'] },
      state: { valueByKey: { quota: 72 } },
    }

    render(<Meter data={data} />)

    const meter = screen.getByRole('meter', { name: 'Storage quota' })
    expect(meter.getAttribute('aria-valuenow')).toBe('72')
    expect(meter.textContent).toBe('Storage quota 72%')
  })

  it('renders breadcrumb and link presets that emit activation', () => {
    const events: PatternEvent[] = []
    const breadcrumbData: PatternData<{ label: string; href?: string }> = {
      items: {
        home: { label: 'Home', href: '/home' },
        settings: { label: 'Settings', href: '/settings' },
      },
      relations: { rootKeys: ['home', 'settings'] },
      refs: { label: 'Breadcrumb' },
      state: { currentByKey: { settings: 'page' } },
    }
    const linkData: PatternData<{ label: string; href?: string }> = {
      items: { docs: { label: 'Docs', href: '/docs' } },
      relations: { rootKeys: ['docs'] },
    }

    render(
      <>
        <Breadcrumb data={breadcrumbData} onEvent={(event) => events.push(event)} />
        <Link data={linkData} onEvent={(event) => events.push(event)} />
      </>,
    )

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeTruthy()
    fireEvent.click(screen.getByRole('link', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('link', { name: 'Docs' }))

    expect(events).toEqual([
      { type: 'activate', key: 'settings' },
      { type: 'activate', key: 'docs' },
    ])
  })
})
