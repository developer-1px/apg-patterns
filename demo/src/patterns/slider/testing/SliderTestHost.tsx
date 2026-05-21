import { useState } from 'react'
import type { PatternEvent } from '../../../../../src/react'
import { Slider } from '../Slider'
import { reduceSliderData, sliderVariants } from '../sliderData'

export function SliderDemo({ onEvent, variant = 'seek' }: { onEvent?: (event: PatternEvent) => void; variant?: keyof typeof sliderVariants }) {
  const init = sliderVariants[variant]
  const [data, setData] = useState(init.data)
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    setData((current) => reduceSliderData(current, event, init.options))
  }
  return <Slider data={data} onEvent={handleEvent} options={init.options} />
}
