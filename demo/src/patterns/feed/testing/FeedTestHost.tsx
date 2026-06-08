import { feedDefinition, reducePatternData } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Feed } from '../Feed'
import { initialFeedData } from '../feedData'

export function FeedDemo() {
  const host = usePatternDataHost(initialFeedData, (data, event) => reducePatternData(feedDefinition, data, event))
  return <Feed data={host.data} onEvent={host.dispatchEvent} />
}
