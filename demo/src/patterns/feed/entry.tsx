import { reducePatternData } from '../../../../src/react'
import { feedDefinition } from '../../../../src/patterns/feed/definition'
import { Feed } from './Feed'
import { initialFeedData } from './feedData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const feedDemoDefinition = {
  key: 'feed',
  label: 'Feed',
  keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'],
  sources: {
    main: 'Feed.tsx',
    entry: 'feed/entry.tsx',
    hooks: ['feed/useFeedPattern.ts'],
    data: ['feedData.ts'],
    definition: 'feed/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Feed',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: feedDemoDefinition,
  initialData: initialFeedData,
  reduce: (data, event) => reducePatternData(feedDefinition, data, event),
  componentName: 'Feed',
  component: Feed,
})
