import { fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { registerKernelBuiltins } from '../kernel/kernelBuiltins'
import { defineDomEvent, resolvePartEventBindings, withDefaultReason } from '../kernel/domEventBindings'
import { useAccordionPattern } from '../patterns/accordion/useAccordionPattern'
import { useAlertPattern } from '../patterns/alert/useAlertPattern'
import { useButtonPattern } from '../patterns/button/useButtonPattern'
import { useCheckboxPattern } from '../patterns/checkbox/useCheckboxPattern'
import { Grid } from '../patterns/grid/Grid'
import { useLinkPattern } from '../patterns/link/useLinkPattern'
import { useMenuButtonPattern } from '../patterns/menu/useMenuButtonPattern'
import { useRadioGroupPattern } from '../patterns/radio/useRadioGroupPattern'
import { getSliderRuntimeState, isMultiThumbSlider } from '../patterns/slider/sliderRuntimeState'
import { useSpinbuttonPattern } from '../patterns/spinbutton/useSpinbuttonPattern'
import { useSwitchPattern } from '../patterns/switch/useSwitchPattern'
import { useTablePattern } from '../patterns/table/useTablePattern'
import { useToolbarPattern } from '../patterns/toolbar/useToolbarPattern'
import type { PatternData, PatternEvent } from '../index'

registerKernelBuiltins()

function HookRuntimeHost() {
  const [events, setEvents] = useState<PatternEvent[]>([])
  const radio = useRadioGroupPattern(
    {
      items: { one: { label: 'One' }, two: { label: 'Two' } },
      relations: { rootKeys: ['one', 'two'] },
      state: { activeKey: 'one', selectedKeys: ['one'], disabledKeys: ['two'] },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-radio-' },
  )
  const spin = useSpinbuttonPattern(
    {
      items: { spin: { label: 'Spin' } },
      relations: { rootKeys: ['spin'] },
      state: { activeKey: 'spin', valueByKey: { spin: 3 } },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-spin-' },
  )
  const checkbox = useCheckboxPattern(
    {
      items: { agree: { label: 'Agree' } },
      relations: { rootKeys: ['agree'] },
      state: { activeKey: 'agree', checkedByKey: { agree: 'mixed' }, disabledKeys: [] },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-check-' },
  )
  const switchRuntime = useSwitchPattern(
    {
      items: { power: { label: 'Power' } },
      relations: { rootKeys: ['power'] },
      state: { activeKey: 'power', checkedByKey: { power: false }, disabledKeys: [] },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-switch-' },
  )
  const toolbar = useToolbarPattern(
    {
      items: { bold: { label: 'Bold' } },
      relations: { rootKeys: ['bold'] },
      state: { activeKey: 'bold', selectedKeys: [], disabledKeys: [] },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-tool-' },
  )
  const table = useTablePattern(
    {
      items: {
        name: { label: 'Name column' },
        header: { label: 'Name', kind: 'columnheader' },
        value: { label: 'Value' },
        row: { label: 'Row' },
      },
      relations: {
        rootKeys: ['header', 'value'],
        rowKeys: ['row'],
        columnKeys: ['name', 'value'],
        cells: [
          { rowKey: 'row', columnKey: 'name', cellKey: 'header' },
          { rowKey: 'row', columnKey: 'value', cellKey: 'value' },
        ],
      },
      state: { sortByKey: { header: 'ascending' } },
      refs: { label: 'Metrics' },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-table-' },
  )
  const accordion = useAccordionPattern(
    {
      items: { section: { label: 'Section' } },
      relations: { rootKeys: ['section'] },
      state: { activeKey: 'section', expandedKeys: [], disabledKeys: [] },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-accordion-' },
  )
  const alert = useAlertPattern(
    {
      items: { alert: { label: 'Alert', message: 'Saved' }, dismiss: { label: 'Dismiss' } },
      relations: { rootKeys: ['alert'] },
      state: {},
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-alert-' },
  )
  const button = useButtonPattern(
    {
      items: { submit: { label: 'Submit' } },
      relations: { rootKeys: ['submit'] },
      state: { activeKey: 'submit', pressedByKey: { submit: true } },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-button-' },
  )
  const link = useLinkPattern(
    {
      items: { docs: { label: 'Docs', href: '#docs', variant: 'quiet' } },
      relations: { rootKeys: ['docs'] },
      state: { activeKey: 'docs' },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-link-' },
  )
  const defaultLink = useLinkPattern({
    items: { fallback: {} },
    relations: { rootKeys: ['fallback'] },
    state: {},
  })
  const emptyLink = useLinkPattern({
    items: {},
    relations: { rootKeys: [] },
    state: {},
  })
  const emptyMenuButton = useMenuButtonPattern({
    items: {},
    relations: { rootKeys: [] },
    state: {},
  }, (event) => setEvents((current) => [...current, event]))

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          radio.actions.focus('two')
          radio.actions.select('two')
          spin.actions.focus('spin')
          spin.actions.step('spin', 'increment')
          checkbox.actions.focus('agree')
          checkbox.actions.check('agree', false)
          checkbox.renderItems[0]?.checkboxProps.onFocus?.({} as never)
          checkbox.renderItems[0]?.checkboxProps.onKeyDown?.({ key: ' ', code: 'Space', preventDefault: () => undefined, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, location: 0, nativeEvent: { isComposing: false } } as never)
          checkbox.renderItems[0]?.checkboxProps.onKeyDown?.({ key: 'Escape', code: 'Escape', preventDefault: () => undefined, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, location: 0, nativeEvent: { isComposing: false } } as never)
          switchRuntime.actions.focus('power')
          switchRuntime.actions.check('power', true)
          switchRuntime.renderItems[0]?.switchProps.onFocus?.({} as never)
          switchRuntime.renderItems[0]?.switchProps.onKeyDown?.({ key: ' ', code: 'Space', preventDefault: () => undefined, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, location: 0, nativeEvent: { isComposing: false } } as never)
          switchRuntime.renderItems[0]?.switchProps.onKeyDown?.({ key: 'Escape', code: 'Escape', preventDefault: () => undefined, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, location: 0, nativeEvent: { isComposing: false } } as never)
          toolbar.actions.focus('bold')
          toolbar.actions.select('bold')
          table.headerRow?.cells[0]?.cellProps.onClick?.({} as never)
          accordion.actions.focus('section')
          accordion.actions.toggle('section')
          accordion.actions.expand('section')
          accordion.actions.collapse('section')
          alert.actions.dismiss()
          button.actions.focus()
          button.actions.press(false)
          button.actions.activate()
          link.actions.activate()
        }}
      >
        Run hook runtimes
      </button>
      <output data-testid="hook-runtime">
        {[
          radio.rootProps.role,
          radio.renderItems.length,
          radio.state.activeKey,
          radio.state.selectedKeys.join(','),
          radio.state.disabledKeys.join(','),
          radio.ids.forKey('one'),
          radio.keyToElementId('two'),
          spin.rootProps.role ?? 'none',
          spin.renderItems.length,
          spin.state.activeKey,
          spin.ids.forKey('spin'),
          spin.keyToElementId('spin'),
          checkbox.rootProps.role ?? 'none',
          checkbox.renderItems.length,
          checkbox.state.activeKey,
          checkbox.renderItems[0]?.state.checked,
          checkbox.ids.forKey('agree'),
          switchRuntime.rootProps.role ?? 'none',
          switchRuntime.renderItems.length,
          switchRuntime.state.activeKey,
          switchRuntime.renderItems[0]?.state.checked,
          switchRuntime.ids.forKey('power'),
          toolbar.rootProps.role,
          toolbar.renderItems.length,
          toolbar.state.activeKey,
          toolbar.ids.forKey('bold'),
          table.tableProps.role,
          table.headerRow?.key,
          table.bodyRows.length,
          table.rows.length,
          table.ids.forKey('header'),
          accordion.rootProps.role,
          accordion.renderItems.length,
          accordion.state.activeKey,
          accordion.ids.forKey('section'),
          alert.rootProps.role,
          alert.dismissProps.role,
          alert.key,
          alert.message,
          alert.state.visible,
          alert.ids.forKey('alert'),
          button.rootProps.role,
          button.key,
          button.label,
          button.state.pressed,
          button.ids.forKey('submit'),
          link.linkProps.role ?? 'none',
          link.key,
          link.label,
          link.href,
          link.variant,
          link.state.active,
          link.ids.forKey('docs'),
          defaultLink.label,
          defaultLink.href,
          defaultLink.variant,
          emptyLink.key ?? 'null',
          emptyLink.label,
          emptyLink.href,
          emptyLink.variant,
          emptyMenuButton.triggerKey ?? 'null',
          emptyMenuButton.menuKey ?? 'null',
          String(emptyMenuButton.expanded),
          emptyMenuButton.focusStrategy,
          emptyMenuButton.items.length,
          events.map((event) => `${event.type}:${'key' in event ? event.key ?? '' : ''}`).join('|'),
        ].join('|')}
      </output>
    </div>
  )
}

function HelperHost() {
  const [result, setResult] = useState('')
  const [draft, setDraft] = useState('')
  const [editResult, setEditResult] = useState('')
  const menuTriggerEvents = useRef<PatternEvent[]>([])
  const emptyMenuButton = useMenuButtonPattern(
    { items: {}, relations: { rootKeys: [] }, state: {} },
    (event) => menuTriggerEvents.current.push(event),
    { elementIdPrefix: 'menu-button-' },
  )
  const closedMenuButton = useMenuButtonPattern(
    {
      items: { trigger: { label: 'Trigger' }, menu: { label: 'Menu' } },
      relations: { rootKeys: ['trigger'], controlsByKey: { trigger: ['menu'] }, childrenByKey: { menu: [] } },
      state: { expandedKeys: [] },
    },
    (event) => menuTriggerEvents.current.push(event),
    { elementIdPrefix: 'menu-button-' },
  )
  const openMenuButton = useMenuButtonPattern(
    {
      items: { trigger: { label: 'Trigger' }, menu: { label: 'Menu' }, first: { label: 'First' } },
      relations: { rootKeys: ['trigger'], controlsByKey: { trigger: ['menu'] }, childrenByKey: { menu: ['first'] } },
      state: { activeKey: 'first', expandedKeys: ['trigger'] },
    },
    (event) => menuTriggerEvents.current.push(event),
    { elementIdPrefix: 'menu-button-' },
  )

  return (
    <div>
      <Grid
        data={{
          items: { cell: { label: 'Edit value' }, row: { label: 'Row' }, column: { label: 'Column' } },
          relations: {
            rootKeys: ['cell'],
            rowKeys: ['row'],
            columnKeys: ['column'],
            cells: [{ rowKey: 'row', columnKey: 'column', cellKey: 'cell' }],
          },
          state: {
            activeKey: 'cell',
            editableKeys: ['cell'],
            editingKey: 'cell',
            editDraftByKey: { cell: draft },
          },
          refs: { label: 'Editable grid' },
        }}
        onEvent={(event) => {
          if (event.type === 'editDraft') setDraft(String(event.value))
          if (event.type === 'value' || event.type === 'editEnd') {
            setEditResult((current) => current ? `${current}|${event.type}` : event.type)
          }
        }}
      />
      <output data-testid="grid-edit-result">{editResult}</output>
      <button
        type="button"
        onClick={() => {
          menuTriggerEvents.current = []
          const empty = emptyMenuButton.triggerProps
          const closed = closedMenuButton.triggerProps
          const open = openMenuButton.triggerProps
          const eventBase = {
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            repeat: false,
            location: 0,
            nativeEvent: { isComposing: false },
            preventDefault: () => undefined,
          }
          closed.onKeyDown?.({ ...eventBase, key: 'ArrowUp', code: 'ArrowUp' } as never)
          open.onKeyDown?.({ ...eventBase, key: 'Escape', code: 'Escape' } as never)
          setResult(`${Object.keys(empty).length}|${closed.id}|${menuTriggerEvents.current.map((event) => `${event.type}:${'key' in event ? event.key ?? '' : ''}`).join('|')}`)
        }}
      >
        Run menu trigger props
      </button>
      <button
        type="button"
        onClick={() => {
          const sliderRuntime = {
            visibleKeys: ['min', 'max'],
            data: {
              items: {
                min: { valuemax: 50 },
                max: { valuemin: 50 },
              },
              relations: { rootKeys: ['min', 'max'] },
              state: {},
            },
          }
          const sliderState = getSliderRuntimeState(sliderRuntime as never)
          setResult([
            sliderState.activeKey ?? 'null',
            Object.keys(sliderState.valueByKey).length,
            isMultiThumbSlider(sliderRuntime as never),
            getSliderRuntimeState({ ...sliderRuntime, visibleKeys: ['min'], data: { ...sliderRuntime.data, state: { activeKey: 'min', valueByKey: { min: 4 } } } } as never).activeKey,
          ].map(String).join('|'))
        }}
      >
        Read runtime state helpers
      </button>
      <button
        type="button"
        onClick={() => {
          const data: PatternData = { items: { item: { label: 'Item' } }, relations: { rootKeys: ['item'] }, state: { activeKey: 'item' } }
          const events: PatternEvent[] = []
          defineDomEvent('coverage-unknown-test', { handlerProp: 'onCoverageUnknownTest' })
          defineDomEvent('coverage-known-test', { handlerProp: 'onCoverageKnownTest' })
          try {
            resolvePartEventBindings([{ event: 'missing-dom-event' as never, events: [{ type: 'focus', key: '$activeKey' }] }], { data, key: undefined, activeKey: null }, (event) => events.push(event))
          } catch (error) {
            events.push({ type: 'activate', key: (error as Error).message })
          }
          const props = resolvePartEventBindings([
            { event: 'coverage-known-test' as never, events: [{ type: 'focus', key: '$activeKey', meta: { reason: 'keyboard' } }] },
            { event: 'coverage-known-test' as never, events: [{ type: 'activate', key: '$activeKey' }] },
          ], { data, key: undefined, activeKey: null }, (event) => events.push(event))
          const knownHandler = props.onCoverageKnownTest
          if (typeof knownHandler === 'function') knownHandler()
          events.push(withDefaultReason({ type: 'activate', key: 'kept', meta: { reason: 'pointer' } }, 'external'))
          setResult(events.map((event) => `${event.type}:${'key' in event ? String(event.key).slice(0, 18) : ''}:${event.meta?.reason ?? ''}`).join('|'))
        }}
      >
        Resolve dom bindings
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('action and prop helper coverage from pointer input', () => {
  it('covers action, prop, and dom binding helpers through input events', () => {
    render(<HelperHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Run menu trigger props' }))
    expect(screen.getByText('0|menu-button-trigger|expand:trigger|expand:trigger')).toBeTruthy()

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'draft' } })
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })
    expect(screen.getByTestId('grid-edit-result').textContent).toBe('value|editEnd')
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
    expect(screen.getByTestId('grid-edit-result').textContent).toBe('value|editEnd|editEnd')
    fireEvent.keyDown(input, { key: 'A', code: 'KeyA' })

    fireEvent.click(screen.getByRole('button', { name: 'Read runtime state helpers' }))
    expect(screen.getByText('null|0|true|min')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve dom bindings' }))
    expect(screen.getByText(/\[apg-pattern\] unk/)).toBeTruthy()
    expect(screen.getByText(/activate:kept:pointer/)).toBeTruthy()

    render(<HookRuntimeHost />)
    fireEvent.click(screen.getByRole('button', { name: 'Run hook runtimes' }))
    const hookOutput = screen.getByTestId('hook-runtime').textContent
    expect(hookOutput).toContain('radiogroup|2|one|one|two|edge-radio-one|edge-radio-two')
    expect(hookOutput).toContain('none|1|agree|mixed|edge-check-agree|none|1|power|false|edge-switch-power')
    expect(hookOutput).toContain('table|row|0|1|edge-table-header|group|1|section|edge-accordion-section')
    expect(hookOutput).toContain('link|docs|Docs|#docs|quiet|true|edge-link-docs|fallback|#|anchor|null||#|anchor')
    expect(hookOutput).toContain('null|null|false|rovingTabIndex|0')
    expect(hookOutput).toContain('focus:two|select:|focus:spin|focus:spin|valueStep:spin|focus:agree|check:agree|focus:agree|check:agree|focus:power|check:power|focus:power|check:power')
  })
})
