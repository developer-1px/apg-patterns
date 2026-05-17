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
  const key = option.id?.replace(/^pattern-/, '')
  if (!label) continue
  option.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

  try {
    await waitFor(() => {
      const text = rootText()
      const sourceText = document.querySelector('pre')?.textContent ?? ''
      return text.includes(label)
        && sourceText !== 'loading'
        && sourceText.length > 0
        && option.getAttribute('aria-selected') === 'true'
        && (!key || window.location.hash.includes(`pattern=${key}`))
    })
  } catch {
    patternFailures.push(`${label}: did not render selected pattern source route`)
    continue
  }

  if (rootText().includes('missing source:')) patternFailures.push(`${label}: missing source marker rendered`)

  const sourceTablist = document.querySelector('[role="tablist"][aria-label="source files"]')
  if (!sourceTablist) {
    patternFailures.push(`${label}: missing source tablist`)
    continue
  }

  for (const sourceName of Array.from(sourceTablist.querySelectorAll('[role="tab"]'), (tab) => tab.textContent?.trim()).filter(Boolean)) {
    const tab = findSourceTab(sourceName)
    if (!sourceName) continue
    if (!tab) {
      patternFailures.push(`${label}: source tab missing: ${sourceName}`)
      continue
    }
    tab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

    try {
      await waitFor(() => {
        const currentTab = findSourceTab(sourceName)
        const sourceText = document.querySelector('pre')?.textContent ?? ''
        return currentTab?.getAttribute('aria-selected') === 'true'
          && currentHashParam('source') === sourceName
          && sourceText !== 'loading'
          && sourceText.length > 0
          && !sourceText.startsWith('missing source:')
      })
    } catch {
      patternFailures.push(`${label}: source tab failed: ${sourceName}`)
    }
  }
}

await verifyHashRoute('#pattern=accordion&panel=aria&source=Accordion.tsx', (text) =>
  window.location.hash.includes('pattern=accordion')
  && window.location.hash.includes('panel=state')
  && text.includes('Accordion')
  && text.includes('state'),
  'legacy aria panel route did not normalize to state',
)

await verifyHashRoute('#pattern=accordion&panel=events&source=Accordion.tsx', (text) =>
  window.location.hash.includes('pattern=accordion')
  && window.location.hash.includes('panel=events')
  && text.includes('Accordion')
  && text.includes('0 events')
  && text.includes('none'),
  'events panel route did not render empty event log',
)

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

async function verifyHashRoute(hash, predicate, failure) {
  window.location.hash = hash
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitFor(() => predicate(rootText()))
  } catch {
    patternFailures.push(failure)
  }
}

function currentHashParam(name) {
  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get(name)
}

function findSourceTab(sourceName) {
  return Array.from(document.querySelectorAll('[role="tablist"][aria-label="source files"] [role="tab"]'))
    .find((tab) => tab.textContent?.trim() === sourceName)
}
