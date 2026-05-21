import { readdir } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { readDemoEntryKeyboardShortcuts } from './demo-smoke/readDemoEntryKeyboardShortcuts.mjs'
import { sourceIdentityNeedles } from './demo-smoke/sourceIdentity.mjs'
import { verifyDistIndexAssets } from './demo-smoke/verifyDistIndexAssets.mjs'
import { verifyPatternPanelRoutes as verifyPatternPanelRoutesBase } from './demo-smoke/verifyPatternPanelRoutes.mjs'
import {
  previewSurfaceIsMounted,
  verifyPreviewKeyboardShortcuts as verifyPreviewKeyboardShortcutsBase,
  verifyPreviewSurface as verifyPreviewSurfaceBase,
  verifyPreviewSurfaceRegistry as verifyPreviewSurfaceRegistryBase,
  verifyVariantControls as verifyVariantControlsBase,
} from './demo-smoke/verifyPreviewSurfaces.mjs'

const demoUrl = 'http://127.0.0.1/#pattern=tabs&panel=code&source=Tabs.tsx'
const distDir = new URL('../demo/dist/', import.meta.url)
const assetsDir = new URL('../demo/dist/assets/', import.meta.url)
const demoPatternsDir = new URL('../demo/src/patterns/', import.meta.url)
const entryFile = (await readdir(assetsDir)).find((file) => /^index-.*\.js$/.test(file))
const expectedKeyboardShortcutsByPattern = await readDemoEntryKeyboardShortcuts(demoPatternsDir)

if (!entryFile) throw new Error('demo build smoke failed: missing built entry chunk')

await verifyDistIndexAssets({ distDir, entryFile })

const errors = []
const recordError = (error) => errors.push(error instanceof Error ? error.stack ?? error.message : String(error))
process.once('uncaughtException', recordError)
process.once('unhandledRejection', recordError)
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
console.error = (...args) => {
  errors.push(`console.error: ${args.map(String).join(' ')}`)
  originalConsoleError(...args)
}
console.warn = (...args) => {
  errors.push(`console.warn: ${args.map(String).join(' ')}`)
  originalConsoleWarn(...args)
}

let dom
let root
let clipboardWrites = []
const patternFailures = []
try {
  await runSmoke()
} finally {
  process.removeListener('uncaughtException', recordError)
  process.removeListener('unhandledRejection', recordError)
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
}

