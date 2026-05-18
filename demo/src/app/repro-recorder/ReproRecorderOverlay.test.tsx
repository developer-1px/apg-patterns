import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import { ReproRecorderOverlay } from './ReproRecorderOverlay'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('ReproRecorderOverlay', () => {
  it('copies stopped recordings without writing them to the console', async () => {
    const writes: string[] = []
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => { writes.push(value) } },
    })
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    render(<ReproRecorderOverlay />)

    fireEvent.click(screen.getByRole('button', { name: 'REC' }))
    fireEvent.click(screen.getByRole('button', { name: 'STOP REC' }))

    await waitFor(() => expect(writes).toHaveLength(1))
    expect(writes[0]).toContain('# REC /')
    expect(log).not.toHaveBeenCalled()
    expect(screen.getByText(/Copied to clipboard\./)).toBeTruthy()
  })

  it('keeps a visible failure state when the clipboard write fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('denied') } },
    })

    render(<ReproRecorderOverlay />)

    fireEvent.click(screen.getByRole('button', { name: 'REC' }))
    fireEvent.click(screen.getByRole('button', { name: 'STOP REC' }))

    await waitFor(() => expect(screen.getByText(/Clipboard copy failed\./)).toBeTruthy())
  })

  it('toggles recording from the keyboard shortcut', async () => {
    const writes: string[] = []
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => { writes.push(value) } },
    })

    render(<ReproRecorderOverlay />)

    fireEvent.keyDown(window, { key: '\\', code: 'Backslash', ctrlKey: true, shiftKey: true })
    expect(screen.getByRole('button', { name: 'STOP REC' })).toBeTruthy()

    fireEvent.keyDown(window, { key: 'R', code: 'KeyR', altKey: true, shiftKey: true })

    await waitFor(() => expect(writes).toHaveLength(1))
    expect(screen.getByRole('button', { name: 'REC' })).toBeTruthy()
  })

  it('updates elapsed recording text and ignores unrelated shortcuts', () => {
    vi.useFakeTimers()
    render(<ReproRecorderOverlay />)

    fireEvent.keyDown(window, { key: 'x', code: 'KeyX', ctrlKey: true, shiftKey: true })
    expect(screen.getByRole('button', { name: 'REC' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'REC' }))
    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(screen.getByText(/REC recording\.\.\. 1s/)).toBeTruthy()
  })

  it('stops active recordings on unmount', () => {
    const { unmount } = render(<ReproRecorderOverlay />)

    fireEvent.click(screen.getByRole('button', { name: 'REC' }))
    expect(screen.getByRole('button', { name: 'STOP REC' })).toBeTruthy()

    unmount()
  })

  it('shows the recording when clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })

    render(<ReproRecorderOverlay />)

    fireEvent.click(screen.getByRole('button', { name: 'REC' }))
    fireEvent.click(screen.getByRole('button', { name: 'STOP REC' }))

    await waitFor(() => expect(screen.getByText(/Clipboard unavailable\./)).toBeTruthy())
  })
})
