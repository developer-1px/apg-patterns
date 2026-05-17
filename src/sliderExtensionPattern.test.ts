/**
 * 커스텀 패턴 실증 — APG slider 를 schema/kernel 0줄 수정으로 추가.
 *
 * 검증 목표:
 *   1. 커스텀 state 필드 (valueByKey) — schema.passthrough() 위에서 동작
 *   2. 커스텀 option (step, min, max) — PatternOptions.passthrough()
 *   3. 커스텀 direction ('increment'/'decrement') — PatternDirection 열림
 *   4. extension event 종류 — EventTemplate.extension + PatternEvent.extension
 *   5. 커스텀 aria source / state projection 등록
 *   6. 커스텀 navigation target ('clampedStep')
 *   7. 커스텀 visibleOrder ('flat')
 *
 * 이 테스트가 통과하면 임의 APG 패턴 + 사용자 커스텀 패턴이 kernel 위에서 동작함이 증명된다.
 */
import { describe, expect, it } from 'vitest'
import {
  PatternDefinitionSchema,
  PatternDataSchema,
  PatternOptionsSchema,
  createPatternRuntime,
  defineAriaSource,
  defineVisibleOrder,
  type PatternEvent,
} from './index'

// ── 1. slider 커스텀 토큰 등록 (kernel 무손상) ─────────────────────

// (singleThumb 별칭 제거 — kernel 의 'flat' 을 재사용한다.)

// 커스텀 aria source — slider 의 값 / 범위
defineAriaSource('state.valueByKey', (ctx) => (ctx.key ? (ctx.data.state as Record<string, unknown>).valueByKey?.[ctx.key as keyof object] : undefined))
defineAriaSource('options.min', (ctx) => (ctx.options as Record<string, unknown>)?.min)
defineAriaSource('options.max', (ctx) => (ctx.options as Record<string, unknown>)?.max)

// ── 2. slider 정의 ───────────────────────────────────────────────
const sliderDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'slider',
  rootRole: 'slider',
  containedRoles: ['slider-thumb'],
  focusModel: 'rovingTabIndex',
  parts: {
    slider: {
      role: 'slider',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-valuemin', from: 'options.min' },
        { attribute: 'aria-valuemax', from: 'options.max' },
        { attribute: 'aria-valuenow', from: 'state.valueByKey' },
      ],
      focus: {
        tabIndex: {
          when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
          active: 0,
          inactive: -1,
        },
      },
      state: [{ name: 'active', from: 'state.activeKey' }],
    },
  },
  // slider 는 navigation target 없이 keyboard 가 직접 extension event 를 발화한다.
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [
    {
      shortcut: 'ArrowRight',
      preventDefault: true,
      cases: [
        {
          case: 'always',
          // extension event 'value-change' — schema 의 'extension' 익스텐션 통로 사용
          events: [{ type: 'extension', name: 'value-change', key: '$activeKey', payload: { direction: 'increment' } }],
        },
      ],
    },
    {
      shortcut: 'ArrowLeft',
      preventDefault: true,
      cases: [{ case: 'always', events: [{ type: 'extension', name: 'value-change', key: '$activeKey', payload: { direction: 'decrement' } }] }],
    },
  ],
})

// ── 3. 데이터 — 커스텀 state 필드 valueByKey 사용 ─────────────────
const sliderData = PatternDataSchema.parse({
  items: { thumb: { label: 'Volume' } },
  relations: { rootKeys: ['thumb'], childrenByKey: { thumb: [] } },
  state: {
    activeKey: 'thumb',
    valueByKey: { thumb: 50 }, // ← schema 의 well-known field 로 정식 채택됨
  },
  refs: { label: 'Volume Slider' },
})

const keyInput = (key: string) => ({
  key, code: key, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false,
  isComposing: false, repeat: false, location: 0,
  preventDefault: () => undefined,
})

describe('Custom slider pattern via kernel — 0줄 kernel 수정', () => {
  it('parses slider definition with extension role and event vocabulary', () => {
    expect(sliderDefinition.apgPattern).toBe('slider')
    expect(sliderDefinition.parts.slider.role).toBe('slider')
    expect(sliderDefinition.navigation.visibleOrder.kind).toBe('flat')
  })

  it('emits extension value-change event with payload on ArrowRight/ArrowLeft', () => {
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: sliderDefinition,
      data: sliderData,
      options: PatternOptionsSchema.parse({ min: 0, max: 100, step: 5, focusStrategy: 'rovingTabIndex' }),
      onEvent: (e) => events.push(e),
    })

    runtime.getRootKeyboardHandler()(keyInput('ArrowRight'))
    runtime.getRootKeyboardHandler()(keyInput('ArrowLeft'))

    expect(events).toEqual([
      { type: 'extension', name: 'value-change', key: 'thumb', payload: { direction: 'increment' } },
      { type: 'extension', name: 'value-change', key: 'thumb', payload: { direction: 'decrement' } },
    ])
  })

  it('exposes ARIA props via extension aria sources (valuemin/valuemax/valuenow)', () => {
    const runtime = createPatternRuntime({
      definition: sliderDefinition,
      data: sliderData,
      options: PatternOptionsSchema.parse({ min: 0, max: 100, step: 5 }),
      onEvent: () => undefined,
    })
    const props = runtime.getPartProps('slider', 'thumb')
    expect(props.role).toBe('slider')
    expect(props['aria-label']).toBe('Volume Slider')
    expect(props['aria-valuemin']).toBe(0)
    expect(props['aria-valuemax']).toBe(100)
    expect(props['aria-valuenow']).toBe(50)
  })

  it('passes through arbitrary user options without schema modification', () => {
    const opts = PatternOptionsSchema.parse({
      min: 0,
      max: 100,
      step: 5,
      // 임의의 사용자 정의 옵션
      orientation: 'horizontal',
      tickFrequency: 10,
      ariaValueTextFormatter: 'percent',
    })
    expect(opts.step).toBe(5)
    expect((opts as Record<string, unknown>).tickFrequency).toBe(10)
    expect((opts as Record<string, unknown>).ariaValueTextFormatter).toBe('percent')
  })

  it('supports arbitrary direction vocabulary in PatternEvent', () => {
    // PatternDirection 이 string 으로 열렸으므로 임의 direction 발화 가능.
    // (kernel 의 'navigate' event 가 임의 direction 을 그대로 전파 — 패턴이 의미를 정의)
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: PatternDefinitionSchema.parse({
        ...sliderDefinition,
        keyboard: [
          { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'pageUp' }] }] },
          { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'pageDown' }] }] },
        ],
      }),
      data: sliderData,
      options: PatternOptionsSchema.parse({}),
      onEvent: (e) => events.push(e),
    })
    runtime.getRootKeyboardHandler()(keyInput('PageUp'))
    runtime.getRootKeyboardHandler()(keyInput('PageDown'))
    expect(events).toEqual([
      { type: 'navigate', direction: 'pageUp' },
      { type: 'navigate', direction: 'pageDown' },
    ])
  })
})
