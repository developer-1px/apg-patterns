import { z } from 'zod'
import { JsonValueSchema, validateJsonExtensionFields } from './jsonValue'
import { KeyTokenSchema } from './patternData'
import { EventTemplateSchema, PatternEventReasonSchema, PatternEventTypeSchema } from './patternEvent'

export const AriaRoleSchema = z.enum([
  'alert', 'alertdialog', 'article', 'button', 'cell', 'checkbox', 'columnheader', 'combobox',
  'dialog', 'feed', 'grid', 'gridcell', 'group', 'heading', 'link', 'list', 'listbox', 'listitem',
  'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'meter', 'navigation',
  'option', 'paragraph', 'presentation', 'radio', 'radiogroup', 'region', 'row', 'rowheader',
  'separator', 'slider', 'spinbutton', 'switch', 'tab', 'table', 'tablist', 'tabpanel', 'toolbar',
  'tooltip', 'tree', 'treegrid', 'treeitem',
])
export type AriaRole = z.infer<typeof AriaRoleSchema>

export const AriaAttributeSchema = z.enum([
  'aria-activedescendant', 'aria-autocomplete', 'aria-checked', 'aria-colcount', 'aria-colindex',
  'aria-controls', 'aria-current', 'aria-describedby', 'aria-disabled', 'aria-expanded',
  'aria-haspopup', 'aria-hidden', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-modal',
  'aria-multiselectable', 'aria-orientation', 'aria-posinset', 'aria-pressed', 'aria-readonly',
  'aria-roledescription', 'aria-rowcount', 'aria-rowindex', 'aria-rowspan',
  'aria-colspan', 'aria-owns', 'aria-selected', 'aria-setsize',
  'aria-sort', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext',
  'href',
])
export type AriaAttribute = z.infer<typeof AriaAttributeSchema>

export const FocusModelSchema = z.enum(['rovingTabIndex', 'ariaActiveDescendant', 'focusTrap'])
export type FocusModel = z.infer<typeof FocusModelSchema>

export const DomEventNameSchema = z.enum([
  'blur', 'change', 'click', 'dblclick', 'focus', 'input', 'keydown', 'keyup',
  'mousedown', 'mouseenter', 'mouseleave', 'pointerdown', 'pointermove', 'pointerup',
])
export type DomEventName = z.infer<typeof DomEventNameSchema>

export const VisibleOrderKindSchema = z.enum([
  'flat', 'comboboxOptions', 'gridRows', 'treeVisibleDepthFirst', 'treegridVisibleCells',
])
export type VisibleOrderKind = z.infer<typeof VisibleOrderKindSchema>

export const NavigationTargetKindSchema = z.enum([
  'linear', 'linearWrap', 'firstChild', 'gridCell', 'gridPage', 'optionLinear',
  'parentKey', 'tabsLinear', 'treegridCell', 'treegridPage', 'treegridParentRowFirstCell',
  'treegridRow', 'treegridRowPage',
])
export type NavigationTargetKind = z.infer<typeof NavigationTargetKindSchema>

export const AriaSourcePathSchema = z.enum([
  '$activeKey',
  '$event.expanded', '$event.extentKey', '$event.key', '$event.payload.value',
  'combobox.popupOpen',
  'items.href', 'items.kind', 'items.label', 'items.labelledBy',
  'items.valuemax', 'items.valuemin', 'items.valuetext',
  'literal.true',
  'menu.expandedIfHasPopup', 'menu.hasPopup',
  'options.autocomplete', 'options.haspopup', 'options.label', 'options.max', 'options.min', 'options.orientation',
  'options.roledescription', 'options.selectionMode.multiple', 'options.slideRoledescription',
  'refs.label', 'refs.labelledBy',
  'relations.controlsByKey', 'relations.ownerByKey',
  'state.activeKey', 'state.activeKey.elementId', 'state.checkedByKey',
  'state.colCount', 'state.columnIndexByKey', 'state.currentKey',
  'state.disabledKeys', 'state.expandedKeys', 'state.inactiveKey',
  'state.levelByKey', 'state.multiselectable', 'state.posInSetByKey',
  'state.pressedByKey', 'state.readonly', 'state.rowCount',
  'state.rowExpanded', 'state.rowIndexByKey',
  'state.selectedKeys', 'state.selectedKeys.radioChecked', 'state.setSizeByKey',
  'state.sortByKey', 'state.valueByKey',
])
export type AriaSourcePath = z.infer<typeof AriaSourcePathSchema>

