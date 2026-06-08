import type { PatternEvent } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Slider } from '../Slider'
import { reduceSliderData, sliderVariants } from '../sliderData'

export function SliderDemo({ onEvent, variant = 'seek' }: { onEvent?: (event: PatternEvent) => void; variant?: keyof typeof sliderVariants }) {
  const init = sliderVariants[variant]
  const host = usePatternDataHost(init.data, (data, event) => reduceSliderData(data, event, init.options))
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    host.dispatchEvent(event)
  }
  return <Slider data={host.data} onEvent={handleEvent} options={init.options} />
}
