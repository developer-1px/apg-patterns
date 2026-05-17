import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createReproRecorder } from '../../../../devtools/src/rec/createReproRecorder'

const buttonStyle = {
  position: 'fixed',
  top: 8,
  right: 8,
  zIndex: 99999,
  height: 28,
  border: '1px solid rgba(24,24,27,0.16)',
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

export function ReproRecorderOverlay() {
  const recorder = useMemo(() => createReproRecorder(), [])
  const [recording, setRecording] = useState(false)
  const startTimeRef = useRef(0)
  const [elapsed, setElapsed] = useState(0)

  const stop = useCallback(() => {
    const data = recorder.stop()
    setRecording(false)
    setElapsed(0)
    void navigator.clipboard?.writeText(data.text)
    console.log(data.text)
  }, [recorder])

  const start = useCallback(() => {
    recorder.start()
    startTimeRef.current = Date.now()
    setElapsed(0)
    setRecording(true)
  }, [recorder])

  const toggle = useCallback(() => {
    if (recording) stop()
    else start()
  }, [recording, start, stop])

  useEffect(() => {
    if (!recording) return
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000)
    return () => window.clearInterval(id)
  }, [recording])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || !event.shiftKey || event.key !== '\\') return
      event.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [toggle])

  const minutes = Math.floor(elapsed / 60)
  const seconds = `${elapsed % 60}`.padStart(2, '0')

  return (
    <button type="button" style={recording ? recordingStyle : buttonStyle} onClick={toggle}>
      {recording ? `STOP ${minutes}:${seconds}` : 'REC'}
    </button>
  )
}