export const StateFieldSchema = z.enum([
  'activeKey', 'anchorKey', 'extentKey', 'selectedKeys', 'expandedKeys', 'disabledKeys',
  'checkedByKey', 'pressedByKey', 'currentByKey', 'invalidByKey', 'requiredKeys',
  'busyKeys', 'modalKeys', 'levelByKey', 'posInSetByKey', 'setSizeByKey',
  'rowIndexByKey', 'columnIndexByKey', 'sortByKey', 'valueByKey', 'rangeValueByKey',
  'typeaheadTextByKey', 'rowCount', 'colCount',
  'editingKey', 'editDraftByKey',
])
export type StateField = z.infer<typeof StateFieldSchema>

export type Predicate =
  | { kind: 'always' }
  | { kind: 'hasActiveKey' }
  | { kind: 'activeCellInFirstColumn' }
  | { kind: 'activeRowExpanded' }
  | { kind: 'activeRowHasChildren' }
  | { kind: 'activeKeyIsRow' }
  | { kind: 'isChecked'; key: string }
  | { kind: 'isPressed'; key: string }
  | { kind: 'isSwitchOn'; key: string }
  | { kind: 'isPopupOpen' }
  | { kind: 'hasChildren'; key: string }
  | { kind: 'isExpanded'; key: string }
  | { kind: 'isDisabled'; key: string }
  | { kind: 'optionEquals'; option: string; value: string | boolean }
  | { kind: 'not'; predicate: Predicate }
  | { kind: 'all'; predicates: readonly Predicate[] }
  | { kind: 'any'; predicates: readonly Predicate[] }

export const PredicateSchema: z.ZodType<Predicate> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('always') }).strict(),
    z.object({ kind: z.literal('hasActiveKey') }).strict(),
    z.object({ kind: z.literal('activeCellInFirstColumn') }).strict(),
    z.object({ kind: z.literal('activeRowExpanded') }).strict(),
    z.object({ kind: z.literal('activeRowHasChildren') }).strict(),
    z.object({ kind: z.literal('activeKeyIsRow') }).strict(),
    z.object({ kind: z.literal('isChecked'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isPressed'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isSwitchOn'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isPopupOpen') }).strict(),
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
  ]),
)

export const KeyboardCaseSchema = z.discriminatedUnion('case', [
  z.object({ case: z.literal('when'), when: PredicateSchema, events: z.array(EventTemplateSchema).readonly() }).strict(),
  z.object({ case: z.literal('always'), events: z.array(EventTemplateSchema).readonly() }).strict(),
  z.object({ case: z.literal('otherwise'), events: z.array(EventTemplateSchema).readonly() }).strict(),
])

export const KeyboardBindingSchema = z.object({ shortcut: z.string().min(1), preventDefault: z.boolean().optional(), cases: z.array(KeyboardCaseSchema).readonly() }).strict()
export type KeyboardBinding = z.infer<typeof KeyboardBindingSchema>

export const AriaSourceSchema = AriaSourcePathSchema
export const AriaProjectionSchema = z.object({ attribute: AriaAttributeSchema, from: AriaSourceSchema, when: PredicateSchema.optional() }).strict()
export type AriaProjection = z.infer<typeof AriaProjectionSchema>

export const StateProjectionSchema = z.object({ name: z.string().min(1), from: AriaSourceSchema }).strict()
export type StateProjection = z.infer<typeof StateProjectionSchema>

export const FocusProjectionSchema = z.object({ tabIndex: z.object({ when: PredicateSchema, active: z.number().optional(), inactive: z.number().optional(), value: z.number().optional() }).strict() }).strict()
export type FocusProjection = z.infer<typeof FocusProjectionSchema>

export const PartEventBindingSchema = z.object({ event: DomEventNameSchema, when: PredicateSchema.optional(), events: z.array(EventTemplateSchema).readonly() }).strict()
export type PartEventBinding = z.infer<typeof PartEventBindingSchema>

export const PartSchema = z
  .object({
    role: AriaRoleSchema,
    aria: z.array(AriaProjectionSchema).readonly().optional(),
    focus: FocusProjectionSchema.optional(),
    state: z.array(StateProjectionSchema).readonly().optional(),
    events: z.array(PartEventBindingSchema).readonly().optional(),
  })
  .strict()

export const ElementTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('key'), key: KeyTokenSchema }).strict(),
  z.object({ kind: z.literal('controlledBy'), key: KeyTokenSchema }).strict(),
  z.object({ kind: z.literal('firstFocusable'), root: z.object({ kind: z.literal('controlledBy'), key: KeyTokenSchema }).strict() }).strict(),
])
export type ElementTarget = z.infer<typeof ElementTargetSchema>

export const FocusEffectTriggerSchema = z.object({
  state: z.literal('activeKey'),
  reasons: z.array(PatternEventReasonSchema).readonly(),
}).strict()

export const FocusEffectScopeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('focusWithin') }).strict(),
  z.object({ kind: z.literal('always') }).strict(),
])