async function runSmoke() {
  dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
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
  globalThis.KeyboardEvent = dom.window.KeyboardEvent
  globalThis.SVGElement = dom.window.SVGElement
  globalThis.Node = dom.window.Node
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: dom.window.navigator,
  })
  Object.defineProperty(dom.window.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (value) => {
        clipboardWrites.push(value)
      },
    },
  })

  await import(new URL(entryFile, assetsDir).href)
  const patternListbox = await waitFor(() => document.querySelector('[role="listbox"][aria-label="APG patterns"]'))

  root = document.getElementById('root')
  const requiredText = ['patterns', 'Tabs', 'code', 'Tabs.tsx']
  const missingText = requiredText.filter((text) => !rootText().includes(text))

  if (!hasActiveDemoHeading('Tabs')) patternFailures.push('initial tabs route did not render Tabs workspace')

  const patternOptions = Array.from(patternListbox.querySelectorAll('[role="option"]'), (option) => ({
    key: option.id?.replace(/^pattern-/, ''),
    label: option.textContent?.trim(),
  })).filter((item) => item.key && item.label)
  verifyPreviewSurfaceRegistry(patternOptions.map((option) => option.key))
  await verifyPatternMenuKeyboardNavigation(patternOptions)

  for (const { key, label } of patternOptions) {
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
        const sourceText = sourcePanelText()
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

    if (hasSourceLoadFailure(rootText())) patternFailures.push(`${label}: source load failure marker rendered`)
    verifyPreviewSurface(key, label)
    verifyPreviewKeyboardShortcuts(key, label)
    await verifyVariantControls(key, label)

    const sourceTablist = document.querySelector('[role="tablist"][aria-label="source files"]')
    if (!sourceTablist) {
      patternFailures.push(`${label}: missing source tablist`)
      continue
    }
    verifySingleSelectedTab(sourceTablist, `${label}: source files tablist`)
    verifySingleTabStop(sourceTablist, `${label}: source files tablist`)
    verifySelectedTabControlsPanel(sourceTablist, `${label}: source files tablist`)

    const rightPanelTablist = document.querySelector('[role="tablist"][aria-label="right panel"]')
    if (!rightPanelTablist) {
      patternFailures.push(`${label}: missing right panel tablist`)
      continue
    }
    verifySingleSelectedTab(rightPanelTablist, `${label}: right panel tablist`)
    verifySingleTabStop(rightPanelTablist, `${label}: right panel tablist`)
    verifySelectedTabControlsPanel(rightPanelTablist, `${label}: right panel tablist`)

    const sourceNames = sourceTabNames()
    const duplicateSourceNames = duplicates(sourceNames)
    if (duplicateSourceNames.length > 0) patternFailures.push(`${label}: duplicate source tabs: ${duplicateSourceNames.join(', ')}`)
    const firstSourceName = sourceNames[0]
    const entrySourceName = sourceNames.find((sourceName) => sourceName === expectedEntrySourceName(key))
    const renderedSourceByName = new Map()
    for (const sourceName of sourceNames) {
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
          const sourceText = sourcePanelText()
          const loaded = currentTab?.getAttribute('aria-selected') === 'true'
            && currentHashParam('source') === sourceName
            && sourceFilenameIs(sourceName)
            && sourcePanelIsLabelledBy(currentTab)
            && sourceText !== 'loading'
            && sourceText.length > 0
            && !hasSourceLoadFailure(sourceText)
          return loaded ? sourceText : false
        })
        const duplicate = Array.from(renderedSourceByName.entries()).find(([, previousSource]) => previousSource === renderedSource)
        if (duplicate) patternFailures.push(`${label}: source tab reused rendered code for ${duplicate[0]} and ${sourceName}`)
        const missingNeedles = sourceIdentityNeedles(sourceName, key)
          .filter((needle) => !renderedSource.includes(needle))
        if (missingNeedles.length > 0) {
          patternFailures.push(`${label}: source tab ${sourceName} rendered code missing ${missingNeedles.join(', ')}`)
        }
        renderedSourceByName.set(sourceName, renderedSource)
      } catch {
        patternFailures.push(`${label}: source tab failed: ${sourceName}`)
      }
    }

    if (firstSourceName) await verifyPatternPanelRoutes({ key, label, sourceName: firstSourceName })
    if (entrySourceName) await verifyPatternPanelRoutes({ key, label, sourceName: entrySourceName })
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

  await verifyTabsKeyboardEventLog()
  await verifySourceTabKeyboardNavigation()
  await verifyRightPanelKeyboardNavigation()
  await verifyRightPanelToggleRestoresSourceState()
  await verifyPreviewStateSurvivesInspection()
  await verifyPatternSwitchResetsStaleSource()
  await verifyInteractionEventLog()
  await verifyEventLogClear()
  await verifyLinkInteractionStaysInDemo()
  await verifyTreeviewInspectControls()
  await verifyCopyLoadedSource()

  await verifyHashRoute('#pattern=accordion&panel=off&source=Accordion.tsx', (text) =>
    currentHashParam('pattern') === 'accordion'
    && currentHashParam('panel') === 'off'
    && hasActiveDemoHeading('Accordion')
    && !text.includes('Accordion.tsx'),
    'closed right panel route did not keep the source panel closed',
  )

  await verifyHashRoute('#pattern=checkbox&panel=code&source=Accordion.tsx', (text) =>
    currentHashParam('pattern') === 'checkbox'
    && currentHashParam('panel') === 'code'
    && currentHashParam('source') === 'Checkbox.tsx'
    && hasActiveDemoHeading('Checkbox')
    && sourceFilenameIs('Checkbox.tsx')
    && text.includes('export function Checkbox')
    && !text.includes('missing source: Accordion.tsx'),
    'valid pattern route with stale source did not recover to the pattern default source',
  )

  await verifyHashRoute('#pattern=missing&panel=missing&source=Missing.tsx', (text) =>
    window.location.hash === '#pattern=treeview&panel=code&source=Treeview.tsx'
    && hasActiveDemoHeading('Treeview')
    && sourceFilenameIs('Treeview.tsx')
    && !text.includes('missing source: Missing.tsx'),
    'invalid deep link did not recover to the default demo route',
  )

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
}

