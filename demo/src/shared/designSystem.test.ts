import { describe, expect, it } from 'vitest'

import { ds } from './designSystem'

const demoSources = import.meta.glob('../**/*.{ts,tsx}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('design system interactive states', () => {
  it.each([
    ['focusRing', ['ui-focus:']],
    ['focusRingInset', ['ui-focus:']],
    ['field', ['focus:', 'ui-focus:']],
    ['iconButton', ['hover:', 'ui-active:', 'ui-focus:', 'ui-disabled:']],
    ['button', ['hover:', 'ui-active:', 'ui-focus:', 'ui-pressed:', 'ui-disabled:']],
    ['textButton', ['hover:', 'ui-active:', 'ui-focus:', 'ui-disabled:']],
    ['option', ['hover:', 'ui-active:', 'ui-focus:', 'ui-selected:', 'ui-disabled:']],
    ['listOption', ['ui-active:', 'ui-focus:', 'ui-selected:', 'ui-disabled:']],
    ['checkable', ['ui-checked:']],
    ['expandable', ['ui-expanded:']],
  ] as const)('%s covers its required interactive variants', (token, variants) => {
    for (const variant of variants) {
      expect(ds[token]).toContain(variant)
    }
  })

  it('keeps shared APG state styling behind ui-* aliases', () => {
    expect(ds.option).not.toContain('aria-selected:')
    expect(ds.option).not.toContain('data-[focus-visible]:')
    expect(ds.listOption).not.toContain('aria-selected:')
    expect(ds.listOption).not.toContain('data-[active]:')
    expect(ds.button).not.toContain('aria-pressed:')
  })

  it.each([
    ['option', 'ui-active:', ['ui-active:bg-', 'ui-active:text-', 'ui-active:ring-']],
    ['option', 'ui-focus:', ['ui-focus:outline', 'ui-focus:ring-']],
    ['option', 'ui-selected:', ['ui-selected:bg-', 'ui-selected:text-']],
    ['listOption', 'ui-active:', ['ui-active:bg-', 'ui-active:text-', 'ui-active:ring-']],
    ['listOption', 'ui-focus:', ['ui-focus:outline', 'ui-focus:ring-']],
    ['listOption', 'ui-selected:', ['ui-selected:bg-', 'ui-selected:text-']],
    ['button', 'ui-active:', ['ui-active:bg-', 'ui-active:translate-']],
    ['button', 'ui-focus:', ['ui-focus:outline']],
    ['button', 'ui-pressed:', ['ui-pressed:bg-', 'ui-pressed:text-']],
    ['iconButton', 'ui-active:', ['ui-active:bg-', 'ui-active:translate-']],
    ['iconButton', 'ui-focus:', ['ui-focus:outline']],
    ['textButton', 'ui-active:', ['ui-active:translate-']],
    ['textButton', 'ui-focus:', ['ui-focus:outline']],
    ['checkable', 'ui-checked:', ['ui-checked:bg-', 'ui-checked:text-']],
    ['expandable', 'ui-expanded:', ['ui-expanded:bg-', 'ui-expanded:text-']],
  ] as const)('%s makes %s visually perceivable', (token, stateVariant, visualUtilities) => {
    expect(ds[token]).toContain(stateVariant)
    for (const utility of visualUtilities) {
      expect(ds[token]).toContain(utility)
    }
  })

  it('keeps demo components from bypassing shared interactive state variants', () => {
    const blockedPatterns = [
      'aria-selected:',
      'aria-checked:',
      'aria-expanded:',
      'aria-pressed:',
      'aria-disabled:',
      'data-[active]:',
      'data-[focus-visible]:',
      'focus-visible:',
    ]

    const offenders = Object.entries(demoSources)
      .filter(([path]) => !path.endsWith('.test.ts') && !path.endsWith('.test.tsx'))
      .flatMap(([path, source]) => blockedPatterns.filter((pattern) => source.includes(pattern)).map((pattern) => `${path}: ${pattern}`))

    expect(offenders).toEqual([])
  })
})
