import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../schema'
import type { PatternRuntime, SlotProps } from '../kernel/patternRuntime'
import { containsActiveElement, resolveFocusEffectTarget } from '../adapters/reactFocusEffectTarget'
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
  const activeTarget = { kind: 'activeKeyElement' } as const
  const panelTarget = { kind: 'controlledBy', key: '$activeKey' } as const

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
      state: { activeKey: 'one' },
      refs: { label: 'Focus target' },
    }
    document.getElementById('focus-panelOne')?.focus()
    const active = resolveFocusEffectTarget(activeTarget, data, keyToElementId)?.id ?? 'none'
    const within = containsActiveElement(panelTarget, data, keyToElementId, 'tablist')
    const empty = containsActiveElement(activeTarget, { ...data, state: { activeKey: null } }, keyToElementId, 'tablist')
    setFocusResult(`${active}:${within}:${empty}`)
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

describe('focus targets and tabs runtime from input controls', () => {
  it('covers focus containment and tabs runtime fallback branches from pointer input', () => {
    render(<FocusAndTabsRuntimeHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Evaluate focus target' }))
    fireEvent.click(screen.getByRole('button', { name: 'Evaluate tabs runtime' }))

    expect(screen.getByTestId('focus-result').textContent).toBe('focus-one:true:false')
    expect(screen.getByTestId('runtime-result').textContent).toBe('one:panelOne:runtime-tab-one:none:none:custom')
    expect(screen.getByTestId('runtime-events').textContent).toBe('focus')
  })
})
