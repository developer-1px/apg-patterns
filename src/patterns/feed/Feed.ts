import type { ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
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

  return renderItemCollection({
    rootProps: feed.feedProps, className, items: feed.articles, dataItems: data.items,
    itemElement: 'article',
    getItemProps: (article) => article.articleProps,
    children: (article, dataItem) => renderArticle?.(article, dataItem) ?? dataItem.content ?? article.label,
  })
}
