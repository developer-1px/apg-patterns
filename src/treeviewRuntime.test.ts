import { describe, expect, it } from 'vitest'
import {
  PatternDataSchema,
  PatternEventSchema,
  PatternOptionsSchema,
  TreeviewPatternDefinitionSchema,
  createParentByKey,
  createTreeviewRuntime,
  resolveNavigationTarget,
  resolveTreeKeyboardBinding,
  serializableTreeviewPatternDefinition,
  treeviewPatternDefinition,
  type PatternData,
  type PatternEvent,
} from './index'

const keyInput = (key: string) => ({
  key,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
  isComposing: false,
  repeat: false,
  location: 0,
  code: key,
  preventDefault: () => undefined,
})

const data = {
  items: {
    a: { label: 'Documents' },
    b: { label: 'Archive' },
    c: { label: 'Drafts' },
  },
  relations: {
    rootKeys: ['a', 'c'],
    childrenByKey: {
      a: ['b'],
      b: [],
      c: [],
    },
  },
  state: {
    activeKey: 'a',
    expandedKeys: ['a'],
    selectedKeys: ['b'],
    disabledKeys: ['c'],
    typeaheadTextByKey: {
      a: 'documents',
      b: 'archive',
      c: 'drafts',
    },
  },
} satisfies PatternData

