import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  useComboboxPattern,
  useDialogPattern,
  useGridPattern,
  useListboxPattern,
  useMenuPattern,
  useMenuButtonPattern,
  useMenubarPattern,
  useTabsPattern,
  useTreegridPattern,
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

  it('keeps grid navigation, sorting, and edit events on the public hook surface', () => {
    const navigationEvents: PatternEvent[] = []
    const { unmount } = render(<GridContractHost data={gridData} onEvent={(event) => navigationEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('grid'), { key: ' ', ctrlKey: true })
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })

    expect(navigationEvents.map(eventPayload)).toEqual([
      { type: 'navigate', direction: 'right' },
      { type: 'selectColumn' },
      { type: 'sort', key: 'name', sort: 'descending' },
    ])
    expect(navigationEvents.slice(0, 2).map(eventReason)).toEqual(['keyboard', 'keyboard'])

    unmount()

    const editEvents: PatternEvent[] = []
    render(<GridContractHost data={gridEditData} onEvent={(event) => editEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })

    expect(editEvents.map(eventPayload)).toEqual([
      { type: 'editStart', key: 'alpha-value', value: 'Draft' },
    ])
  })

  it('keeps treegrid collapse and row selection events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<TreegridContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('treegrid'), { key: 'ArrowLeft' })
    fireEvent.keyDown(screen.getByRole('treegrid'), { key: ' ', shiftKey: true })

    expect(events.map(eventPayload)).toEqual([
      { type: 'expandActiveRow', expanded: false },
      { type: 'selectRow' },
    ])
    expect(events.map(eventReason)).toEqual(['keyboard', 'keyboard'])
  })

  it('keeps menubar root and submenu keyboard events on the public hook surface', () => {
    const rootEvents: PatternEvent[] = []
    render(<MenubarContractHost data={menubarData} onEvent={(event) => rootEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menubar'), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'File' }), { key: 'ArrowDown' })

    expect(rootEvents.map(eventPayload)).toEqual([
      { type: 'navigate', direction: 'next' },
      { type: 'expand', key: 'file', expanded: true },
      { type: 'focus', key: 'new' },
    ])
    expect(rootEvents.map(eventReason)).toEqual(['keyboard', undefined, 'keyboard'])

    const submenuEvents: PatternEvent[] = []
    render(<MenubarContractHost data={menubarOpenData} onEvent={(event) => submenuEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    expect(submenuEvents.map(eventPayload)).toEqual([
      { type: 'expand', key: 'file', expanded: false },
      { type: 'focus', key: 'file' },
    ])
    expect(submenuEvents.map(eventReason)).toEqual(['keyboard', 'focus'])
  })

  it('keeps standalone menu keyboard activation and dismiss events on the public hook surface', () => {
    const keyboardEvents: PatternEvent[] = []
    const { unmount } = render(<MenuContractHost onEvent={(event) => keyboardEvents.push(event)} />)
    keyboardEvents.length = 0

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' })

    expect(keyboardEvents.map(eventPayload)).toEqual([
      { type: 'activate', key: 'copy' },
      { type: 'dismiss', key: 'menu' },
    ])
    expect(keyboardEvents.map(eventReason)).toEqual(['keyboard', 'keyboard'])

    unmount()

    const pointerEvents: PatternEvent[] = []
    render(<MenuContractHost onEvent={(event) => pointerEvents.push(event)} />)
    pointerEvents.length = 0

    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))

    expect(pointerEvents.map(eventPayload)).toEqual([
      { type: 'activate', key: 'delete' },
    ])
    expect(pointerEvents.map(eventReason)).toEqual(['pointer'])
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

function GridContractHost({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  const grid = useGridPattern(data, onEvent, { selectionMode: 'multiple' })

  return (
    <div {...grid.gridProps}>
      {grid.rows.map((row) => (
        <div key={row.key} {...row.rowProps}>
          {row.cells.map((cell) => <div key={cell.key} {...cell.cellProps}>{cell.value}</div>)}
        </div>
      ))}
    </div>
  )
}

function TreegridContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const treegrid = useTreegridPattern(treegridData, onEvent, { selectionMode: 'multiple' })

  return (
    <div {...treegrid.treegridProps}>
      {treegrid.rows.map((row) => (
        <div key={row.key} {...row.rowProps}>
          {row.cells.map((cell) => <div key={cell.key} {...cell.cellProps}>{cell.value}</div>)}
        </div>
      ))}
    </div>
  )
}

function MenubarContractHost({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  const menubar = useMenubarPattern(data, onEvent)

  return (
    <div>
      <div {...menubar.rootProps}>
        {menubar.rootItems.map((item) => <div key={item.key} {...item.itemProps}>{item.label}</div>)}
      </div>
      {menubar.expandedRootKeys.map((key) => (
        <div key={key} {...menubar.submenuProps(key)}>
          {menubar.itemsFor(key).map((item) => <div key={item.key} {...item.itemProps}>{item.label}</div>)}
        </div>
      ))}
    </div>
  )
}

function MenuContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const menu = useMenuPattern(menuData, onEvent, { open: true, dismissOnInteractOutside: false })

  return (
    <div {...menu.menuProps}>
      {menu.items.map((item) => <div key={item.key} {...item.itemProps}>{item.label}</div>)}
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

const gridData = {
  items: {
    rowAlpha: { label: 'Alpha row' },
    rowBeta: { label: 'Beta row' },
    name: { label: 'Name', kind: 'columnheader', sortable: true },
    status: { label: 'Status', kind: 'columnheader' },
    'alpha-name': { label: 'Alpha' },
    'alpha-status': { label: 'Ready' },
    'beta-name': { label: 'Beta' },
    'beta-status': { label: 'Queued' },
  },
  relations: {
    rowKeys: ['rowAlpha', 'rowBeta'],
    columnKeys: ['name', 'status'],
    cells: [
      { rowKey: 'rowAlpha', columnKey: 'name', cellKey: 'alpha-name' },
      { rowKey: 'rowAlpha', columnKey: 'status', cellKey: 'alpha-status' },
      { rowKey: 'rowBeta', columnKey: 'name', cellKey: 'beta-name' },
      { rowKey: 'rowBeta', columnKey: 'status', cellKey: 'beta-status' },
    ],
  },
  state: {
    activeKey: 'name',
    selectedKeys: ['name'],
    sortByKey: { name: 'ascending' },
    rowIndexByKey: {
      rowAlpha: 1,
      rowBeta: 2,
      'alpha-name': 1,
      'alpha-status': 1,
      'beta-name': 2,
      'beta-status': 2,
    },
    columnIndexByKey: {
      name: 1,
      status: 2,
      'alpha-name': 1,
      'alpha-status': 2,
      'beta-name': 1,
      'beta-status': 2,
    },
    rowCount: 2,
    colCount: 2,
  },
  refs: { label: 'Resource grid' },
} satisfies PatternData

const gridEditData = {
  ...gridData,
  state: {
    ...gridData.state,
    activeKey: 'alpha-value',
    editableKeys: ['alpha-value'],
    valueByKey: { 'alpha-value': 'Draft' },
  },
  items: {
    ...gridData.items,
    value: { label: 'Value', kind: 'columnheader' },
    'alpha-value': { label: 'Draft' },
    'beta-value': { label: 'Later' },
  },
  relations: {
    rowKeys: ['rowAlpha', 'rowBeta'],
    columnKeys: ['name', 'value'],
    cells: [
      { rowKey: 'rowAlpha', columnKey: 'name', cellKey: 'alpha-name' },
      { rowKey: 'rowAlpha', columnKey: 'value', cellKey: 'alpha-value' },
      { rowKey: 'rowBeta', columnKey: 'name', cellKey: 'beta-name' },
      { rowKey: 'rowBeta', columnKey: 'value', cellKey: 'beta-value' },
    ],
  },
} satisfies PatternData

const treegridData = {
  items: {
    parent: { label: 'Parent' },
    child: { label: 'Child' },
    name: { label: 'Name' },
    status: { label: 'Status' },
    'parent-name': { label: 'Parent name' },
    'parent-status': { label: 'Ready' },
    'child-name': { label: 'Child name' },
    'child-status': { label: 'Queued' },
  },
  relations: {
    rootKeys: ['parent'],
    childrenByKey: { parent: ['child'] },
    rowKeys: ['parent', 'child'],
    columnKeys: ['name', 'status'],
    cells: [
      { rowKey: 'parent', columnKey: 'name', cellKey: 'parent-name' },
      { rowKey: 'parent', columnKey: 'status', cellKey: 'parent-status' },
      { rowKey: 'child', columnKey: 'name', cellKey: 'child-name' },
      { rowKey: 'child', columnKey: 'status', cellKey: 'child-status' },
    ],
  },
  state: {
    activeKey: 'parent-name',
    selectedKeys: ['parent-name'],
    expandedKeys: ['parent'],
    rowIndexByKey: {
      parent: 1,
      child: 2,
      'parent-name': 1,
      'parent-status': 1,
      'child-name': 2,
      'child-status': 2,
    },
    columnIndexByKey: {
      'parent-name': 1,
      'parent-status': 2,
      'child-name': 1,
      'child-status': 2,
    },
    levelByKey: { parent: 1, child: 2 },
    rowCount: 2,
    colCount: 2,
  },
  refs: { label: 'Resource treegrid' },
} satisfies PatternData

const menubarData = {
  items: {
    file: { label: 'File' },
    edit: { label: 'Edit' },
    new: { label: 'New' },
    open: { label: 'Open' },
    undo: { label: 'Undo' },
    redo: { label: 'Redo' },
  },
  relations: {
    rootKeys: ['file', 'edit'],
    childrenByKey: {
      file: ['new', 'open'],
      edit: ['undo', 'redo'],
    },
  },
  state: {
    activeKey: 'file',
  },
  refs: { label: 'Application menu' },
} satisfies PatternData

const menubarOpenData = {
  ...menubarData,
  state: {
    activeKey: 'new',
    expandedKeys: ['file'],
  },
} satisfies PatternData

const menuData = {
  items: {
    menu: { label: 'Actions menu' },
    copy: { label: 'Copy' },
    delete: { label: 'Delete' },
  },
  relations: {
    rootKeys: ['menu'],
    childrenByKey: { menu: ['copy', 'delete'] },
    ownerByKey: { menu: 'menu' },
  },
  state: {
    activeKey: 'copy',
  },
  refs: { label: 'Actions' },
} satisfies PatternData
