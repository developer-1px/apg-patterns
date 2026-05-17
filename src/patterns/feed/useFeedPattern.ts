import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternDataWithOptions, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { feedDefinition } from './definition'

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
      return runtime.getRootProps() as ReactPatternProps
    },
    get articles() {
      return runtime.visibleKeys.map((key) => {
        const state = runtime.getItemState(key, 'article')
        return {
          key,
          label: runtime.data.items[key]?.label ?? key,
          state: { active: Boolean(state.active) },
          articleProps: runtime.getItemProps('article', key) as ReactPatternProps,
        }
      })
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