export const FocusEffectTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('activeKeyElement') }).strict(),
  ...ElementTargetSchema.options,
])

export const EffectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('focus'),
    when: PredicateSchema.optional(),
    on: FocusEffectTriggerSchema.optional(),
    scope: FocusEffectScopeSchema.optional(),
    target: FocusEffectTargetSchema,
    preventScroll: z.boolean().optional(),
  }).strict(),
  z.object({ kind: z.literal('restoreFocus'), when: PredicateSchema, target: ElementTargetSchema, preventScroll: z.boolean().optional() }).strict(),
  z.object({ kind: z.literal('trapFocus'), when: PredicateSchema, root: ElementTargetSchema }).strict(),
])
export type EffectDefinition = z.infer<typeof EffectSchema>

const LinearActionSchema = z.enum(['next', 'previous', 'first', 'last'])
const GridActionSchema = z.enum(['left', 'right', 'up', 'down', 'rowStart', 'rowEnd', 'gridStart', 'gridEnd'])
const GridPageActionSchema = z.enum(['pageUp', 'pageDown'])
const TreegridPageDirectionSchema = z.enum(['up', 'down'])
const NavigationTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('linear'), action: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('linearWrap'), action: z.enum(['next', 'previous']) }).strict(),
  z.object({ kind: z.literal('firstChild'), key: KeyTokenSchema.optional() }).strict(),
  z.object({ kind: z.literal('gridCell'), action: GridActionSchema }).strict(),
  z.object({ kind: z.literal('gridPage'), action: GridPageActionSchema }).strict(),
  z.object({ kind: z.literal('optionLinear'), direction: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('parentKey'), key: KeyTokenSchema }).strict(),
  z.object({ kind: z.literal('tabsLinear'), action: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('treegridCell'), action: GridActionSchema }).strict(),
  z.object({ kind: z.literal('treegridPage'), direction: TreegridPageDirectionSchema }).strict(),
  z.object({ kind: z.literal('treegridParentRowFirstCell') }).strict(),
  z.object({ kind: z.literal('treegridRow'), action: z.enum(['up', 'down', 'gridStart', 'gridEnd']) }).strict(),
  z.object({ kind: z.literal('treegridRowPage'), direction: TreegridPageDirectionSchema }).strict(),
])

const VisibleOrderSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('flat') }).strict(),
  z.object({ kind: z.literal('comboboxOptions') }).strict(),
  z.object({ kind: z.literal('gridRows') }).strict(),
  z.object({ kind: z.literal('treeVisibleDepthFirst') }).strict(),
  z.object({ kind: z.literal('treegridVisibleCells') }).strict(),
  z.object({ kind: z.literal('treegridVisibleRows') }).strict(),
])

export const NavigationSchema = z
  .object({
    visibleOrder: VisibleOrderSchema,
    targets: z.record(z.string().min(1), NavigationTargetSchema),
  })
  .strict()

export const EventValueSourceSchema = z.enum([
  '$event.key',
  '$event.keys',
  '$event.anchorKey',
  '$event.extentKey',
  '$event.expanded',
  '$event.checked',
  '$event.pressed',
  '$event.value',
  '$activeKey',
])
export type EventValueSource = z.infer<typeof EventValueSourceSchema>

export const TransitionValueSchema = z.union([
  z.object({ from: EventValueSourceSchema }).strict(),
  z.object({ literal: JsonValueSchema }).strict(),
])
export type TransitionValue = z.infer<typeof TransitionValueSchema>

export const StateActionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('set'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('add'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('remove'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('setMembership'), field: StateFieldSchema, value: TransitionValueSchema, present: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('setRecordValue'), field: StateFieldSchema, key: TransitionValueSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('toggleInSet'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('replaceSet'), field: StateFieldSchema, values: z.array(TransitionValueSchema).readonly() }).strict(),
])
export type StateAction = z.infer<typeof StateActionSchema>

export const TransitionSchema = z
  .object({
    on: PatternEventTypeSchema,
    name: z.string().min(1).optional(),
    when: PredicateSchema.optional(),
    actions: z.array(StateActionSchema).readonly(),
  })
  .strict()
export type Transition = z.infer<typeof TransitionSchema>

export const PatternDefinitionSchema = z
  .object({
    apgPattern: z.string().min(1),
    rootRole: AriaRoleSchema,
    containedRoles: z.array(AriaRoleSchema).readonly().optional(),
    focusModel: FocusModelSchema.optional(),
    parts: z.record(z.string().min(1), PartSchema),
    navigation: NavigationSchema,
    keyboard: z.array(KeyboardBindingSchema).readonly(),
    transitions: z.array(TransitionSchema).readonly().optional(),
    effects: z.array(EffectSchema).readonly().optional(),
  })
  .strict()
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
