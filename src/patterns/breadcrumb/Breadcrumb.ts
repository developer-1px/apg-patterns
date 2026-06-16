import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactBreadcrumbItem } from './breadcrumbItem'
import { useBreadcrumbPattern } from './useBreadcrumbPattern'

type BreadcrumbDataItem = PatternItem & {
  href?: unknown
}

type BreadcrumbData<TItem extends BreadcrumbDataItem> = PatternData<TItem>

export interface BreadcrumbProps<TItem extends BreadcrumbDataItem = BreadcrumbDataItem> {
  data: BreadcrumbData<TItem>
  onEvent?: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderCrumb?: (item: ReactBreadcrumbItem, dataItem: TItem) => ReactNode
}

export function Breadcrumb<TItem extends BreadcrumbDataItem = BreadcrumbDataItem>({
  data,
  onEvent = () => undefined,
  options,
  className,
  renderCrumb,
}: BreadcrumbProps<TItem>) {
  const breadcrumb = useBreadcrumbPattern(data, onEvent, options)

  return createElement(
    'nav',
    { ...breadcrumb.rootProps, className } as ComponentPropsWithoutRef<'nav'>,
    createElement(
      'ol',
      breadcrumb.listProps as ComponentPropsWithoutRef<'ol'>,
      breadcrumb.items.map((item) =>
        createElement('li', { key: item.key } as ComponentPropsWithoutRef<'li'> & { key: Key },
          createElement('a', item.crumbProps as ComponentPropsWithoutRef<'a'>, renderCrumb?.(item, data.items[item.key]) ?? item.label),
        ),
      ),
    ),
  )
}
