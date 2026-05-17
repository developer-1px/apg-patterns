import { readdir } from 'node:fs/promises'
import { JSDOM } from 'jsdom'

const demoUrl = 'http://127.0.0.1/#pattern=tabs&panel=code&source=Tabs.tsx'
const assetsDir = new URL('../demo/dist/assets/', import.meta.url)
const entryFile = (await readdir(assetsDir)).find((file) => /^index-.*\.js$/.test(file))

if (!entryFile) throw new Error('demo build smoke failed: missing built entry chunk')

const errors = []
const recordError = (error) => errors.push(error instanceof Error ? error.stack ?? error.message : String(error))
process.once('uncaughtException', recordError)
process.once('unhandledRejection', recordError)

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
  pretendToBeVisual: true,
  url: demoUrl,
})

globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.location = dom.window.location
globalThis.history = dom.window.history
globalThis.MutationObserver = dom.window.MutationObserver
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.HTMLIFrameElement = dom.window.HTMLIFrameElement
globalThis.SVGElement = dom.window.SVGElement
globalThis.Node = dom.window.Node
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: dom.window.navigator,
})

await import(new URL(entryFile, assetsDir).href)
const patternListbox = await waitFor(() => document.querySelector('[role="listbox"][aria-label="APG patterns"]'))

const root = document.getElementById('root')
const rootText = () => root?.textContent ?? ''
const requiredText = ['patterns', 'Tabs', 'code', 'Tabs.tsx']
const missingText = requiredText.filter((text) => !rootText().includes(text))
const patternFailures = []

for (const option of patternListbox.querySelectorAll('[role="option"]')) {
  const label = option.textContent?.trim()
  if (!label) continue
  option.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

  try {
    await waitFor(() => {
      const text = rootText()
      const sourceText = document.querySelector('pre')?.textContent ?? ''
      return text.includes(label) && sourceText !== 'loading' && sourceText.length > 0
    })
  } catch {
    patternFailures.push(`${label}: did not render source preview`)
    continue
  }

  if (rootText().includes('missing source:')) patternFailures.push(`${label}: missing source marker rendered`)
}

process.removeListener('uncaughtException', recordError)
process.removeListener('unhandledRejection', recordError)

if (errors.length > 0 || missingText.length > 0 || patternFailures.length > 0) {
  const details = [
    errors.length > 0 ? `runtime errors:\n${errors.join('\n')}` : null,
    missingText.length > 0 ? `missing text: ${missingText.join(', ')}` : null,
    patternFailures.length > 0 ? `pattern smoke failures:\n${patternFailures.join('\n')}` : null,
    `rendered text: ${rootText().slice(0, 300)}`,
  ].filter(Boolean).join('\n\n')
  throw new Error(`demo build smoke failed\n${details}`)
}

console.log('demo build smoke passed')

async function waitFor(predicate, timeoutMs = 1000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = predicate()
    if (value) return value
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error('timed out')
}
