---
type: proposal
status: superseded
date: 2026-05-17
author: 유용태
title: Declarative Runtime Expansion — useState 0 / 100% Serializable
---

# Declarative Runtime Expansion

> Status: superseded as an implementation plan.
>
> Keep this document only as historical diagnosis of declarative runtime gaps.
> The current React-facing direction is:
>
> - `PatternDefinitionSchema.react` facade descriptors
> - `useXPattern(data, onEvent, options?)`
> - `rootProps` + `renderItems`
> - optional future preset renderers for LLM-facing usage
>
> See:
>
> - `docs/proposals/2026-05-18-react-facade-zod-blind-loop.md`
> - `docs/proposals/2026-05-18-llm-friendly-apg-react-api.md`
>
> Do not implement this proposal literally. In particular, the old `usePattern(definition, { data, onEvent })` public API and "per-pattern runtime.ts -> 0" target are no longer the active direction.

> 27개 APG 패턴 등록 회고에서 발견한 **9곳의 useState 우회**와 **16곳의 명령형 중복**을 schema/runtime 어휘 확장으로 일거에 흡수한다.

## TL;DR

- **목적**: PatternDefinition만으로 모든 widget 패턴을 표현. demo 컴포넌트의 `useState`·`useRef`·`useLayoutEffect`를 0개로 수렴.
- **원칙**: 100% JSON 직렬화 가능. definition.ts에 함수 0개. effect도 description object.
- **범위**: kernel(schema/patternKernel/patternRuntime) **0줄 수정** 유지. 신규 어휘는 모두 `defineEffect`/`defineInput`/`defineReducer` OCP 훅으로 등록.
- **회수**: 9곳 useState + 16곳 명령형 중복 → 0곳. 4개 per-pattern runtime.ts → 0~1개.

---

## 1. 문제 (Why)

### 1.1 정량 진단 — 27개 패턴 등록 후 측정값

| 항목 | 값 |
|---|---|
| `useState` 잔존 패턴 | 9개 (dialog·alertdialog·alert·tooltip·carousel·treegrid·menu close·combobox close·feed focus) |
| `useLayoutEffect → focus()` 호출 | 9곳 (listbox·tree·tabs·grid·slider·spinbutton·accordion·toolbar·combobox) |
| type-ahead first-char buffer 재구현 | 4곳 (listbox·menu·tree·combobox) |
| Escape→close+focus restore 재구현 | 5곳 (dialog·alertdialog·menu·combobox·tooltip) |
| Outside-click dismiss 재구현 | 3곳 (menu·combobox·dialog) |
| `CSS.escape` 폴리필 (테스트) | 8곳 |
| `src/patterns/*/runtime.ts` per-pattern 파일 | 4개 (treeview·tabs·disclosure·treegrid) |

### 1.2 본질 — Schema 어휘 밖 5개 갭

| # | 갭 | 본질 |
|---|---|---|
| G1 | 명령형 효과 (focus/trap/restore/dismiss/scroll/autoplay) | definition은 ARIA projection만 가능, **DOM 부작용 어휘 없음** |
| G2 | 임시 상태 슬롯 (open/hover/pressed/focused/previous) | `state`가 `activeKey/selectedKeys/expandedKeys`로 닫혀 있음 |
| G3 | Cross-part keyToken ctx (cell→row, child→parent) | resolver가 `$key/$activeKey`만 알아 부모/소유자 좌표 부재 |
| G4 | Extension event ↔ reducer 레이스 | extension은 reducer를 통과하지만 데이터 변환은 demo가 수동 |
| G5 | Render-side ARIA override | component spread가 emit된 aria-* 를 `undefined`로 덮어쓸 수 있음 |

### 1.3 OCP 약속 깨짐

> "새 패턴 추가가 정의 + resolver 등록만으로 가능하다"

— 18개 패턴은 약속이 지켜졌으나, **modal/overlay/cross-part 9개 패턴은 정의 + React 명령형 코드**가 필요했다. retro에서 가장 자주 본 코멘트: *"Demo는 kernel runtime을 쓰지 않고 React state로 직접 제어"*.

---

## 2. 이상적 결과 (What)

