import { previewSurfaceSelectors } from './previewSurfaceSelectors.mjs'

export function verifyPreviewSurfaceRegistry({ patternKeys, expectedKeyboardShortcutsByPattern, patternFailures }) {
  const patternKeySet = new Set(patternKeys)
  const selectorKeys = Object.keys(previewSurfaceSelectors)
  for (const key of patternKeys) {
    if (!previewSurfaceSelectors[key]) patternFailures.push(`${key}: missing preview smoke selector`)
    if (!expectedKeyboardShortcutsByPattern.has(key)) patternFailures.push(`${key}: missing keyboard shortcut metadata smoke fixture`)
  }
  for (const key of selectorKeys) {
    if (!patternKeySet.has(key)) patternFailures.push(`${key}: stale preview smoke selector`)
  }
  for (const key of expectedKeyboardShortcutsByPattern.keys()) {
    if (!patternKeySet.has(key)) patternFailures.push(`${key}: stale keyboard shortcut metadata smoke fixture`)
  }
}

export function verifyPreviewSurface({ key, label, patternFailures }) {
  const selector = previewSurfaceSelectors[key]
  if (!selector) {
    patternFailures.push(`${label}: missing preview smoke selector`)
    return
  }
  const previews = Array.from(document.querySelectorAll('[data-demo-preview]'))
  const matchingPreviews = previews.filter((preview) => preview.getAttribute('data-demo-preview') === key)
  const preview = matchingPreviews[0]
  if (!preview) {
    patternFailures.push(`${label}: missing preview container`)
    return
  }
  if (matchingPreviews.length > 1) {
    patternFailures.push(`${label}: rendered duplicate preview containers`)
  }
  if (previews.length !== 1) {
    const renderedKeys = previews.map((renderedPreview) => renderedPreview.getAttribute('data-demo-preview') ?? 'unknown')
    patternFailures.push(`${label}: stale preview containers rendered: ${renderedKeys.join(', ')}`)
  }
  if (!preview.firstElementChild) {
    patternFailures.push(`${label}: preview container rendered empty`)
  }
  if (!preview.querySelector(selector)) {
    patternFailures.push(`${label}: preview did not render expected surface: ${selector}`)
  }
}

export function verifyPreviewKeyboardShortcuts({ key, label, expectedKeyboardShortcutsByPattern, patternFailures }) {
  const expectedShortcuts = expectedKeyboardShortcutsByPattern.get(key)
  if (!expectedShortcuts) {
    patternFailures.push(`${label}: missing demo entry keyboard shortcut metadata`)
    return
  }

  const preview = document.querySelector(`[data-demo-preview="${key}"]`)
  const expectedValue = expectedShortcuts.join(' ') || null
  const actualValue = preview?.getAttribute('aria-keyshortcuts')
  if (actualValue !== expectedValue) {
    patternFailures.push(`${label}: preview aria-keyshortcuts mismatch: expected=${expectedValue ?? 'none'}, actual=${actualValue ?? 'none'}`)
  }
}

export function previewSurfaceIsMounted(key) {
  const selector = previewSurfaceSelectors[key]
  const previews = Array.from(document.querySelectorAll('[data-demo-preview]'))
  const preview = previews.find((renderedPreview) => renderedPreview.getAttribute('data-demo-preview') === key)
  return Boolean(selector && preview && previews.length === 1 && preview.firstElementChild && preview.querySelector(selector))
}

export async function verifyVariantControls({ key, label, dom, waitFor, currentHashParam, patternFailures }) {
  const variantListboxes = Array.from(document.querySelectorAll('[role="listbox"]'))
    .filter((listbox) => listbox.getAttribute('aria-label')?.includes('variants'))

  for (const listbox of variantListboxes) {
    const listboxLabel = listbox.getAttribute('aria-label') ?? 'variants'
    const options = Array.from(listbox.querySelectorAll('[role="option"]'))
    if (options.length === 0) {
      patternFailures.push(`${label}: ${listboxLabel} has no options`)
      continue
    }

    if (options.length > 1) {
      const selectedOptionIndex = options.findIndex((option) => option.getAttribute('aria-selected') === 'true')
      const expectedOptionId = options[((selectedOptionIndex < 0 ? 0 : selectedOptionIndex) + 1) % options.length].id
      listbox.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true, cancelable: true }))

      try {
        await waitFor(() => {
          const expectedOption = document.getElementById(expectedOptionId)
          return expectedOption?.getAttribute('aria-selected') === 'true'
            && document.activeElement === expectedOption
            && currentHashParam('pattern') === key
        })
        verifyPreviewSurface({ key, label: `${label} / ${listboxLabel} keyboard`, patternFailures })
      } catch {
        patternFailures.push(`${label}: ${listboxLabel} keyboard navigation did not select and focus the next option`)
      }
    }

    for (const option of options) {
      const optionLabel = option.textContent?.trim() || option.id || 'unknown'
      option.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

      try {
        await waitFor(() => option.getAttribute('aria-selected') === 'true'
          && currentHashParam('pattern') === key)
        verifyPreviewSurface({ key, label: `${label} / ${optionLabel}`, patternFailures })
      } catch {
        patternFailures.push(`${label}: ${listboxLabel} option did not select: ${optionLabel}`)
      }
    }
  }
}
