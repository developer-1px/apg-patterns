import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useFeedPattern, type ReactFeedArticle } from './useFeedPattern'

type FeedDataItem = PatternItem & {
  content?: string
}

export interface FeedProps<TItem extends FeedDataItem = FeedDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderArticle?: (article: ReactFeedArticle, dataItem: TItem) => ReactNode
}

export function Feed<TItem extends FeedDataItem = FeedDataItem>({ data, onEvent, options, className, renderArticle }: FeedProps<TItem>) {
  const feed = useFeedPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...feed.feedProps, className } as ComponentPropsWithoutRef<'div'>,
    feed.articles.map((article) =>
      createElement(
        'article',
        { key: article.key, ...article.articleProps } as ComponentPropsWithoutRef<'article'> & { key: Key },
        renderArticle?.(article, data.items[article.key]) ?? data.items[article.key]?.content ?? article.label,
      ),
    ),
  )
}