async function waitFor(predicate, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = predicate()
    if (value) return value
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  throw new Error('timed out')
}

function rootText() {
  return root?.textContent ?? ''
}

async function verifyHashRoute(hash, predicate, failure) {
  window.location.hash = hash
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitFor(() => predicate(rootText()))
  } catch {
    patternFailures.push(`${failure}: expected ${hash}, current ${window.location.hash}, ${describeRouteState()}, ${describePreviewState()}, text=${rootText().slice(0, 180)}`)
  }
}

async function waitForPatternRoute({ pattern, panel, source, label }) {
  await waitFor(() =>
    currentHashParam('pattern') === pattern
    && currentHashParam('panel') === panel
    && currentHashParam('source') === source
    && hasActiveDemoHeading(label)
    && previewSurfaceIsMounted(pattern)
    && (panel === 'off' || findRightPanelTab(panel)?.getAttribute('aria-selected') === 'true')
    && (panel !== 'code' || sourceFilenameIs(source)),
  )
}

async function verifyInteractionEventLog() {
  window.location.hash = '#pattern=accordion&panel=events&source=Accordion.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'accordion', panel: 'events', source: 'Accordion.tsx', label: 'Accordion' })
    const accordionButton = await waitFor(() => document.querySelector('button[aria-expanded]'))
    accordionButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => {
      const text = rootText()
      const logText = activePreText()
      return text.includes('events') && logText.includes('expand') && logText.includes('via pointer')
    })
  } catch {
    patternFailures.push('accordion interaction did not record an event log entry')
  }
}

async function verifyEventLogClear() {
  window.location.hash = '#pattern=accordion&panel=events&source=Accordion.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'accordion', panel: 'events', source: 'Accordion.tsx', label: 'Accordion' })
    const accordionButton = await waitFor(() => document.querySelector('button[aria-expanded]'))
    accordionButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => rootText().includes('1 events') && activePreText().includes('expand'))

    const clearButton = await waitFor(() => Array.from(document.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === 'clear'))
    clearButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

    await waitFor(() => {
      const text = rootText()
      const logText = activePreText()
      return text.includes('0 events') && logText.trim() === 'none' && !logText.includes('expand key=')
    })
  } catch {
    patternFailures.push(`event log clear did not reset count and rendered log: text=${rootText().slice(0, 180)}`)
  }
}

