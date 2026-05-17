import { z } from 'zod'

export const KeySchema = z.string().min(1)
export type Key = z.infer<typeof KeySchema>

export const IdRefListSchema = z.union([KeySchema, z.array(KeySchema).readonly()])
// KeyToken — '$key'/'$activeKey' 외에 패턴별 토큰($anchorKey/$extentKey 등) 추가 가능.
// kernel 의 keyToken registry 가 등록되지 않은 토큰을 진단한다.
export const KeyTokenSchema = z.string().min(1).startsWith('$')

export const PatternItemSchema = z
  .object({
    label: z.string().optional(),
    labelledBy: IdRefListSchema.optional(),
    textValue: z.string().optional(),
    itemValue: z.unknown().optional(),
    kind: z.string().optional(),
  })
  .passthrough()

// relations 는 optional family 집합이다. 각 APG pattern 이 필요한 relation slice 를 자기 refinement/resolver 에서 요구한다.
export const PatternRelationsSchema = z
  .object({
    rootKeys: z.array(KeySchema).readonly().optional(),
    childrenByKey: z.record(KeySchema, z.array(KeySchema).readonly()).optional(),
    ownerByKey: z.record(KeySchema, KeySchema).optional(),
    controlsByKey: z.record(KeySchema, z.array(KeySchema).readonly()).optional(),
    rowKeys: z.array(KeySchema).readonly().optional(),
    columnKeys: z.array(KeySchema).readonly().optional(),
    cells: z
      .array(z.object({ rowKey: KeySchema, columnKey: KeySchema, cellKey: KeySchema }).strict())
      .readonly()
      .optional(),
  })
  .strict()

