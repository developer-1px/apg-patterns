import { previewSurfaceIsMounted } from './verifyPreviewSurfaces.mjs'

export async function verifyPatternPanelRoutes({
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
  sourceTextMatches,
}) {
  const stateHash = buildHash({ pattern: key, panel: 'state', source: sourceName })
  await verifyHashRoute(stateHash, () => {
    const inspectText = activePreText()
    return (
      window.location.hash === stateHash
      && currentHashParam('pattern') === key
      && currentHashParam('panel') === 'state'
      && hasActiveDemoHeading(label)
      && previewSurfaceIsMounted(key)
      && findRightPanelTab('state')?.getAttribute('aria-selected') === 'true'
      && inspectText.trim().length > 0
      && inspectText !== 'loading'
      && !inspectText.includes('export function ')
    )
  },
    `${label}: state panel route did not render`,
  )

  const eventsHash = buildHash({ pattern: key, panel: 'events', source: sourceName })
  await verifyHashRoute(eventsHash, (text) => {
    const logText = activePreText()
    return (
      window.location.hash === eventsHash
      && currentHashParam('pattern') === key
      && currentHashParam('panel') === 'events'
      && hasActiveDemoHeading(label)
      && previewSurfaceIsMounted(key)
      && findRightPanelTab('events')?.getAttribute('aria-selected') === 'true'
      && text.includes('events')
      && text.includes('0 events')
      && logText.trim() === ''
    )
  },
    `${label}: events panel route did not render`,
  )

  const offHash = buildHash({ pattern: key, panel: 'off', source: sourceName })
  await verifyHashRoute(offHash, () =>
    window.location.hash === offHash
    && currentHashParam('pattern') === key
    && currentHashParam('panel') === 'off'
    && hasActiveDemoHeading(label)
    && previewSurfaceIsMounted(key)
    && !document.querySelector('[role="tablist"][aria-label="right panel"]')
    && !document.querySelector('[role="tablist"][aria-label="source files"]')
    && !sourcePanelElement(),
    `${label}: closed panel route did not render`,
  )

  const codeHash = buildHash({ pattern: key, panel: 'code', source: sourceName })
  await verifyHashRoute(codeHash, () => {
    const sourceText = sourcePanelText()
    return (
      window.location.hash === codeHash
      && currentHashParam('pattern') === key
      && currentHashParam('panel') === 'code'
      && hasActiveDemoHeading(label)
      && previewSurfaceIsMounted(key)
      && findRightPanelTab('code')?.getAttribute('aria-selected') === 'true'
      && sourceFilenameIs(sourceName)
      && sourceText.trim().length > 0
      && sourceText !== 'loading'
      && !hasSourceLoadFailure(sourceText)
      && sourceTextMatches(sourceName, sourceText)
    )
  },
    `${label}: code panel route did not restore after panel route checks`,
  )
}

function buildHash(params) {
  const hashParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) hashParams.set(key, value)
  return `#${hashParams.toString()}`
}
