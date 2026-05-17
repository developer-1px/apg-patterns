import { useReducer } from 'react'
import { reducePatternData, useFeedPattern, type PatternData, type PatternEvent } from '../../../../src'
import { feedDefinition } from '../../../../src/patterns/feed/definition'
import { feedArticles, initialFeedData } from './feedData'

export interface FeedProps {
  data?: PatternData
  onEvent?: (event: PatternEvent) => void
}

export function Feed({ data = initialFeedData, onEvent }: FeedProps = {}) {
  const [localData, dispatch] = useReducer(
    (current: PatternData, event: PatternEvent) => reducePatternData(feedDefinition, current, event),
    data,
  )
  const isControlled = onEvent !== undefined
  const feed = useFeedPattern(isControlled ? data : localData, isControlled ? onEvent : dispatch)

  return (
    <div
      {...feed.feedProps}
      className="grid max-w-2xl gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500"
    >
      {feed.articles.map((article) => {
        const content = feedArticles.find((item) => item.key === article.key)
        const titleId = `feed-article-${article.key}-title`
        return (
          <article
            key={article.key}
            {...article.articleProps}
            data-active={article.state.active ? '' : undefined}
            className="rounded-xl bg-white/70 p-3 shadow-[0_10px_28px_rgba(24,24,27,0.06)] outline-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 data-[active]:bg-white data-[active]:shadow-[0_16px_40px_rgba(24,24,27,0.1)] dark:bg-white/[0.045] dark:shadow-black/15 dark:focus-visible:outline-zinc-500 dark:data-[active]:bg-white/[0.07]"
          >
            <h3 id={titleId} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {content?.title ?? article.label}
            </h3>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{content?.body}</p>
          </article>
        )
      })}
    </div>
  )
}
