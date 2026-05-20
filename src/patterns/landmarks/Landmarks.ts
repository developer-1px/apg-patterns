import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactLandmarkItem } from './useLandmarksPattern'
import { useLandmarksPattern } from './useLandmarksPattern'

type LandmarkDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>
type HeaderProps = ComponentPropsWithoutRef<'header'>
type AsideProps = ComponentPropsWithoutRef<'aside'>
type FooterProps = ComponentPropsWithoutRef<'footer'>
type FormProps = ComponentPropsWithoutRef<'form'>
type MainProps = ComponentPropsWithoutRef<'main'>
type NavProps = ComponentPropsWithoutRef<'nav'>
type SectionProps = ComponentPropsWithoutRef<'section'>

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
    { ...landmarks.rootProps, className } as DivProps,
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
  if (item.kind === 'banner') return createElement('header', { key: item.key, ...item.landmarkProps } as HeaderProps & { key: Key }, content)
  if (item.kind === 'complementary') return createElement('aside', { key: item.key, ...item.landmarkProps } as AsideProps & { key: Key }, content)
  if (item.kind === 'contentinfo') return createElement('footer', { key: item.key, ...item.landmarkProps } as FooterProps & { key: Key }, content)
  if (item.kind === 'form') return createElement('form', { key: item.key, ...item.landmarkProps } as FormProps & { key: Key }, content)
  if (item.kind === 'main') return createElement('main', { key: item.key, ...item.landmarkProps } as MainProps & { key: Key }, content)
  if (item.kind === 'navigation') return createElement('nav', { key: item.key, ...item.landmarkProps } as NavProps & { key: Key }, content)
  if (item.kind === 'region') return createElement('section', { key: item.key, ...item.landmarkProps } as SectionProps & { key: Key }, content)
  return createElement('div', { key: item.key, ...item.landmarkProps } as DivProps & { key: Key }, content)
}
