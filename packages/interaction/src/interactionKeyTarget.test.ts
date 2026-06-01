import { describe, expect, it } from 'vitest'

import { classifyInteractionKeyTarget } from './interactionKeyTarget'

describe('interaction key target classification', () => {
  it('classifies native text entry targets', () => {
    const input = document.createElement('input')
    input.type = 'search'
    const textarea = document.createElement('textarea')
    const select = document.createElement('select')
    const editor = document.createElement('div')
    editor.setAttribute('contenteditable', 'true')

    expect(classifyInteractionKeyTarget(input)).toBe('text-input')
    expect(classifyInteractionKeyTarget(textarea)).toBe('textarea')
    expect(classifyInteractionKeyTarget(select)).toBe('select')
    expect(classifyInteractionKeyTarget(editor)).toBe('contenteditable')
  })

  it('classifies native non-text controls separately from text entry', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    const button = document.createElement('button')
    const link = document.createElement('a')
    link.href = '#target'

    expect(classifyInteractionKeyTarget(checkbox)).toBe('native-control')
    expect(classifyInteractionKeyTarget(button)).toBe('native-control')
    expect(classifyInteractionKeyTarget(link)).toBe('native-control')
  })

  it('classifies APG role-backed pattern roots', () => {
    const tree = document.createElement('div')
    tree.setAttribute('role', 'tree')
    const toolbar = document.createElement('div')
    toolbar.setAttribute('role', 'toolbar')

    expect(classifyInteractionKeyTarget(tree)).toBe('pattern')
    expect(classifyInteractionKeyTarget(toolbar)).toBe('pattern')
  })

  it('classifies scroll containers and incidental focus targets', () => {
    const scrollContainer = document.createElement('div')
    scrollContainer.tabIndex = 0
    scrollContainer.style.overflowY = 'auto'

    const incidental = document.createElement('div')
    incidental.tabIndex = 0

    expect(classifyInteractionKeyTarget(scrollContainer)).toBe('scroll-container')
    expect(classifyInteractionKeyTarget(incidental)).toBe('incidental')
  })

  it('allows explicit target kind overrides for app-specific adapters', () => {
    const target = document.createElement('div')
    target.setAttribute('data-interaction-target-kind', 'temporary-control')

    expect(classifyInteractionKeyTarget(target)).toBe('temporary-control')
  })

  it('falls back to unknown when DOM constructors are not installed globally', () => {
    const elementDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'Element')
    if (elementDescriptor?.configurable === false) return

    Object.defineProperty(globalThis, 'Element', {
      configurable: true,
      value: undefined,
    })

    try {
      expect(classifyInteractionKeyTarget({} as EventTarget)).toBe('unknown')
    } finally {
      if (elementDescriptor) {
        Object.defineProperty(globalThis, 'Element', elementDescriptor)
      } else {
        Reflect.deleteProperty(globalThis, 'Element')
      }
    }
  })
})