describe('@interactive-os/apg-treeview-contract', () => {
  it('keeps the treeview definition serializable and schema-validated', () => {
    expect(TreeviewPatternDefinitionSchema.parse(treeviewPatternDefinition)).toEqual(treeviewPatternDefinition)
    expect(TreeviewPatternDefinitionSchema.parse(serializableTreeviewPatternDefinition)).toEqual(treeviewPatternDefinition)
    expect(serializableTreeviewPatternDefinition.keyboard).toContainEqual({
      shortcut: 'ArrowDown',
      preventDefault: true,
      cases: [
        {
          case: 'when',
          when: { kind: 'hasActiveKey' },
          events: [{ type: 'navigate', direction: 'next' }],
        },
      ],
    })
  })

  it('keeps runtime options JSON-serializable while allowing pattern-level extensions (OCP)', () => {
    expect(PatternOptionsSchema.parse({ elementIdPrefix: 'node-' })).toEqual({ elementIdPrefix: 'node-' })
    // well-known 어휘 — orientation 이 패턴별 옵션으로 정식 채택됨
    expect(PatternOptionsSchema.parse({ orientation: 'horizontal' })).toEqual({ orientation: 'horizontal' })
    // 패턴별 extension 옵션 — passthrough 로 허용 (slider 의 step, combobox 의 allowCustomValue 등)
    expect(PatternOptionsSchema.parse({ loop: true })).toEqual({ loop: true })
    // 함수는 well-known 필드의 형 검증으로 거부될 수 있어야 한다 — selectionMode 자리에 함수 넣기 등은 여전히 throw
    expect(() => PatternOptionsSchema.parse({ selectionMode: () => 'single' })).toThrow()
  })

  it('rejects hallucinated top-level PatternData buckets but allows pattern-level state extensions (OCP)', () => {
    // PatternDataSchema 자체는 .strict() — items/relations/state/refs 외 임의 top-level bucket 은 거부.
    expect(() =>
      PatternDataSchema.parse({
        ...data,
        apg: { pattern: 'treeview' },
      }),
    ).toThrow()

    // state 는 passthrough — 패턴별 state 필드(valueByKey, orientationByKey, ...) 추가 자유.
    // disabledByKey 가 'disabledKeys' alias 처럼 보여도 OCP 우선 — kernel 이 의미를 모르는 채 통과.
    // 잘못된 사용은 resolveStateProjection 시점 진단으로 잡힌다.
    const parsed = PatternDataSchema.parse({
      ...data,
      state: { activeKey: 'a', disabledByKey: { a: true } },
    })
    expect((parsed.state as Record<string, unknown>).disabledByKey).toEqual({ a: true })
  })

  it('rejects PatternData references to keys missing from items', () => {
    expect(() =>
      PatternDataSchema.parse({
        ...data,
        relations: { ...data.relations, rootKeys: ['missing'] },
      }),
    ).toThrow()

    expect(() =>
      PatternDataSchema.parse({
        ...data,
        relations: { ...data.relations, childrenByKey: { ...data.relations.childrenByKey, a: ['missing'] } },
      }),
    ).toThrow()

    expect(() =>
      PatternDataSchema.parse({
        ...data,
        state: { ...data.state, selectedKeys: ['missing'] },
      }),
    ).toThrow()

    expect(() =>
      PatternDataSchema.parse({
        ...data,
        refs: { domainIdByKey: { missing: 'domain-missing' } },
      }),
    ).toThrow()
  })

  it('rejects PatternEvent extra fields and shape mismatches while accepting documented vocabulary', () => {
    // 정식 어휘(open/check/press/value/typeahead/dismiss/extension 등) 는 통과해야 한다.
    expect(PatternEventSchema.parse({ type: 'open', key: 'a', open: true })).toMatchObject({ type: 'open' })
    expect(PatternEventSchema.parse({ type: 'value', key: 'a', value: 42 })).toMatchObject({ type: 'value' })
    expect(PatternEventSchema.parse({ type: 'extension', name: 'drag.start', key: 'a' })).toMatchObject({ type: 'extension', name: 'drag.start' })

    // 변형별 strict() 는 유지 — 형이 어긋난 입력은 여전히 거부.
    expect(() => PatternEventSchema.parse({ type: 'navigate', key: 'a', direction: 'next' })).toThrow() // navigate 는 key 없음
    expect(() => PatternEventSchema.parse({ type: 'open', key: 'a', open: true, focus: 'first' })).toThrow() // 변형에 없는 extra
    expect(() => PatternEventSchema.parse({ type: 'select', key: 'a' })).toThrow() // select 는 keys[] 필수
    expect(() => PatternEventSchema.parse({ type: 'close', key: 'a' })).toThrow() // 미등록 변형
    expect(() => PatternEventSchema.parse({ type: 'extension', key: 'a' })).toThrow() // extension 의 name 필수
  })

  it('rejects incomplete or cross-shaped event templates', () => {
    expect(() =>
      TreeviewPatternDefinitionSchema.parse({
        ...treeviewPatternDefinition,
        keyboard: [{ shortcut: 'ArrowDown', cases: [{ case: 'always', events: [{ type: 'navigate' }] }] }],
      }),
    ).toThrow()

    expect(() =>
      TreeviewPatternDefinitionSchema.parse({
        ...treeviewPatternDefinition,
        keyboard: [{ shortcut: 'ArrowDown', cases: [{ case: 'always', events: [{ type: 'focus', direction: 'next' }] }] }],
      }),
    ).toThrow()
  })

  it('rejects string predicates and unknown predicate vocabulary', () => {
    expect(() =>
      TreeviewPatternDefinitionSchema.parse({
        ...treeviewPatternDefinition,
        keyboard: [
          {
            shortcut: 'ArrowRight',
            cases: [
              {
                case: 'when',
                when: 'activeItem.hasChildren && !activeItem.expanded',
                events: [{ type: 'expand', key: '$activeKey', expanded: true }],
              },
            ],
          },
        ],
      }),
    ).toThrow()

    expect(() =>
      TreeviewPatternDefinitionSchema.parse({
        ...treeviewPatternDefinition,
        keyboard: [
          {
            shortcut: 'ArrowRight',
            cases: [
              {
                case: 'when',
                when: { kind: 'hasChild', key: '$activeKey' },
                events: [{ type: 'expand', key: '$activeKey', expanded: true }],
              },
            ],
          },
        ],
      }),
    ).toThrow()
  })

  it('returns render-ready slotProps and state without exposing raw aria.byKey reads', () => {
    const events: PatternEvent[] = []
    const runtime = createTreeviewRuntime({ data, onEvent: (event) => events.push(event) })

    expect(runtime.items.map((item) => item.key)).toEqual(['a', 'b', 'c'])
    expect(runtime.items[0]?.state).toMatchObject({ active: true, expanded: true, selected: false })
    expect(runtime.items[1]?.state).toMatchObject({ active: false, selected: true })

    expect(runtime.getTreeProps()).toMatchObject({ role: 'tree' })
    expect(runtime.getTreeItemProps('a')).toMatchObject({
      role: 'treeitem',
      id: 'treeitem-a',
      tabIndex: 0,
      'aria-label': 'Documents',
      'aria-expanded': true,
    })
    expect(runtime.getTreeItemProps('b')).toMatchObject({
      role: 'treeitem',
      id: 'treeitem-b',
      tabIndex: -1,
      'aria-selected': true,
    })
  })

  it('derives element ids from a serializable prefix option', () => {
    const runtime = createTreeviewRuntime({
      data,
      options: { focusStrategy: 'ariaActiveDescendant', elementIdPrefix: 'node-' },
      onEvent: () => undefined,
    })

    expect(runtime.getTreeProps()).toMatchObject({ 'aria-activedescendant': 'node-a' })
    expect(runtime.getTreeItemProps('a')).toMatchObject({ id: 'node-a' })
  })

  it('emits only validated PatternEvents from declarative keyboard behavior', () => {
    const events: PatternEvent[] = []
    const runtime = createTreeviewRuntime({ data, onEvent: (event) => events.push(event) })
    const treeProps = runtime.getTreeProps()

    const onKeyDown = treeProps.onKeyDown as (event: ReturnType<typeof keyInput>) => void

    onKeyDown(keyInput('ArrowDown'))
    onKeyDown(keyInput('ArrowLeft'))
    onKeyDown(keyInput('Enter'))

    expect(events).toEqual([
      { type: 'navigate', direction: 'next' },
      { type: 'expand', key: 'a', expanded: false },
      { type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'a' },
    ])
  })

  it('evaluates declarative ArrowRight cases in order', () => {
    const collapsedData: PatternData = {
      ...data,
      state: { ...data.state, expandedKeys: [] },
    }
    const expandedEvents: PatternEvent[] = []
    const collapsedEvents: PatternEvent[] = []

    const expandedRuntime = createTreeviewRuntime({ data, onEvent: (event) => expandedEvents.push(event) })
    const collapsedRuntime = createTreeviewRuntime({ data: collapsedData, onEvent: (event) => collapsedEvents.push(event) })

    const expandedOnKeyDown = expandedRuntime.getTreeProps().onKeyDown as (event: ReturnType<typeof keyInput>) => void
    const collapsedOnKeyDown = collapsedRuntime.getTreeProps().onKeyDown as (event: ReturnType<typeof keyInput>) => void

    expandedOnKeyDown(keyInput('ArrowRight'))
    collapsedOnKeyDown(keyInput('ArrowRight'))

    expect(expandedEvents).toEqual([{ type: 'navigate', direction: 'child' }])
    expect(collapsedEvents).toEqual([{ type: 'expand', key: 'a', expanded: true }])
  })

  it('falls through ArrowRight to next item when active item has no children', () => {
    const events: PatternEvent[] = []
    const leafData: PatternData = {
      ...data,
      state: { ...data.state, activeKey: 'b' },
    }
    const runtime = createTreeviewRuntime({ data: leafData, onEvent: (event) => events.push(event) })

    const onKeyDown = runtime.getTreeProps().onKeyDown as (event: ReturnType<typeof keyInput>) => void

    onKeyDown(keyInput('ArrowRight'))

    expect(events).toEqual([{ type: 'navigate', direction: 'next' }])
  })

  it('uses itemClickAction for keyboard activation', () => {
    const selectEvents: PatternEvent[] = []
    const toggleEvents: PatternEvent[] = []
    const noneEvents: PatternEvent[] = []
    const selectRuntime = createTreeviewRuntime({ data, onEvent: (event) => selectEvents.push(event) })
    const toggleRuntime = createTreeviewRuntime({ data, options: { itemClickAction: 'toggleExpand' }, onEvent: (event) => toggleEvents.push(event) })
    const noneRuntime = createTreeviewRuntime({ data, options: { itemClickAction: 'none' }, onEvent: (event) => noneEvents.push(event) })

    ;(selectRuntime.getTreeProps().onKeyDown as (event: ReturnType<typeof keyInput>) => void)(keyInput('Enter'))
    ;(toggleRuntime.getTreeProps().onKeyDown as (event: ReturnType<typeof keyInput>) => void)(keyInput('Enter'))
    ;(noneRuntime.getTreeProps().onKeyDown as (event: ReturnType<typeof keyInput>) => void)(keyInput('Enter'))

    expect(selectEvents).toEqual([{ type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'a' }])
    expect(toggleEvents).toEqual([{ type: 'expand', key: 'a', expanded: false }])
    expect(noneEvents).toEqual([])
  })

  it('keeps scanning shortcut bindings when an earlier same-shortcut binding has no matching case', () => {
    const result = resolveTreeKeyboardBinding(keyInput('ArrowDown'), 'a', data, {}, [
      {
        shortcut: 'ArrowDown',
        cases: [
          {
            case: 'when',
            when: { kind: 'isDisabled', key: '$activeKey' },
            events: [{ type: 'activate', key: '$activeKey' }],
          },
        ],
      },
      {
        shortcut: 'ArrowDown',
        cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }],
      },
    ])

    expect(result?.events).toEqual([{ type: 'navigate', direction: 'next' }])
  })

  it('supports optional followFocus selection declaratively', () => {
    const defaultEvents: PatternEvent[] = []
    const followEvents: PatternEvent[] = []
    const defaultRuntime = createTreeviewRuntime({ data, onEvent: (event) => defaultEvents.push(event) })
    const followRuntime = createTreeviewRuntime({
      data,
      options: { followFocus: true },
      onEvent: (event) => followEvents.push(event),
    })

    ;(defaultRuntime.getTreeItemProps('b').onFocus as () => void)()
    ;(followRuntime.getTreeItemProps('b').onFocus as () => void)()

    expect(defaultEvents).toEqual([{ type: 'focus', key: 'b' }])
    expect(followEvents).toEqual([
      { type: 'focus', key: 'b' },
      { type: 'select', keys: ['b'], anchorKey: 'b', extentKey: 'b' },
    ])
  })

  it('supports item click select vs expand toggle as declarative options', () => {
    const selectEvents: PatternEvent[] = []
    const toggleEvents: PatternEvent[] = []
    const noneEvents: PatternEvent[] = []

    const selectRuntime = createTreeviewRuntime({ data, onEvent: (event) => selectEvents.push(event) })
    const toggleRuntime = createTreeviewRuntime({
      data,
      options: { itemClickAction: 'toggleExpand' },
      onEvent: (event) => toggleEvents.push(event),
    })
    const noneRuntime = createTreeviewRuntime({
      data,
      options: { itemClickAction: 'none' },
      onEvent: (event) => noneEvents.push(event),
    })

    ;(selectRuntime.getTreeItemProps('a').onClick as () => void)()
    ;(toggleRuntime.getTreeItemProps('a').onClick as () => void)()
    ;(noneRuntime.getTreeItemProps('a').onClick as () => void)()

    expect(selectEvents).toEqual([
      { type: 'focus', key: 'a' },
      { type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'a' },
    ])
    expect(toggleEvents).toEqual([
      { type: 'focus', key: 'a' },
      { type: 'expand', key: 'a', expanded: false },
    ])
    expect(noneEvents).toEqual([{ type: 'focus', key: 'a' }])
  })

  it('supports indicator click toggle while item click selects', () => {
    const events: PatternEvent[] = []
    const runtime = createTreeviewRuntime({ data, onEvent: (event) => events.push(event) })

    ;(runtime.getTreeItemProps('a').onClick as () => void)()
    ;(runtime.getIndicatorProps('a').onClick as () => void)()

    expect(events).toEqual([
      { type: 'focus', key: 'a' },
      { type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'a' },
      { type: 'focus', key: 'a' },
      { type: 'expand', key: 'a', expanded: false },
    ])
  })

  it('resolves navigate events through keyboard-navigation primitives', () => {
    const parentByKey = createParentByKey(data)

    expect(resolveNavigationTarget({ type: 'navigate', direction: 'next' }, 'a', data)).toBe('b')
    expect(resolveNavigationTarget({ type: 'navigate', direction: 'previous' }, 'b', data)).toBe('a')
    expect(resolveNavigationTarget({ type: 'navigate', direction: 'first' }, 'b', data)).toBe('a')
    expect(resolveNavigationTarget({ type: 'navigate', direction: 'last' }, 'a', data)).toBe('c')
    expect(resolveNavigationTarget({ type: 'navigate', direction: 'child' }, 'a', data)).toBe('b')
    expect(resolveNavigationTarget({ type: 'navigate', direction: 'parent' }, 'b', data, parentByKey)).toBe('a')
    expect(resolveNavigationTarget({ type: 'navigate', direction: 'parent' }, 'c', data, parentByKey)).toBe('a')
  })
})
