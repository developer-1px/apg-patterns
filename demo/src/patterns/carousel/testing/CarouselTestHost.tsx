import { useState } from 'react'
import { carouselDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { Carousel } from '../Carousel'
import { initialCarouselData } from '../carouselData'

export function CarouselDemo() {
  const [data, setData] = useState<PatternData>(initialCarouselData)
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(carouselDefinition, current, event))
  return <Carousel data={data} onEvent={handleEvent} />
}
