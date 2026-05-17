/**
 * OCP 최종 실증 — listbox 패턴을 createPatternRuntime(kernel) 만으로 끝까지 동작.
 * kernel 영역(schema.ts / patternKernel.ts / treeviewRuntime.ts / treeviewDefinition.ts) 0줄 수정.
 *
 * 이 테스트가 통과한다 = 새 패턴 추가 비용이 "정의 + 패턴별 토큰 등록" 으로 닫혔다.
 */
import { describe, expect, it, vi } from 'vitest'
import {
  PatternDefinitionSchema,
  PatternDataSchema,
  PatternOptionsSchema,
  createPatternRuntime,
  defineVisibleOrder,
  type PatternData,
  type PatternEvent,
} from './index'

// 'flat' visibleOrder + 'linear' navigationTarget 은 kernel 기본 — 별도 등록 불필요.

// ── 2. 정의 ─────────────────────────────────────────────────────
const listboxDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'listbox',
  rootRole: 'listbox',
  containedRoles: ['option'],
  focusModel: 'rovingTabIndex',
  parts: {
    listbox: {
      role: 'listbox',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
      ],
    },
    option: {
      role: 'option',
      keySource: 'collectionItemKey',
      aria: [
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      ],
      focus: {
        tabIndex: {
          when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
          active: 0,
          inactive: -1,
        },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'selected', from: 'state.selectedKeys' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
      events: [
        { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
        { event: 'click', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }, { type: 'select', key: '$key' }] },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'select', key: '$activeKey' }] }] },
  ],
})

const data = PatternDataSchema.parse({
  items: { a: { label: 'Apple' }, b: { label: 'Banana' }, c: { label: 'Cherry' } },
  relations: { rootKeys: ['a', 'b', 'c'], childrenByKey: { a: [], b: [], c: [] } },
  state: { activeKey: 'b', selectedKeys: ['b'], disabledKeys: ['c'] },
  refs: { label: 'Fruits' },
})

const keyInput = (key: string) => ({
  key, code: key, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false,
  isComposing: false, repeat: false, location: 0,
  preventDefault: vi.fn(),
})

describe('listbox via generic createPatternRuntime — kernel 0줄 수정 OCP 실증', () => {
  it('assembles root listbox slot props with aria + role + onKeyDown', () => {
    const onEvent = vi.fn()
    const runtime = createPatternRuntime({
      definition: listboxDefinition,
      data,
      options: PatternOptionsSchema.parse({ selectionMode: 'multiple', focusStrategy: 'rovingTabIndex' }),
      onEvent,
    })
    const props = runtime.getPartProps('listbox')
    expect(props.role).toBe('listbox')
    expect(props['aria-label']).toBe('Fruits')
    expect(props['aria-multiselectable']).toBe(true)
    // Root part 는 onKeyDown 을 자동 포함 — 사용자가 spread 만으로 키보드 동작.
    expect(typeof props.onKeyDown).toBe('function')
  })

  it('root part onKeyDown dispatches events when fired directly via spread', () => {
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: listboxDefinition,
      data,
      options: PatternOptionsSchema.parse({}),
      onEvent: (e) => events.push(e),
    })
    const rootProps = runtime.getPartProps('listbox')
    ;(rootProps.onKeyDown as (e: ReturnType<typeof keyInput>) => void)(keyInput('ArrowDown'))
    ;(rootProps.onKeyDown as (e: ReturnType<typeof keyInput>) => void)(keyInput('Enter'))
    expect(events).toEqual([
      { type: 'navigate', direction: 'next' },
      { type: 'select', keys: ['b'], anchorKey: 'b', extentKey: 'b' },
    ])
  })

  it('assembles per-item option slot props with aria-selected, tabIndex, onClick', () => {
    const onEvent = vi.fn()
    const runtime = createPatternRuntime({
      definition: listboxDefinition,
      data,
      options: PatternOptionsSchema.parse({ focusStrategy: 'rovingTabIndex' }),
      onEvent,
      keyToElementId: (k) => `opt-${k}`,
    })
    const active = runtime.getPartProps('option', 'b')
    expect(active.role).toBe('option')
    expect(active.id).toBe('opt-b')
    expect(active['aria-selected']).toBe(true)
    expect(active.tabIndex).toBe(0)
    expect(typeof active.onClick).toBe('function')

    const inactive = runtime.getPartProps('option', 'a')
    expect(inactive.tabIndex).toBe(-1)
    // ARIA spec — selectable 옵션은 명시적 false 를 emit (omit 이 아니라).
    expect(inactive['aria-selected']).toBe(false)
  })

  it('keyboard handler dispatches navigate/select events through kernel', () => {
    const events: PatternEvent[] = []
    const dataChanges: PatternData[] = []
    const runtime = createPatternRuntime({
      definition: listboxDefinition,
      data,
      options: PatternOptionsSchema.parse({}),
      onEvent: (e) => events.push(e),
      onDataChange: (next) => dataChanges.push(next),
    })
    const handler = runtime.getRootKeyboardHandler()
    handler(keyInput('ArrowDown'))
    handler(keyInput('Enter'))
    expect(events).toEqual([
      { type: 'navigate', direction: 'next' },
      { type: 'select', keys: ['b'], anchorKey: 'b', extentKey: 'b' },
    ])
    expect(dataChanges[0]?.state?.activeKey).toBe('c')
    expect(dataChanges[1]?.state?.selectedKeys).toEqual(['b'])
  })

  it('resolveKeyboardBinding directly returns events for any shortcut', () => {
    const runtime = createPatternRuntime({
      definition: listboxDefinition,
      data,
      options: PatternOptionsSchema.parse({}),
      onEvent: () => undefined,
    })
    const home = runtime.resolveKeyboardBinding(keyInput('Home'), 'b')
    expect(home?.events).toEqual([{ type: 'navigate', direction: 'first' }])
    expect(home?.preventDefault).toBe(true)
  })

  it('disabled item suppresses click/focus event firing via predicate "when"', () => {
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: listboxDefinition,
      data,
      options: PatternOptionsSchema.parse({}),
      onEvent: (e) => events.push(e),
    })
    const disabledProps = runtime.getPartProps('option', 'c')
    ;(disabledProps.onClick as () => void)?.()
    expect(events).toEqual([])
  })

  it('per-item state projection reports active/selected/disabled', () => {
    const runtime = createPatternRuntime({
      definition: listboxDefinition,
      data,
      options: PatternOptionsSchema.parse({}),
      onEvent: () => undefined,
    })
    expect(runtime.getItemState('b', 'option')).toEqual({ active: true, selected: true, disabled: false })
    expect(runtime.getItemState('c', 'option')).toEqual({ active: false, selected: false, disabled: true })
  })
})