// State 는 패턴이 자유롭게 확장 가능한 형태 — passthrough.
// kernel 이 공통으로 인지하는 well-known 필드(activeKey/selectedKeys/...)만 명시 검증하고,
// 패턴별 state 필드(valueByKey/orientationByKey/...)는 사용자가 등록해 사용한다.
export const PatternStateSchema = z
  .object({
    activeKey: KeySchema.nullish(),
    anchorKey: KeySchema.nullish(),
    extentKey: KeySchema.nullish(),
    selectedKeys: z.array(KeySchema).readonly().optional(),
    expandedKeys: z.array(KeySchema).readonly().optional(),
    disabledKeys: z.array(KeySchema).readonly().optional(),
    checkedByKey: z.record(KeySchema, z.union([z.boolean(), z.literal('mixed')])).optional(),
    pressedByKey: z.record(KeySchema, z.union([z.boolean(), z.literal('mixed')])).optional(),
    currentByKey: z.record(KeySchema, z.union([z.boolean(), z.string()])).optional(),
    invalidByKey: z.record(KeySchema, z.union([z.boolean(), z.enum(['grammar', 'spelling'])])).optional(),
    requiredKeys: z.array(KeySchema).readonly().optional(),
    busyKeys: z.array(KeySchema).readonly().optional(),
    modalKeys: z.array(KeySchema).readonly().optional(),
    levelByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    posInSetByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    setSizeByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    rowIndexByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    columnIndexByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    sortByKey: z.record(KeySchema, z.enum(['ascending', 'descending', 'other'])).optional(),
    valueByKey: z.record(KeySchema, z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
    rangeValueByKey: z.record(KeySchema, z.object({ min: z.number().optional(), max: z.number().optional(), now: z.number(), text: z.string().optional() }).strict()).optional(),
    typeaheadTextByKey: z.record(KeySchema, z.string()).optional(),
  })
  .passthrough()

export const PatternRefsSchema = z
  .object({
    label: z.string().optional(),
    labelledBy: IdRefListSchema.optional(),
    domainIdByKey: z.record(KeySchema, z.string()).optional(),
    pointerByKey: z.record(KeySchema, z.string()).optional(),
  })
  .strict()

const addUnknownKeyIssue = (ctx: z.RefinementCtx, path: (string | number)[], key: string) => {
  ctx.addIssue({
    code: 'custom',
    path,
    message: `key "${key}" must exist in items`,
  })
}

const validatePatternDataRefs = (
  value: {
    items: Record<string, unknown>
    relations?: {
      rootKeys?: readonly string[]
      childrenByKey?: Record<string, readonly string[]>
      ownerByKey?: Record<string, string>
      controlsByKey?: Record<string, readonly string[]>
      rowKeys?: readonly string[]
      columnKeys?: readonly string[]
      cells?: readonly { rowKey: string; columnKey: string; cellKey: string }[]
    }
    state?: {
      activeKey?: string | null
      anchorKey?: string | null
      extentKey?: string | null
      selectedKeys?: readonly string[]
      expandedKeys?: readonly string[]
      disabledKeys?: readonly string[]
      checkedByKey?: Record<string, unknown>
      pressedByKey?: Record<string, unknown>
      currentByKey?: Record<string, unknown>
      invalidByKey?: Record<string, unknown>
      requiredKeys?: readonly string[]
      busyKeys?: readonly string[]
      modalKeys?: readonly string[]
      levelByKey?: Record<string, unknown>
      posInSetByKey?: Record<string, unknown>
      setSizeByKey?: Record<string, unknown>
      rowIndexByKey?: Record<string, unknown>
      columnIndexByKey?: Record<string, unknown>
      sortByKey?: Record<string, unknown>
      valueByKey?: Record<string, unknown>
      rangeValueByKey?: Record<string, unknown>
      typeaheadTextByKey?: Record<string, unknown>
    }
    refs?: {
      domainIdByKey?: Record<string, unknown>
      pointerByKey?: Record<string, unknown>
    }
  },
  ctx: z.RefinementCtx,
) => {
  const keys = new Set(Object.keys(value.items))

  value.relations?.rootKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'rootKeys', index], key)
  })

  for (const [parentKey, childKeys] of Object.entries(value.relations?.childrenByKey ?? {})) {
    if (!keys.has(parentKey)) addUnknownKeyIssue(ctx, ['relations', 'childrenByKey', parentKey], parentKey)
    childKeys.forEach((childKey, index) => {
      if (!keys.has(childKey)) addUnknownKeyIssue(ctx, ['relations', 'childrenByKey', parentKey, index], childKey)
    })
  }

  for (const [key, ownerKey] of Object.entries(value.relations?.ownerByKey ?? {})) {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'ownerByKey', key], key)
    if (!keys.has(ownerKey)) addUnknownKeyIssue(ctx, ['relations', 'ownerByKey', key], ownerKey)
  }

  for (const [key, controlledKeys] of Object.entries(value.relations?.controlsByKey ?? {})) {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'controlsByKey', key], key)
    controlledKeys.forEach((controlledKey, index) => {
      if (!keys.has(controlledKey)) addUnknownKeyIssue(ctx, ['relations', 'controlsByKey', key, index], controlledKey)
    })
  }

  value.relations?.rowKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'rowKeys', index], key)
  })

  value.relations?.columnKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'columnKeys', index], key)
  })

  value.relations?.cells?.forEach((cell, index) => {
    if (!keys.has(cell.rowKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'rowKey'], cell.rowKey)
    if (!keys.has(cell.columnKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'columnKey'], cell.columnKey)
    if (!keys.has(cell.cellKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'cellKey'], cell.cellKey)
  })

  for (const keyField of ['activeKey', 'anchorKey', 'extentKey'] as const) {
    const key = value.state?.[keyField]
    if (key != null && !keys.has(key)) addUnknownKeyIssue(ctx, ['state', keyField], key)
  }

  for (const keyListField of ['selectedKeys', 'expandedKeys', 'disabledKeys', 'requiredKeys', 'busyKeys', 'modalKeys'] as const) {
    value.state?.[keyListField]?.forEach((key, index) => {
      if (!keys.has(key)) addUnknownKeyIssue(ctx, ['state', keyListField, index], key)
    })
  }

  for (const byKeyField of [
    'checkedByKey',
    'pressedByKey',
    'currentByKey',
    'invalidByKey',
    'levelByKey',
    'posInSetByKey',
    'setSizeByKey',
    'rowIndexByKey',
    'columnIndexByKey',
    'sortByKey',
    'valueByKey',
    'rangeValueByKey',
    'typeaheadTextByKey',
  ] as const) {
    for (const key of Object.keys(value.state?.[byKeyField] ?? {})) {
      if (!keys.has(key)) addUnknownKeyIssue(ctx, ['state', byKeyField, key], key)
    }
  }

  for (const refByKeyField of ['domainIdByKey', 'pointerByKey'] as const) {
    for (const key of Object.keys(value.refs?.[refByKeyField] ?? {})) {
      if (!keys.has(key)) addUnknownKeyIssue(ctx, ['refs', refByKeyField, key], key)
    }
  }
}

