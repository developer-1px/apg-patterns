import { z } from 'zod'
import { validateJsonExtensionFields } from './jsonValue'
import { EventTemplateSchema } from './patternEvent'
import { EffectSchema } from './patternEffects'
import { NavigationSchema } from './patternNavigation'
import { PredicateSchema } from './patternPredicate'
import { TransitionSchema } from './patternTransition'
import { ReactFacadeSchema } from './reactFacade'
export * from './patternEffects'
export * from './patternNavigation'
export * from './patternPredicate'
export * from './patternTransition'
export * from './reactFacade'

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
  'state.colCount', 'state.columnIndexByKey', 'state.currentByKey',
  'state.disabledKeys', 'state.expandedKeys', 'state.inactiveKey',
  'state.levelByKey', 'state.multiselectable', 'state.posInSetByKey',
  'state.pressedByKey', 'state.readonly', 'state.rowCount',
  'state.rowExpanded', 'state.rowIndexByKey',
  'state.selectedKeys', 'state.selectedKeys.radioChecked', 'state.setSizeByKey',
  'state.sortByKey', 'state.valueByKey',
])
export type AriaSourcePath = z.infer<typeof AriaSourcePathSchema>

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
    react: ReactFacadeSchema.optional(),
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
    if (!value.react) return
    const hasPart = (part: string) => Object.prototype.hasOwnProperty.call(value.parts, part)
    if (!hasPart(value.react.root.part)) {
      ctx.addIssue({ code: 'custom', path: ['react', 'root', 'part'], message: `unknown react root part "${value.react.root.part}".` })
    }
    for (const [variantIndex, variant] of (value.react.renderItems?.variants ?? []).entries()) {
      for (const [field, source] of Object.entries(variant.fields)) {
        if (source.kind === 'partState' && !hasPart(source.part)) {
          ctx.addIssue({ code: 'custom', path: ['react', 'renderItems', 'variants', variantIndex, 'fields', field, 'part'], message: `unknown partState part "${source.part}".` })
        }
      }
      for (const [propName, prop] of Object.entries(variant.props)) {
        if (!hasPart(prop.part)) {
          ctx.addIssue({ code: 'custom', path: ['react', 'renderItems', 'variants', variantIndex, 'props', propName, 'part'], message: `unknown react prop part "${prop.part}".` })
        }
      }
    }
  })

export type PatternDefinition = z.infer<typeof PatternDefinitionSchema>
