import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  useAccordionPattern,
  useAlertDialogPattern,
  useBreadcrumbPattern,
  useButtonPattern,
  useCarouselPattern,
  useCheckboxPattern,
  useComboboxPattern,
  useControlledAlertDialogPattern,
  useControlledDialogPattern,
  useDialogPattern,
  useDisclosurePattern,
  useFeedPattern,
  useGridPattern,
  useLinkPattern,
  useListboxPattern,
  useMenuPattern,
  useMenuButtonPattern,
  useMenubarPattern,
  useRadioGroupPattern,
  useSliderPattern,
  useSpinbuttonPattern,
  useSwitchPattern,
  useTabsPattern,
  useTablePattern,
  useToolbarPattern,
  useTooltipPattern,
  useTreegridPattern,
  useTreeviewPattern,
  useWindowSplitterPattern,
  type PatternData,
  type PatternEvent,
} from '../react'

type PatternEventPayload<T extends PatternEvent = PatternEvent> = T extends PatternEvent ? Omit<T, 'meta'> : never

describe('React public event contracts', () => {
  it('keeps treeview keyboard and indicator events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<TreeviewContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowDown' })
    fireEvent.click(screen.getByRole('button', { name: 'toggle docs' }))

    expectEventTrace(events, [
      { type: 'navigate', direction: 'next' },
      { type: 'expand', key: 'docs', expanded: false },
    ], ['keyboard', 'pointer'])
  })

  it('keeps tabs keyboard and automatic focus events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<TabsContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown' })
    fireEvent.focus(screen.getByRole('tab', { name: 'API' }))

    expectEventTrace([events[0]], [{ type: 'navigate', direction: 'next' }], ['keyboard'])
    expectEventTrace(events.slice(1), [
      { type: 'focus', key: 'tab-api' },
      { type: 'select', keys: ['tab-api'], anchorKey: 'tab-api', extentKey: 'tab-api' },
    ], ['focus', 'focus'])
  })

  it('keeps combobox input and open keyboard events on the public hook surface', () => {
    const events: PatternEvent[] = []
    const { unmount } = render(<ComboboxContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'alp' } })
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })

    expectEventTrace([events[0]], [{ type: 'inputValue', key: 'combobox', value: 'alp', inline: false }], ['keyboard'])
    expectEventTrace(events.slice(1), [
      { type: 'expand', key: 'combobox', expanded: true },
      { type: 'navigate', direction: 'first' },
    ], ['keyboard', 'keyboard'])

    unmount()

    const pointerEvents: PatternEvent[] = []
    render(<ComboboxContractHost data={comboboxOpenData} onEvent={(event) => pointerEvents.push(event)} />)

    fireEvent.mouseDown(screen.getByRole('option', { name: 'Alpha' }))

    expectEventTrace(pointerEvents, [
      { type: 'select', keys: ['alpha'], anchorKey: 'alpha', extentKey: 'alpha' },
      { type: 'expand', key: 'combobox', expanded: false },
      { type: 'commitValue', key: 'alpha', value: 'Alpha' },
    ], ['pointer', 'pointer', 'pointer'])
  })

  it('keeps dialog Escape and overlay close events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<DialogContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    fireEvent.mouseDown(screen.getByTestId('dialog-overlay'))

    expectEventTrace(events, [
      { type: 'expand', key: 'trigger', expanded: false },
      { type: 'expand', key: 'trigger', expanded: false },
    ], ['keyboard', 'pointer'])
  })

  it('keeps alert dialog activation and close events on the public hook surface', () => {
    const keyboardEvents: PatternEvent[] = []
    const { unmount } = render(<AlertDialogContractHost onEvent={(event) => keyboardEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })

    expectEventTrace(keyboardEvents, [
      { type: 'activate', key: 'cancel' },
      { type: 'expand', key: 'trigger', expanded: false },
    ], ['keyboard', 'keyboard'])

    unmount()

    const pointerEvents: PatternEvent[] = []
    render(<AlertDialogContractHost onEvent={(event) => pointerEvents.push(event)} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expectEventTrace(pointerEvents, [
      { type: 'activate', key: 'confirm' },
      { type: 'expand', key: 'trigger', expanded: false },
    ], ['pointer', 'pointer'])
  })

  it('keeps listbox keyboard navigation and multi-select pointer events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<ListboxContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'ArrowDown' })
    fireEvent.click(screen.getByRole('option', { name: 'Two' }))

    expectEventTrace(events, [
      { type: 'navigate', direction: 'next' },
      { type: 'select', keys: ['two'], anchorKey: 'two', extentKey: 'two' },
    ], ['keyboard', 'pointer'])
  })

  it('keeps menu button open and activation events on the public hook surface', () => {
    const openingEvents: PatternEvent[] = []
    render(<MenuButtonContractHost data={menuButtonClosedData} onEvent={(event) => openingEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowDown' })

    expectEventTrace(openingEvents, [
      { type: 'expand', key: 'trigger', expanded: true },
      { type: 'focus', key: 'copy' },
    ], ['open', 'open'])

    const activationEvents: PatternEvent[] = []
    render(<MenuButtonContractHost data={menuButtonOpenData} onEvent={(event) => activationEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' })

    expectEventTrace(activationEvents, [
      { type: 'activate', key: 'copy' },
      { type: 'expand', key: 'trigger', expanded: false },
    ], ['keyboard', 'keyboard'])
  })

  it('keeps grid navigation, sorting, and edit events on the public hook surface', () => {
    const navigationEvents: PatternEvent[] = []
    const { unmount } = render(<GridContractHost data={gridData} onEvent={(event) => navigationEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('grid'), { key: ' ', ctrlKey: true })
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })

    expectEventTrace(navigationEvents, [
      { type: 'navigate', direction: 'right' },
      { type: 'selectColumn' },
      { type: 'sort', key: 'name', sort: 'descending' },
    ], ['keyboard', 'keyboard', 'keyboard'])

    unmount()

    const editEvents: PatternEvent[] = []
    render(<GridContractHost data={gridEditData} onEvent={(event) => editEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })

    expectEventTrace(editEvents, [
      { type: 'editStart', key: 'alpha-value', value: 'Draft' },
    ], ['keyboard'])
  })

  it('keeps treegrid collapse and row selection events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<TreegridContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('treegrid'), { key: 'ArrowLeft' })
    fireEvent.keyDown(screen.getByRole('treegrid'), { key: ' ', shiftKey: true })

    expectEventTrace(events, [
      { type: 'expandActiveRow', expanded: false },
      { type: 'selectRow' },
    ], ['keyboard', 'keyboard'])
  })

  it('keeps menubar root and submenu keyboard events on the public hook surface', () => {
    const rootEvents: PatternEvent[] = []
    render(<MenubarContractHost data={menubarData} onEvent={(event) => rootEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menubar'), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'File' }), { key: 'ArrowDown' })

    expectEventTrace(rootEvents, [
      { type: 'navigate', direction: 'next' },
      { type: 'expand', key: 'file', expanded: true },
      { type: 'focus', key: 'new' },
    ], ['keyboard', 'keyboard', 'keyboard'])

    const submenuEvents: PatternEvent[] = []
    render(<MenubarContractHost data={menubarOpenData} onEvent={(event) => submenuEvents.push(event)} />)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    expectEventTrace(submenuEvents, [
      { type: 'expand', key: 'file', expanded: false },
      { type: 'focus', key: 'file' },
    ], ['keyboard', 'focus'])
  })

  it('keeps standalone menu keyboard activation and dismiss events on the public hook surface', () => {
    const keyboardEvents: PatternEvent[] = []
    const { unmount } = render(<MenuContractHost onEvent={(event) => keyboardEvents.push(event)} />)
    keyboardEvents.length = 0

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' })

    expectEventTrace(keyboardEvents, [
      { type: 'activate', key: 'copy' },
      { type: 'dismiss', key: 'menu' },
    ], ['keyboard', 'keyboard'])

    unmount()

    const pointerEvents: PatternEvent[] = []
    render(<MenuContractHost onEvent={(event) => pointerEvents.push(event)} />)
    pointerEvents.length = 0

    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))

    expectEventTrace(pointerEvents, [
      { type: 'activate', key: 'delete' },
    ], ['pointer'])
  })

  it('keeps simple control keyboard and pointer events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<SimpleControlsContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('button', { name: 'Submit' }), { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('checkbox', { name: 'Agree' }), { key: ' ' })
    fireEvent.keyDown(screen.getByRole('switch', { name: 'Power' }), { key: ' ' })
    fireEvent.click(screen.getByRole('link', { name: 'Docs' }))

    expectEventTrace(events, [
      { type: 'press', key: 'submit', pressed: true },
      { type: 'activate', key: 'submit' },
      { type: 'check', key: 'agree', checked: true },
      { type: 'check', key: 'power', checked: true },
      { type: 'activate', key: 'docs' },
    ], ['keyboard', 'keyboard', 'keyboard', 'keyboard', 'pointer'])
  })

  it('keeps breadcrumb pointer activation on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<BreadcrumbContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.click(screen.getByRole('link', { name: 'API' }))

    expectEventTrace(events, [
      { type: 'activate', key: 'api' },
    ], ['pointer'])
  })

  it('keeps accordion and disclosure expand events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<ExpansionControlsContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('group', { name: 'Sections' }), { key: 'Enter' })
    fireEvent.click(screen.getByRole('button', { name: 'Details' }))

    expectEventTrace(events, [
      { type: 'expand', key: 'section', expanded: true },
      { type: 'expand', key: 'details', expanded: true },
    ], ['keyboard', 'pointer'])
  })

  it('keeps radio group and toolbar navigation events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<CompositeControlsContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('radiogroup', { name: 'Density' }), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('toolbar', { name: 'Formatting' }), { key: 'ArrowRight' })

    expectEventTrace(events, [
      { type: 'navigate', direction: 'next' },
      { type: 'select', keys: ['comfortable'], anchorKey: 'comfortable', extentKey: 'comfortable' },
      { type: 'navigate', direction: 'next' },
    ], ['keyboard', 'keyboard', 'keyboard'])
  })

  it('keeps range widget value events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<RangeControlsContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Volume' }), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'Quantity' }), { key: 'PageUp' })
    fireEvent.click(screen.getByRole('button', { name: 'Increment Quantity' }))
    fireEvent.keyDown(screen.getByRole('separator', { name: 'Resize panel' }), { key: 'Enter' })

    expectEventTrace(events, [
      { type: 'focus', key: 'volume' },
      { type: 'valueStep', key: 'volume', direction: 'increment' },
      { type: 'focus', key: 'quantity' },
      { type: 'valueStep', key: 'quantity', direction: 'incrementLarge' },
      { type: 'focus', key: 'quantity' },
      { type: 'valueStep', key: 'quantity', direction: 'increment' },
      { type: 'focus', key: 'splitter' },
      { type: 'collapse', key: 'splitter' },
    ], [
      'keyboard',
      'keyboard',
      'keyboard',
      'keyboard',
      'pointer',
      'pointer',
      'keyboard',
      'keyboard',
    ])
  })

  it('keeps controlled dialog close metadata on the public hook surface', () => {
    const keyboardEvents: PatternEvent[] = []
    const keyboardChanges: OpenChangeRecord[] = []
    const { unmount } = render(<ControlledDialogContractHost onEvent={(event) => keyboardEvents.push(event)} onOpenChange={(change) => keyboardChanges.push(change)} />)

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expectEventTrace(keyboardEvents, [
      { type: 'dismiss', key: 'settingsDialog' },
    ], ['keyboard'])
    expect(keyboardChanges).toEqual([{ open: false, reason: 'keyboard', key: 'settingsDialog' }])

    unmount()

    const pointerEvents: PatternEvent[] = []
    const pointerChanges: OpenChangeRecord[] = []
    render(<ControlledDialogContractHost onEvent={(event) => pointerEvents.push(event)} onOpenChange={(change) => pointerChanges.push(change)} />)

    fireEvent.mouseDown(screen.getByTestId('controlled-dialog-overlay'))

    expectEventTrace(pointerEvents, [
      { type: 'dismiss', key: 'settingsDialog' },
    ], ['pointer'])
    expect(pointerChanges).toEqual([{ open: false, reason: 'pointer', key: 'settingsDialog' }])
  })

  it('keeps controlled alert dialog activation and close metadata on the public hook surface', () => {
    const keyboardEvents: PatternEvent[] = []
    const keyboardChanges: OpenChangeRecord[] = []
    const { unmount } = render(<ControlledAlertDialogContractHost onEvent={(event) => keyboardEvents.push(event)} onOpenChange={(change) => keyboardChanges.push(change)} />)

    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })

    expectEventTrace(keyboardEvents, [
      { type: 'activate', key: 'cancel' },
      { type: 'dismiss', key: 'warningDialog' },
    ], ['keyboard', 'keyboard'])
    expect(keyboardChanges).toEqual([{ open: false, reason: 'keyboard', key: 'warningDialog' }])

    unmount()

    const pointerEvents: PatternEvent[] = []
    const pointerChanges: OpenChangeRecord[] = []
    render(<ControlledAlertDialogContractHost onEvent={(event) => pointerEvents.push(event)} onOpenChange={(change) => pointerChanges.push(change)} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expectEventTrace(pointerEvents, [
      { type: 'activate', key: 'confirm' },
      { type: 'dismiss', key: 'warningDialog' },
    ], ['pointer', 'pointer'])
    expect(pointerChanges).toEqual([{ open: false, reason: 'pointer', key: 'warningDialog' }])
  })

  it('keeps table sort, carousel picker, feed, and tooltip events on the public hook surface', () => {
    const events: PatternEvent[] = []
    render(<RemainingFlowContractHost onEvent={(event) => events.push(event)} />)

    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    fireEvent.click(screen.getByRole('button', { name: 'Slide 2' }))
    fireEvent.keyDown(screen.getByRole('feed'), { key: 'PageDown' })
    fireEvent.focus(screen.getAllByRole('article')[1]!)
    fireEvent.focus(screen.getByRole('button', { name: 'Help' }))
    fireEvent.keyDown(screen.getByRole('button', { name: 'Help' }), { key: 'Escape' })

    expectEventTrace(events, [
      { type: 'sort', key: 'name', sort: 'descending' },
      { type: 'navigate', direction: 'previous' },
      { type: 'select', keys: ['slide2'], anchorKey: 'slide2', extentKey: 'slide2' },
      { type: 'navigate', direction: 'next' },
      { type: 'focus', key: 'second' },
      { type: 'expand', key: 'help', expanded: true },
      { type: 'expand', key: 'help', expanded: false },
    ], ['pointer', 'pointer', 'pointer', 'keyboard', 'focus', 'focus', 'keyboard'])
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

function ComboboxContractHost({ data = comboboxData, onEvent }: { data?: PatternData; onEvent: (event: PatternEvent) => void }) {
  const combobox = useComboboxPattern(data, onEvent)

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

function AlertDialogContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const alertDialog = useAlertDialogPattern(alertDialogData, onEvent)

  return (
    <div>
      <button type="button" {...alertDialog.triggerProps}>{alertDialog.labelOf('trigger')}</button>
      <div data-testid="alertdialog-overlay" {...alertDialog.overlayProps}>
        <div {...alertDialog.dialogProps}>
          <h2 {...alertDialog.titleProps}>{alertDialog.labelOf('title')}</h2>
          <p {...alertDialog.descriptionProps}>{alertDialog.labelOf('description')}</p>
          <button type="button" {...alertDialog.confirmProps}>{alertDialog.labelOf('confirm')}</button>
          <button type="button" {...alertDialog.cancelProps}>{alertDialog.labelOf('cancel')}</button>
        </div>
      </div>
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

function SimpleControlsContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const button = useButtonPattern(buttonData, onEvent)
  const checkbox = useCheckboxPattern(checkboxData, onEvent)
  const switchRuntime = useSwitchPattern(switchData, onEvent)
  const link = useLinkPattern(linkData, onEvent)

  return (
    <div>
      <button type="button" {...button.rootProps}>{button.label}</button>
      {checkbox.renderItems.map((item) => <div key={item.key} {...item.checkboxProps}>{item.label}</div>)}
      {switchRuntime.renderItems.map((item) => <div key={item.key} {...item.switchProps}>{item.label}</div>)}
      <a href={link.href} {...link.linkProps}>{link.label}</a>
    </div>
  )
}

function BreadcrumbContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const breadcrumb = useBreadcrumbPattern(breadcrumbData, onEvent)

  return (
    <nav {...breadcrumb.rootProps}>
      <ol {...breadcrumb.listProps}>
        {breadcrumb.items.map((item) => (
          <li key={item.key}>
            <a {...item.crumbProps}>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function ExpansionControlsContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const accordion = useAccordionPattern(accordionData, onEvent)
  const disclosure = useDisclosurePattern(disclosureData, onEvent)

  return (
    <div>
      <div {...accordion.rootProps}>
        {accordion.renderItems.map((item) => (
          <div key={item.key}>
            <button type="button" {...item.headerProps}>{item.label}</button>
            {item.panelProps ? <div {...item.panelProps}>Panel</div> : null}
          </div>
        ))}
      </div>
      <button type="button" {...disclosure.triggerProps}>{disclosureData.items.details?.label}</button>
      <div {...disclosure.panelProps}>Details panel</div>
    </div>
  )
}

function CompositeControlsContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const radio = useRadioGroupPattern(radioData, onEvent)
  const toolbar = useToolbarPattern(toolbarData, onEvent)

  return (
    <div>
      <div {...radio.rootProps}>
        {radio.renderItems.map((item) => <div key={item.key} {...item.radioProps}>{item.label}</div>)}
      </div>
      <div {...toolbar.rootProps}>
        {toolbar.renderItems.map((item) => <button key={item.key} type="button" {...item.itemProps}>{item.label}</button>)}
      </div>
    </div>
  )
}

function RangeControlsContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const slider = useSliderPattern(sliderData, onEvent)
  const spinbutton = useSpinbuttonPattern(spinbuttonData, onEvent)
  const splitter = useWindowSplitterPattern(windowSplitterData, onEvent, { min: 0, max: 100 })

  return (
    <div>
      {slider.renderItems.map((item) => <div key={item.key} {...item.sliderProps}>{item.label}</div>)}
      {spinbutton.renderItems.map((item) => (
        <div key={item.key}>
          <div {...item.spinbuttonProps}>{item.label}</div>
          <button type="button" {...item.incrementButtonProps}>+</button>
        </div>
      ))}
      <div {...splitter.separatorProps}>Resize panel</div>
    </div>
  )
}

interface OpenChangeRecord {
  open: boolean
  reason: string | undefined
  key: string | undefined
}

function ControlledDialogContractHost({
  onEvent,
  onOpenChange,
}: {
  onEvent: (event: PatternEvent) => void
  onOpenChange: (change: OpenChangeRecord) => void
}) {
  const dialog = useControlledDialogPattern(controlledDialogData, {
    open: true,
    onEvent,
    onOpenChange: (open, meta) => onOpenChange({ open, reason: meta.reason, key: meta.key }),
  })

  return (
    <div data-testid="controlled-dialog-overlay" {...dialog.overlayProps}>
      <div {...dialog.dialogProps}>
        <h2 {...dialog.titleProps}>{controlledDialogData.items.settingsTitle?.label}</h2>
        <p {...dialog.descriptionProps}>{controlledDialogData.items.settingsDescription?.label}</p>
        <button type="button" {...dialog.cancelProps}>{controlledDialogData.items.cancel?.label}</button>
        <button type="button" {...dialog.submitProps}>{controlledDialogData.items.submit?.label}</button>
      </div>
    </div>
  )
}

function ControlledAlertDialogContractHost({
  onEvent,
  onOpenChange,
}: {
  onEvent: (event: PatternEvent) => void
  onOpenChange: (change: OpenChangeRecord) => void
}) {
  const alertDialog = useControlledAlertDialogPattern(controlledAlertDialogData, {
    open: true,
    onEvent,
    onOpenChange: (open, meta) => onOpenChange({ open, reason: meta.reason, key: meta.key }),
  })

  return (
    <div data-testid="controlled-alertdialog-overlay" {...alertDialog.overlayProps}>
      <div {...alertDialog.dialogProps}>
        <h2 {...alertDialog.titleProps}>{controlledAlertDialogData.items.alertTitle?.label}</h2>
        <p {...alertDialog.descriptionProps}>{controlledAlertDialogData.items.alertDescription?.label}</p>
        <button type="button" {...alertDialog.confirmProps}>{controlledAlertDialogData.items.confirm?.label}</button>
        <button type="button" {...alertDialog.cancelProps}>{controlledAlertDialogData.items.cancel?.label}</button>
      </div>
    </div>
  )
}

function RemainingFlowContractHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const table = useTablePattern(tableData, onEvent)
  const carousel = useCarouselPattern(carouselData, onEvent)
  const feed = useFeedPattern(feedData, onEvent)
  const tooltip = useTooltipPattern(tooltipData, onEvent)

  return (
    <div>
      <div {...table.tableProps}>
        {table.rows.map((row) => (
          <div key={row.key} {...row.rowProps}>
            {row.cells.map((cell) => <div key={cell.key} {...cell.cellProps}>{cell.label}</div>)}
          </div>
        ))}
      </div>
      <div {...carousel.rootProps}>
        <button type="button" {...carousel.prevProps}>{carouselData.items.prev?.label}</button>
        <button type="button" {...carousel.nextProps}>{carouselData.items.next?.label}</button>
        {carousel.slides.map((slide) => <button key={slide.key} type="button" {...slide.pickerProps}>{carouselData.items[slide.key]?.label}</button>)}
      </div>
      <div {...feed.feedProps}>
        {feed.articles.map((article) => <article key={article.key} {...article.articleProps}>{article.label}</article>)}
      </div>
      <button type="button" {...tooltip.triggerProps}>{tooltip.triggerLabel}</button>
    </div>
  )
}

function eventPayload(event: PatternEvent | undefined): PatternEventPayload | undefined {
  if (!event) return undefined
  const payload = { ...event }
  delete (payload as { meta?: unknown }).meta
  return payload as PatternEventPayload
}

function eventReason(event: PatternEvent | undefined): string | undefined {
  return event?.meta?.reason
}

function expectEventTrace(
  events: readonly (PatternEvent | undefined)[],
  payloads: readonly (PatternEventPayload | undefined)[],
  reasons: readonly (string | undefined)[],
) {
  expect(events.map(eventPayload)).toEqual(payloads)
  expect(events.map(eventReason)).toEqual(reasons)
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

const comboboxOpenData = {
  ...comboboxData,
  state: {
    ...comboboxData.state,
    activeKey: 'alpha',
    expandedKeys: ['combobox'],
  },
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

const alertDialogData = {
  items: {
    trigger: { label: 'Delete item', kind: 'dialog' },
    warningDialog: { label: 'Delete warning' },
    title: { label: 'Delete item?' },
    description: { label: 'This cannot be undone.' },
    confirm: { label: 'Delete' },
    cancel: { label: 'Cancel' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: {
      trigger: ['warningDialog'],
      warningDialog: ['description'],
    },
    ownerByKey: { warningDialog: 'title' },
  },
  state: {
    activeKey: 'trigger',
    expandedKeys: ['trigger'],
  },
  refs: { initialFocusKey: 'cancel' },
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

const buttonData = {
  items: {
    submit: { label: 'Submit' },
  },
  relations: {
    rootKeys: ['submit'],
  },
  state: {
    activeKey: 'submit',
    pressedByKey: { submit: false },
  },
} satisfies PatternData

const checkboxData = {
  items: {
    agree: { label: 'Agree' },
  },
  relations: {
    rootKeys: ['agree'],
  },
  state: {
    activeKey: 'agree',
    checkedByKey: { agree: false },
  },
} satisfies PatternData

const switchData = {
  items: {
    power: { label: 'Power' },
  },
  relations: {
    rootKeys: ['power'],
  },
  state: {
    activeKey: 'power',
    checkedByKey: { power: false },
  },
} satisfies PatternData

const linkData = {
  items: {
    docs: { label: 'Docs', href: '#docs' },
  },
  relations: {
    rootKeys: ['docs'],
  },
  state: {
    activeKey: 'docs',
  },
} satisfies PatternData

const breadcrumbData = {
  items: {
    home: { label: 'Home', href: '#home' },
    api: { label: 'API', href: '#api' },
  },
  relations: {
    rootKeys: ['home', 'api'],
  },
  state: {
    currentByKey: { api: 'page' },
  },
  refs: { label: 'Breadcrumb' },
} satisfies PatternData

const accordionData = {
  items: {
    section: { label: 'Section' },
    sectionPanel: { label: 'Section panel' },
  },
  relations: {
    rootKeys: ['section'],
    controlsByKey: { section: ['sectionPanel'] },
    ownerByKey: { sectionPanel: 'section' },
  },
  state: {
    activeKey: 'section',
    expandedKeys: [],
  },
  refs: { label: 'Sections' },
} satisfies PatternData

const disclosureData = {
  items: {
    details: { label: 'Details' },
    detailsPanel: { label: 'Details panel' },
  },
  relations: {
    rootKeys: ['details'],
    controlsByKey: { details: ['detailsPanel'] },
    ownerByKey: { detailsPanel: 'details' },
  },
  state: {
    activeKey: 'details',
    expandedKeys: [],
  },
} satisfies PatternData

const radioData = {
  items: {
    compact: { label: 'Compact' },
    comfortable: { label: 'Comfortable' },
  },
  relations: {
    rootKeys: ['compact', 'comfortable'],
  },
  state: {
    activeKey: 'compact',
    selectedKeys: ['compact'],
  },
  refs: { label: 'Density' },
} satisfies PatternData

const toolbarData = {
  items: {
    bold: { label: 'Bold', kind: 'toggleButton' },
    italic: { label: 'Italic', kind: 'toggleButton' },
  },
  relations: {
    rootKeys: ['bold', 'italic'],
  },
  state: {
    activeKey: 'bold',
    pressedByKey: { bold: true, italic: false },
  },
  refs: { label: 'Formatting' },
} satisfies PatternData

const sliderData = {
  items: {
    volume: { label: 'Volume', valuemin: 0, valuemax: 10 },
  },
  relations: {
    rootKeys: ['volume'],
  },
  state: {
    activeKey: 'volume',
    valueByKey: { volume: 4 },
  },
} satisfies PatternData

const spinbuttonData = {
  items: {
    quantity: { label: 'Quantity', valuemin: 0, valuemax: 20 },
  },
  relations: {
    rootKeys: ['quantity'],
  },
  state: {
    activeKey: 'quantity',
    valueByKey: { quantity: 2 },
  },
} satisfies PatternData

const windowSplitterData = {
  items: {
    splitter: { label: 'Resize panel' },
    panel: { label: 'Resizable panel' },
  },
  relations: {
    rootKeys: ['splitter'],
    controlsByKey: { splitter: ['panel'] },
  },
  state: {
    activeKey: 'splitter',
    valueByKey: { splitter: 60 },
  },
} satisfies PatternData

const controlledDialogData = {
  items: {
    settingsDialog: { label: 'Controlled settings' },
    settingsTitle: { label: 'Settings' },
    settingsDescription: { label: 'Configure settings' },
    cancel: { label: 'Cancel' },
    submit: { label: 'Save' },
  },
  relations: {
    controlsByKey: {
      settingsDialog: ['settingsDescription'],
    },
    ownerByKey: { settingsDialog: 'settingsTitle' },
  },
  refs: { initialFocusKey: 'cancel' },
} satisfies PatternData

const controlledAlertDialogData = {
  items: {
    trigger: { label: 'Delete item', kind: 'dialog' },
    warningDialog: { label: 'Delete warning' },
    alertTitle: { label: 'Delete item?' },
    alertDescription: { label: 'This cannot be undone.' },
    confirm: { label: 'Delete' },
    cancel: { label: 'Cancel' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: {
      trigger: ['warningDialog'],
      warningDialog: ['alertDescription'],
    },
    ownerByKey: { warningDialog: 'alertTitle' },
  },
  refs: { initialFocusKey: 'cancel' },
} satisfies PatternData

const tableData = {
  items: {
    row: { label: 'Row' },
    name: { label: 'Name', kind: 'columnheader' },
    value: { label: 'Value', kind: 'cell' },
  },
  relations: {
    rowKeys: ['row'],
    columnKeys: ['name', 'value'],
    cells: [
      { rowKey: 'row', columnKey: 'name', cellKey: 'name' },
      { rowKey: 'row', columnKey: 'value', cellKey: 'value' },
    ],
  },
  state: {
    sortByKey: { name: 'ascending' },
    rowIndexByKey: { row: 1, name: 1, value: 1 },
    columnIndexByKey: { name: 1, value: 2 },
    rowCount: 1,
    colCount: 2,
  },
  refs: { label: 'Metrics' },
} satisfies PatternData

const carouselData: PatternData = {
  items: {
    prev: { label: 'Previous' },
    next: { label: 'Next' },
    slide1: { label: 'Slide 1', title: 'First slide' },
    slide2: { label: 'Slide 2', title: 'Second slide' },
  },
  relations: {
    rootKeys: ['slide1', 'slide2'],
  },
  state: {
    activeKey: 'slide1',
    selectedKeys: ['slide1'],
    showDots: true,
  },
  refs: { label: 'Featured' },
} satisfies PatternData

const feedData = {
  items: {
    first: { label: 'First article' },
    second: { label: 'Second article' },
  },
  relations: {
    rootKeys: ['first', 'second'],
  },
  state: {
    activeKey: 'first',
    posInSetByKey: { first: 1, second: 2 },
    setSizeByKey: { first: 2, second: 2 },
  },
  refs: { label: 'Updates' },
} satisfies PatternData

const tooltipData = {
  items: {
    help: { label: 'Help' },
    tip: { label: 'Helpful tip' },
  },
  relations: {
    rootKeys: ['help'],
    controlsByKey: { help: ['tip'] },
    ownerByKey: { tip: 'help' },
  },
  state: {
    activeKey: 'help',
    expandedKeys: [],
  },
} satisfies PatternData
