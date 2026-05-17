---
type: proposal
status: draft
date: 2026-05-18
author: 유용태
title: Flat Hook API — { data, onEvent, options } 하나로 끝내기
---

# Flat Hook API

> 현재 demo가 `useXxxReducer` + `useXxxPattern` + `usePatternEffects` 3중 호출 + 내부 state 직접 조회를 요구하는 문제를, 패턴당 단일 훅으로 수렴시킨다.

## TL;DR

- **목적**: 사용자가 알아야 할 개념을 `data`·`onEvent`·`options` 셋으로 축소.
- **원칙**: dispatch·reducer·effect 호출·내부 state 모양은 모두 훅 안에 캡슐화. 사용자는 평탄화된 `items[]`와 spread 가능한 props만 본다.
- **범위**: `src/adapters/react.ts`의 공개 API만 변경. kernel/schema/definition은 0줄 수정.
- **회수**: demo당 LOC ~40% 감소, 신규 사용자가 외워야 할 export 27개(`useXxxPattern`·`useXxxReducer`·`xxxAxis` × 9패턴) → 9개.

---

## 1. 문제 (Why)

### 1.1 현재 사용자가 작성해야 하는 코드

`aria-kernel-apps/apps/site/src/demos/tree.tsx`:

```tsx
const [data, dispatch] = useTreeviewReducer(tree, { defaultExpanded: ['src', 'demos'] })
const { rootProps, itemProps, items } = useTreeviewPattern(data, dispatch)

return (
  <ul {...rootProps}>
    {items.map((item) => (
      <li {...itemProps(item.id)} style={{ paddingLeft: 8 + item.level * 16 }}>
        {item.hasChildren ? (item.expanded ? '▾' : '▸') : ''}
        {item.label}
      </li>
    ))}
  </ul>
)
```

`apg-patterns/demo/src/patterns/treeview/Tree.tsx` (더 심함):

```tsx
const options = (data.state?.options as PatternOptions | undefined) ?? {}
const tree = useTreeviewPattern({ data, options, onEvent })
usePatternEffects({ definition: treeviewDefinition, data, keyToElementId: tree.keyToElementId })

// 사용처에서…
const hasChildren = (data.relations?.childrenByKey?.[item.key]?.length ?? 0) > 0
const expanded = data.state?.expandedKeys?.includes(item.key) ?? false
const indent = (data.state?.levelByKey?.[item.key] ?? 1) * 18
```

### 1.2 사용자가 알아야 하는 개념 — 13개

`useXxxReducer`, `useXxxPattern`, `usePatternEffects`, `dispatch`, `PatternData`, `PatternEvent`, `PatternOptions`, `data.state.expandedKeys`, `data.state.levelByKey`, `data.relations.childrenByKey`, `data.items[k]`, `slotProps.indicator`, `slotProps.treeitem`. **헤드리스 트리 하나 그리는 데 13개.**

### 1.3 본질

| 갭 | 정체 |
|---|---|
| G1 | reducer/runtime/effects 3개 훅이 항상 같이 호출됨 → 묶이지 않은 이유 없음 |
| G2 | `data`의 정규화 형태(state·relations·items 분리)가 외부로 노출 — 내부 표현이지 API가 아님 |
| G3 | `itemProps(id)` 함수 호출 + slotProps 다중 분기 — 평탄화하면 `item.itemProps` 한 줄 |
| G4 | `axisKeys(treeviewAxis())`를 meta에서 사용자가 재조립 — 정적 export로 끝낼 일 |

---

## 2. 이상적인 모양 (What)

### 2.1 Tree

```tsx
import { useTreeview } from '@interactive-os/apg-patterns'

type Node = { id: string; label: string; href?: string; children?: Node[] }

const tree: Node[] = [
  { id: 'src', label: 'src', children: [
    { id: 'app', label: 'App.tsx' },
    { id: 'demos', label: 'demos', children: [
      { id: 'tabs', label: 'tabs.tsx' },
      { id: 'tree', label: 'tree.tsx' },
    ]},
  ]},
  { id: 'pkg', label: 'package.json' },
]

export const meta = {
  title: 'Tree',
  apg: 'treeview',
  kind: 'collection' as const,
  blurb: '...',
  keys: useTreeview.keys,        // 정적 export
}

export default function TreeDemo() {
  const { rootProps, items } = useTreeview({
    data: tree,
    defaultExpanded: ['src', 'demos'],
    // onEvent: (e) => {},  // optional
  })

  return (
    <ul {...rootProps} aria-label="Files" className="…">
      {items.map((item) => (
        <li
          key={item.id}
          {...item.itemProps}
          style={{ paddingLeft: 8 + item.level * 16 }}
          className="…"
        >
          {item.hasChildren && (
            <span aria-hidden>{item.expanded ? '▾' : '▸'}</span>
          )}
          {item.label}
        </li>
      ))}
    </ul>
  )
}
```

### 2.2 Listbox (동형)

```tsx
const { rootProps, items } = useListbox({
  data: FRUITS,          // { id, label }[]
  defaultSelected: ['banana'],
})

return (
  <ul {...rootProps} aria-label="Fruits">
    {items.map((item) => (
      <li key={item.id} {...item.optionProps}>{item.label}</li>
    ))}
  </ul>
)
```