async function verifyTabsKeyboardEventLog() {
  window.location.hash = '#pattern=accordion&panel=events&source=Accordion.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))
  await waitForPatternRoute({ pattern: 'accordion', panel: 'events', source: 'Accordion.tsx', label: 'Accordion' })

  window.location.hash = '#pattern=tabs&panel=events&source=Tabs.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'tabs', panel: 'events', source: 'Tabs.tsx', label: 'Tabs' })
    const automaticVariant = await waitFor(() => {
      const options = Array.from(document.querySelectorAll('[role="listbox"][aria-label="tabs variants"] [role="option"]'))
      return options.find((option) => option.textContent?.trim() === 'Automatic activation') ?? false
    })
    automaticVariant.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => automaticVariant.getAttribute('aria-selected') === 'true')

    const tabs = await waitFor(() => {
      const renderedTabs = Array.from(document.querySelectorAll('[data-demo-preview="tabs"] [role="tab"]'))
      return renderedTabs.length > 1 ? renderedTabs : false
    })
    const selectedIndex = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
    const sourceTab = tabs[selectedIndex < 0 ? 0 : selectedIndex]
    const expectedLabel = tabs[((selectedIndex < 0 ? 0 : selectedIndex) + 1) % tabs.length].textContent?.trim()

    sourceTab.focus()
    sourceTab.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true, cancelable: true }))
    await waitFor(() => {
      const text = rootText()
      const logText = activePreText()
      const selectedLabel = Array.from(document.querySelectorAll('[data-demo-preview="tabs"] [role="tab"]'))
        .find((tab) => tab.getAttribute('aria-selected') === 'true')
        ?.textContent?.trim()
      return selectedLabel === expectedLabel
        && text.includes('events')
        && logText.includes('navigate')
        && logText.includes('direction=next')
        && logText.includes('via keyboard')
    })
  } catch {
    patternFailures.push(`tabs keyboard interaction did not update selection and event log: ${describePreviewTabs('tabs')} | text=${rootText().slice(0, 180)}`)
  }
}

async function verifySourceTabKeyboardNavigation() {
  window.location.hash = '#pattern=accordion&panel=code&source=Accordion.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'accordion', panel: 'code', source: 'Accordion.tsx', label: 'Accordion' })
    const sourceTablist = await waitFor(() => document.querySelector('[role="tablist"][aria-label="source files"]'))
    const selectedTab = await waitFor(() => sourceTablist.querySelector('[role="tab"][aria-selected="true"]'))
    selectedTab.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true, cancelable: true }))

    await waitFor(() => {
      const selectedSourceName = sourceTabNames().find((sourceName) => findSourceTab(sourceName)?.getAttribute('aria-selected') === 'true')
      const sourceText = sourcePanelText()
      return selectedSourceName
        && selectedSourceName !== 'Accordion.tsx'
        && currentHashParam('pattern') === 'accordion'
        && currentHashParam('panel') === 'code'
        && currentHashParam('source') === selectedSourceName
        && sourceFilenameIs(selectedSourceName)
        && sourceText !== 'loading'
        && sourceText.length > 0
        && !hasSourceLoadFailure(sourceText)
    })
  } catch {
    patternFailures.push(`source tab keyboard navigation did not update the selected source route: current ${window.location.hash}, selected=${sourceTabNames().join(',')}, text=${rootText().slice(0, 180)}`)
  }
}

async function verifyRightPanelKeyboardNavigation() {
  window.location.hash = '#pattern=accordion&panel=code&source=Accordion.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'accordion', panel: 'code', source: 'Accordion.tsx', label: 'Accordion' })
    const selectedRightPanelTab = await waitFor(() => findRightPanelTab('code'))
    selectedRightPanelTab.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true, cancelable: true }))

    await waitFor(() => {
      const panelText = document.querySelector('pre')?.textContent ?? ''
      return currentHashParam('pattern') === 'accordion'
        && currentHashParam('panel') === 'state'
        && currentHashParam('source') === 'Accordion.tsx'
        && hasActiveDemoHeading('Accordion')
        && findRightPanelTab('state')?.getAttribute('aria-selected') === 'true'
        && panelText.includes('"items"')
        && panelText.includes('"relations"')
        && !panelText.includes('export function Accordion')
    })
  } catch {
    patternFailures.push(`right panel keyboard navigation did not switch code to state: current ${window.location.hash}, text=${rootText().slice(0, 180)}`)
  }
}

