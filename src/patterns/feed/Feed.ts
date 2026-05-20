import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternDataWithOptions, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactFeedArticle } from './feedArticle'
import { useFeedPattern } from './useFeedPattern'

type FeedDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>
type ArticleProps = ComponentPropsWithoutRef<'article'>

export interface FeedProps<TItem extends FeedDataItem = FeedDataItem> {
  data: PatternDataWithOptions<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderArticle?: (article: ReactFeedArticle, dataItem: TItem) => ReactNode
}

export function Feed<TItem extends FeedDataItem = FeedDataItem>({ data, onEvent, options, className, renderArticle }: FeedProps<TItem>) {
  const feed = useFeedPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...feed.feedProps, className } as DivProps,
    feed.articles.map((article) =>
      createElement(
        'article',
        { key: article.key, ...article.articleProps } as ArticleProps & { key: Key },
        renderArticle?.(article, data.items[article.key]) ?? data.items[article.key]?.content ?? article.label,
      ),
    ),
  )
}
