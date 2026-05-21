import { useState } from 'react'
import { feedDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { Feed } from '../Feed'
import { initialFeedData } from '../feedData'

export function FeedDemo() {
  const [data, setData] = useState<PatternData>(initialFeedData)
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(feedDefinition, current, event))
  return <Feed data={data} onEvent={handleEvent} />
}
