import { useState } from 'react'
import type { PatternEvent } from '../../../../../src/react'
import { Button } from '../Button'
import { buttonVariants } from '../buttonData'

export function ActionButtonDemo({ onActivate }: { onActivate?: () => void }) {
  const variant = buttonVariants.action
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => {
    if (event.type === 'activate') onActivate?.()
    setData((current) => variant.reduce(current, event))
  }
  return <Button data={data} onEvent={handleEvent} />
}

export function ToggleButtonDemo() {
  const variant = buttonVariants.toggle
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => setData((current) => variant.reduce(current, event))
  return <Button data={data} onEvent={handleEvent} />
}
