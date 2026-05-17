/**
 * APG combobox pattern — built on the generic pattern kernel.
 *
 * Modeling choices:
 *   - "combobox" key is a synthetic root item. expandedKeys ∋ 'combobox' iff popup is open.
 *   - 'combobox' part has role 'combobox' (input semantics) and emits aria-expanded
 *     (explicit true/false), aria-controls, aria-haspopup, aria-autocomplete, aria-activedescendant.
 *   - 'listbox' part has role 'listbox' (popup container).
 *   - 'option' part has role 'option' with aria-selected.
 *   - We register new tokens for combobox-specific state we couldn't find on the kernel:
 *       ariaSource 'state.expandedKeys.self' → emits boolean for the current item's expanded state
 *         (kernel's 'state.expandedKeys' returns undefined when key isn't in items context,
 *          and returns true|undefined for items — but APG requires explicit false on the textbox).
 *       ariaSource 'options.haspopup', 'options.autocomplete' → from PatternOptions passthrough.
 *       visibleOrder 'comboboxOptions' → all keys except the 'combobox' synthetic.
 *       navigationTarget 'optionLinear' → next/previous within option keys, skipping combobox.
 *       predicate 'isPopupOpen' → expandedKeys.includes('combobox').
 */
import { describe, expect, it } from 'vitest'
import { createPatternRuntime, type PatternEvent } from '../../index'
import { COMBOBOX_KEY, comboboxDefinition } from './definition'

// aria-expanded must be explicit false when collapsed-but-expandable.
// Kernel's 'state.expandedKeys' returns true|undefined (suppresses false). We need true|false.
// ── Fixture ────────────────────────────────────────────────────────

const makeData = (overrides: { activeKey?: string | null; expanded?: boolean; selectedKeys?: readonly string[] } = {}) => ({
  items: {
    [COMBOBOX_KEY]: { label: 'Fruit' },
    apple: { label: 'Apple' },
    banana: { label: 'Banana' },
    cherry: { label: 'Cherry' },
  },
  relations: {
    controlsByKey: { [COMBOBOX_KEY]: ['listbox-popup' as const].map(String) as unknown as readonly string[] },
  },
  state: {
    activeKey: overrides.activeKey === undefined ? null : overrides.activeKey,
    expandedKeys: overrides.expanded ? [COMBOBOX_KEY] : [],
    selectedKeys: overrides.selectedKeys ?? [],
  },
  refs: { label: 'Fruit' },
})

// controlsByKey requires the target to be an item key — use 'listbox' role's key.
// Simplest: have combobox control 'apple' for the smoke test of aria-controls (or no controls projection).
// Since schema validates that controlsByKey targets exist in items, we route control through an item.
// We'll skip controls in fixture and rely on default — drop the relation.
const makeRuntime = (overrides: Parameters<typeof makeData>[0] = {}) => {
  const events: PatternEvent[] = []
  const data = makeData(overrides)
  // Drop the unresolved controls relation — items doesn't contain 'listbox-popup'.
  delete (data as { relations?: unknown }).relations
  return {
    events,
    runtime: createPatternRuntime({
      definition: comboboxDefinition,
      data,
      options: { focusStrategy: 'ariaActiveDescendant', haspopup: 'listbox', autocomplete: 'list' },
      onEvent: (e) => events.push(e),
    }),
  }
}

const press = (key: string) => ({ key, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false })

// ── Tests ──────────────────────────────────────────────────────────

describe('combobox pattern', () => {
  it('exposes correct slot props on the combobox (textbox) root', () => {
    const { runtime } = makeRuntime()
    const props = runtime.getRootProps() as Record<string, unknown>
    expect(props.role).toBe('combobox')
    expect(props['aria-expanded']).toBe(false) // explicit false when collapsed
    expect(props['aria-haspopup']).toBe('listbox')
    expect(props['aria-autocomplete']).toBe('list')
    expect(props['aria-label']).toBe('Fruit')
    expect(typeof props.onKeyDown).toBe('function')
    expect(typeof props.onInput).toBe('function')
  })

  it('ArrowDown on a closed combobox opens popup and focuses first option', () => {
    const { runtime, events } = makeRuntime()
    const handler = runtime.getRootKeyboardHandler()
    handler(press('ArrowDown'))
    expect(events).toEqual([
      { type: 'expand', key: COMBOBOX_KEY, expanded: true },
      { type: 'navigate', direction: 'first' },
    ])
  })

  it('ArrowDown on an open combobox navigates to the next option', () => {
    const { runtime, events } = makeRuntime({ activeKey: 'apple', expanded: true })
    runtime.getRootKeyboardHandler()(press('ArrowDown'))
    expect(events).toEqual([{ type: 'navigate', direction: 'next' }])
    // aria-expanded reflects open state.
    expect((runtime.getRootProps() as Record<string, unknown>)['aria-expanded']).toBe(true)
  })

  it('Enter on an open combobox selects active option and closes popup', () => {
    const { runtime, events } = makeRuntime({ activeKey: 'banana', expanded: true })
    runtime.getRootKeyboardHandler()(press('Enter'))
    expect(events).toEqual([
      { type: 'select', keys: ['banana'], anchorKey: 'banana', extentKey: 'banana' },
      { type: 'expand', key: COMBOBOX_KEY, expanded: false },
    ])
  })

  it('ArrowUp on a closed combobox opens popup and focuses last option', () => {
    const { runtime, events } = makeRuntime()
    runtime.getRootKeyboardHandler()(press('ArrowUp'))
    expect(events).toEqual([
      { type: 'expand', key: COMBOBOX_KEY, expanded: true },
      { type: 'navigate', direction: 'last' },
    ])
  })

  it('Home on an open popup navigates to first; End to last', () => {
    const { runtime, events } = makeRuntime({ activeKey: 'banana', expanded: true })
    runtime.getRootKeyboardHandler()(press('Home'))
    runtime.getRootKeyboardHandler()(press('End'))
    expect(events).toEqual([
      { type: 'navigate', direction: 'first' },
      { type: 'navigate', direction: 'last' },
    ])
  })

  it('Escape closes the popup', () => {
    const { runtime, events } = makeRuntime({ activeKey: 'cherry', expanded: true })
    runtime.getRootKeyboardHandler()(press('Escape'))
    expect(events).toEqual([{ type: 'expand', key: COMBOBOX_KEY, expanded: false }])
  })

  it('typing in the input emits a custom extension input event', () => {
    const { runtime, events } = makeRuntime()
    const props = runtime.getRootProps() as { onInput: () => void }
    props.onInput()
    expect(events).toEqual([{ type: 'extension', name: 'input', payload: { source: 'combobox' } }])
  })

  it('option items expose aria-selected and active state projection', () => {
    const { runtime } = makeRuntime({ activeKey: 'banana', expanded: true, selectedKeys: ['banana'] })
    const props = runtime.getItemProps('option', 'banana') as Record<string, unknown>
    expect(props.role).toBe('option')
    expect(props['aria-selected']).toBe(true)
    expect(runtime.getItemState('banana', 'option')).toEqual({ active: true, selected: true })
  })
})
