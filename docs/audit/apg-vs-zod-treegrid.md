---
title: APG vs zod — treegrid audit
pattern: treegrid
sources:
  - https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/
  - src/patterns/treegrid/definition.ts
  - src/schema/patternDefinition.ts
date: 2026-05-17
---

# treegrid — W3C APG ↔ repo definition ↔ zod schema

## 1. Roles

| W3C APG | repo `containedRoles` | repo `parts.*.role` | Δ |
|---|---|---|---|
| `treegrid` | (root) | `treegrid` | ✓ |
| `row` | ✓ | `row` | ✓ |
| `gridcell` | ✓ | `gridcell` | ✓ |
| `columnheader` | ✓ | `columnheader` | ✓ |
| `rowheader` | ✓ | — | **missing-in-repo** (declared in `containedRoles` but no `parts.rowheader` definition) |
| `rowgroup` (optional) | — | — | missing-in-repo (optional per APG; OK to defer) |

## 2. ARIA attributes

W3C APG는 treegrid 컨테이너/row/cell 에 다음 속성을 명시한다. repo 의 part 별 `aria` 프로젝션과 비교:

| Attribute | APG 위치 | repo 위치 | zod enum 포함? | Δ |
|---|---|---|---|---|
| `aria-label` | treegrid | treegrid | ✓ | ✓ |
| `aria-labelledby` | treegrid | treegrid | ✓ | ✓ |
| `aria-describedby` | treegrid (선택) | — | ✓ | **missing-in-repo** |
| `aria-rowcount` | treegrid | treegrid | ✓ | ✓ |
| `aria-colcount` | treegrid | treegrid | ✓ | ✓ |
| `aria-multiselectable` | treegrid | treegrid | ✓ | ✓ |
| `aria-readonly` | treegrid / cell | — | ✓ | **missing-in-repo** (zod source `state.readonly` 는 존재하지만 어떤 part 도 project 하지 않음) |
| `aria-rowindex` | row / cell | row, gridcell, columnheader | ✓ | ✓ |
| `aria-colindex` | cell | gridcell, columnheader | ✓ | ✓ |
| `aria-level` | row | row | ✓ | ✓ |
| `aria-expanded` | row (자식 있는 경우) | row | ✓ | ✓ |
| `aria-selected` | row / cell | row, gridcell | ✓ | ✓ |
| `aria-sort` | columnheader | columnheader | ✓ | ✓ |
| `aria-rowspan` | cell (선택, non-HTML) | — | **✗ (enum 누락)** | **missing-in-zod + missing-in-repo** |
| `aria-colspan` | cell (선택, non-HTML) | — | **✗ (enum 누락)** | **missing-in-zod + missing-in-repo** |
| `aria-owns` | treegrid (소유 row/cell) | — | **✗ (enum 누락)** | **missing-in-zod + missing-in-repo** |
| `aria-posinset` | row (선택) | — | ✓ | naming/wiring: zod 에는 있고 listbox/menu 등 다른 패턴이 씀. treegrid 에선 `aria-rowindex` 로 대체 가능 — 의도적 omission 으로 보임 |
| `aria-setsize` | row (선택) | — | ✓ | 위와 동일 사유 |

## 3. Keyboard

