import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import '../kernel/kernelBuiltins'
import { defineDomEvent, defineDomEventHandlerProp, resolvePartEventBindings, withDefaultReason } from '../kernel/domEventBindings'
import { useAccordionPattern } from '../patterns/accordion/useAccordionPattern'
import { AlertDefinitionSchema } from '../patterns/alert/definition'
import { createAlertActions } from '../patterns/alert/alertActions'
import { useAlertPattern } from '../patterns/alert/useAlertPattern'
import { createButtonRootProps } from '../patterns/button/buttonRootProps'
import { useButtonPattern } from '../patterns/button/useButtonPattern'
import { createCheckboxActions } from '../patterns/checkbox/checkboxActions'
import { useCheckboxPattern } from '../patterns/checkbox/useCheckboxPattern'
import { createGridEditInputProps } from '../patterns/grid/gridEditInputProps'
import { LinkDefinitionSchema } from '../patterns/link/definition'
import { useLinkPattern } from '../patterns/link/useLinkPattern'
import { createMenuButtonTriggerProps } from '../patterns/menu/menuButtonTriggerProps'
import { getMenuButtonRuntimeState } from '../patterns/menu/menuButtonRuntimeState'
import { createRadioGroupActions } from '../patterns/radio/radioGroupActions'
import { useRadioGroupPattern } from '../patterns/radio/useRadioGroupPattern'
import { getSliderRuntimeState, isMultiThumbSlider } from '../patterns/slider/sliderRuntimeState'
import { createSpinbuttonActions } from '../patterns/spinbutton/spinbuttonActions'
import { getSpinbuttonRuntimeState } from '../patterns/spinbutton/spinbuttonRuntimeState'
import { useSpinbuttonPattern } from '../patterns/spinbutton/useSpinbuttonPattern'
import { createSwitchActions } from '../patterns/switch/switchActions'
import { useSwitchPattern } from '../patterns/switch/useSwitchPattern'
import { useTablePattern } from '../patterns/table/useTablePattern'
import { createToolbarActions } from '../patterns/toolbar/toolbarActions'
import { useToolbarPattern } from '../patterns/toolbar/useToolbarPattern'
import type { PatternData, PatternEvent } from '../index'

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
          events.map((event) => `${event.type}:${'key' in event ? event.key ?? '' : ''}`).join('|'),
        ].join('|')}
      </output>
    </div>
  )
}

