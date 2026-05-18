import type { PointerEvent } from 'react'

export function valueFromSliderPointer({
  event,
  min,
  max,
  orientation,
  step,
}: {
  event: PointerEvent<HTMLElement>
  min: number
  max: number
  orientation: 'horizontal' | 'vertical'
  step: number
}): number {
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = orientation === 'vertical'
    ? rect.height <= 0 ? 0 : Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))
    : rect.width <= 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const raw = min + ratio * (max - min)
  return Math.round(raw / step) * step
}