export const PatternDataSchema = z
  .object({
    items: z.record(KeySchema, PatternItemSchema),
    relations: PatternRelationsSchema.optional(),
    state: PatternStateSchema.optional(),
    refs: PatternRefsSchema.optional(),
  })
  .strict()
  .superRefine(validatePatternDataRefs)

export type PatternData = z.infer<typeof PatternDataSchema>

// Direction 어휘는 열려 있음 — 'next/previous/up/down/...' 외에도 'increment/decrement/pageDown' 등 패턴별 어휘 허용.
export const PatternDirectionSchema = z.string().min(1)
export type PatternDirection = z.infer<typeof PatternDirectionSchema>

// PatternEvent — APG 공통 상호작용 어휘 + extension.
export const PatternEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('focus'), key: KeySchema }).strict(),
  z.object({ type: z.literal('navigate'), direction: PatternDirectionSchema }).strict(),
  z.object({ type: z.literal('select'), keys: z.array(KeySchema).readonly(), anchorKey: KeySchema.nullish(), extentKey: KeySchema.nullish() }).strict(),
  z.object({ type: z.literal('expand'), key: KeySchema, expanded: z.boolean() }).strict(),
  z.object({ type: z.literal('activate'), key: KeySchema }).strict(),
  z.object({ type: z.literal('open'), key: KeySchema, open: z.boolean() }).strict(),
  z.object({ type: z.literal('check'), key: KeySchema, checked: z.union([z.boolean(), z.literal('mixed')]) }).strict(),
  z.object({ type: z.literal('press'), key: KeySchema, pressed: z.union([z.boolean(), z.literal('mixed')]).optional() }).strict(),
  z.object({ type: z.literal('value'), key: KeySchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]) }).strict(),
  z.object({ type: z.literal('typeahead'), query: z.string() }).strict(),
  z.object({ type: z.literal('dismiss'), key: KeySchema.optional() }).strict(),
  z.object({ type: z.literal('extension'), name: z.string().min(1), key: KeySchema.optional(), payload: z.record(z.string(), z.unknown()).optional() }).strict(),
])

export type PatternEvent = z.infer<typeof PatternEventSchema>

export const PatternOptionsSchema = z
  .object({
    selectionMode: z.enum(['none', 'single', 'multiple']).optional(),
    focusStrategy: z.enum(['rovingTabIndex', 'ariaActiveDescendant']).optional(),
    followFocus: z.boolean().optional(),
    typeaheadEnabled: z.boolean().optional(),
    elementIdPrefix: z.string().optional(),
    orientation: z.enum(['horizontal', 'vertical', 'both']).optional(),
  })
  // Options 도 패턴별로 자유 확장 — kernel 무손상으로 자기 옵션 추가 가능.
  .passthrough()

export type PatternOptions = z.infer<typeof PatternOptionsSchema>

// 핵심 결합자(always/not/all/any)만 닫혀 있고, leaf kind 는
// 'extension' 을 통해 패턴별 등록이 가능하다.
export type Predicate =
  | { kind: 'always' }
  | { kind: 'hasActiveKey' }
  | { kind: 'hasChildren'; key: string }
  | { kind: 'isExpanded'; key: string }
  | { kind: 'isDisabled'; key: string }
  | { kind: 'optionEquals'; option: string; value: string | boolean }
  | { kind: 'not'; predicate: Predicate }
  | { kind: 'all'; predicates: readonly Predicate[] }
  | { kind: 'any'; predicates: readonly Predicate[] }
  | { kind: 'extension'; name: string; key?: string; args?: Record<string, unknown> }

