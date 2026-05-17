import { Feed } from './Feed'
import { initialFeedData } from './feedData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'feed',
  label: 'Feed',
  useDemoPattern: (_onEvent) => {
    return {
      key: 'feed',
      label: 'Feed',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'],
      sourceNames: ['Feed.tsx', 'feedData.ts', 'feed/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(initialFeedData),
      preview: <Feed />,
    }
  },
}
