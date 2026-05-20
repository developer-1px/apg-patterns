import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Accordion,
  Alert,
  AlertDialog,
  Breadcrumb,
  Button,
  Carousel,
  Checkbox,
  Combobox,
  Dialog,
  Disclosure,
  Feed,
  Grid,
  Landmarks,
  Link,
  Listbox,
  MenuButton,
  Menubar,
  Meter,
  RadioGroup,
  Slider,
  Spinbutton,
  Switch,
  Table,
  Tabs,
  Toolbar,
  Tooltip,
  Tree,
  Treegrid,
  WindowSplitter,
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

  it('renders alert, disclosure, and tooltip presets', () => {
    const events: PatternEvent[] = []
    const alertData: PatternData<{ label?: string; message?: string }> = {
      items: {
        alert: { label: 'Status', message: 'Saved' },
        dismiss: { label: 'Dismiss status' },
      },
      relations: {
        rootKeys: ['alert'],
        controlsByKey: { dismiss: ['alert'] },
      },
      state: {
        activeKey: 'alert',
        expandedKeys: ['alert'],
      },
    }
    const disclosureData: PatternData<{ label: string; content?: string }> = {
      items: {
        details: { label: 'Details' },
        panel: { label: 'Details panel', content: 'More detail' },
      },
      relations: {
        rootKeys: ['details'],
        controlsByKey: { details: ['panel'] },
        ownerByKey: { panel: 'details' },
      },
      state: {
        activeKey: 'details',
        expandedKeys: ['details'],
      },
    }
    const tooltipData: PatternData<{ label: string; content?: string }> = {
      items: {
        help: { label: 'Help' },
        tip: { label: 'Help tip', content: 'Helpful text' },
      },
      relations: {
        rootKeys: ['help'],
        controlsByKey: { help: ['tip'] },
        ownerByKey: { tip: 'help' },
      },
      state: {
        expandedKeys: ['help'],
      },
    }

    render(
      <>
        <Alert data={alertData} onEvent={(event) => events.push(event)} />
        <Disclosure data={disclosureData} onEvent={(event) => events.push(event)} />
        <Tooltip data={tooltipData} onEvent={(event) => events.push(event)} />
      </>,
    )

    expect(screen.getByRole('alert', { name: 'Status' }).textContent).toContain('Saved')
    expect(screen.getByRole('region', { name: 'Details' }).textContent).toBe('More detail')
    expect(screen.getByRole('tooltip').textContent).toBe('Helpful text')

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss status' }))
    fireEvent.click(screen.getByRole('button', { name: 'Details' }))
    fireEvent.mouseLeave(screen.getByRole('button', { name: 'Help' }))

    expect(events).toEqual([
      { type: 'dismiss', key: 'alert' },
      { type: 'expand', key: 'details', expanded: false },
      { type: 'expand', key: 'help', expanded: false },
    ])
  })

  it('renders dialog presets and emits action events', () => {
    const events: PatternEvent[] = []
    const dialogData: PatternData<{ label: string; content?: string; kind?: string }> = {
      items: {
        trigger: { label: 'Open dialog', kind: 'dialog' },
        dialog: { label: 'Example dialog' },
        title: { label: 'Example dialog' },
        description: { label: 'Dialog description' },
        cancel: { label: 'Cancel' },
        submit: { label: 'Submit' },
      },
      relations: {
        rootKeys: ['trigger'],
        controlsByKey: { trigger: ['dialog'], dialog: ['description'] },
        ownerByKey: { dialog: 'title' },
      },
      state: {
        expandedKeys: ['trigger'],
      },
    }
    const alertDialogData: PatternData<{ label: string; kind?: string }> = {
      items: {
        trigger: { label: 'Delete', kind: 'dialog' },
        dialog: { label: 'Delete?' },
        title: { label: 'Delete?' },
        description: { label: 'Cannot be undone.' },
        confirm: { label: 'Confirm delete' },
        cancel: { label: 'Cancel delete' },
      },
      relations: {
        rootKeys: ['trigger'],
        controlsByKey: { trigger: ['dialog'], dialog: ['description'] },
        ownerByKey: { dialog: 'title' },
      },
      state: {
        expandedKeys: ['trigger'],
      },
    }

    render(
      <>
        <Dialog data={dialogData} onEvent={(event) => events.push(event)} />
        <AlertDialog data={alertDialogData} onEvent={(event) => events.push(event)} />
      </>,
    )

    expect(screen.getByRole('dialog', { name: 'Example dialog' })).toBeTruthy()
    expect(screen.getByRole('alertdialog', { name: 'Delete?' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))

    expect(events).toEqual([
      { type: 'expand', key: 'trigger', expanded: false },
      { type: 'expand', key: 'trigger', expanded: false },
      { type: 'activate', key: 'confirm' },
    ])
  })

  it('renders carousel and combobox presets', () => {
    const events: PatternEvent[] = []
    const carouselData: PatternData<{ label: string; title?: string; caption?: string }> = {
      items: {
        prev: { label: 'Previous slide' },
        next: { label: 'Next slide' },
        alpha: { label: 'Slide 1', title: 'Alpha', caption: 'Alpha caption' },
        beta: { label: 'Slide 2', title: 'Beta', caption: 'Beta caption' },
      },
      relations: { rootKeys: ['alpha', 'beta'] },
      refs: { label: 'Featured' },
      state: {
        activeKey: 'alpha',
        selectedKeys: ['alpha'],
        showDots: true,
      },
    }
    const comboboxData: PatternData<{ label: string }> = {
      items: {
        combobox: { label: 'Fruit' },
        apple: { label: 'Apple' },
        banana: { label: 'Banana' },
      },
      refs: { label: 'Fruit' },
      state: {
        expandedKeys: ['combobox'],
        selectedKeys: [],
        activeKey: 'apple',
        query: '',
        variant: 'listAutocomplete',
      },
    }

    render(
      <>
        <Carousel data={carouselData} onEvent={(event) => events.push(event)} />
        <Combobox data={comboboxData} onEvent={(event) => events.push(event)} />
      </>,
    )

    expect(screen.getByRole('region', { name: 'Featured' })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeTruthy()
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Banana' }))

    expect(events).toEqual([
      { type: 'navigate', direction: 'next' },
      { type: 'select', keys: ['banana'], anchorKey: 'banana', extentKey: 'banana' },
      { type: 'expand', key: 'combobox', expanded: false },
      { type: 'commitValue', key: 'banana', value: 'Banana' },
    ])
  })

  it('renders feed, table, grid, and treegrid collection presets', () => {
    const events: PatternEvent[] = []
    const feedData: PatternData<{ label: string; content?: string }> = {
      items: {
        one: { label: 'Article one', content: 'Article content' },
      },
      relations: { rootKeys: ['one'] },
      refs: { label: 'Updates' },
      state: {
        activeKey: 'one',
        posInSetByKey: { one: 1 },
        setSizeByKey: { one: 1 },
      },
    }
    const tableData: PatternData = {
      items: {
        row1: { label: 'Header row' },
        row2: { label: 'Body row' },
        col1: { label: 'Column 1' },
        col2: { label: 'Column 2' },
        c1: { label: 'Name', kind: 'columnheader' },
        c2: { label: 'Value', kind: 'columnheader' },
        a1: { label: 'Alpha' },
        a2: { label: 'One' },
      },
      relations: {
        rowKeys: ['row1', 'row2'],
        columnKeys: ['col1', 'col2'],
        cells: [
          { rowKey: 'row1', columnKey: 'col1', cellKey: 'c1' },
          { rowKey: 'row1', columnKey: 'col2', cellKey: 'c2' },
          { rowKey: 'row2', columnKey: 'col1', cellKey: 'a1' },
          { rowKey: 'row2', columnKey: 'col2', cellKey: 'a2' },
        ],
      },
      refs: { label: 'Static data' },
      state: {
        rowIndexByKey: { row1: 1, row2: 2, c1: 1, c2: 1, a1: 2, a2: 2 },
        columnIndexByKey: { c1: 1, c2: 2, a1: 1, a2: 2 },
        rowCount: 2,
        colCount: 2,
      },
    }
    const gridData: PatternData = {
      ...tableData,
      refs: { label: 'Editable grid' },
      state: {
        ...tableData.state,
        activeKey: 'a1',
        selectedKeys: ['a1'],
        valueByKey: { a1: 'Alpha', a2: 'One' },
      },
    }
    const treegridData: PatternData = {
      ...gridData,
      refs: { label: 'Tree grid' },
      relations: {
        ...gridData.relations,
        rootKeys: ['row2'],
      },
      state: {
        ...gridData.state,
        levelByKey: { row2: 1 },
        expandedKeys: ['row2'],
      },
    }

    render(
      <>
        <Feed data={feedData} onEvent={(event) => events.push(event)} />
        <Table data={tableData} />
        <Grid data={gridData} onEvent={(event) => events.push(event)} />
        <Treegrid data={treegridData} onEvent={(event) => events.push(event)} />
      </>,
    )

    expect(screen.getByRole('feed', { name: 'Updates' })).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Static data' })).toBeTruthy()
    expect(screen.getByRole('grid', { name: 'Editable grid' })).toBeTruthy()
    expect(screen.getByRole('treegrid', { name: 'Tree grid' })).toBeTruthy()

    fireEvent.click(screen.getAllByRole('gridcell', { name: 'One' })[0]!)

    expect(events).toEqual([{ type: 'select', keys: ['a2'], anchorKey: 'a2', extentKey: 'a2' }])
  })

  it('renders menu button, menubar, and tabs presets', () => {
    const events: PatternEvent[] = []
    const menuButtonData: PatternData = {
      items: {
        trigger: { label: 'Actions' },
        menu: { label: 'Actions menu' },
        copy: { label: 'Copy' },
      },
      relations: {
        rootKeys: ['trigger'],
        controlsByKey: { trigger: ['menu'] },
        ownerByKey: { menu: 'trigger' },
        childrenByKey: { menu: ['copy'] },
      },
      state: {
        activeKey: 'copy',
        expandedKeys: ['trigger'],
      },
    }
    const menubarData: PatternData = {
      items: {
        file: { label: 'File' },
        newFile: { label: 'New' },
      },
      relations: {
        rootKeys: ['file'],
        childrenByKey: { file: ['newFile'] },
      },
      refs: { label: 'App menu' },
      state: {
        activeKey: 'file',
        expandedKeys: ['file'],
      },
    }
    const tabsData: PatternData<{ label: string; content?: string }> = {
      items: {
        first: { label: 'First' },
        firstPanel: { label: 'First panel', content: 'First content' },
        second: { label: 'Second' },
        secondPanel: { label: 'Second panel', content: 'Second content' },
      },
      relations: {
        rootKeys: ['first', 'second'],
        controlsByKey: { first: ['firstPanel'], second: ['secondPanel'] },
        ownerByKey: { firstPanel: 'first', secondPanel: 'second' },
      },
      refs: { label: 'Sections' },
      state: {
        activeKey: 'first',
        selectedKeys: ['first'],
      },
    }

    render(
      <>
        <MenuButton data={menuButtonData} onEvent={(event) => events.push(event)} />
        <Menubar data={menubarData} onEvent={(event) => events.push(event)} />
        <Tabs data={tabsData} onEvent={(event) => events.push(event)} />
      </>,
    )

    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy()
    expect(screen.getByRole('menubar', { name: 'App menu' })).toBeTruthy()
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Second' }))

    expect(events).toEqual([{ type: 'select', keys: ['second'], anchorKey: 'second', extentKey: 'second' }])
  })

  it('renders slider, spinbutton, landmarks, and window splitter presets', () => {
    const events: PatternEvent[] = []
    const sliderData: PatternData = {
      items: {
        volume: { label: 'Volume' },
      },
      relations: { rootKeys: ['volume'] },
      state: {
        activeKey: 'volume',
        valueByKey: { volume: 40 },
      },
    }
    const spinbuttonData: PatternData = {
      items: {
        quantity: { label: 'Quantity', valuemin: 0, valuemax: 10 },
      },
      relations: { rootKeys: ['quantity'] },
      state: {
        activeKey: 'quantity',
        valueByKey: { quantity: 2 },
      },
    }
    const landmarksData: PatternData<{ label: string; kind: string; content?: string }> = {
      items: {
        header: { label: 'Header', kind: 'banner', content: 'Header' },
        nav: { label: 'Primary', kind: 'navigation', content: 'Nav' },
        main: { label: 'Main', kind: 'main', content: 'Main' },
        search: { label: 'Site search', kind: 'search', content: 'Search' },
      },
      relations: { rootKeys: ['header', 'nav', 'main', 'search'] },
    }
    const splitterData: PatternData<{ label: string; content?: string }> = {
      items: {
        split: { label: 'Resize navigation' },
        pane: { label: 'Navigation pane', content: 'Pane' },
      },
      relations: {
        rootKeys: ['split'],
        controlsByKey: { split: ['pane'] },
      },
      state: {
        activeKey: 'split',
        valueByKey: { split: 30 },
      },
    }

    render(
      <>
        <Slider data={sliderData} onEvent={(event) => events.push(event)} options={{ min: 0, max: 100 }} />
        <Spinbutton data={spinbuttonData} onEvent={(event) => events.push(event)} />
        <Landmarks data={landmarksData} />
        <WindowSplitter data={splitterData} onEvent={(event) => events.push(event)} options={{ min: 0, max: 100, orientation: 'vertical' }} />
      </>,
    )

    expect(screen.getByRole('slider', { name: 'Volume' })).toBeTruthy()
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeTruthy()
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy()
    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getByRole('search')).toBeTruthy()
    expect(screen.getByRole('separator', { name: 'Resize navigation' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Increment Quantity' }))

    expect(events).toEqual([
      { type: 'focus', key: 'quantity' },
      { type: 'valueStep', key: 'quantity', direction: 'increment' },
    ])
  })
})
