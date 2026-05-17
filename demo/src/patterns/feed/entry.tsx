import { reducePatternData } from '../../../../src'
import { feedDefinition } from '../../../../src/patterns/feed/definition'
import { usePatternDataHost } from '../../shared/demoHostState'
import { Feed } from './Feed'
import { initialFeedData } from './feedData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'feed',
  label: 'Feed',
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialFeedData, (data, event) => reducePatternData(feedDefinition, data, event))
    return {
      key: 'feed',
      label: 'Feed',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'],
      sourceNames: ['Feed.tsx', 'feed/useFeedPattern.ts', 'feedData.ts', 'feed/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <Feed data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}
