import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'

export interface ReactFeedArticle {
  key: Key
  label: string
  state: Pick<ReactRenderItemState, 'active'>
  articleProps: ReactPatternProps
}

export function createFeedArticle(runtime: PatternRuntime, key: Key): ReactFeedArticle {
  const state = runtime.getItemState(key, 'article')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: { active: Boolean(state.active) },
    articleProps: runtime.getItemProps('article', key) as ReactPatternProps,
  }
}