### 2.3 시그니처

```ts
function useTreeview<T extends { id: string; children?: T[] }>(opts: {
  data: T[]
  defaultExpanded?: string[]
  defaultSelected?: string[]
  expanded?: string[]                 // controlled
  selected?: string[]                 // controlled
  onEvent?: (e: TreeviewEvent) => void
  getLabel?: (node: T) => string      // default: node.label
}): {
  rootProps: HTMLAttributes<HTMLElement>
  items: Array<{
    id: string
    label: string
    level: number
    expanded: boolean
    selected: boolean
    hasChildren: boolean
    itemProps: HTMLAttributes<HTMLElement>
    toggleProps: ButtonHTMLAttributes<HTMLButtonElement>
    data: T                           // escape hatch
  }>
}

useTreeview.keys: string[]            // 정적 — axisKeys(treeviewAxis()) 흡수
```

`useListbox`·`useMenu`·`useTabs` 등 27개 패턴 모두 같은 템플릿:
- `(opts: { data, onEvent?, ...defaults }) → { rootProps, items }`
- `items[].xxxProps`로 spread 위치 표시
- 원본 노드는 `item.data`로 escape

---

## 3. 비교

| 축 | 지금 | 제안 |
|---|---|---|
| 사용자가 호출하는 훅 수 | 2~3개 (`useXxxReducer` + `useXxxPattern` + `usePatternEffects`) | **1개** |
| dispatch 노출 | O — 사용자가 들고 다님 | X — onEvent로만 관찰 |
| 내부 state 직접 조회 | `data.state.expandedKeys.includes(...)` | `item.expanded` |
| 관계 직접 조회 | `data.relations.childrenByKey[k]?.length` | `item.hasChildren` |
| 깊이 직접 조회 | `data.state.levelByKey[k]` | `item.level` |
| 노드별 props | `itemProps(id)` 함수 호출 | `item.itemProps` (spread만) |
| 슬롯 props | `slotProps.indicator` / `slotProps.treeitem` 분기 | `item.toggleProps` + `item.itemProps` 평탄화 |
| effect 호출 | `usePatternEffects(...)` 별도 | 훅 안에 흡수 |
| meta.keys | `axisKeys(treeviewAxis())` 사용자가 조립 | `useTreeview.keys` 정적 |
| **demo LOC (tree)** | 23 라인 | **14 라인** |
| **사용자가 외울 export** | 27 (`useXxxPattern`·`useXxxReducer`·`xxxAxis` × 9) | **9** (`useXxx` × 9) |

---

## 4. 구현 전략 (How)

### 4.1 내부 구조는 그대로

- kernel·schema·definition·runtime 어휘는 0줄 수정.
- `useTreeview`는 기존 `useTreeviewReducer` + `useTreeviewPattern` + `usePatternEffects`를 **그 안에서** 호출하는 얇은 합성 훅으로 시작.
- `data.state.*`·`data.relations.*`를 `items[]` 평탄화 단계에서 한 번에 매핑.

### 4.2 단계

1. **(1d)** `useTreeview` / `useListbox` 신설 — 기존 훅 합성 + 평탄화. 기존 export는 유지.
2. **(0.5d)** `aria-kernel-apps`의 demo를 새 API로 전환 — diff로 LOC·개념 수 회수 측정.
3. **(2d)** 나머지 25개 패턴에 같은 템플릿 적용. 패턴별 차이는 `items[].xxxProps` 슬롯 이름과 옵션뿐.
4. **(0.5d)** 기존 `useXxxPattern`/`useXxxReducer`는 `@deprecated` 마킹. advanced escape hatch로 유지.

### 4.3 What-if

- **사용자가 controlled 상태가 필요할 때?** → `expanded` / `selected` prop으로 외부 주입. `onEvent`로 변경 관찰. 현재 dispatch 노출과 동일한 표현력.
- **사용자가 raw `data`·`dispatch`가 필요할 때?** → `useTreeviewPattern`·`useTreeviewReducer`를 그대로 사용. 새 훅이 옛 훅을 가린다, 죽이지 않는다.
- **타입 추론?** → `T extends { id: string; children?: T[] }`로 노드 타입 보존. `item.data`는 `T`.

---

## 5. 검증 게이트

- demo `tree.tsx`·`listbox.tsx` 새 API로 전환 후 기존 키보드 테스트 100% 통과.
- 새 demo에서 `useState`·`useRef`·`useLayoutEffect` 0개.
- `data.state.*`·`data.relations.*`·`dispatch` 식별자 demo 코드에 0회 등장 (grep gate).

---

## 6. 결정 필요

- [ ] 훅 네이밍: `useTreeview` (제안) vs `useTreeviewHeadless` vs `createTreeview`
- [ ] 기존 `useXxxPattern`·`useXxxReducer` 처리: `@deprecated` 유지 vs 즉시 제거
- [ ] `item.toggleProps` 같은 슬롯 props: 평탄화(`item.toggleProps`) vs 묶음(`item.slotProps.toggle`)
