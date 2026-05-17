/**
 * Menu pattern definitions — APG `menubar` + `menu-button` (Action menu button).
 *
 * 2 패턴이 한 파일에 공존:
 *   - menubarDefinition: 상단 메뉴바 (Editor / Navigation). 서브메뉴는 expandedKeys 로 모델링.
 *   - menuButtonDefinition: 단일 트리거 + 팝업 메뉴. trigger=button, menu=menu, menuitem=menuitem.
 *
 * Kernel 비변경 원칙 — 'menu.hasPopup' / 'menu.expandedIfHasPopup' AriaSource 만 본 파일에서 등록.
 */
import { PatternDefinitionSchema } from '../../schema'
import { defineAriaSource } from '../../kernel/patternKernel'

// ─────────────────────────────────────────────────────────────
// Menu-specific AriaSource registrations
// ─────────────────────────────────────────────────────────────

// aria-haspopup="menu" only when the item actually has children.
defineAriaSource('menu.hasPopup', (ctx) => {
  if (!ctx.key) return undefined
  return (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0 ? 'menu' : undefined
})

// aria-expanded omitted when the item is not expandable (no children).
defineAriaSource('menu.expandedIfHasPopup', (ctx) => {
  if (!ctx.key) return undefined
  const hasChildren = (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0
  if (!hasChildren) return undefined
  return ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false
})

// items.kind — used to drive role variation (menuitem / menuitemcheckbox / menuitemradio).
defineAriaSource('items.kind', (ctx) => (ctx.key ? (ctx.data.items[ctx.key] as { kind?: string } | undefined)?.kind : undefined))

// ─────────────────────────────────────────────────────────────
// Menubar (Editor + Navigation share this definition)
// ─────────────────────────────────────────────────────────────

export const menubarDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menubar',
  rootRole: 'menubar',
  containedRoles: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
    menubar: {
      role: 'menubar',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-orientation', from: 'options.orientation' },
      ],
    },
    menuitem: {
      role: 'menuitem',
      aria: [
        { attribute: 'aria-haspopup', from: 'menu.hasPopup' },
        { attribute: 'aria-expanded', from: 'menu.expandedIfHasPopup' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
        { attribute: 'aria-checked', from: 'state.checkedByKey' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, active: 0, inactive: -1 },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'expanded', from: 'state.expandedKeys' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
      events: [
        { event: 'click', events: [{ type: 'focus', key: '$key' }, { type: 'activate', key: '$key' }] },
        { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
      down: { kind: 'firstChild' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    {
      shortcut: 'ArrowDown',
      preventDefault: true,
      cases: [
        {
          case: 'when',
          when: { kind: 'hasChildren', key: '$activeKey' },
          events: [
            { type: 'expand', key: '$activeKey', expanded: true },
            { type: 'navigate', direction: 'down' },
          ],
        },
      ],
    },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
    { shortcut: 'Space', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
    { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }] },
  ],
})

// ─────────────────────────────────────────────────────────────
// Menu Button (Action menu button — APG `menu-button`)
// ─────────────────────────────────────────────────────────────
//
// 한 트리거 + 팝업 메뉴. rootKeys[0] = trigger, relations.controlsByKey[trigger]=[menuKey],
// childrenByKey[menuKey] = menuitem keys. expandedKeys 에 trigger 가 들어 있으면 open.

export const menuButtonDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menu-button',
  rootRole: 'button',
  containedRoles: ['menu', 'menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead', 'open'] }, scope: { kind: 'always' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
    trigger: {
      role: 'button',
      aria: [
        { attribute: 'aria-haspopup', from: 'menu.hasPopup' },
        { attribute: 'aria-expanded', from: 'state.expandedKeys' },
        { attribute: 'aria-controls', from: 'relations.controlsByKey' },
        { attribute: 'aria-label', from: 'items.label' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, value: 0 },
      },
      state: [
        { name: 'expanded', from: 'state.expandedKeys' },
      ],
      events: [
        {
          event: 'click',
          when: { kind: 'isExpanded', key: '$key' },
          events: [{ type: 'expand', key: '$key', expanded: false }],
        },
        {
          event: 'click',
          when: { kind: 'not', predicate: { kind: 'isExpanded', key: '$key' } },
          events: [{ type: 'expand', key: '$key', expanded: true }],
        },
      ],
    },
    menu: {
      role: 'menu',
      aria: [
        { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
        { attribute: 'aria-activedescendant', from: 'state.activeKey.elementId' },
      ],
    },
    menuitem: {
      role: 'menuitem',
      aria: [
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
        { attribute: 'aria-checked', from: 'state.checkedByKey' },
      ],
      focus: {
        tabIndex: {
          when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
          active: 0,
          inactive: -1,
        },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
      events: [
        { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
        { event: 'click', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'activate', key: '$key' }, { type: 'dismiss' }] },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'activate', key: '$activeKey' }, { type: 'dismiss' }] }] },
    { shortcut: 'Space', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'activate', key: '$activeKey' }, { type: 'dismiss' }] }] },
    { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss' }] }] },
  ],
})
