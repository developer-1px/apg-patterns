import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactLandmarkItem } from './useLandmarksPattern'
import { useLandmarksPattern } from './useLandmarksPattern'

type LandmarkDataItem = PatternItem & {
  content?: string
}

type LandmarkTag = 'aside' | 'div' | 'footer' | 'form' | 'header' | 'main' | 'nav' | 'section'

const landmarkTags: Record<string, LandmarkTag> = {
  banner: 'header',
  complementary: 'aside',
  contentinfo: 'footer',
  form: 'form',
  main: 'main',
  navigation: 'nav',
  region: 'section',
}

export interface LandmarksProps<TItem extends LandmarkDataItem = LandmarkDataItem> {
  data: PatternData<TItem>
  onEvent?: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderLandmark?: (item: ReactLandmarkItem, dataItem: TItem) => ReactNode
}

export function Landmarks<TItem extends LandmarkDataItem = LandmarkDataItem>({
  data,
  onEvent = () => undefined,
  options,
  className,
  renderLandmark,
}: LandmarksProps<TItem>) {
  const landmarks = useLandmarksPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...landmarks.rootProps, className } as ComponentPropsWithoutRef<'div'>,
    landmarks.items.map((item) => renderLandmarkElement({ item, dataItem: data.items[item.key], renderLandmark })),
  )
}

function renderLandmarkElement<TItem extends LandmarkDataItem>({
  item,
  dataItem,
  renderLandmark,
}: {
  item: ReactLandmarkItem
  dataItem: TItem
  renderLandmark?: (item: ReactLandmarkItem, dataItem: TItem) => ReactNode
}) {
  const content = renderLandmark?.(item, dataItem) ?? dataItem.content ?? item.label
  const tag = landmarkTags[item.kind] ?? 'div'
  return createElement(tag, { key: item.key, ...item.landmarkProps } as ComponentPropsWithoutRef<LandmarkTag> & { key: Key }, content)
}
