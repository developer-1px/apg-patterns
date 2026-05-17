import type { MouseEvent } from 'react'
import { breadcrumbItems, breadcrumbLabel, type BreadcrumbItem } from './breadcrumbData'

export interface BreadcrumbProps {
  items?: ReadonlyArray<BreadcrumbItem>
  label?: string
  onNavigate?: (item: BreadcrumbItem) => void
}

export function Breadcrumb({ items = breadcrumbItems, label = breadcrumbLabel, onNavigate }: BreadcrumbProps) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault()
            onNavigate?.(item)
          }
          return (
            <li key={item.key} className="flex items-center gap-1">
              <a
                href={item.href}
                onClick={handleClick}
                aria-current={isLast ? 'page' : undefined}
                className={isLast ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-blue-600 underline hover:text-blue-800 dark:text-blue-400'}
              >
                {item.label}
              </a>
              {isLast ? null : <span aria-hidden="true" className="text-zinc-400">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