function HelperHost() {
  const [result, setResult] = useState('')
  const [draft, setDraft] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const events: PatternEvent[] = []
          const runtime = { emit: (event: PatternEvent) => events.push(event) }
          createAlertActions(runtime as never, null).dismiss()
          createAlertActions(runtime as never, 'alert').dismiss()
          const spin = createSpinbuttonActions(runtime as never)
          spin.focus('spin')
          spin.step('spin', 'increment')
          const checkbox = createCheckboxActions(runtime as never)
          checkbox.focus('check')
          checkbox.check('check', 'mixed')
          const radio = createRadioGroupActions(runtime as never)
          radio.focus('radio')
          radio.select('radio')
          const switchActions = createSwitchActions(runtime as never)
          switchActions.focus('switch')
          switchActions.check('switch', true)
          const toolbar = createToolbarActions(runtime as never)
          toolbar.focus('tool')
          toolbar.select('tool')
          setResult(events.map((event) => `${event.type}:${'key' in event ? event.key ?? '' : ''}`).join('|'))
        }}
      >
        Run action helpers
      </button>
      <button
        type="button"
        onClick={() => {
          const messages: string[] = []
          const invalidAlertKind = AlertDefinitionSchema.safeParse({ apgPattern: 'button', rootRole: 'button', containedRoles: [], parts: { alert: { role: 'button' } }, navigation: { visibleOrder: { kind: 'flat' }, targets: {} }, keyboard: [] })
          const invalidAlertPart = AlertDefinitionSchema.safeParse({ apgPattern: 'alert', rootRole: 'alert', containedRoles: [], parts: { other: { role: 'alert' } }, navigation: { visibleOrder: { kind: 'flat' }, targets: {} }, keyboard: [] })
          const invalidLinkKind = LinkDefinitionSchema.safeParse({ apgPattern: 'button', rootRole: 'button', containedRoles: [], parts: { link: { role: 'button' } }, navigation: { visibleOrder: { kind: 'flat' }, targets: {} }, keyboard: [] })
          const invalidLinkPart = LinkDefinitionSchema.safeParse({ apgPattern: 'link', rootRole: 'link', containedRoles: [], parts: { other: { role: 'link' } }, navigation: { visibleOrder: { kind: 'flat' }, targets: {} }, keyboard: [] })
          for (const result of [invalidAlertKind, invalidAlertPart, invalidLinkKind, invalidLinkPart]) {
            if (!result.success) messages.push(result.error.issues.map((issue) => issue.message).join(','))
          }
          setResult(messages.join('|'))
        }}
      >
        Parse definition guards
      </button>
      <button
        type="button"
        onClick={() => {
          const events: PatternEvent[] = []
          const runtime = {
            getPartProps: () => ({ role: 'button', id: 'runtime-button' }),
            emit: (event: PatternEvent) => events.push(event),
            resolveKeyboardBinding: (input: { key: string }) =>
              input.key === 'Enter'
                ? { preventDefault: false, events: [{ type: 'activate', key: 'button' }] }
                : null,
          }
          const empty = createButtonRootProps(runtime as never, null)
          const props = createButtonRootProps(runtime as never, 'button')
          fireEvent.focus(screen.getByTestId('button-props-target'))
          props.onFocus?.({} as never)
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
          props.onKeyDown?.({ ...eventBase, key: 'Escape', code: 'Escape' } as never)
          props.onKeyDown?.({ ...eventBase, key: 'Enter', code: 'Enter' } as never)
          setResult(`${Object.keys(empty).length}|${events.map((event) => event.type).join('|')}`)
        }}
      >
        Run button props
      </button>
      <button data-testid="button-props-target" type="button">Button props target</button>
      <input
        aria-label="Edit value"
        {...createGridEditInputProps({
          key: 'cell',
          editDraftByKey: { cell: draft },
          commitEdit: () => setResult('commit'),
          cancelEdit: () => setResult('cancel'),
          onEvent: (event) => {
            if (event.type === 'editDraft') setDraft(String(event.value))
          },
        })}
      />
      <button
        type="button"
        onClick={() => {
          const events: PatternEvent[] = []
          const runtime = {
            getPartProps: () => ({ role: 'button', onKeyDown: () => events.push({ type: 'activate', key: 'fallback' }) }),
            keyToElementId: (key: string) => `menu-button-${key}`,
          }
          const data: PatternData = { items: {}, relations: {}, state: {} }
          const empty = createMenuButtonTriggerProps({ runtime: runtime as never, data, triggerKey: null, itemKeys: [], expanded: false, onEvent: (event) => events.push(event) })
          const closed = createMenuButtonTriggerProps({ runtime: runtime as never, data, triggerKey: 'trigger', itemKeys: [], expanded: false, onEvent: (event) => events.push(event) })
          const open = createMenuButtonTriggerProps({ runtime: runtime as never, data, triggerKey: 'trigger', itemKeys: ['first'], expanded: true, onEvent: (event) => events.push(event) })
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
          setResult(`${Object.keys(empty).length}|${closed.id}|${events.map((event) => `${event.type}:${'key' in event ? event.key ?? '' : ''}`).join('|')}`)
        }}
      >
        Run menu trigger props
      </button>
      <button
        type="button"
        onClick={() => {
          const empty = getMenuButtonRuntimeState({ items: {}, relations: {}, state: {} })
          setResult([
            empty.triggerKey ?? 'null',
            empty.menuKey ?? 'null',
            String(empty.expanded),
            empty.itemKeys.length,
          ].join('|'))
        }}
      >
        Read empty menu state
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
          const spinState = getSpinbuttonRuntimeState({ items: {}, relations: {}, state: {} })
          setResult([
            sliderState.activeKey ?? 'null',
            Object.keys(sliderState.valueByKey).length,
            isMultiThumbSlider(sliderRuntime as never),
            getSliderRuntimeState({ ...sliderRuntime, visibleKeys: ['min'], data: { ...sliderRuntime.data, state: { activeKey: 'min', valueByKey: { min: 4 } } } } as never).activeKey,
            spinState.activeKey ?? 'null',
            Object.keys(spinState.valueByKey).length,
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
          defineDomEventHandlerProp('coverage-known-test', 'onCoverageKnownTest')
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

    fireEvent.click(screen.getByRole('button', { name: 'Run action helpers' }))
    expect(screen.getByText('dismiss:alert|focus:spin|focus:spin|valueStep:spin|focus:check|check:check|focus:radio|select:|focus:switch|check:switch|focus:tool|select:')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Parse definition guards' }))
    expect(screen.getByText('expected "alert",expected "alert"|alert requires parts.alert|expected "link",expected "link"|link requires parts.link')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Run button props' }))
    expect(screen.getByText('0|focus|activate')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Run menu trigger props' }))
    expect(screen.getByText('0|menu-button-trigger|expand:trigger|activate:fallback')).toBeTruthy()

    const input = screen.getByRole('textbox', { name: 'Edit value' })
    fireEvent.change(input, { target: { value: 'draft' } })
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })
    expect(screen.getByText('commit')).toBeTruthy()
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
    expect(screen.getByText('cancel')).toBeTruthy()
    fireEvent.keyDown(input, { key: 'A', code: 'KeyA' })

    fireEvent.click(screen.getByRole('button', { name: 'Read empty menu state' }))
    expect(screen.getByText('null|null|false|0')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Read runtime state helpers' }))
    expect(screen.getByText('null|0|true|min|null|0')).toBeTruthy()

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
    expect(hookOutput).toContain('focus:two|select:|focus:spin|focus:spin|valueStep:spin|focus:agree|check:agree|focus:agree|check:agree|focus:power|check:power|focus:power|check:power')
  })
})
