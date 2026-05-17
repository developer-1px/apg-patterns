import { useState, type KeyboardEvent } from 'react'
import { initialTooltipData, tooltipPanelId, tooltipTriggerId } from './tooltipData'

export interface TooltipProps {
  label?: string
  description?: string
}

export function Tooltip({ label, description }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const triggerLabel = label ?? (initialTooltipData.items[tooltipTriggerId]?.label as string)
  const tip = description ?? (initialTooltipData.items[tooltipPanelId]?.label as string)

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <>
      <button
        type="button"
        id={tooltipTriggerId}
        aria-describedby={tooltipPanelId}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onKeyDown={onKeyDown}
      >
        {triggerLabel}
      </button>
      {open ? (
        <span id={tooltipPanelId} role="tooltip">
          {tip}
        </span>
      ) : null}
    </>
  )
}