```ts
// Dialog 같은 가장 명령형이었던 패턴조차 이렇게 끝난다:
export function Dialog({ data, onEvent }: Props) {
  const runtime = usePattern(dialogDefinition, { data, onEvent })
  return (
    <>
      <button {...runtime.getPartProps('trigger')}>Open</button>
      {runtime.isOpen('dialog') && (
        <div {...runtime.getPartProps('overlay')}>
          <div {...runtime.getPartProps('dialog')}>
            <h2 {...runtime.getPartProps('title')}>...</h2>
            <button {...runtime.getPartProps('confirm')}>OK</button>
          </div>
        </div>
      )}
    </>
  )
}
```

- ❌ `useState` 0개
- ❌ `useRef` 0개
- ❌ `useEffect`/`useLayoutEffect` 0개
- ✅ `runtime.isOpen()`은 `data.state.openKeys.includes('dialog')` 단순 derived getter
- ✅ focus trap, Escape close, focus restore — 모두 definition.effects[]가 declarative emit

---

## 3. 해결 (How) — Primitives 5축 확장

memory의 5축 모델 (INPUT·NAV TOPOLOGY·STATE·EFFECT·SEMANTIC)을 갱신한다.

### 3.1 EFFECT 축 (🆕 신규)

**가장 큰 갭. 9곳 명령형 + 9개 패턴 useState의 80% 흡수.**

```ts
// definition.ts 안에 effects[] 선언 (JSON 직렬화 가능)
effects: [
  {
    on: { kind: 'stateChange', path: 'state.activeKey' },
    effect: { kind: 'focus', target: '$activeKey' },
  },
  {
    on: { kind: 'stateChange', path: 'state.openKeys', op: 'add' },
    effect: { kind: 'focusTrap', container: '$payload.key' },
  },
  {
    on: { kind: 'stateChange', path: 'state.openKeys', op: 'remove' },
    effect: { kind: 'focusRestore', from: 'state.previousFocusedKey' },
  },
  {
    on: { kind: 'event', type: 'expand' },
    effect: { kind: 'scrollIntoView', target: '$payload.key' },
  },
]
```

| effect 어휘 | 시그니처 | 흡수하는 중복 |
|---|---|---|
| `focus` | `{ target: KeyToken }` | 9곳 useLayoutEffect |
| `focusTrap` | `{ container: KeyToken }` | dialog/alertdialog 2곳 |
| `focusRestore` | `{ from: StatePath }` | 5곳 Escape close |
| `scrollIntoView` | `{ target, behavior }` | listbox scrollable·rearrange |
| `dismissOn` | `{ input: 'pointerOutside'\|'escape'\|'blur' }` | menu/combobox/dialog 3곳 |
| `autoplay` | `{ interval, action }` | carousel |

**등록 메커니즘**: `defineEffect(name, executor)`. executor는 React adapter가 `useEffect`로 dispatch. SSR 환경에서는 no-op.

### 3.2 STATE 축 확장 (🔧 슬롯 추가)

```ts
// PatternData.state — optional 확장 (backward compat 보장)
state: {
  // 기존 ─────────
  activeKey?: string
  selectedKeys?: string[]
  disabledKeys?: string[]
  expandedKeys?: string[]
  valueByKey?: Record<string, number>
  pressedKeys?: string[]
  // 신규 ─────────
  openKeys?: string[]                 // dialog/menu/tooltip open
  hoveredKey?: string | null          // tooltip hover
  focusedKey?: string | null          // focus 위치 (activeKey와 분리)
  previousFocusedKey?: string | null  // close 시 복귀 대상
  phaseByKey?: Record<string, 'idle' | 'entering' | 'open' | 'leaving'>
}
```

모두 optional + JSON 직렬화 가능. 기존 9개 패턴은 사용 안 함 → 회귀 0.

### 3.3 INPUT 축 확장 (🔧 어휘 추가)

```ts
// definition.ts
keyboard: [...] // 기존
pointer: [
  { event: 'click', when: { kind: 'modifier', shift: true }, events: [...] },
  { event: 'hover', events: [{ type: 'hover', key: '$key' }] },
  { event: 'outside', container: '$rootKey', events: [{ type: 'close' }] },
]
typeAhead: { window: 500, source: 'items.label', emit: { type: 'focus' } }
```

| 입력 어휘 | 흡수하는 중복 |
|---|---|
| `pointer.click.modifier {shift, ctrl}` | listbox/grid multi-select 2곳 |
| `pointer.hover` | tooltip |
| `pointer.outside` | menu/combobox/dialog 3곳 |
| `pointer.drag` | slider/splitter (현재는 키보드만) |
| `typeAhead { window, source }` | listbox/menu/tree/combobox 4곳 |

