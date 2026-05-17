import { PatternDataSchema } from '../../../../src'
import type { PatternData } from '../../../../src'

export type MenuVariantKey =
  | 'editorMenubar'
  | 'navMenubar'
  | 'actionMenuButton'
  | 'actionMenuButtonFocus'
  | 'actionMenuButtonActiveDescendant'

// ── Variant 1: Editor Menubar (APG: examples/menubar-editor) ────────────────
// File / Edit / View — each with submenu children.
export const initialEditorMenubarData: PatternData = PatternDataSchema.parse({
  items: {
    file: { label: 'File' },
    edit: { label: 'Edit' },
    view: { label: 'View' },
    // File submenu
    fileNew: { label: 'New' },
    fileOpen: { label: 'Open…' },
    fileSave: { label: 'Save' },
    fileSaveAs: { label: 'Save As…' },
    fileClose: { label: 'Close' },
    // Edit submenu
    editUndo: { label: 'Undo' },
    editRedo: { label: 'Redo' },
    editCut: { label: 'Cut' },
    editCopy: { label: 'Copy' },
    editPaste: { label: 'Paste' },
    // View submenu — checkbox + radios for theme.
    viewWrap: { label: 'Word Wrap', kind: 'menuitemcheckbox' },
    viewMini: { label: 'Minimap', kind: 'menuitemcheckbox' },
    viewLight: { label: 'Light', kind: 'menuitemradio' },
    viewDark: { label: 'Dark', kind: 'menuitemradio' },
    viewSystem: { label: 'System', kind: 'menuitemradio' },
  },
  relations: {
    rootKeys: ['file', 'edit', 'view'],
    childrenByKey: {
      file: ['fileNew', 'fileOpen', 'fileSave', 'fileSaveAs', 'fileClose'],
      edit: ['editUndo', 'editRedo', 'editCut', 'editCopy', 'editPaste'],
      view: ['viewWrap', 'viewMini', 'viewLight', 'viewDark', 'viewSystem'],
    },
  },
  state: {
    activeKey: 'file',
    checkedByKey: { viewWrap: true, viewMini: false, viewLight: false, viewDark: true, viewSystem: false },
    disabledKeys: ['editRedo'],
  },
  refs: { label: 'Editor' },
})

// ── Variant 2: Navigation Menubar (APG: examples/menubar-navigation) ────────
export const initialNavMenubarData: PatternData = PatternDataSchema.parse({
  items: {
    about: { label: 'About' },
    admissions: { label: 'Admissions' },
    academics: { label: 'Academics' },
    aboutOverview: { label: 'Overview' },
    aboutHistory: { label: 'History' },
    aboutMission: { label: 'Mission' },
    admApply: { label: 'Apply' },
    admTuition: { label: 'Tuition' },
    admSessions: { label: 'Sessions' },
    acaPrograms: { label: 'Programs' },
    acaSchools: { label: 'Schools' },
    acaCalendar: { label: 'Calendar' },
  },
  relations: {
    rootKeys: ['about', 'admissions', 'academics'],
    childrenByKey: {
      about: ['aboutOverview', 'aboutHistory', 'aboutMission'],
      admissions: ['admApply', 'admTuition', 'admSessions'],
      academics: ['acaPrograms', 'acaSchools', 'acaCalendar'],
    },
  },
  state: { activeKey: 'about' },
  refs: { label: 'Mythical University' },
})

// ── Variant 3+4+5: Action Menu Button (APG: examples/menu-button-actions* ) ─
//
// All three share the same data; what differs is focus management in <Menu>.
//   - actionMenuButton                : default (roving tab-index)
//   - actionMenuButtonFocus           : uses element.focus() via roving tab-index (same as default)
//   - actionMenuButtonActiveDescendant: focus stays on the menu, aria-activedescendant marks the active item
export const initialActionMenuData: PatternData = PatternDataSchema.parse({
  items: {
    trigger: { label: 'Actions' },
    menu: { label: 'Actions menu' },
    actAction: { label: 'Action 1' },
    actAnother: { label: 'Action 2' },
    actSomething: { label: 'Action 3' },
    actLast: { label: 'Last action' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['menu'] },
    ownerByKey: { menu: 'trigger' },
    childrenByKey: {
      trigger: ['menu'],
      menu: ['actAction', 'actAnother', 'actSomething', 'actLast'],
    },
  },
  state: { activeKey: 'actAction', expandedKeys: [] },
})

export const menuVariantItems: ReadonlyArray<{ key: MenuVariantKey; label: string }> = [
  { key: 'editorMenubar', label: 'Menubar (Editor)' },
  { key: 'navMenubar', label: 'Menubar (Navigation)' },
  { key: 'actionMenuButton', label: 'Menu Button (Actions)' },
  { key: 'actionMenuButtonFocus', label: 'Menu Button — element.focus()' },
  { key: 'actionMenuButtonActiveDescendant', label: 'Menu Button — aria-activedescendant' },
]

export const menuVariants: Record<MenuVariantKey, { data: PatternData; apgPattern: 'menubar' | 'menu-button'; focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant' }> = {
  editorMenubar: { data: initialEditorMenubarData, apgPattern: 'menubar', focusStrategy: 'rovingTabIndex' },
  navMenubar: { data: initialNavMenubarData, apgPattern: 'menubar', focusStrategy: 'rovingTabIndex' },
  actionMenuButton: { data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'rovingTabIndex' },
  actionMenuButtonFocus: { data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'rovingTabIndex' },
  actionMenuButtonActiveDescendant: { data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'ariaActiveDescendant' },
}
