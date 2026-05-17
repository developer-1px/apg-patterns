import type { MouseEvent } from 'react'
import { useLinkPattern, type PatternData, type PatternEvent } from '../../../../src'

const linkClass =
  'inline-flex items-center rounded-md text-sm text-blue-700 underline underline-offset-2 outline-none transition hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 dark:text-blue-300 dark:hover:text-blue-100'

export interface LinkProps {
  data: PatternData
  onEvent?: (event: PatternEvent) => void
}

export function Link({ data, onEvent }: LinkProps) {
  const link = useLinkPattern(data, onEvent)
  if (!link.key) return null

  if (link.variant === 'spanRole') {
    return (
      <span {...link.linkProps} className={linkClass} data-href={link.href}>
        {link.label}
      </span>
    )
  }

  return (
    <a {...link.linkProps} href={link.href} className={linkClass} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      link.linkProps.onClick?.(event)
    }}>
      {link.label}
    </a>
  )
}