async function verifyRightPanelToggleRestoresSourceState() {
  window.location.hash = '#pattern=accordion&panel=code&source=accordionData.ts'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'accordion', panel: 'code', source: 'accordionData.ts', label: 'Accordion' })
    await waitFor(() => {
      const sourceText = sourcePanelText()
      return sourceFilenameIs('accordionData.ts')
        && sourceText.includes('export const initialAccordionData')
        && !hasSourceLoadFailure(sourceText)
    })

    const closeToggle = await waitFor(() => findRightPanelToggle())
    closeToggle.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

    await waitFor(() =>
      currentHashParam('pattern') === 'accordion'
      && currentHashParam('panel') === 'off'
      && currentHashParam('source') === 'accordionData.ts'
      && hasActiveDemoHeading('Accordion')
      && !document.querySelector('[role="tablist"][aria-label="right panel"]')
      && !document.querySelector('[role="tablist"][aria-label="source files"]'),
    )

    const reopenToggle = await waitFor(() => findRightPanelToggle())
    reopenToggle.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

    await waitFor(() => {
      const sourceText = sourcePanelText()
      return currentHashParam('pattern') === 'accordion'
        && currentHashParam('panel') === 'code'
        && currentHashParam('source') === 'accordionData.ts'
        && hasActiveDemoHeading('Accordion')
        && findRightPanelTab('code')?.getAttribute('aria-selected') === 'true'
        && sourceFilenameIs('accordionData.ts')
        && sourceText.includes('export const initialAccordionData')
        && !hasSourceLoadFailure(sourceText)
    })
  } catch {
    patternFailures.push(`right panel toggle did not restore source state: current ${window.location.hash}, text=${rootText().slice(0, 180)}`)
  }
}

async function verifyPreviewStateSurvivesInspection() {
  window.location.hash = '#pattern=accordion&panel=code&source=Accordion.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'accordion', panel: 'code', source: 'Accordion.tsx', label: 'Accordion' })
    const accordionButton = await waitFor(() => document.querySelector('[data-demo-preview="accordion"] button[aria-expanded]'))
    accordionButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => accordionButton.getAttribute('aria-expanded') === 'true')

    const dataSourceTab = await waitFor(() => findSourceTab('accordionData.ts'))
    dataSourceTab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => currentHashParam('source') === 'accordionData.ts'
      && sourceFilenameIs('accordionData.ts')
      && accordionButton.getAttribute('aria-expanded') === 'true')

    const stateTab = await waitFor(() => findRightPanelTab('state'))
    stateTab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => currentHashParam('panel') === 'state'
      && accordionButton.getAttribute('aria-expanded') === 'true'
      && (document.querySelector('pre')?.textContent ?? '').includes('"items"'))

    const eventsTab = await waitFor(() => findRightPanelTab('events'))
    eventsTab.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => currentHashParam('panel') === 'events'
      && accordionButton.getAttribute('aria-expanded') === 'true'
      && rootText().includes('1 events'))
  } catch {
    patternFailures.push(`preview state did not survive inspection panel/source navigation: current ${window.location.hash}, text=${rootText().slice(0, 180)}`)
  }
}

async function verifyPatternSwitchResetsStaleSource() {
  window.location.hash = '#pattern=accordion&panel=code&source=accordionData.ts'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'accordion', panel: 'code', source: 'accordionData.ts', label: 'Accordion' })
    const checkboxOption = await waitFor(() => findPatternOption('checkbox'))
    checkboxOption.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))

    await waitFor(() => {
      const sourceText = sourcePanelText()
      return currentHashParam('pattern') === 'checkbox'
        && currentHashParam('panel') === 'code'
        && currentHashParam('source') === 'Checkbox.tsx'
        && hasActiveDemoHeading('Checkbox')
        && sourceFilenameIs('Checkbox.tsx')
        && sourceText.includes('export function Checkbox')
        && !hasSourceLoadFailure(sourceText)
    })
  } catch {
    patternFailures.push(`pattern switch did not reset stale source state: current ${window.location.hash}, text=${rootText().slice(0, 180)}`)
  }
}

