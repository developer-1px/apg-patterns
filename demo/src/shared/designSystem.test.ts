import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { ds } from './designSystem'

const styleSource = readFileSync(fileURLToPath(new URL('../style.css', import.meta.url)), 'utf8')

describe('design system interactive states', () => {
  it('defines Tailwind v4 custom variants for APG surface states', () => {
    for (const variant of ['ui-focus', 'ui-active', 'ui-selected', 'ui-checked', 'ui-pressed', 'ui-expanded', 'ui-disabled']) {
      expect(styleSource).toContain(`@custom-variant ${variant}`)
    }
  })

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
})
