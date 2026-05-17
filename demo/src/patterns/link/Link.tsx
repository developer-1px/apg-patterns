import { useLinkPattern, type PatternData, type PatternEvent } from '../../../../src'

const linkClass =
  'inline-flex items-center text-sm text-blue-700 underline outline-none hover:text-blue-900 focus:outline focus:outline-2 focus:outline-blue-400 dark:text-blue-300 dark:hover:text-blue-100'

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
    <a {...link.linkProps} href={link.href} className={linkClass}>
      {link.label}
    </a>
  )
}
