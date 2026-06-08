import type { PatternEvent } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Button } from '../Button'
import { buttonVariants } from '../buttonData'

export function ActionButtonDemo({ onActivate }: { onActivate?: () => void }) {
  const variant = buttonVariants.action
  const host = usePatternDataHost(variant.data, variant.reduce)
  const handleEvent = (event: PatternEvent) => {
    if (event.type === 'activate') onActivate?.()
    host.dispatchEvent(event)
  }
  return <Button data={host.data} onEvent={handleEvent} />
}

export function ToggleButtonDemo() {
  const variant = buttonVariants.toggle
  const host = usePatternDataHost(variant.data, variant.reduce)
  return <Button data={host.data} onEvent={host.dispatchEvent} />
}
