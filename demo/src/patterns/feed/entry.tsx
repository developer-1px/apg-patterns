import { Feed } from './Feed'
import { initialFeedData } from './feedData'
import { type PatternEntry } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/data'

export const entry: PatternEntry = {
  key: 'feed',
  label: 'Feed',
  order: 18,
  useDemoPattern: (_onEvent) => {
    return {
      key: 'feed',
      label: 'Feed',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'],
      sourceNames: ['Feed.tsx', 'feedData.ts', 'feed/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(initialFeedData),
      preview: <Feed />,
      reset: () => {},
    }
  },
}
