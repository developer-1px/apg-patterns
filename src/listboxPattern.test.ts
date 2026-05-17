/**
 * OCP 실증 테스트 — listbox 패턴을 schema.ts / patternKernel.ts / treeviewRuntime.ts
 * "kernel 영역" 0줄 수정으로 추가할 수 있는지 검증.
 *
 * 이 파일이 통과한다는 것은 새 패턴 추가가 "정의 + resolver 등록" 만으로 가능하다는 뜻.
 */
import { describe, expect, it } from 'vitest'
import {
  PatternDefinitionSchema,
  PatternDataSchema,
  defineVisibleOrder,
  defineNavigationTarget,
  defineAriaSource,
  resolveAriaSource,
  resolveVisibleOrder,
  dispatchNavigationTarget,
  evaluatePredicate,
  createParentByKey,
} from './index'

// ── 1. listbox 전용 토큰 등록 (밖) ────────────────────────────
// 'flat' visibleOrder 와 'linear' navigationTarget 모두 kernel 기본 등록 — 별도 등록 불필요.

// listbox 특유의 source 가 필요하다면 여기서 등록 (예시 — 사용 안 함)
defineAriaSource('items.textValue', (ctx) => (ctx.key ? ctx.data.items[ctx.key]?.textValue : undefined))

// ── 2. 정의 — schema.ts 의 generic PatternDefinitionSchema 사용 ──
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
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'selected', from: 'state.selectedKeys' },
        { name: 'disabled', from: 'state.disabledKeys' },
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
  ],
})

const data = PatternDataSchema.parse({
  items: { a: { label: 'Apple' }, b: { label: 'Banana' }, c: { label: 'Cherry' } },
  relations: { rootKeys: ['a', 'b', 'c'], childrenByKey: { a: [], b: [], c: [] } },
  state: { activeKey: 'b', selectedKeys: ['b'], disabledKeys: ['c'] },
  refs: { label: 'Fruits' },
})

describe('listbox via kernel (OCP 실증)', () => {
  it('parses listbox definition through generic PatternDefinitionSchema without schema modification', () => {
    expect(listboxDefinition.apgPattern).toBe('listbox')
    expect(listboxDefinition.rootRole).toBe('listbox')
    expect(listboxDefinition.parts.listbox.role).toBe('listbox')
    expect(listboxDefinition.parts.option.role).toBe('option')
  })

  it('resolves flat visibleOrder via registered resolver', () => {
    const visible = resolveVisibleOrder(listboxDefinition.navigation.visibleOrder, data)
    expect(visible).toEqual(['a', 'b', 'c'])
  })

  it('reuses kernel "linear" navigation target for listbox', () => {
    const ctx = {
      activeKey: 'b',
      data,
      parentByKey: createParentByKey(data),
      visibleKeys: ['a', 'b', 'c'] as const,
    }
    expect(dispatchNavigationTarget(listboxDefinition.navigation.targets.next!, ctx)).toBe('c')
    expect(dispatchNavigationTarget(listboxDefinition.navigation.targets.previous!, ctx)).toBe('a')
    expect(dispatchNavigationTarget(listboxDefinition.navigation.targets.first!, ctx)).toBe('a')
    expect(dispatchNavigationTarget(listboxDefinition.navigation.targets.last!, ctx)).toBe('c')
  })

  it('resolves aria-source tokens reused from kernel defaults', () => {
    const ctx = { data, options: { selectionMode: 'multiple' as const }, key: 'b', activeKey: 'b' }
    expect(resolveAriaSource('refs.label', ctx)).toBe('Fruits')
    expect(resolveAriaSource('options.selectionMode.multiple', ctx)).toBe(true)
    expect(resolveAriaSource('state.selectedKeys', ctx)).toBe(true)
    expect(resolveAriaSource('state.disabledKeys', { ...ctx, key: 'c' })).toBe(true)
  })

  it('evaluates kernel predicates against listbox data', () => {
    const ctx = { data, options: { selectionMode: 'multiple' as const }, key: 'b', activeKey: 'b' }
    expect(evaluatePredicate({ kind: 'hasActiveKey' }, ctx)).toBe(true)
    expect(evaluatePredicate({ kind: 'optionEquals', option: 'selectionMode', value: 'multiple' }, ctx)).toBe(true)
    expect(evaluatePredicate({ kind: 'isDisabled', key: '$key' }, { ...ctx, key: 'c' })).toBe(true)
  })

  it('unregistered tokens throw a clear diagnostic at resolve time', () => {
    expect(() => resolveAriaSource('state.bogusToken', { data, activeKey: 'b', key: 'b' })).toThrow(/unknown ariaSource token/)
    expect(() =>
      resolveVisibleOrder({ kind: 'unknownOrder' }, data),
    ).toThrow(/unknown visibleOrder token/)
  })
})
