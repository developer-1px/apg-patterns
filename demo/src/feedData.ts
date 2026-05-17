import { PatternDataSchema } from '../../src'

export interface FeedArticle {
  key: string
  title: string
  body: string
}

export const feedArticles: readonly FeedArticle[] = [
  { key: 'a1', title: 'Welcome to APG Feed', body: 'A scrollable region of articles with PageDown/PageUp keyboard support.' },
  { key: 'a2', title: 'Lazy Loading', body: 'Feed patterns commonly stream additional articles as the user scrolls.' },
  { key: 'a3', title: 'Focus Management', body: 'Each article is a focus stop; the feed itself does not steal focus.' },
  { key: 'a4', title: 'aria-posinset', body: 'Articles advertise their position so AT can announce "3 of 12".' },
  { key: 'a5', title: 'aria-setsize', body: 'Total article count; -1 may be used when the set is open-ended.' },
  { key: 'a6', title: 'aria-labelledby', body: 'Each article points to its own heading for an accessible name.' },
  { key: 'a7', title: 'PageDown moves forward', body: 'PageDown navigates to the next article in reading order.' },
  { key: 'a8', title: 'PageUp moves back', body: 'PageUp navigates to the previous article in reading order.' },
  { key: 'a9', title: 'Ctrl+Home jumps to top', body: 'Ctrl+Home places focus on the first article in the feed.' },
  { key: 'a10', title: 'Ctrl+End jumps to bottom', body: 'Ctrl+End places focus on the last loaded article.' },
  { key: 'a11', title: 'Read more', body: 'Activate an article (Enter/click) to follow it to a detail view.' },
  { key: 'a12', title: 'Last article', body: 'The end of the feed — Ctrl+End lands here.' },
]

export const initialFeedData = PatternDataSchema.parse({
  items: Object.fromEntries(
    feedArticles.map((a) => [a.key, { label: a.title, labelledBy: [`feed-article-${a.key}-title`] }]),
  ),
  relations: {
    rootKeys: feedArticles.map((a) => a.key),
    childrenByKey: Object.fromEntries(feedArticles.map((a) => [a.key, []])),
  },
  state: {
    activeKey: feedArticles[0]!.key,
    posInSetByKey: Object.fromEntries(feedArticles.map((a, i) => [a.key, i + 1])),
    setSizeByKey: Object.fromEntries(feedArticles.map((a) => [a.key, feedArticles.length])),
  },
  refs: { label: 'Demo feed' },
})
