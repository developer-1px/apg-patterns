import { useBreadcrumbPattern, type PatternData, type PatternEvent } from '../../../../src/react'

export interface BreadcrumbProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function Breadcrumb({ data, onEvent }: BreadcrumbProps) {
  const breadcrumb = useBreadcrumbPattern(data, onEvent)

  return (
    <nav {...breadcrumb.rootProps}>
      <ol {...breadcrumb.listProps} className="flex flex-wrap items-center gap-1 text-sm">
        {breadcrumb.items.map((item) => {
          return (
            <li key={item.key} className="flex items-center gap-1">
              <a
                {...item.crumbProps}
                className={item.current ? 'font-medium text-zinc-900 dark:text-zinc-100' : 'text-blue-600 underline hover:text-blue-800 dark:text-blue-400'}
              >
                {item.label}
              </a>
              {item.current ? null : <span aria-hidden="true" className="text-zinc-400">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