async function verifyLinkInteractionStaysInDemo() {
  window.location.hash = '#pattern=link&panel=events&source=Link.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'link', panel: 'events', source: 'Link.tsx', label: 'Link' })
    const link = await waitFor(() => document.querySelector('[data-demo-preview="link"] a[role="link"]'))
    const beforeHref = window.location.href
    const defaultAllowed = link.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => {
      const text = rootText()
      return window.location.href === beforeHref
        && defaultAllowed === false
        && text.includes('1 events')
        && text.includes('activate key=home')
        && text.includes('via pointer')
    })
  } catch {
    patternFailures.push(`link interaction did not record an event while staying in the demo: current ${window.location.href}, text=${rootText().slice(0, 180)}`)
  }
}

async function verifyCopyLoadedSource() {
  window.location.hash = '#pattern=accordion&panel=code&source=Accordion.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))
  clipboardWrites = []

  try {
    await waitForPatternRoute({ pattern: 'accordion', panel: 'code', source: 'Accordion.tsx', label: 'Accordion' })
    const copyButton = await waitFor(() => {
      const button = Array.from(document.querySelectorAll('button'))
        .find((candidate) => candidate.getAttribute('aria-label') === 'copy')
      const sourceText = sourcePanelText()
      const ready = button
        && !button.disabled
        && sourceFilenameIs('Accordion.tsx')
        && sourceText.includes('export function Accordion')
        && !sourceText.includes('loading')
      return ready ? button : false
    })
    copyButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    await waitFor(() => {
      const copiedText = clipboardWrites.at(-1) ?? ''
      return copiedText.includes('export function Accordion')
        && !copiedText.includes('loading')
        && Array.from(document.querySelectorAll('button'))
          .some((button) => button.getAttribute('aria-label') === 'copied')
    })
  } catch {
    patternFailures.push(`source copy did not write the loaded Accordion source: writes=${clipboardWrites.length}, text=${rootText().slice(0, 180)}`)
  }
}

async function verifyPatternMenuKeyboardNavigation(patternOptions) {
  window.location.hash = '#pattern=tabs&panel=code&source=Tabs.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  const currentIndex = patternOptions.findIndex((option) => option.key === 'tabs')
  const expectedOption = patternOptions[currentIndex + 1] ?? patternOptions[0]
  if (currentIndex < 0 || !expectedOption) {
    patternFailures.push('pattern menu keyboard route check could not resolve the next pattern option')
    return
  }

  try {
    await waitForPatternRoute({ pattern: 'tabs', panel: 'code', source: 'Tabs.tsx', label: 'Tabs' })
    const patternListbox = await waitFor(() => document.querySelector('[role="listbox"][aria-label="APG patterns"]'))
    patternListbox.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true, cancelable: true }))

    await waitFor(() => {
      const sourceText = sourcePanelText()
      return currentHashParam('pattern') === expectedOption.key
        && findPatternOption(expectedOption.key)?.getAttribute('aria-selected') === 'true'
        && hasActiveDemoHeading(expectedOption.label)
        && previewSurfaceIsMounted(expectedOption.key)
        && sourceText !== 'loading'
        && sourceText.length > 0
        && !hasSourceLoadFailure(sourceText)
    })
  } catch {
    patternFailures.push(`pattern menu keyboard navigation did not update route and preview: expected=${expectedOption.key}, current=${window.location.hash}, selected=${selectedPatternOptionName() ?? 'none'}`)
  }
}

