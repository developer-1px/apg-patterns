/**
 * Kernel 이 기본 등록하는 토큰의 type-safe 상수 모음.
 *
 * 이유:
 *   - 토큰 어휘가 `z.string()` 으로 열려 있어 LLM/사람이 임의로 발명하면 fragmentation 발생.
 *     (관측 사례: 한 agent 가 `menu.firstChild` 를 발명했지만 kernel/treeview 에는 unscoped `firstChild` 가 이미 존재.)
 *   - 이 모듈을 import 해서 상수로 참조하면 IDE autocomplete + typo 차단 + 어휘 통일 효과.
 *
 * 사용 예:
 *   import { AriaSources, NavigationTargets, Directions } from './kernelVocabulary'
 *   { attribute: 'aria-label', from: AriaSources.refs.label }
 *   { kind: NavigationTargets.linear, action: Directions.next }
 *
 * 새 토큰을 등록하면 여기에도 상수를 추가한다 — 그게 정본(canonical) 어휘다.
 * 등록만 하고 상수를 안 추가하면 "비공식 어휘" — 다른 패턴이 못 발견한다.
 */

// AriaSource — 부품의 ARIA attribute 값을 가져오는 토큰
export const AriaSources = {
  refs: {
    label: 'refs.label',
    labelledBy: 'refs.labelledBy',
  },
  items: {
    label: 'items.label',
    labelledBy: 'items.labelledBy',
  },
  relations: {
    controlsByKey: 'relations.controlsByKey',
    ownerByKey: 'relations.ownerByKey',
  },
  state: {
    selectedKeys: 'state.selectedKeys',
    disabledKeys: 'state.disabledKeys',
    expandedKeys: 'state.expandedKeys',
    activeKeyElementId: 'state.activeKey.elementId',
    checkedByKey: 'state.checkedByKey',
    pressedByKey: 'state.pressedByKey',
    levelByKey: 'state.levelByKey',
    posInSetByKey: 'state.posInSetByKey',
    setSizeByKey: 'state.setSizeByKey',
    rowIndexByKey: 'state.rowIndexByKey',
    columnIndexByKey: 'state.columnIndexByKey',
    sortByKey: 'state.sortByKey',
  },
  options: {
    orientation: 'options.orientation',
    selectionModeMultiple: 'options.selectionMode.multiple',
  },
} as const

// StateProjection.from — 부품의 렌더 state(active/selected/...) 의 출처 토큰
export const StateSources = {
  activeKey: 'state.activeKey',
  selectedKeys: 'state.selectedKeys',
  disabledKeys: 'state.disabledKeys',
  expandedKeys: 'state.expandedKeys',
  checkedByKey: 'state.checkedByKey',
} as const

// NavigationTarget.kind — kernel 이 기본 등록한 navigation target
export const NavigationTargets = {
  linear: 'linear',          // visibleKeys 위 next/previous/first/last
  firstChild: 'firstChild',  // 자식 첫 항목 (트리)
  parentKey: 'parentKey',    // 부모 (트리)
} as const

// VisibleOrder.kind — kernel 이 기본 등록한 visible order
export const VisibleOrders = {
  flat: 'flat',                          // relations.rootKeys 평면 순회
  treeVisibleDepthFirst: 'treeVisibleDepthFirst', // 트리 깊이우선
} as const

// PatternDirection — navigate event 의 direction 어휘.
// kernel 의 'linear' navigation target 이 인지하는 표준 verb.
// 새 direction (예: pageUp/increment/...) 은 패턴이 자유롭게 사용하되,
// 의미 충돌을 피하려면 여기 상수에 추가하고 navigationTarget resolver 가 처리해야 한다.
export const Directions = {
  next: 'next',
  previous: 'previous',
  first: 'first',
  last: 'last',
  child: 'child',
  parent: 'parent',
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
} as const

// KeyToken — EventTemplate / Predicate 안에서 key 자리를 가리키는 placeholder.
export const KeyTokens = {
  key: '$key',                 // 현재 이벤트가 발화된 part 의 key (item 키)
  activeKey: '$activeKey',     // data.state.activeKey
  anchorKey: '$anchorKey',     // multi-select 의 anchor
  extentKey: '$extentKey',     // multi-select 의 extent
} as const

// PartEventBinding.event — DOM event 이름. kernel 에서 React handler prop 으로 매핑된 어휘.
export const DomEvents = {
  focus: 'focus',
  blur: 'blur',
  click: 'click',
  dblclick: 'dblclick',
  keydown: 'keydown',
  keyup: 'keyup',
  input: 'input',
  change: 'change',
  pointerdown: 'pointerdown',
  pointerup: 'pointerup',
  pointermove: 'pointermove',
  mouseenter: 'mouseenter',
  mouseleave: 'mouseleave',
} as const
