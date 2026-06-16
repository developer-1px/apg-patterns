import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { feedDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

export interface ReactFeedArticle {
  key: Key
  label: string
  state: Pick<ReactRenderItemState, 'active'>
  articleProps: ReactPatternProps
}

export interface ReactFeedRuntime {
  feedProps: ReactPatternProps
  articles: readonly ReactFeedArticle[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useFeedPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactFeedRuntime {
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'feed-article-')
  const runtime = createPatternRuntime({
    definition: feedDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
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

function createFeedArticle(runtime: PatternRuntime, key: Key): ReactFeedArticle {
  const state = runtime.getItemState(key, 'article')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: { active: Boolean(state.active) },
    articleProps: reactProps(runtime.getItemProps('article', key)),
  }
}
