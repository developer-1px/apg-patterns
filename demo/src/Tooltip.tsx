import { useReducer, type HTMLAttributes, type KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, reducePatternData } from '../../src'
import { tooltipDefinition } from '../../src/patterns/tooltip/definition'
import { initialTooltipData, tooltipPanelId, tooltipTriggerId } from './tooltipData'

export interface TooltipProps {
  label?: string
  description?: string
}

export function Tooltip({ label, description }: TooltipProps) {
  const [data, dispatch] = useReducer(
    (current: typeof initialTooltipData, event: Parameters<typeof reducePatternData>[2]) =>
      reducePatternData(tooltipDefinition, current, event),
    initialTooltipData,
  )
  const runtime = createPatternRuntime({
    definition: tooltipDefinition,
    data,
    options: {},
    onEvent: dispatch,
    keyToElementId: (key) => key,
  })
  const triggerLabel = label ?? (initialTooltipData.items[tooltipTriggerId]?.label as string)
  const tip = description ?? (initialTooltipData.items[tooltipPanelId]?.label as string)
  const open = data.state?.expandedKeys?.includes(tooltipTriggerId) ?? false
  const { onKeyDown: _dropKeyDown, ...triggerProps } = runtime.getPartProps('trigger', tooltipTriggerId) as HTMLAttributes<HTMLButtonElement>
  const tooltipProps = runtime.getPartProps('tooltip', tooltipPanelId) as HTMLAttributes<HTMLSpanElement>
  const rootKeyDown = runtime.getRootKeyboardHandler()

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    rootKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
  }

  return (
    <>
      <button
        {...triggerProps}
        type="button"
        onKeyDown={onKeyDown}
      >
        {triggerLabel}
      </button>
      {open ? (
        <span {...tooltipProps}>
          {tip}
        </span>
      ) : null}
    </>
  )
}
