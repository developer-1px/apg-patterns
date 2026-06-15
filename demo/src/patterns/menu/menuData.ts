import { createMenuButtonPatternData, PatternDataSchema, type PatternData } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

export type MenuVariantKey =
  | 'editorMenubar'
  | 'navMenubar'
  | 'actionMenuButton'
  | 'actionMenuButtonFocus'
  | 'actionMenuButtonActiveDescendant'
  | 'linkMenuButton'

const initialEditorMenubarData: PatternData = PatternDataSchema.parse({
  items: {
    file: { label: 'File' },
    edit: { label: 'Edit' },
    view: { label: 'View' },
    fileNew: { label: 'New' },
    fileOpen: { label: 'Open…' },
    fileSave: { label: 'Save' },
    fileSaveAs: { label: 'Save As…' },
    fileClose: { label: 'Close' },
    editUndo: { label: 'Undo' },
    editRedo: { label: 'Redo' },
    editCut: { label: 'Cut' },
    editCopy: { label: 'Copy' },
    editPaste: { label: 'Paste' },
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

const initialNavMenubarData: PatternData = PatternDataSchema.parse({
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

const initialActionMenuData = createMenuButtonPatternData(
  { key: 'trigger', label: 'Actions' },
  [
    { key: 'actAction', label: 'Action 1' },
    { key: 'actAnother', label: 'Action 2' },
    { key: 'actSomething', label: 'Action 3' },
    { key: 'actLast', label: 'Last action' },
  ],
  { menuKey: 'menu', menuLabel: 'Actions menu' },
)

const initialLinkMenuData = createMenuButtonPatternData(
  { key: 'trigger', label: 'Links' },
  [
    { key: 'linkHome', label: 'Home' },
    { key: 'linkAbout', label: 'About' },
    { key: 'linkAdmissions', label: 'Admissions' },
    { key: 'linkAcademics', label: 'Academics' },
  ],
  { menuKey: 'menu', menuLabel: 'Links menu' },
)

export const menuVariants: Record<MenuVariantKey, { label: string; data: PatternData; apgPattern: 'menubar' | 'menu-button'; focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant' }> = {
  editorMenubar: { label: 'Menubar (Editor)', data: initialEditorMenubarData, apgPattern: 'menubar', focusStrategy: 'rovingTabIndex' },
  navMenubar: { label: 'Menubar (Navigation)', data: initialNavMenubarData, apgPattern: 'menubar', focusStrategy: 'rovingTabIndex' },
  actionMenuButton: { label: 'Menu Button (Actions)', data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'rovingTabIndex' },
  actionMenuButtonFocus: { label: 'Menu Button — element.focus()', data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'rovingTabIndex' },
  actionMenuButtonActiveDescendant: { label: 'Menu Button — aria-activedescendant', data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'ariaActiveDescendant' },
  linkMenuButton: { label: 'Menu Button (Links)', data: initialLinkMenuData, apgPattern: 'menu-button', focusStrategy: 'rovingTabIndex' },
}

export const menuVariantItems = variantItemsFrom(menuVariants)