async function verifyTreeviewInspectControls() {
  window.location.hash = '#pattern=treeview&panel=state&source=Treeview.tsx'
  window.dispatchEvent(new dom.window.HashChangeEvent('hashchange'))

  try {
    await waitForPatternRoute({ pattern: 'treeview', panel: 'state', source: 'Treeview.tsx', label: 'Treeview' })
    const inspectModeSelect = await waitFor(() => {
      const select = Array.from(document.querySelectorAll('select'))
        .find((candidate) => Array.from(candidate.options).some((option) => option.value === 'html'))
      const inspectText = document.querySelector('pre')?.textContent ?? ''
      const ready = select
        && currentHashParam('pattern') === 'treeview'
        && currentHashParam('panel') === 'state'
        && hasActiveDemoHeading('Treeview')
        && findRightPanelTab('state')?.getAttribute('aria-selected') === 'true'
        && inspectText.includes('treeitem')
        && !inspectText.includes('<div role="tree"')
      return ready ? select : false
    })

    inspectModeSelect.value = 'html'
    inspectModeSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }))

    await waitFor(() => {
      const inspectText = document.querySelector('pre')?.textContent ?? ''
      return inspectModeSelect.value === 'html'
        && inspectText.includes('<div role="tree"')
        && inspectText.includes('<button aria-label="toggle')
        && currentHashParam('pattern') === 'treeview'
        && currentHashParam('panel') === 'state'
    })
  } catch {
    const inspectText = document.querySelector('pre')?.textContent ?? ''
    const selectValues = Array.from(document.querySelectorAll('select'), (select) =>
      Array.from(select.options, (option) => option.value).join('/'),
    ).join(', ')
    patternFailures.push(`treeview inspect controls did not switch rendered state output: selects=${selectValues}, text=${inspectText.slice(0, 180)}`)
  }
}

