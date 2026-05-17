/**
 * Smoke test for src/patterns/menu/definition.ts
 *
 * Goal: confirm the new menubarDefinition + menuButtonDefinition parse against
 * PatternDefinitionSchema and that the resulting runtime emits the ARIA
 * attributes the W3C APG examples advertise.
 *
 * Behavioral parity with the in-test menubar definition (pattern.test.ts) is
 * covered there; this file checks only what the in-test definition does NOT
 * (menu-button + Home/End/Space/menuitemcheckbox + checked).
 */
import { describe, expect, it } from 'vitest'
import {
  createPatternRuntime,
  PatternDataSchema,
  type PatternData,
  type PatternEvent,
} from '../../index'
import { menubarDefinition, menuButtonDefinition } from './definition'

const baseKey = { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false }

function makeMenubarData(): PatternData {
  return PatternDataSchema.parse({
    items: {
      file: { label: 'File' },
      edit: { label: 'Edit' },
      view: { label: 'View' },
      new: { label: 'New' },
      open: { label: 'Open' },
      wrap: { label: 'Word wrap', kind: 'menuitemcheckbox' },
    },
    relations: {
      rootKeys: ['file', 'edit', 'view'],
      childrenByKey: { file: ['new', 'open'], view: ['wrap'] },
    },
    state: {
      activeKey: 'file',
      checkedByKey: { wrap: true },
      disabledKeys: ['edit'],
    },
    refs: { label: 'Editor menu' },
  })
}

describe('menubarDefinition', () => {
  it('menubar root advertises role, label, and orientation', () => {
    const data = makeMenubarData()
    const runtime = createPatternRuntime({
      definition: menubarDefinition,
      data,
      options: { orientation: 'horizontal' },
      onEvent: () => {},
    })
    const props = runtime.getPartProps('menubar')
    expect(props.role).toBe('menubar')
    expect(props['aria-label']).toBe('Editor menu')
    expect(props['aria-orientation']).toBe('horizontal')
  })

  it('menuitem advertises aria-haspopup / aria-expanded / aria-disabled', () => {
    const data = makeMenubarData()
    const runtime = createPatternRuntime({ definition: menubarDefinition, data, onEvent: () => {} })
    const file = runtime.getPartProps('menuitem', 'file')
    expect(file['aria-haspopup']).toBe('menu')
    expect(file['aria-expanded']).toBe(false)
    const edit = runtime.getPartProps('menuitem', 'edit')
    expect(edit['aria-haspopup']).toBeUndefined()
    expect(edit['aria-disabled']).toBe(true)
  })

  it('Home/End emit navigate first/last', () => {
    const data = makeMenubarData()
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: menubarDefinition,
      data,
      onEvent: (e) => events.push(e),
    })
    const handler = runtime.getRootKeyboardHandler()
    handler({ key: 'Home', code: 'Home', ...baseKey, preventDefault: () => {} } as any)
    handler({ key: 'End', code: 'End', ...baseKey, preventDefault: () => {} } as any)
    expect(events).toEqual([
      { type: 'navigate', direction: 'first' },
      { type: 'navigate', direction: 'last' },
    ])
  })

  it('Space activates current item like Enter', () => {
    const data = makeMenubarData()
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: menubarDefinition,
      data,
      onEvent: (e) => events.push(e),
    })
    runtime.getRootKeyboardHandler()({ key: ' ', code: 'Space', ...baseKey, preventDefault: () => {} } as any)
    expect(events).toEqual([{ type: 'activate', key: 'file' }])
  })
})

// ─────────────────────────────────────────────────────────────
// Menu Button
// ─────────────────────────────────────────────────────────────

function makeMenuButtonData(): PatternData {
  return PatternDataSchema.parse({
    items: {
      trigger: { label: 'Actions' },
      menu: { label: 'Actions menu' },
      copy: { label: 'Copy' },
      paste: { label: 'Paste' },
      cut: { label: 'Cut' },
    },
    relations: {
      rootKeys: ['trigger'],
      controlsByKey: { trigger: ['menu'] },
      ownerByKey: { menu: 'trigger' },
      childrenByKey: { trigger: ['menu'], menu: ['copy', 'paste', 'cut'] },
    },
    state: { activeKey: 'copy', expandedKeys: [] },
  })
}

describe('menuButtonDefinition', () => {
  it('trigger advertises aria-haspopup="menu" + aria-controls', () => {
    const data = makeMenuButtonData()
    const runtime = createPatternRuntime({
      definition: menuButtonDefinition,
      data,
      onEvent: () => {},
      keyToElementId: (k) => `mb-${k}`,
    })
    const props = runtime.getPartProps('trigger', 'trigger')
    expect(props.role).toBe('button')
    expect(props['aria-haspopup']).toBe('menu')
    expect(props['aria-expanded']).toBe(false)
    expect(props['aria-controls']).toBe('mb-menu')
  })

  it('trigger click toggles expanded via expand event', () => {
    const data = makeMenuButtonData()
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: menuButtonDefinition,
      data,
      onEvent: (e) => events.push(e),
    })
    const props = runtime.getPartProps('trigger', 'trigger') as any
    props.onClick?.({ preventDefault: () => {}, stopPropagation: () => {} })
    expect(events).toEqual([{ type: 'expand', key: 'trigger', expanded: true }])
  })

  it('menu advertises aria-activedescendant when keyToElementId is provided', () => {
    const data = makeMenuButtonData()
    const runtime = createPatternRuntime({
      definition: menuButtonDefinition,
      data,
      onEvent: () => {},
      keyToElementId: (k) => `mb-${k}`,
    })
    const menuProps = runtime.getPartProps('menu', 'menu')
    expect(menuProps.role).toBe('menu')
    expect(menuProps['aria-activedescendant']).toBe('mb-copy')
    expect(menuProps['aria-labelledby']).toBe('mb-trigger')
  })

  it('Enter on menuitem emits activate + dismiss', () => {
    const data = makeMenuButtonData()
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: menuButtonDefinition,
      data,
      onEvent: (e) => events.push(e),
    })
    runtime.getRootKeyboardHandler()({ key: 'Enter', code: 'Enter', ...baseKey, preventDefault: () => {} } as any)
    expect(events).toEqual([
      { type: 'activate', key: 'copy' },
      { type: 'dismiss' },
    ])
  })

  it('Escape emits dismiss', () => {
    const data = makeMenuButtonData()
    const events: PatternEvent[] = []
    const runtime = createPatternRuntime({
      definition: menuButtonDefinition,
      data,
      onEvent: (e) => events.push(e),
    })
    runtime.getRootKeyboardHandler()({ key: 'Escape', code: 'Escape', ...baseKey, preventDefault: () => {} } as any)
    expect(events).toEqual([{ type: 'dismiss' }])
  })
})
