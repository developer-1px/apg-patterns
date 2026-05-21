import { useFeedPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'

interface FeedProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function Feed({ data, onEvent }: FeedProps) {
  const feed = useFeedPattern(data, onEvent)

  return (
    <div
      {...feed.feedProps}
      className={cx('grid max-w-2xl gap-3', ds.focusRing)}
    >
      {feed.articles.map((article) => {
        const titleId = `feed-article-${article.key}-title`
        return (
          <article
            key={article.key}
            {...article.articleProps}
            data-active={article.state.active ? '' : undefined}
            className={cx('rounded-md border border-zinc-200 p-3 transition ui-active:bg-zinc-100 dark:border-white/10 dark:ui-active:bg-white/[0.07]', ds.focusRing)}
          >
            <h3 id={titleId} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {article.label}
            </h3>
          </article>
        )
      })}
    </div>
  )
}
