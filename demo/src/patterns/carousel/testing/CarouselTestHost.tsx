import { carouselDefinition, reducePatternData } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Carousel } from '../Carousel'
import { initialCarouselData } from '../carouselData'

export function CarouselDemo() {
  const host = usePatternDataHost(initialCarouselData, (data, event) => reducePatternData(carouselDefinition, data, event))
  return <Carousel data={host.data} onEvent={host.dispatchEvent} />
}
