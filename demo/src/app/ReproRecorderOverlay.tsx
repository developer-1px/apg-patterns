import { useCallback, useEffect, useRef, useState } from 'react'
import {
  formatTimelineAsText,
  type ReproEvent,
  type ReproMeta,
} from './reproRecorderFormat'
import { findRoleContainer, serializeARIATree } from './reproARIATree'

type RecorderState = {
  active: boolean
  startedAt: number
  startedAtIso: string
  seq: number
  entries: ReproEvent[]
}

const buttonStyle = {
  position: 'fixed',
  top: 8,
  right: 8,
  zIndex: 99999,
  height: 28,
  border: '1px solid rgba(24,24,27,0.18)',
  borderRadius: 6,
  padding: '0 10px',
  background: 'rgba(24,24,27,0.88)',
  color: 'white',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
} as const

const recordingStyle = {
  ...buttonStyle,
  background: '#dc2626',
  borderColor: '#dc2626',
} as const

const panelStyle = {
  position: 'fixed',
  right: 8,
  bottom: 8,
  zIndex: 99999,
  maxWidth: 560,
  maxHeight: '44dvh',
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
  border: '1px solid rgba(24,24,27,0.18)',
  borderRadius: 8,
  padding: 10,
  background: 'rgba(255,255,255,0.96)',
  color: '#18181b',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  lineHeight: 1.45,
  boxShadow: '0 16px 48px rgba(24,24,27,0.16)',
} as const

function shortcutMatches(event: KeyboardEvent): boolean {
  const modShiftSlash = (event.metaKey || event.ctrlKey) && event.shiftKey && (event.key === '\\' || event.code === 'Backslash')
  const altShiftR = event.altKey && event.shiftKey && event.code === 'KeyR'
  return modShiftSlash || altShiftR
}

export function ReproRecorderOverlay() {
  const recorderRef = useRef<RecorderState>({ active: false, startedAt: 0, startedAtIso: '', seq: 0, entries: [] })
  const [recording, setRecording] = useState(false)
  const [summary, setSummary] = useState('REC ready. Shortcut: Cmd/Ctrl+Shift+\\ or Alt+Shift+R')

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    recorder.active = false
    setRecording(false)
    const meta: ReproMeta = {
      url: window.location.href,
      startedAt: recorder.startedAtIso,
      duration: performance.now() - recorder.startedAt,
      eventCount: recorder.entries.length,
    }
    const text = formatTimelineAsText(meta, recorder.entries)
    setSummary(text)
    console.log(text)
    void navigator.clipboard?.writeText(text).catch(() => undefined)
  }, [])

  const start = useCallback(() => {
    recorderRef.current = { active: true, startedAt: performance.now(), startedAtIso: new Date().toISOString(), seq: 0, entries: [] }
    setSummary('REC recording...')
    setRecording(true)
  }, [])

  const toggle = useCallback(() => {
    if (recorderRef.current.active) stop()
    else start()
  }, [start, stop])

  useEffect(() => {
    const record = (event: KeyboardEvent | MouseEvent | FocusEvent) => {
      const recorder = recorderRef.current
      if (!recorder.active) return
      if (event instanceof KeyboardEvent && shortcutMatches(event)) return

      const seq = ++recorder.seq
      const startedAt = recorder.startedAt
      const target = event.target
      const key = event instanceof KeyboardEvent ? event.key : undefined
      window.requestAnimationFrame(() => {
        const activeElement = document.activeElement instanceof Element ? document.activeElement : null
        const targetElement = target instanceof Element ? target : null
        const container = findRoleContainer(targetElement)
        const entry: ReproEvent = {
          seq,
          time: `+${Math.round(performance.now() - startedAt)}ms`,
          ch: 'input',
          type: event.type === 'focusin' ? 'focus' : event.type,
          ...(key ? { key } : {}),
          target: describeElement(target),
          source: container ? describeElement(container) : null,
          focus: describeElement(activeElement),
          prevented: event.defaultPrevented,
          ariaTree: container ? serializeARIATree(container, activeElement) : '(no ARIA nodes)',
        }
        recorder.entries.push(entry)
        setSummary(formatTimelineAsText({
          url: window.location.href,
          startedAt: recorder.startedAtIso,
          duration: performance.now() - recorder.startedAt,
          eventCount: recorder.entries.length,
        }, recorder.entries.slice(-3)))
      })
    }

    const onShortcut = (event: KeyboardEvent) => {
      if (!shortcutMatches(event)) return
      event.preventDefault()
      event.stopPropagation()
      toggle()
    }

    window.addEventListener('keydown', onShortcut, true)
    window.addEventListener('keydown', record, true)
    window.addEventListener('click', record, true)
    window.addEventListener('focusin', record, true)
    return () => {
      window.removeEventListener('keydown', onShortcut, true)
      window.removeEventListener('keydown', record, true)
      window.removeEventListener('click', record, true)
      window.removeEventListener('focusin', record, true)
    }
  }, [toggle])

  return (
    <>
      <button type="button" style={recording ? recordingStyle : buttonStyle} onClick={toggle}>
        {recording ? 'STOP REC' : 'REC'}
      </button>
      <div style={panelStyle}>{summary}</div>
    </>
  )
}

function describeElement(element: EventTarget | Element | null): string {
  if (!(element instanceof Element)) return 'null'
  const tag = element.tagName.toLowerCase()
  const role = element.getAttribute('role')
  const id = element.id ? `#${element.id}` : ''
  const label = element.getAttribute('aria-label')
  const text = element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 48)
  const name = label ?? text
  return `${tag}${id}${role ? `[role=${role}]` : ''}${name ? ` "${name}"` : ''}`
}
