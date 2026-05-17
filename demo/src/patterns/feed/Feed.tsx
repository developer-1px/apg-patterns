import { useReducer, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { createPatternRuntime, reducePatternData, usePatternEffects, type PatternData, type PatternEvent } from '../../../../src'
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
  const rootRef = useRef<HTMLDivElement>(null)

  const runtime = createPatternRuntime({
    definition: feedDefinition,
    data,
    options: {},
    onEvent: handleEvent,
    keyToElementId: (key) => `feed-article-${key}`,
  })

  usePatternEffects({ definition: feedDefinition, data, keyToElementId: runtime.keyToElementId })

  const rootProps = runtime.getRootProps() as DivProps

  return (
    <div
      ref={rootRef}
      {...rootProps}
      className="grid max-w-2xl gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500"
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
            className="rounded-xl bg-white/70 p-3 shadow-[0_10px_28px_rgba(24,24,27,0.06)] outline-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 data-active:bg-white data-active:shadow-[0_16px_40px_rgba(24,24,27,0.1)] dark:bg-white/[0.045] dark:shadow-black/15 dark:focus-visible:outline-zinc-500 dark:data-active:bg-white/[0.07]"
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
