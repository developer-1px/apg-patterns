import { createElement, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useLinkPattern } from './useLinkPattern'

type LinkDataItem = PatternItem & {
  href?: unknown
  variant?: string
}

export interface LinkProps<TItem extends LinkDataItem = LinkDataItem> {
  data: PatternData<TItem>
  onEvent?: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  children?: ReactNode
}

export function Link<TItem extends LinkDataItem = LinkDataItem>({ data, onEvent = () => undefined, options, className, children }: LinkProps<TItem>) {
  const link = useLinkPattern(data, onEvent, options)
  if (!link.key) return null

  if (link.variant === 'spanRole') {
    return createElement('span', { ...link.linkProps, className, 'data-href': link.href } as ComponentPropsWithoutRef<'span'>, children ?? link.label)
  }

  return createElement(
    'a',
    {
      ...link.linkProps,
      href: link.href,
      className,
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        link.linkProps.onClick?.(event)
      },
    } as ComponentPropsWithoutRef<'a'>,
    children ?? link.label,
  )
}
