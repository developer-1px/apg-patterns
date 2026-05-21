import { PatternDataSchema } from '../../../../src/react'
import type { PatternData } from '../../../../src/react'

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

const initialActionMenuData: PatternData = PatternDataSchema.parse({
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

const initialLinkMenuData: PatternData = PatternDataSchema.parse({
  items: {
    trigger: { label: 'Links' },
    menu: { label: 'Links menu' },
    linkHome: { label: 'Home' },
    linkAbout: { label: 'About' },
    linkAdmissions: { label: 'Admissions' },
    linkAcademics: { label: 'Academics' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['menu'] },
    ownerByKey: { menu: 'trigger' },
    childrenByKey: {
      trigger: ['menu'],
      menu: ['linkHome', 'linkAbout', 'linkAdmissions', 'linkAcademics'],
    },
  },
  state: { activeKey: 'linkHome', expandedKeys: [] },
})

export const menuVariants: Record<MenuVariantKey, { label: string; data: PatternData; apgPattern: 'menubar' | 'menu-button'; focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant' }> = {
  editorMenubar: { label: 'Menubar (Editor)', data: initialEditorMenubarData, apgPattern: 'menubar', focusStrategy: 'rovingTabIndex' },
  navMenubar: { label: 'Menubar (Navigation)', data: initialNavMenubarData, apgPattern: 'menubar', focusStrategy: 'rovingTabIndex' },
  actionMenuButton: { label: 'Menu Button (Actions)', data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'rovingTabIndex' },
  actionMenuButtonFocus: { label: 'Menu Button — element.focus()', data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'rovingTabIndex' },
  actionMenuButtonActiveDescendant: { label: 'Menu Button — aria-activedescendant', data: initialActionMenuData, apgPattern: 'menu-button', focusStrategy: 'ariaActiveDescendant' },
  linkMenuButton: { label: 'Menu Button (Links)', data: initialLinkMenuData, apgPattern: 'menu-button', focusStrategy: 'rovingTabIndex' },
}

export const menuVariantItems: ReadonlyArray<{ key: MenuVariantKey; label: string }> = Object.entries(menuVariants).map(([key, value]) => ({
  key: key as MenuVariantKey,
  label: value.label,
}))
