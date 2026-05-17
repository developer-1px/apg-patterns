import type { MouseEvent } from 'react'
import type { PatternData } from '../../src'
import { initialBreadcrumbData, type BreadcrumbItem } from './breadcrumbData'

export interface BreadcrumbProps {
  data?: PatternData
  onNavigate?: (item: BreadcrumbItem) => void
}

export function Breadcrumb({ data = initialBreadcrumbData, onNavigate }: BreadcrumbProps) {
  const rootKeys = data.relations?.rootKeys ?? []
  const currentByKey = data.state?.currentByKey ?? {}
  const items = rootKeys.map((key) => ({
    key,
    label: data.items[key]?.label ?? key,
    href: String((data.items[key] as { href?: unknown } | undefined)?.href ?? '#'),
  }))

  return (
    <nav aria-label={data.refs?.label}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item) => {
          const current = currentByKey[item.key]
          const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault()
            onNavigate?.(item)
          }
          return (
            <li key={item.key} className="flex items-center gap-1">
              <a
                href={item.href}
                onClick={handleClick}
                aria-current={current || undefined}
                className={current ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-blue-600 underline hover:text-blue-800 dark:text-blue-400'}
              >
                {item.label}
              </a>
              {current ? null : <span aria-hidden="true" className="text-zinc-400">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
