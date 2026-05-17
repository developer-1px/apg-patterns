/**
 * Kernel API 가드 — 직전 보고서에서 식별한 구조 결함 회귀 방지.
 *   1. getRootProps() / getItemProps() 명시적 분리 (hidden contract 제거)
 *   2. 중복 등록 시 console.warn (fragmentation 조기 발견)
 *   3. PatternDataSchema.parse 가 진입 시점에 실행 (boundary fail-fast)
 *   4. KeyInput 형이 외부로 export
 */
import { describe, expect, it, vi } from 'vitest'
import {
  PatternDefinitionSchema,
  createPatternRuntime,
  defineAriaSource,
  type KeyInput,
} from './index'

const tinyDef = PatternDefinitionSchema.parse({
  apgPattern: 'tiny',
  rootRole: 'listbox',
  parts: {
    listbox: { role: 'listbox', aria: [{ attribute: 'aria-label', from: 'refs.label' }] },
    option: { role: 'option' },
  },
  navigation: { visibleOrder: { kind: 'flat' }, targets: {} },
  keyboard: [],
})

// 'flat' visibleOrder 는 kernel 기본 등록 — 별도 등록 불필요.

const validData = {
  items: { a: {} },
  relations: { rootKeys: ['a'], childrenByKey: { a: [] } },
}

describe('kernel API guards (구조 결함 회귀 방지)', () => {
  it('exposes getRootProps() — root part name 을 사용자가 알 필요 없음', () => {
    const runtime = createPatternRuntime({ definition: tinyDef, data: validData, options: {}, onEvent: vi.fn() })
    const props = runtime.getRootProps()
    expect(props.role).toBe('listbox')
    expect(typeof props.onKeyDown).toBe('function')
  })

  it('exposes getItemProps(partName, key) — root 분기 추측 불필요', () => {
    const runtime = createPatternRuntime({ definition: tinyDef, data: validData, options: {}, onEvent: vi.fn() })
    const props = runtime.getItemProps('option', 'a')
    expect(props.role).toBe('option')
  })

  it('throws zod error at boundary for malformed data (deep error 방지)', () => {
    expect(() =>
      createPatternRuntime({
        definition: tinyDef,
        // @ts-expect-error - intentional bad shape
        data: { items: 'not-an-object' },
        options: {},
        onEvent: vi.fn(),
      }),
    ).toThrow(/items|Invalid/i)
  })

  it('warns on duplicate registration with a different resolver', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    defineAriaSource('test.dup', () => 'first')
    defineAriaSource('test.dup', () => 'second') // 다른 resolver — warn
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('test.dup'))
    warn.mockRestore()
  })

  it('re-registering the same resolver object is silent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const sameResolver = () => 'x'
    defineAriaSource('test.same', sameResolver)
    defineAriaSource('test.same', sameResolver)
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('test.same'))
    warn.mockRestore()
  })

  it('rejects definitions with zero or multiple parts matching rootRole', () => {
    // zero matches
    expect(() =>
      PatternDefinitionSchema.parse({
        apgPattern: 'bad', rootRole: 'listbox',
        parts: { wrong: { role: 'option' } },
        navigation: { visibleOrder: { kind: 'flat' }, targets: {} },
        keyboard: [],
      }),
    ).toThrow(/no part with role/)
    // multiple matches
    expect(() =>
      PatternDefinitionSchema.parse({
        apgPattern: 'bad', rootRole: 'listbox',
        parts: { a: { role: 'listbox' }, b: { role: 'listbox' } },
        navigation: { visibleOrder: { kind: 'flat' }, targets: {} },
        keyboard: [],
      }),
    ).toThrow(/multiple parts/)
  })

  it('throws when keyboard binding references a navigation direction without a registered target', () => {
    const def = PatternDefinitionSchema.parse({
      apgPattern: 'bad', rootRole: 'listbox',
      parts: { listbox: { role: 'listbox' } },
      navigation: { visibleOrder: { kind: 'flat' }, targets: {} }, // 'next' 없음
      keyboard: [
        { shortcut: 'ArrowDown', cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
      ],
    })
    const runtime = createPatternRuntime({ definition: def, data: validData, options: {}, onEvent: () => undefined, onDataChange: () => undefined })
    // emit 시 reducer 가 missing target 을 throw 해야 한다 — silent no-op 금지.
    expect(() => runtime.emit({ type: 'navigate', direction: 'next' })).toThrow(/navigation.targets\["next"\] is missing/)
  })

  it('re-exports KeyInput type from index — root onKeyDown 입력 형 발견 가능', () => {
    // 컴파일 타임 가드 — 이 코드가 typecheck 통과한다는 사실이 export 증거.
    const k: KeyInput = {
      key: 'a', code: 'KeyA',
      ctrlKey: false, shiftKey: false, altKey: false, metaKey: false,
      isComposing: false, repeat: false, location: 0,
    }
    expect(k.key).toBe('a')
  })
})
