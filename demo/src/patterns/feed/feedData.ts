import { PatternDataSchema } from '../../../../src/react'

interface FeedArticle {
  key: string
  title: string
}

export const feedArticles: readonly FeedArticle[] = [
  { key: 'a1', title: 'Welcome to APG Feed' },
  { key: 'a2', title: 'Lazy Loading' },
  { key: 'a3', title: 'Focus Management' },
  { key: 'a4', title: 'aria-posinset' },
  { key: 'a5', title: 'aria-setsize' },
  { key: 'a6', title: 'aria-labelledby' },
  { key: 'a7', title: 'PageDown moves forward' },
  { key: 'a8', title: 'PageUp moves back' },
  { key: 'a9', title: 'Ctrl+Home jumps to top' },
  { key: 'a10', title: 'Ctrl+End jumps to bottom' },
  { key: 'a11', title: 'Read more' },
  { key: 'a12', title: 'Last article' },
]

export const initialFeedData = PatternDataSchema.parse({
  items: Object.fromEntries(
    feedArticles.map((a) => [a.key, { label: a.title, labelledBy: [`feed-article-${a.key}-title`] }]),
  ),
  relations: {
    rootKeys: feedArticles.map((a) => a.key),
  },
  state: {
    activeKey: feedArticles[0]!.key,
    posInSetByKey: Object.fromEntries(feedArticles.map((a, i) => [a.key, i + 1])),
    setSizeByKey: Object.fromEntries(feedArticles.map((a) => [a.key, feedArticles.length])),
  },
  refs: { label: 'Demo feed' },
})