function describePreviewTabs(key) {
  return Array.from(document.querySelectorAll(`[data-demo-preview="${key}"] [role="tab"]`), (tab) =>
    `${tab.textContent?.trim()}:${tab.getAttribute('aria-selected')}`,
  ).join(',')
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

function sourcePanelText() {
  return sourcePanelElement()?.textContent ?? ''
}

function sourcePanelElement() {
  const selectedSourceTab = selectedTabs(document.querySelector('[role="tablist"][aria-label="source files"]')).at(0)
  const panelId = selectedSourceTab?.getAttribute('aria-controls')
  return panelId ? document.getElementById(panelId) : undefined
}

function sourcePanelIsLabelledBy(tab) {
  const panel = sourcePanelElement()
  return Boolean(tab)
    && Boolean(panel)
    && tab.getAttribute('aria-controls') === panel.id
    && panel.getAttribute('aria-labelledby') === tab.id
}

function describeRouteState() {
  const selectedRightTab = selectedTabName('[role="tablist"][aria-label="right panel"]')
  const selectedSourceTab = selectedTabName('[role="tablist"][aria-label="source files"]')
  const sourcePanel = sourcePanelElement()
  return [
    `pattern=${currentHashParam('pattern') ?? 'none'}`,
    `panel=${currentHashParam('panel') ?? 'none'}`,
    `source=${currentHashParam('source') ?? 'none'}`,
    `rightTab=${selectedRightTab ?? 'none'}`,
    `sourceTab=${selectedSourceTab ?? 'none'}`,
    `sourcePanel=${sourcePanel ? `${sourcePanel.id}/${sourcePanel.getAttribute('aria-labelledby') ?? 'unlabelled'}` : 'none'}`,
  ].join(', ')
}

function describePreviewState() {
  const previews = Array.from(document.querySelectorAll('[data-demo-preview]'), (preview) => {
    const key = preview.getAttribute('data-demo-preview') ?? 'unknown'
    const hasContent = preview.firstElementChild ? 'content' : 'empty'
    return `${key}/${hasContent}`
  })
  return `previews=${previews.join('|') || 'none'}`
}

function selectedTabName(tablistSelector) {
  return selectedTabs(document.querySelector(tablistSelector))
    .at(0)
    ?.textContent
    ?.trim()
}

function selectedPatternOptionName() {
  return Array.from(document.querySelectorAll('[role="listbox"][aria-label="APG patterns"] [role="option"]'))
    .find((option) => option.getAttribute('aria-selected') === 'true')
    ?.textContent
    ?.trim()
}

function verifySingleSelectedTab(tablist, label) {
  const selected = selectedTabs(tablist)
  if (selected.length !== 1) {
    const selectedLabels = selected.map((tab) => tab.textContent?.trim() || tab.id || 'unknown').join(', ') || 'none'
    patternFailures.push(`${label}: expected exactly one selected tab, got ${selected.length}: ${selectedLabels}`)
  }
}

function verifySingleTabStop(tablist, label) {
  const tabbableTabs = Array.from(tablist.querySelectorAll('[role="tab"]'))
    .filter((tab) => tab.getAttribute('tabindex') === '0')
  if (tabbableTabs.length !== 1) {
    const tabbableLabels = tabbableTabs.map((tab) => tab.textContent?.trim() || tab.id || 'unknown').join(', ') || 'none'
    patternFailures.push(`${label}: expected exactly one tabbable tab, got ${tabbableTabs.length}: ${tabbableLabels}`)
  }
}

function verifySelectedTabControlsPanel(tablist, label) {
  const tab = selectedTabs(tablist).at(0)
  const panelId = tab?.getAttribute('aria-controls')
  const panel = panelId ? document.getElementById(panelId) : null
  if (!tab || !panel || panel.getAttribute('aria-labelledby') !== tab.id) {
    patternFailures.push(`${label}: selected tab is not linked to its panel`)
  }
}

function selectedTabs(tablist) {
  if (!tablist) return []
  return Array.from(tablist.querySelectorAll('[role="tab"]'))
    .filter((tab) => tab.getAttribute('aria-selected') === 'true')
}

function activePreText() {
  return document.querySelector('pre')?.textContent ?? ''
}

function hasSourceLoadFailure(text) {
  return text.includes('missing source:') || text.includes('failed source:')
}

function expectedEntrySourceName(patternKey) {
  return `${patternKey === 'menuAndMenubar' ? 'menu' : patternKey}/entry.tsx`
}

function findSourceTab(sourceName) {
  return Array.from(document.querySelectorAll('[role="tablist"][aria-label="source files"] [role="tab"]'))
    .find((tab) => tab.textContent?.trim() === sourceName)
}

function findRightPanelTab(name) {
  return Array.from(document.querySelectorAll('[role="tablist"][aria-label="right panel"] [role="tab"]'))
    .find((tab) => tab.textContent?.trim() === name)
}

function findRightPanelToggle() {
  return Array.from(document.querySelectorAll('button[aria-pressed]'))
    .find((button) => button.textContent?.trim() === 'code')
}

function findPatternOption(key) {
  return document.getElementById(`pattern-${key}`)
}

async function verifyPatternPanelRoutes({ key, label, sourceName }) {
  await verifyPatternPanelRoutesBase({
    key,
    label,
    sourceName,
    verifyHashRoute,
    currentHashParam,
    hasActiveDemoHeading,
    findRightPanelTab,
    sourceFilenameIs,
    sourcePanelText,
    activePreText,
    hasSourceLoadFailure,
    sourcePanelElement,
  })
}

function verifyPreviewSurface(key, label) {
  verifyPreviewSurfaceBase({ key, label, patternFailures })
}

function verifyPreviewKeyboardShortcuts(key, label) {
  verifyPreviewKeyboardShortcutsBase({ key, label, expectedKeyboardShortcutsByPattern, patternFailures })
}

async function verifyVariantControls(key, label) {
  await verifyVariantControlsBase({ key, label, dom, waitFor, currentHashParam, patternFailures })
}

function verifyPreviewSurfaceRegistry(patternKeys) {
  verifyPreviewSurfaceRegistryBase({ patternKeys, expectedKeyboardShortcutsByPattern, patternFailures })
}

function duplicates(values) {
  const seen = new Set()
  const duplicateValues = new Set()
  for (const value of values) {
    if (seen.has(value)) duplicateValues.add(value)
    seen.add(value)
  }
  return [...duplicateValues]
}
