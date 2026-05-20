import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { reducePatternData, useTooltipPattern, type PatternData, type PatternEvent } from '../../../../src'
import { tooltipDefinition } from '../../../../src/patterns/tooltip/definition'
import { Tooltip } from './Tooltip'
import { initialTooltipData } from './tooltipData'

function TooltipDemo() {
  const [data, setData] = useState<PatternData>(initialTooltipData)
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(tooltipDefinition, current, event))
  return <Tooltip data={data} onEvent={handleEvent} />
}

function TooltipActionsDemo({ empty = false }: { empty?: boolean }) {
  const [data, setData] = useState<PatternData>(empty ? { items: {}, relations: { rootKeys: [] }, state: {} } : initialTooltipData)
  const tooltip = useTooltipPattern(
    data,
    (event: PatternEvent) => setData((current) => reducePatternData(tooltipDefinition, current, event)),
  )

  return (
    <div>
      <button type="button" onClick={() => tooltip.actions.open()}>Open action</button>
      <button type="button" onClick={() => tooltip.actions.close()}>Close action</button>
      <output>{String(tooltip.state.open)}</output>
    </div>
  )
}

describe('Tooltip demo', () => {
  it('trigger has aria-describedby pointing to tooltip id', () => {
    render(<TooltipDemo />)
    const trigger = screen.getByRole('button')
    const describedby = trigger.getAttribute('aria-describedby')
    expect(describedby).toBeTruthy()
    fireEvent.focus(trigger)
    const tip = screen.getByRole('tooltip')
    expect(tip.id).toBe(describedby)
  })

  it('focus shows tooltip and blur hides it', () => {
    render(<TooltipDemo />)
    const trigger = screen.getByRole('button')
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()

    fireEvent.blur(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('mouseenter shows tooltip and mouseleave hides it', () => {
    render(<TooltipDemo />)
    const trigger = screen.getByRole('button')
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.mouseEnter(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()

    fireEvent.mouseLeave(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('Escape hides the tooltip while focused', () => {
    render(<TooltipDemo />)
    const trigger = screen.getByRole('button')
    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()

    fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('imperative actions open and close from pointer controls', () => {
    render(<TooltipActionsDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Open action' }))
    expect(screen.getByText('true')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close action' }))
    expect(screen.getByText('false')).toBeTruthy()
  })

  it('imperative actions are harmless without a trigger key', () => {
    render(<TooltipActionsDemo empty />)

    fireEvent.click(screen.getByRole('button', { name: 'Open action' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close action' }))

    expect(screen.getByText('false')).toBeTruthy()
  })
})