### 3.4 NAV TOPOLOGY 축 통합 (🔧 흡수)

per-pattern `runtime.ts` 4개를 kernel 등록 토큰으로 통합:

```ts
// 기존: src/patterns/treeview/runtime.ts (140줄), tabs/runtime.ts (73줄) ...
// 통합 후: kernel visibleOrder 토큰 등록만으로 끝
defineVisibleOrder('treegrid', (data, ctx) => /* ... */)
```

| 통합 대상 | 현재 LOC | 통합 후 |
|---|---|---|
| treeview/runtime.ts | 140 | kernel 토큰 |
| tabs/runtime.ts | 73 | kernel 토큰 |
| disclosure/runtime.ts | 75 | kernel 토큰 |
| treegrid/navigation.ts | ~150 | kernel 토큰 (treeview+grid 조합) |

### 3.5 SEMANTIC 축 강화 (🔧 frozen + mixin)

```ts
// runtime.getPartProps() 반환값은 Object.freeze
// React adapter: aria-* 가 undefined로 override 되는 케이스 dev warning

// value-bearing mixin (slider/spinbutton/meter/windowsplitter 공통)
const valueBearingMixin = {
  aria: [
    { attribute: 'aria-valuemin', from: 'options.min' },
    { attribute: 'aria-valuemax', from: 'options.max' },
    { attribute: 'aria-valuenow', from: 'state.valueByKey' },
    { attribute: 'aria-valuetext', from: 'items.valuetext' },
    { attribute: 'aria-orientation', from: 'options.orientation' },
  ],
}
```

---

## 4. 실행 계획 (PRT)

총 5개 PR, 순차 진행. 각 PR마다 230 테스트 회귀 0 + 신규 회귀 테스트 추가.

### PR-1. EFFECT 축 도입 + STATE.openKeys

**범위**: `defineEffect` 훅, kernelBuiltins에 6개 effect 등록, React adapter에 effect dispatcher, `state.openKeys/previousFocusedKey` 슬롯.

**검증 대상 패턴** (이 PR로 useState 0개 달성):
- dialog, alertdialog, tooltip, alert, menu close, combobox close

**예상 절감**: useState 6곳, useLayoutEffect 5곳, useRef 4곳 → 0.

### PR-2. INPUT 확장 (typeAhead + pointerOutside + click.modifier)

**범위**: `defineInput`, typeAhead resolver, pointerOutside DOM 리스너 (React adapter).

**검증 대상**: listbox·menu·tree·combobox(typeahead 4곳), menu·combobox·dialog(outside 3곳), listbox·grid(multi-select 2곳).

**예상 절감**: demo 명령형 코드 ~9곳.

### PR-3. NAV TOPOLOGY 통합

**범위**: 4개 per-pattern runtime.ts를 kernel `defineVisibleOrder/NavigationTarget` 토큰으로 흡수.

**예상 절감**: runtime.ts 4개 파일, ~440 LOC.

### PR-4. SEMANTIC frozen + value-bearing mixin

**범위**: `getPartProps()` 결과 frozen, slider/spinbutton/meter/windowsplitter 공통 mixin 추출.

**예상 절감**: 4개 패턴 definition.ts 평균 30% 축약, Listbox aria-posinset 버그 차단.

### PR-5. Cross-part keyToken ctx (G3)

**범위**: KeyTokenContext에 `$parentKey/$ownerKey/$rowKey/$rootSiblings`. relations 역방향 인덱스 자동 빌드.

**검증 대상**: treegrid (cell→row 수동 변환 제거), disclosure navMenu (mutual exclusion declarative화).

---

## 5. 부작용 분석 (NBR)

| 부작용 | 비교 | 대응 |
|---|---|---|
| `PatternData.state` 슬롯 추가 → 기존 9개 패턴 마이그레이션 우려 | optional 슬롯이라 미마이그레이션 가능 | 기존 230 테스트 회귀 0 확인 |
| effect dispatcher가 React `useEffect` 자동 발화 → 테스트 act() warning 가능 | act() 안에서 fireEvent 자연 처리 | 신규 effect별 회귀 테스트 |
| `defineEffect` executor가 React 의존 | SSR/Vue/RN 이식성 ↓ | effect = description, executor는 어댑터별 → React executor만 우선 |
| Object.freeze가 className/style 합치기 차단 | className은 ARIA 아님 — 분리 | frozen은 `aria-*`/`role`/`id`만 |
| Cross-part ctx 역방향 인덱스 빌드 비용 | items 수가 큰 트리 O(N) 1회 | useMemo로 캐싱 |

