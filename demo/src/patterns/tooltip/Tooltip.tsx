import { useReducer, type HTMLAttributes, type KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, reducePatternData, type PatternData } from '../../../../src'
import { tooltipDefinition } from '../../../../src/patterns/tooltip/definition'
import { initialTooltipData, tooltipPanelId, tooltipTriggerId } from './tooltipData'

export interface TooltipProps {
  data?: PatternData
}

export function Tooltip({ data: initialData = initialTooltipData }: TooltipProps) {
  const [data, dispatch] = useReducer(
    (current: PatternData, event: Parameters<typeof reducePatternData>[2]) =>
      reducePatternData(tooltipDefinition, current, event),
    initialData,
  )
  const runtime = createPatternRuntime({
    definition: tooltipDefinition,
    data,
    options: {},
    onEvent: dispatch,
    keyToElementId: (key) => key,
  })
  const triggerLabel = data.items[tooltipTriggerId]?.label ?? tooltipTriggerId
  const tip = data.items[tooltipPanelId]?.label ?? tooltipPanelId
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