| W3C APG shortcut | APG action | repo shortcut | repo action | Δ |
|---|---|---|---|---|
| Enter | first-col 이고 자식 있으면 expand/collapse, 아니면 default cell action | `Enter` | 동일 (toggle / activate) | ✓ |
| Tab | row 내 다음 focusable, 마지막이면 treegrid 밖으로 | — | — | **missing-in-repo** (브라우저 기본 동작에 위임 가능 — intentional 일 수 있으나 문서화 필요) |
| Right Arrow | collapsed 면 expand, expanded 면 first cell, 아니면 →1 | `ArrowRight` | 동일 | ✓ |
| Left Arrow | expanded 면 collapse, first cell 이면 parent row, 아니면 ←1 | `ArrowLeft` | 동일 | ✓ |
| Down Arrow | ↓1 | `ArrowDown` | ✓ | ✓ |
| Up Arrow | ↑1 | `ArrowUp` | ✓ | ✓ |
| Page Down | author 정의 행만큼 ↓ | `PageDown` | `navigate pageDown` | ✓ (이번 작업으로 추가) |
| Page Up | author 정의 행만큼 ↑ | `PageUp` | `navigate pageUp` | ✓ (이번 작업으로 추가) |
| Home | 현재 행 first cell 또는 first row | `Home` | `rowStart` | partial — APG 는 "first cell in current row **또는** first row" 두 모드. repo 는 row-start 만 |
| End | 현재 행 last cell 또는 last row | `End` | `rowEnd` | partial — 위와 동일 |
| Control+Home | 같은 열의 first row first cell | `Control+Home` | `gridStart` | ✓ |
| Control+End | 같은 열의 last row last cell | `Control+End` | `gridEnd` | ✓ |
| Control+Space | 모든 cell 또는 열 선택 | `Control+Space` | `treegridSelectColumn` ext | partial — APG 는 row-focus 시 "select all" 의미 포함. repo 는 column 만 |
| Shift+Space | 현재 행 선택 | `Shift+Space` | `treegridSelectRow` ext | ✓ |
| Control+A | 모든 cell 선택 | `Control+a` | `treegridSelectAll` ext | ✓ |
| Shift+Right Arrow | 오른쪽으로 selection 확장 (cell focus) | `Shift+ArrowRight` | `extendSelection right` ext | ✓ |
| Shift+Left Arrow | 왼쪽으로 selection 확장 (cell focus) | `Shift+ArrowLeft` | `extendSelection left` ext | ✓ |
| Shift+Down Arrow | 아래로 selection 확장 또는 다음 행 전체 | `Shift+ArrowDown` | `extendSelection down` ext | partial — "다음 행 전체" 분기는 미모델 |
| Shift+Up Arrow | 위로 selection 확장 또는 이전 행 전체 | `Shift+ArrowUp` | `extendSelection up` ext | partial — 동일 |
| — | — | `Shift+Home` | `extendSelection rowStart` ext | **extra-in-repo** (APG 미명시. 일반적 grid extension 으로 합리적이나 spec 출처 명기 필요) |
| — | — | `Shift+End` | `extendSelection rowEnd` ext | **extra-in-repo** (동일) |
| F2 (편집 진입) | — | — | — | spec 외 — 일부 grid 예제에서만 등장. 이 패턴 외 |

## 4. Focus model

| 항목 | W3C APG | repo |
|---|---|---|
| 지원 모드 | **row focus** (행 전체 포커스) **+ cell focus** (cell 별 포커스) 둘 다 | **cell focus 만** (cellFocus 적용 대상이 gridcell/columnheader) |
| Δ | row-focus 모드 미모델 — `parts.row.focus` 누락. row tabIndex 미부여 → row 가 포커스 가질 수 없음 | partial |

## 5. zod 스키마 갭 요약

이 감사에서 드러난 zod 보강 필요 항목:

1. `AriaAttributeSchema` 에 추가 필요: `aria-rowspan`, `aria-colspan`, `aria-owns` (W3C APG treegrid 가 명시).
2. (선택) `aria-describedby` 는 enum 에는 있으나 어떤 패턴도 project 하지 않음 — 컨테이너 패턴들에서 `refs.describedBy` AriaSourcePath 와 함께 도입 검토.
3. row-focus 모드를 표현하려면 `parts.row.focus` 가 가능해야 하는데, `PartSchema` 자체는 이미 허용. 누락은 zod 가 아니라 treegrid definition.

## 6. 결론 (treegrid)

- **missing-in-repo (정합 위반)**: rowheader part, aria-readonly 프로젝션, row-focus 모드, Home/End 의 row-mode 분기, Ctrl+Space 의 row-mode all-select 분기, Shift+Arrow 의 row-extent 분기.
- **missing-in-zod**: `aria-rowspan` / `aria-colspan` / `aria-owns` enum.
- **extra-in-repo (spec 초과)**: `Shift+Home` / `Shift+End` — APG treegrid 표에 없음. 다른 grid 패턴 관습이라면 출처 주석 필요.
- **fully matched**: 컨테이너 ARIA(label/rowcount/colcount/multiselectable), row aria-level/expanded/selected, cell aria-rowindex/colindex/selected, columnheader aria-sort, Arrow/Ctrl+Home/Ctrl+End/Ctrl+A/Shift+Space/Page* 키.

다음 단계는 위 갭 중 어느 항목을 실제 코드로 수렴시킬지 선택하는 것. (zod enum 보강 → repo definition 보강 → 테스트 보강 순서를 추천)