**기각 대안**:
- ❌ **kernel 리팩토링 (Option C)**: PR 크기 폭증·27 패턴 동시 회귀 위험
- ❌ **per-pattern 임시 어휘 추가**: OCP 위반·앞으로도 같은 패턴 반복
- ❌ **명령형 escape hatch 유지**: 사용자 제약(100% 선언적) 위반

---

## 6. FRT 게이트 결과

| # | 검증 | 판정 |
|---|---|---|
| 1 | ⑪→⑤ 5개 갭 모두 어휘로 흡수 | 🟢 |
| 2 | ⑪→⑥ "schema 어휘 밖" 원인 제거 | 🟡 (미래 갭 보장 불가, 5축 모델은 열림 구조로 설계) |
| 3 | ⑪→⑦ 100% 직렬화 + 선언 | 🟢 |
| 4 | ⑪→⑧ kernelBuiltins/defineXxx/RFC 6902 재활용 | 🟢 |
| 5 | ⑪→⑫ 부작용 < 갭 | 🟡 (위 표 5건 명시) |
| 6 | ⑨ 기각 대안 ≥2 | 🟢 |

**전체 판정**: 핵심 🟢, 후행 🟡. 사용자 명시 동의로 진행 가능.

---

## 7. 성공 기준 (DoD)

| 항목 | 목표 |
|---|---|
| demo의 `useState` (PatternData 제외) | **0곳** |
| demo의 `useLayoutEffect/useEffect/useRef` | **0~3곳** (React adapter 진입점 외) |
| `src/patterns/*/runtime.ts` | **0~1개** |
| `CSS.escape` 폴리필 | **0** (`data-key` selector로 전환) |
| 기존 230 테스트 회귀 | **0건** |
| 새 effect/input 어휘별 회귀 테스트 | 각 ≥1건 |
| definition.ts에 함수 | **0개** (JSON.stringify(definition) round-trip OK) |
| coverage Lines | ≥85% (현재 75%) |

---

## 8. Open Questions

- **Q1**. RFC 6902 JSON Patch를 reducer DSL로 채택할 것인가, zod-friendly 자체 DSL인가?
- **Q2**. effect executor를 어댑터별로 plug-in 할 것인가, React 한정으로 시작할 것인가?
- **Q3**. `state.openKeys`가 `expandedKeys`와 의미 중복하지 않는가? (정의: expanded=tree disclosure, open=overlay)
- **Q4**. PR-1을 단일 PR로 묶을지, effect 어휘 6개를 개별 PR로 쪼갤지?

---

## 9. 부록 — Primitives 5축 갱신 다이어그램

```
┌───────── INPUT ─────────┐  ┌─────── NAV TOPOLOGY ───────┐
│ keyboard                 │  │ flat                        │
│ pointer.click[.modifier] │  │ tree   (visibleTreeItems)   │
│ pointer.hover     🆕     │  │ grid   (rows × cols)        │
│ pointer.outside   🆕     │  │ treegrid  🆕                │
│ pointer.drag      🆕     │  └─────────────────────────────┘
│ typeAhead         🆕     │
└──────────────────────────┘
            │
            ▼
┌────────── STATE ──────────────────────────────────┐
│ activeKey · selectedKeys · disabledKeys           │
│ expandedKeys · valueByKey · pressedKeys           │
│ openKeys 🆕 · hoveredKey 🆕 · focusedKey 🆕       │
│ previousFocusedKey 🆕 · phaseByKey 🆕             │
└────────────────────────────────────────────────────┘
            │
            ▼
┌──── EFFECT 🆕 ────┐    ┌──── SEMANTIC ────┐
│ focus              │    │ aria projection    │
│ focusTrap          │    │ data-* projection  │
│ focusRestore       │    │ frozen contract 🆕 │
│ scrollIntoView     │    │ value-bearing mixin 🆕│
│ dismissOn          │    └────────────────────┘
│ autoplay           │
└────────────────────┘
```
