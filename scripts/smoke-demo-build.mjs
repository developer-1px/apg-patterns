import { access, readFile, readdir } from 'node:fs/promises'
import { JSDOM } from 'jsdom'

const demoUrl = 'http://127.0.0.1/#pattern=tabs&panel=code&source=Tabs.tsx'
const distDir = new URL('../demo/dist/', import.meta.url)
const assetsDir = new URL('../demo/dist/assets/', import.meta.url)
const entryFile = (await readdir(assetsDir)).find((file) => /^index-.*\.js$/.test(file))

if (!entryFile) throw new Error('demo build smoke failed: missing built entry chunk')

await verifyDistIndexAssets()

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

if (!hasActiveDemoHeading('Tabs')) patternFailures.push('initial tabs route did not render Tabs workspace')

for (const { key, label } of Array.from(patternListbox.querySelectorAll('[role="option"]'), (option) => ({
  key: option.id?.replace(/^pattern-/, ''),
  label: option.textContent?.trim(),
})).filter((item) => item.key && item.label)) {
  const option = findPatternOption(key)
  if (!label) continue
  if (!option) {
    patternFailures.push(`${label}: pattern option missing`)
    continue
  }
  option.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

  try {
    await waitFor(() => {
      const currentOption = findPatternOption(key)
      const sourceText = document.querySelector('pre')?.textContent ?? ''
      return hasActiveDemoHeading(label)
        && sourceText !== 'loading'
        && sourceText.length > 0
        && currentOption?.getAttribute('aria-selected') === 'true'
        && currentHashParam('pattern') === key
        && sourceTabNames().length > 0
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

  const renderedSourceByName = new Map()
  for (const sourceName of Array.from(sourceTablist.querySelectorAll('[role="tab"]'), (tab) => tab.textContent?.trim()).filter(Boolean)) {
    const tab = findSourceTab(sourceName)
    if (!sourceName) continue
    if (!tab) {
      patternFailures.push(`${label}: source tab missing: ${sourceName}`)
      continue
    }
    tab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

    try {
      const renderedSource = await waitFor(() => {
        const currentTab = findSourceTab(sourceName)
        const sourceText = document.querySelector('pre')?.textContent ?? ''
        const loaded = currentTab?.getAttribute('aria-selected') === 'true'
          && currentHashParam('source') === sourceName
          && sourceFilenameIs(sourceName)
          && sourceText !== 'loading'
          && sourceText.length > 0
          && !sourceText.startsWith('missing source:')
        return loaded ? sourceText : false
      })
      const duplicate = Array.from(renderedSourceByName.entries()).find(([, previousSource]) => previousSource === renderedSource)
      if (duplicate) patternFailures.push(`${label}: source tab reused rendered code for ${duplicate[0]} and ${sourceName}`)
      renderedSourceByName.set(sourceName, renderedSource)
    } catch {
      patternFailures.push(`${label}: source tab failed: ${sourceName}`)
    }
  }
}

await verifyHashRoute('#pattern=accordion&panel=aria&source=Accordion.tsx', (text) =>
  currentHashParam('pattern') === 'accordion'
  && currentHashParam('panel') === 'state'
  && hasActiveDemoHeading('Accordion')
  && text.includes('state'),
  'legacy aria panel route did not normalize to state',
)

await verifyHashRoute('#pattern=accordion&panel=events&source=Accordion.tsx', (text) =>
  currentHashParam('pattern') === 'accordion'
  && currentHashParam('panel') === 'events'
  && hasActiveDemoHeading('Accordion')
  && text.includes('0 events')
  && text.includes('none'),
  'events panel route did not render empty event log',
)

await verifyInteractionEventLog()

await verifyHashRoute('#pattern=accordion&panel=off&source=Accordion.tsx', (text) =>
  currentHashParam('pattern') === 'accordion'
  && currentHashParam('panel') === 'off'
  && hasActiveDemoHeading('Accordion')
  && !text.includes('Accordion.tsx'),
  'closed right panel route did not keep the source panel closed',
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

async function verifyInteractionEventLog() {
  window.location.hash = '#pattern=accordion&panel=events&source=Accordion.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    const accordionButton = await waitFor(() => document.querySelector('button[aria-expanded]'))
    accordionButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => {
      const text = rootText()
      return text.includes('1 events') && text.includes('expand') && text.includes('via pointer')
    })
  } catch {
    patternFailures.push('accordion interaction did not record an event log entry')
  }
}

function currentHashParam(name) {
  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get(name)
}

function hasActiveDemoHeading(label) {
  return Array.from(document.querySelectorAll('h2'))
    .some((heading) => heading.textContent?.trim() === label)
}

function sourceTabNames() {
  return Array.from(document.querySelectorAll('[role="tablist"][aria-label="source files"] [role="tab"]'), (tab) => tab.textContent?.trim())
    .filter(Boolean)
}

function sourceFilenameIs(sourceName) {
  return Array.from(document.querySelectorAll('[title]'))
    .some((element) => element.getAttribute('title') === sourceName && element.textContent?.trim() === sourceName)
}

function findSourceTab(sourceName) {
  return Array.from(document.querySelectorAll('[role="tablist"][aria-label="source files"] [role="tab"]'))
    .find((tab) => tab.textContent?.trim() === sourceName)
}

function findPatternOption(key) {
  return document.getElementById(`pattern-${key}`)
}

async function verifyDistIndexAssets() {
  const indexHtml = await readFile(new URL('index.html', distDir), 'utf8')
  const assetRefs = Array.from(indexHtml.matchAll(/(?:src|href)="([^"]+)"/g), ([, assetRef]) => assetRef)
    .filter((assetRef) => assetRef?.startsWith('/assets/'))

  if (!assetRefs.includes(`/assets/${entryFile}`)) {
    throw new Error(`demo build smoke failed: index.html does not reference ${entryFile}`)
  }

  const missingAssets = []
  for (const assetRef of assetRefs) {
    try {
      await access(new URL(assetRef.replace(/^\//, ''), distDir))
    } catch {
      missingAssets.push(assetRef)
    }
  }

  if (missingAssets.length > 0) {
    throw new Error(`demo build smoke failed: index.html references missing assets: ${missingAssets.join(', ')}`)
  }
}
