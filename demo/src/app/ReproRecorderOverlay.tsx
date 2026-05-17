import { useCallback, useEffect, useRef, useState } from 'react'

type RecorderEntry = {
  seq: number
  time: string
  type: string
  key?: string
  target: string
  defaultPrevented: boolean
  snapshot: string
}

type RecorderState = {
  active: boolean
  startedAt: number
  seq: number
  entries: RecorderEntry[]
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

function getName(element: Element): string {
  return element.getAttribute('aria-label')
    ?? element.getAttribute('aria-labelledby')
    ?? element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60)
    ?? ''
}

function serializeCombobox(): string {
  const combobox = document.querySelector<HTMLElement>('[role="combobox"]')
  if (!combobox) return 'combobox: not found'

  const activeId = combobox.getAttribute('aria-activedescendant')
  const activeOption = activeId ? document.getElementById(activeId) : null
  const popupId = combobox.getAttribute('aria-controls')
  const popup = popupId ? document.getElementById(popupId) : null
  const input = combobox instanceof HTMLInputElement ? combobox : null

  const lines = [
    `combobox "${getName(combobox)}"`,
    `  focus=${document.activeElement === combobox}`,
    `  value=${JSON.stringify(input?.value ?? '')}`,
    `  expanded=${combobox.getAttribute('aria-expanded') ?? 'null'}`,
    `  activeDescendant=${activeId ?? 'null'}${activeOption ? ` "${getName(activeOption)}"` : ''}`,
    `  activeVisible=${activeOption ? isVisibleWithin(activeOption, popup) : 'n/a'}`,
  ]

  if (popup) {
    lines.push(`popup #${popup.id} scrollTop=${popup.scrollTop} clientHeight=${popup.clientHeight}`)
    const options = Array.from(popup.querySelectorAll<HTMLElement>('[role="option"]'))
    for (const option of options) {
      const selected = option.getAttribute('aria-selected')
      const marker = option === activeOption ? '>' : ' '
      lines.push(`${marker} option #${option.id} "${getName(option)}" selected=${selected ?? 'null'} data-active=${option.hasAttribute('data-active')}`)
    }
  } else {
    lines.push(`popup: not found (${popupId ?? 'no aria-controls'})`)
  }

  return lines.join('\n')
}

function isVisibleWithin(element: HTMLElement, container: HTMLElement | null): boolean {
  if (!container) return false
  const elementTop = element.offsetTop
  const elementBottom = elementTop + element.offsetHeight
  return elementTop >= container.scrollTop && elementBottom <= container.scrollTop + container.clientHeight
}

function formatRecording(entries: RecorderEntry[]): string {
  if (entries.length === 0) return 'REC: no events'
  return entries.map((entry) => {
    const key = entry.key ? ` ${entry.key}` : ''
    return `[${entry.seq}] ${entry.time} ${entry.type}${key} -> ${entry.target} prevented=${entry.defaultPrevented}\n${entry.snapshot}`
  }).join('\n\n')
}

function shortcutMatches(event: KeyboardEvent): boolean {
  const modShiftSlash = (event.metaKey || event.ctrlKey) && event.shiftKey && (event.key === '\\' || event.code === 'Backslash')
  const altShiftR = event.altKey && event.shiftKey && event.code === 'KeyR'
  return modShiftSlash || altShiftR
}

export function ReproRecorderOverlay() {
  const recorderRef = useRef<RecorderState>({ active: false, startedAt: 0, seq: 0, entries: [] })
  const [recording, setRecording] = useState(false)
  const [summary, setSummary] = useState('REC ready. Shortcut: Cmd/Ctrl+Shift+\\ or Alt+Shift+R')

  const stop = useCallback(() => {
    const recorder = recorderRef.current
    recorder.active = false
    setRecording(false)
    const text = formatRecording(recorder.entries)
    setSummary(text)
    console.log(text)
    void navigator.clipboard?.writeText(text).catch(() => undefined)
  }, [])

  const start = useCallback(() => {
    recorderRef.current = { active: true, startedAt: performance.now(), seq: 0, entries: [] }
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
        const entry: RecorderEntry = {
          seq,
          time: `+${Math.round(performance.now() - startedAt)}ms`,
          type: event.type,
          ...(key ? { key } : {}),
          target: describeElement(target),
          defaultPrevented: event.defaultPrevented,
          snapshot: serializeCombobox(),
        }
        recorder.entries.push(entry)
        setSummary(formatRecording(recorder.entries.slice(-3)))
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