export const PredicateSchema: z.ZodType<Predicate> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('always') }).strict(),
    z.object({ kind: z.literal('hasActiveKey') }).strict(),
    z.object({ kind: z.literal('hasChildren'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isExpanded'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isDisabled'), key: KeyTokenSchema }).strict(),
    z
      .object({
        kind: z.literal('optionEquals'),
        option: z.string().min(1),
        value: z.union([z.string(), z.boolean()]),
      })
      .strict(),
    z.object({ kind: z.literal('not'), predicate: PredicateSchema }).strict(),
    z.object({ kind: z.literal('all'), predicates: z.array(PredicateSchema).readonly() }).strict(),
    z.object({ kind: z.literal('any'), predicates: z.array(PredicateSchema).readonly() }).strict(),
    z
      .object({
        kind: z.literal('extension'),
        name: z.string().min(1),
        key: KeyTokenSchema.optional(),
        args: z.record(z.string(), z.unknown()).optional(),
      })
      .strict(),
  ]),
)

// EventTemplate — 정의 안에서 표현되는 이벤트 청사진. 'extension' 으로 임의 event 종 표현 가능.
export const EventTemplateSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('focus'), key: KeyTokenSchema }).strict(),
  z.object({ type: z.literal('navigate'), direction: PatternDirectionSchema }).strict(),
  z.object({ type: z.literal('select'), key: KeyTokenSchema }).strict(),
  z.object({ type: z.literal('expand'), key: KeyTokenSchema, expanded: z.boolean().optional() }).strict(),
  z.object({ type: z.literal('activate'), key: KeyTokenSchema }).strict(),
  z.object({ type: z.literal('open'), key: KeyTokenSchema, open: z.boolean().optional() }).strict(),
  z.object({ type: z.literal('check'), key: KeyTokenSchema, checked: z.union([z.boolean(), z.literal('mixed')]).optional() }).strict(),
  z.object({ type: z.literal('press'), key: KeyTokenSchema, pressed: z.union([z.boolean(), z.literal('mixed')]).optional() }).strict(),
  z.object({ type: z.literal('value'), key: KeyTokenSchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]) }).strict(),
  z.object({ type: z.literal('typeahead'), query: z.string() }).strict(),
  z.object({ type: z.literal('dismiss'), key: KeyTokenSchema.optional() }).strict(),
  z
    .object({
      type: z.literal('extension'),
      name: z.string().min(1),
      key: KeyTokenSchema.optional(),
      payload: z.record(z.string(), z.unknown()).optional(),
    })
    .strict(),
])
export type EventTemplate = z.infer<typeof EventTemplateSchema>

export const KeyboardCaseSchema = z.discriminatedUnion('case', [
  z.object({ case: z.literal('when'), when: PredicateSchema, events: z.array(EventTemplateSchema).readonly() }).strict(),
  z.object({ case: z.literal('always'), events: z.array(EventTemplateSchema).readonly() }).strict(),
  z.object({ case: z.literal('otherwise'), events: z.array(EventTemplateSchema).readonly() }).strict(),
])

export const KeyboardBindingSchema = z.object({ shortcut: z.string().min(1), preventDefault: z.boolean().optional(), cases: z.array(KeyboardCaseSchema).readonly() }).strict()
export type KeyboardBinding = z.infer<typeof KeyboardBindingSchema>

// 열린 어휘 — 등록되지 않은 토큰은 runtime resolve 시점 진단으로 잡는다.
// 토큰 자체의 enum 닫힘은 새 패턴 추가 시 schema 동반 변경을 강제하므로 의도적으로 string 으로 열어둔다.
export const AriaSourceSchema = z.string().min(1)

