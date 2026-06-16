import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  useComboboxPattern,
  useDialogPattern,
  useListboxPattern,
  useMenuButtonPattern,
  useTabsPattern,
  useTreeviewPattern,
  type PatternData,
  type PatternEvent,
} from '../react'

describe('React public event contracts', () => {
  it('keeps treeview keyboard and indicator events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<TreeviewContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowDown' })
    fireEvent.click(screen.getByRole('button', { name: 'toggle docs' }))

    expect(eventPayload(events[0])).toEqual({ type: 'navigate', direction: 'next' })
    expect(eventReason(events[0])).toBe('keyboard')
    expect(eventPayload(events[1])).toEqual({ type: 'expand', key: 'docs', expanded: false })
    expect(eventReason(events[1])).toBe('pointer')
  })

  it('keeps tabs keyboard and automatic focus events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<TabsContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown' })
    fireEvent.focus(screen.getByRole('tab', { name: 'API' }))

    expect(eventPayload(events[0])).toEqual({ type: 'navigate', direction: 'next' })
    expect(eventReason(events[0])).toBe('keyboard')
    expect(events.slice(1).map(eventPayload)).toEqual([
      { type: 'focus', key: 'tab-api' },
      { type: 'select', keys: ['tab-api'], anchorKey: 'tab-api', extentKey: 'tab-api' },
    ])
    expect(events.slice(1).map(eventReason)).toEqual(['focus', 'focus'])
  })

  it('keeps combobox input and open keyboard events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<ComboboxContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'alp' } })
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })

    expect(eventPayload(events[0])).toEqual({ type: 'inputValue', key: 'combobox', value: 'alp', inline: false })
    expect(events.slice(1).map(eventPayload)).toEqual([
      { type: 'expand', key: 'combobox', expanded: true },
      { type: 'navigate', direction: 'first' },
    ])
    expect(events.slice(1).map(eventReason)).toEqual(['keyboard', 'keyboard'])
  })

  it('keeps dialog Escape and overlay close events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<DialogContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    fireEvent.mouseDown(screen.getByTestId('dialog-overlay'))

    expect(eventPayload(events[0])).toEqual({ type: 'expand', key: 'trigger', expanded: false })
    expect(eventReason(events[0])).toBe('keyboard')
    expect(eventPayload(events[1])).toEqual({ type: 'expand', key: 'trigger', expanded: false })
    expect(eventReason(events[1])).toBe('pointer')
  })

  it('keeps listbox keyboard navigation and multi-select pointer events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<ListboxContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
    fireEvent.click(screen.getByRole('option', { name: 'Two' }))

    expect(eventPayload(events[0])).toEqual({ type: 'navigate', direction: 'next' })
    expect(eventReason(events[0])).toBe('keyboard')
    expect(eventPayload(events[1])).toEqual({ type: 'select', keys: ['two'], anchorKey: 'two', extentKey: 'two' })
  })

  it('keeps menu button open and activation events on the public hook surface', () => {
    const openingEvents: PatternEvent[] = []
    render(<MenuButtonContractHost data={menuButtonClosedData} onEvent={(event) => openingEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowDown' })

    expect(openingEvents.map(eventPayload)).toEqual([
      { type: 'expand', key: 'trigger', expanded: true },
      { type: 'focus', key: 'copy' },
    ])
    expect(openingEvents.map(eventReason)).toEqual(['open', 'open'])

    const activationEvents: PatternEvent[] = []
    render(<MenuButtonContractHost data={menuButtonOpenData} onEvent={(event) => activationEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' })

    expect(activationEvents.map(eventPayload)).toEqual([
      { type: 'activate', key: 'copy' },
      { type: 'expand', key: 'trigger', expanded: false },
    ])
  })
})

function TreeviewContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const treeview = useTreeviewPattern(treeviewData, onEvent, { selectionMode: 'multiple' })

  return (
    <div {...treeview.rootProps}>
      {treeview.renderItems.map((item) => (
        <div key={item.key} {...item.treeitemProps}>
          {item.kind === 'branch' ? <button type="button" aria-label={`toggle ${item.key}`} {...item.toggleButtonProps} /> : null}
          {item.label}
        </div>
      ))}
    </div>
  )
}

function TabsContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const tabs = useTabsPattern(tabsData, onEvent, { orientation: 'vertical', activationMode: 'automatic' })

  return (
    <div>
      <div {...tabs.getTablistProps()}>
        {tabs.tabs.map((key) => <button key={key} {...tabs.getTabProps(key)}>{tabsData.items[key]?.label}</button>)}
      </div>
      {tabs.selectedPanelKey ? <div {...tabs.getTabPanelProps(tabs.selectedPanelKey)}>{tabsData.items[tabs.selectedPanelKey]?.label}</div> : null}
    </div>
  )
}

function ComboboxContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const combobox = useComboboxPattern(comboboxData, onEvent)

  return (
    <div>
      <input {...combobox.inputProps} ref={combobox.setInputRef} />
      {combobox.open ? (
        <div {...combobox.listboxProps}>
          {combobox.options.map((option) => <div key={option.key} {...option.optionProps}>{option.label}</div>)}
        </div>
      ) : null}
    </div>
  )
}

function DialogContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const dialog = useDialogPattern(dialogData, onEvent)

  return (
    <div>
      <button type="button" {...dialog.triggerProps}>{dialog.labelOf('trigger')}</button>
      {dialog.open ? (
        <div data-testid="dialog-overlay" {...dialog.overlayProps}>
          <div {...dialog.dialogProps}>
            <h2 {...dialog.titleProps}>{dialog.labelOf('title')}</h2>
            <p {...dialog.descriptionProps}>{dialog.labelOf('description')}</p>
            <button type="button" {...dialog.cancelProps}>{dialog.labelOf('cancel')}</button>
            <button type="button" {...dialog.submitProps}>{dialog.labelOf('submit')}</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ListboxContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const listbox = useListboxPattern(listboxData, onEvent, { selectionMode: 'multiple' })

  return (
    <div {...listbox.rootProps}>
      {listbox.renderItems.map((item) => <div key={item.key} {...item.optionProps}>{item.label}</div>)}
    </div>
  )
}

function MenuButtonContractHost({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  const menuButton = useMenuButtonPattern(data, onEvent)

  return (
    <div>
      <button type="button" {...menuButton.triggerProps}>{data.items.trigger?.label}</button>
      {menuButton.expanded ? (
        <div {...menuButton.menuProps}>
          {menuButton.items.map((item) => <div key={item.key} {...item.itemProps}>{item.label}</div>)}
        </div>
      ) : null}
    </div>
  )
}

function eventPayload(event: PatternEvent | undefined): Omit<PatternEvent, 'meta'> | undefined {
  if (!event) return undefined
  const payload = { ...event }
  delete (payload as { meta?: unknown }).meta
  return payload as Omit<PatternEvent, 'meta'>
}

function eventReason(event: PatternEvent | undefined): string | undefined {
  return event?.meta?.reason
}

const treeviewData = {
  items: {
    docs: { label: 'Docs' },
    overview: { label: 'Overview' },
    api: { label: 'API' },
  },
  relations: {
    rootKeys: ['docs'],
    childrenByKey: { docs: ['overview', 'api'] },
  },
  state: {
    activeKey: 'docs',
    selectedKeys: ['overview'],
    expandedKeys: ['docs'],
    levelByKey: { docs: 1, overview: 2, api: 2 },
    posInSetByKey: { docs: 1, overview: 1, api: 2 },
    setSizeByKey: { docs: 1, overview: 2, api: 2 },
  },
  refs: { label: 'Documentation tree' },
} satisfies PatternData

const tabsData: PatternData = {
  items: {
    'tab-overview': { label: 'Overview' },
    'tab-api': { label: 'API' },
    'panel-overview': { label: 'Overview panel' },
    'panel-api': { label: 'API panel' },
  },
  relations: {
    rootKeys: ['tab-overview', 'tab-api'],
    controlsByKey: {
      'tab-overview': ['panel-overview'],
      'tab-api': ['panel-api'],
    },
    ownerByKey: {
      'panel-overview': 'tab-overview',
      'panel-api': 'tab-api',
    },
  },
  state: {
    activeKey: 'tab-overview',
    selectedKeys: ['tab-overview'],
  },
  refs: { label: 'Documentation tabs' },
}

const comboboxData = {
  items: {
    combobox: { label: 'Search' },
    alpha: { label: 'Alpha' },
    beta: { label: 'Beta' },
  },
  state: {
    activeKey: 'combobox',
    expandedKeys: [],
    selectedKeys: [],
  },
  refs: { label: 'Search options' },
} satisfies PatternData

const dialogData = {
  items: {
    trigger: { label: 'Open dialog', kind: 'dialog' },
    modal: { label: 'Settings dialog' },
    title: { label: 'Settings' },
    description: { label: 'Configure settings' },
    cancel: { label: 'Cancel' },
    submit: { label: 'Save' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: {
      trigger: ['modal'],
      modal: ['description'],
    },
    ownerByKey: { modal: 'title' },
  },
  state: {
    activeKey: 'trigger',
    expandedKeys: ['trigger'],
  },
} satisfies PatternData

const listboxData = {
  items: {
    one: { label: 'One' },
    two: { label: 'Two' },
    three: { label: 'Three' },
  },
  relations: {
    rootKeys: ['one', 'two', 'three'],
  },
  state: {
    activeKey: 'one',
    selectedKeys: ['one'],
    disabledKeys: ['three'],
    posInSetByKey: { one: 1, two: 2, three: 3 },
    setSizeByKey: { one: 3, two: 3, three: 3 },
  },
  refs: { label: 'Number list' },
} satisfies PatternData

const menuButtonBaseData = {
  items: {
    trigger: { label: 'Actions' },
    menu: { label: 'Actions menu' },
    copy: { label: 'Copy' },
    paste: { label: 'Paste' },
    delete: { label: 'Delete' },
  },
  relations: {
    rootKeys: ['trigger'],
    childrenByKey: {
      trigger: ['menu'],
      menu: ['copy', 'paste', 'delete'],
    },
    controlsByKey: { trigger: ['menu'] },
    ownerByKey: { menu: 'trigger' },
  },
  state: {
    activeKey: 'copy',
    disabledKeys: ['paste'],
  },
} satisfies PatternData

const menuButtonClosedData = menuButtonBaseData
const menuButtonOpenData = {
  ...menuButtonBaseData,
  state: {
    ...menuButtonBaseData.state,
    expandedKeys: ['trigger'],
  },
} satisfies PatternData
