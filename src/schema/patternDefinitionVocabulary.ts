import { z } from 'zod'

export const AriaRoleSchema = z.enum([
  'alert', 'alertdialog', 'article', 'banner', 'button', 'cell', 'checkbox', 'columnheader',
  'combobox', 'complementary', 'contentinfo', 'dialog', 'document', 'feed', 'form', 'grid',
  'gridcell', 'group', 'heading', 'link', 'list', 'listbox', 'listitem', 'main', 'menu',
  'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'meter', 'navigation', 'option',
  'paragraph', 'presentation', 'radio', 'radiogroup', 'region', 'row', 'rowheader', 'search',
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
  'items.href', 'items.kind', 'items.label', 'items.$key.label', 'items.labelledBy',
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
