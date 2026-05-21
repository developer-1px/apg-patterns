import type { MouseEvent } from 'react'
import { useLinkPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'

const linkClass = cx(ds.focusRing, 'inline-flex items-center rounded-md text-sm text-blue-700 underline underline-offset-2 transition hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100')

interface LinkProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
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
