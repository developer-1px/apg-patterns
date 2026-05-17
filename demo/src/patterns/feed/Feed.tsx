import { useReducer } from 'react'
import type { HTMLAttributes } from 'react'
import { createPatternRuntime, reducePatternData, usePatternAutoFocus, type PatternData, type PatternEvent } from '../../../../src'
import { feedDefinition } from '../../../../src/patterns/feed/definition'
import { feedArticles, initialFeedData } from './feedData'

type DivProps = HTMLAttributes<HTMLElement>

export interface FeedProps {
  data?: PatternData
}

export function Feed({ data: initialData = initialFeedData }: FeedProps = {}) {
  const [data, dispatch] = useReducer(
    (current: PatternData, event: PatternEvent) => reducePatternData(feedDefinition, current, event),
    initialData,
  )
  const handleEvent = (event: PatternEvent) =>
    dispatch(event)

  const runtime = createPatternRuntime({
    definition: feedDefinition,
    data,
    options: {},
    onEvent: handleEvent,
    keyToElementId: (key) => `feed-article-${key}`,
  })

  usePatternAutoFocus(runtime)

  const rootProps = runtime.getRootProps() as DivProps

  return (
    <div
      {...rootProps}
      className="grid max-w-2xl gap-3 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500"
    >
      {feedArticles.map((article) => {
        const itemProps = runtime.getItemProps('article', article.key) as DivProps
        const state = runtime.getItemState(article.key, 'article')
        const titleId = `feed-article-${article.key}-title`
        return (
          <article
            key={article.key}
            {...itemProps}
            data-active={state.active ? '' : undefined}
            className="rounded border border-zinc-200 bg-white p-3 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 data-active:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:outline-zinc-500 dark:data-active:border-zinc-500"
          >
            <h3 id={titleId} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {article.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{article.body}</p>
          </article>
        )
      })}
    </div>
  )
}
