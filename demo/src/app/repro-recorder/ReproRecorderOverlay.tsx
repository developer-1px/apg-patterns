import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createReproRecorder } from './createReproRecorder'

const buttonStyle = {
  position: 'fixed',
  top: 8,
  right: 8,
  zIndex: 99999,
  height: 28,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(24,24,27,0.18)',
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
  const recorder = useMemo(() => createReproRecorder(), [])
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const startTimeRef = useRef(0)
  const [recording, setRecording] = useState(false)
  const [summary, setSummary] = useState('REC ready. Cmd/Ctrl+Shift+\\ or Alt+Shift+R')

  const copyRecording = useCallback(async (text: string) => {
    if (!navigator.clipboard?.writeText) {
      setSummary(`${text}\n\nClipboard unavailable.`)
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setSummary(`${text}\n\nCopied to clipboard.`)
    } catch {
      setSummary(`${text}\n\nClipboard copy failed.`)
    }
  }, [])

  const stop = useCallback(() => {
    const data = recorder.stop()
    clearInterval(timerRef.current)
    setRecording(false)
    setSummary(data.text)
    void copyRecording(data.text)
  }, [copyRecording, recorder])

  const start = useCallback(() => {
    recorder.start()
    startTimeRef.current = Date.now()
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSummary(`REC recording... ${Math.floor((Date.now() - startTimeRef.current) / 1000)}s`)
    }, 1000)
    setSummary('REC recording...')
    setRecording(true)
  }, [recorder])

  const toggle = useCallback(() => {
    if (recorder.isActive) stop()
    else start()
  }, [recorder, start, stop])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (!shortcutMatches(event)) return
      event.preventDefault()
      event.stopPropagation()
      toggle()
    }

    window.addEventListener('keydown', onShortcut, true)
    return () => {
      window.removeEventListener('keydown', onShortcut, true)
      clearInterval(timerRef.current)
      if (recorder.isActive) recorder.stop()
    }
  }, [recorder, toggle])

  return (
    <>
      <button type="button" style={recording ? recordingStyle : buttonStyle} onClick={toggle}>
        {recording ? 'STOP REC' : 'REC'}
      </button>
      <div style={panelStyle}>{summary}</div>
    </>
  )
}
