import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternDefinition, PatternEvent } from '../schema'
import type { PatternRuntime, SlotProps } from '../kernel/patternRuntime'
import { runPatternEffects } from '../adapters/reactEffectRunner'
import { createTabsRuntime } from '../patterns/tabs/runtime'

const tabsData: PatternData = {
  items: {
    one: { label: 'One' },
    two: { label: 'Two' },
    panelOne: { label: 'Panel one' },
  },
  relations: { rootKeys: ['one', 'two'], controlsByKey: { one: ['panelOne'] } },
  state: {},
  refs: { label: 'Runtime tabs' },
}

function FocusAndTabsRuntimeHost() {
  const [focusResult, setFocusResult] = useState('')
  const [runtimeResult, setRuntimeResult] = useState('')
  const [events, setEvents] = useState<PatternEvent[]>([])

  const keyToElementId = (key: string) => `focus-${key}`

  const customRuntime: PatternRuntime = {
    definition: createTabsRuntime({ data: tabsData, onEvent: () => undefined }).definition,
    data: tabsData,
    options: {},
    visibleKeys: [],
    getRootProps: () => ({ role: 'custom' }) as SlotProps,
    getItemProps: () => ({ role: 'custom' }) as SlotProps,
    getPartProps: () => ({ role: 'custom' }) as SlotProps,
    getRootKeyboardHandler: () => () => undefined,
    resolveKeyboardBinding: () => null,
    getItemState: () => ({}),
    keyToElementId,
    emit: (event) => setEvents((current) => [...current, event]),
  }

  const evaluateFocus = () => {
    const data: PatternData = {
      items: { one: { label: 'One' }, panelOne: { label: 'Panel one' } },
      relations: { rootKeys: ['one'], controlsByKey: { one: ['panelOne'] } },
      state: { activeKey: 'one', lastEventReason: 'pointer' },
      refs: { label: 'Focus target' },
    }
    document.getElementById('focus-panelOne')?.focus()
    runPatternEffects({ definition: focusDefinition, data, keyToElementId, previousMatches: [] })
    const focused = (document.activeElement as HTMLElement | null)?.id ?? 'none'
    document.getElementById('focus-panelOne')?.focus()
    runPatternEffects({ definition: focusDefinition, data: { ...data, state: { activeKey: null, lastEventReason: 'pointer' } }, keyToElementId, previousMatches: [] })
    const empty = (document.activeElement as HTMLElement | null)?.id ?? 'none'
    setFocusResult(`${focused}:${empty}`)
  }

  const evaluateTabs = () => {
    const runtime = createTabsRuntime({
      data: tabsData,
      onEvent: (event) => setEvents((current) => [...current, event]),
      options: { elementIdPrefix: 'runtime-tab-' },
    })
    const fallbackRuntime = createTabsRuntime({ data: { ...tabsData, relations: { rootKeys: [], controlsByKey: {} } }, onEvent: () => undefined })
    const injected = createTabsRuntime({ data: tabsData, onEvent: () => undefined, runtime: customRuntime })
    runtime.emit({ type: 'focus', key: 'two', meta: { reason: 'pointer' } })
    setRuntimeResult([
      runtime.selectedKey,
      runtime.selectedPanelKey,
      runtime.getTabProps('one').id,
      fallbackRuntime.selectedKey ?? 'none',
      fallbackRuntime.selectedPanelKey ?? 'none',
      injected.getTabProps('one').role,
    ].join(':'))
  }

  return (
    <div>
      <div role="tablist" aria-label="Focus targets">
        <button id="focus-one" type="button" role="tab">One</button>
        <button id="focus-panelOne" type="button" role="tabpanel">Panel one</button>
      </div>
      <button type="button" onClick={evaluateFocus}>Evaluate focus target</button>
      <button type="button" onClick={evaluateTabs}>Evaluate tabs runtime</button>
      <output data-testid="focus-result">{focusResult}</output>
      <output data-testid="runtime-result">{runtimeResult}</output>
      <output data-testid="runtime-events">{events.map((event) => event.type).join(',')}</output>
    </div>
  )
}

const focusDefinition = {
  apgPattern: 'focus-target',
  rootRole: 'tablist',
  containedRoles: ['tab'],
  focusModel: 'rovingTabIndex',
  parts: {},
  navigation: { visibleOrder: { kind: 'flat' }, targets: {} },
  keyboard: [],
  effects: [
    {
      kind: 'focus',
      when: { kind: 'always' },
      on: { state: 'activeKey', reasons: ['pointer'] },
      scope: { kind: 'focusWithin' },
      target: { kind: 'activeKeyElement' },
    },
  ],
} satisfies PatternDefinition

describe('focus targets and tabs runtime from input controls', () => {
  it('covers focus containment and tabs runtime fallback branches from pointer input', () => {
    render(<FocusAndTabsRuntimeHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Evaluate focus target' }))
    fireEvent.click(screen.getByRole('button', { name: 'Evaluate tabs runtime' }))

    expect(screen.getByTestId('focus-result').textContent).toBe('focus-one:focus-panelOne')
    expect(screen.getByTestId('runtime-result').textContent).toBe('one:panelOne:runtime-tab-one:none:none:custom')
    expect(screen.getByTestId('runtime-events').textContent).toBe('focus')
  })
})
