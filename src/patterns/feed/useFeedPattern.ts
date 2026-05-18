import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternDataWithOptions, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { feedDefinition } from './definition'
import { createFeedArticle, type ReactFeedArticle } from './feedArticle'
export type { ReactFeedArticle } from './feedArticle'

export interface ReactFeedRuntime {
  feedProps: ReactPatternProps
  articles: readonly ReactFeedArticle[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useFeedPattern(data: PatternDataWithOptions, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactFeedRuntime {
  const runtimeOptions = options ?? data.state?.options ?? {}
  const runtime = createPatternRuntime({
    definition: feedDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'feed-article-'}${key}`,
  })

  usePatternEffects({ definition: feedDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get feedProps() {
      return reactProps(runtime.getRootProps())
    },
    get articles() {
      return runtime.visibleKeys.map((key) => createFeedArticle(runtime, key))
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