export const AriaProjectionSchema = z.object({ attribute: z.string().min(1), from: AriaSourceSchema, when: PredicateSchema.optional() }).strict()
export type AriaProjection = z.infer<typeof AriaProjectionSchema>
export const StateProjectionSchema = z.object({ name: z.string().min(1), from: z.string().min(1) }).strict()
export type StateProjection = z.infer<typeof StateProjectionSchema>
export const FocusProjectionSchema = z.object({ tabIndex: z.object({ when: PredicateSchema, active: z.number().optional(), inactive: z.number().optional(), value: z.number().optional() }).strict() }).strict()
export type FocusProjection = z.infer<typeof FocusProjectionSchema>
// PartEventBinding.event — DOM 이벤트 어휘는 열림. kernel 의 partEvent registry 가 등록되지 않은 이벤트를 진단.
// 기본: focus/click/keydown/keyup/pointerdown/pointerup/dblclick/mouseenter/mouseleave/input/change/blur
export const PartEventBindingSchema = z.object({ event: z.string().min(1), when: PredicateSchema.optional(), events: z.array(EventTemplateSchema).readonly() }).strict()
export type PartEventBinding = z.infer<typeof PartEventBindingSchema>

// role / keySource 도 열린 어휘 — 패턴마다 다른 role 집합을 advertise 한다.
export const PartSchema = z
  .object({
    role: z.string().min(1),
    // keySource — APG 메타데이터(어느 키 컬렉션을 사용하는지). runtime 미사용 — 정의자의 자기문서화용.
    keySource: z.string().min(1).optional(),
    aria: z.array(AriaProjectionSchema).readonly().optional(),
    focus: FocusProjectionSchema.optional(),
    state: z.array(StateProjectionSchema).readonly().optional(),
    events: z.array(PartEventBindingSchema).readonly().optional(),
  })
  .strict()

// visibleOrder/target 의 kind 는 패턴별 navigation 방식을 표현 — 등록 기반.
// 등록되지 않은 kind 는 navigationTarget/visibleOrder 호출 시점에 진단.
const NavigationTargetSchema = z
  .object({ kind: z.string().min(1) })
  .passthrough()

const VisibleOrderSchema = z
  .object({ kind: z.string().min(1) })
  .passthrough()

export const NavigationSchema = z
  .object({
    visibleOrder: VisibleOrderSchema,
    targets: z.record(z.string().min(1), NavigationTargetSchema),
  })
  .strict()

// 패턴 정의의 generic 골격 — 임의 apgPattern/role/parts 키를 받는다.
// 패턴별 특수 형태(예: treeview 가 반드시 tree/treeitem part 를 갖는가)는
// 각 패턴이 자기 Schema 를 superRefine 으로 검증한다.
export const PatternDefinitionSchema = z
  .object({
    apgPattern: z.string().min(1),
    rootRole: z.string().min(1),
    // containedRoles — APG 메타. runtime 미사용. 정의자가 advertise 용도로만 기재. optional.
    containedRoles: z.array(z.string().min(1)).readonly().optional(),
    // focusModel — APG 메타. 실제 분기는 options.focusStrategy 가 담당하므로 runtime 미사용. optional.
    focusModel: z.string().min(1).optional(),
    parts: z.record(z.string().min(1), PartSchema),
    navigation: NavigationSchema,
    keyboard: z.array(KeyboardBindingSchema).readonly(),
  })
  // 정의 자체도 passthrough — 패턴별 메타데이터(예: apgVersion, w3cRef) 부착 자유.
  .passthrough()
  // 구조 invariant 검증 — runtime 시점 fragile discovery 가 아니라 parse 시점에 fail-fast.
  .superRefine((value, ctx) => {
    const rootParts = Object.entries(value.parts).filter(([, part]) => part.role === value.rootRole)
    if (rootParts.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['parts'],
        message: `no part with role="${value.rootRole}" — definition must contain exactly one root part whose role matches rootRole.`,
      })
    } else if (rootParts.length > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['parts'],
        message: `multiple parts (${rootParts.map(([n]) => `"${n}"`).join(', ')}) share rootRole="${value.rootRole}" — exactly one allowed.`,
      })
    }
  })

export type PatternDefinition = z.infer<typeof PatternDefinitionSchema>
