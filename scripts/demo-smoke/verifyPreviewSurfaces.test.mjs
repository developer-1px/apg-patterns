import { afterEach, describe, expect, it } from 'vitest'
import {
  previewSurfaceIsMounted,
  verifyPreviewKeyboardShortcuts,
  verifyPreviewSurface,
  verifyPreviewSurfaceRegistry,
} from './verifyPreviewSurfaces.mjs'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('verifyPreviewSurfaceRegistry', () => {
  it('reports missing and stale preview metadata', () => {
    const patternFailures = []

    verifyPreviewSurfaceRegistry({
      patternKeys: ['accordion', 'missingPattern'],
      expectedKeyboardShortcutsByPattern: new Map([
        ['accordion', ['Enter']],
        ['stalePattern', ['Space']],
      ]),
      patternFailures,
    })

    expect(patternFailures).toContain('missingPattern: missing preview smoke selector')
    expect(patternFailures).toContain('missingPattern: missing keyboard shortcut metadata smoke fixture')
    expect(patternFailures).toContain('stalePattern: stale keyboard shortcut metadata smoke fixture')
  })
})

describe('verifyPreviewSurface', () => {
  it('accepts exactly one populated preview with the expected surface', () => {
    const patternFailures = []
    document.body.innerHTML = '<div data-demo-preview="button"><button type="button">Save</button></div>'

    verifyPreviewSurface({ key: 'button', label: 'Button', patternFailures })

    expect(patternFailures).toEqual([])
    expect(previewSurfaceIsMounted('button')).toBe(true)
  })

  it('reports stale preview containers and missing expected surface', () => {
    const patternFailures = []
    document.body.innerHTML = [
      '<div data-demo-preview="button"><span>Save</span></div>',
      '<div data-demo-preview="tabs"><div role="tablist"></div></div>',
    ].join('')

    verifyPreviewSurface({ key: 'button', label: 'Button', patternFailures })

    expect(patternFailures).toContain('Button: stale preview containers rendered: button, tabs')
    expect(patternFailures).toContain('Button: preview did not render expected surface: button')
    expect(previewSurfaceIsMounted('button')).toBe(false)
  })
})

describe('verifyPreviewKeyboardShortcuts', () => {
  it('checks rendered aria-keyshortcuts against entry metadata', () => {
    const patternFailures = []
    document.body.innerHTML = '<div data-demo-preview="button" aria-keyshortcuts="Enter Space"><button type="button">Save</button></div>'

    verifyPreviewKeyboardShortcuts({
      key: 'button',
      label: 'Button',
      expectedKeyboardShortcutsByPattern: new Map([['button', ['Enter', 'Space']]]),
      patternFailures,
    })

    expect(patternFailures).toEqual([])
  })

  it('reports shortcut drift between rendered preview and metadata', () => {
    const patternFailures = []
    document.body.innerHTML = '<div data-demo-preview="button" aria-keyshortcuts="Enter"><button type="button">Save</button></div>'

    verifyPreviewKeyboardShortcuts({
      key: 'button',
      label: 'Button',
      expectedKeyboardShortcutsByPattern: new Map([['button', ['Enter', 'Space']]]),
      patternFailures,
    })

    expect(patternFailures).toEqual([
      'Button: preview aria-keyshortcuts mismatch: expected=Enter Space, actual=Enter',
    ])
  })
})
