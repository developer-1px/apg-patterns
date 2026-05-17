import type { CSSProperties } from 'react'

const iconUrlByName = {
  'chevron-right': new URL('lucide-static/icons/chevron-right.svg', import.meta.url).href,
} as const

export type IconName = keyof typeof iconUrlByName

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={['demo-icon', className].filter(Boolean).join(' ')}
      style={{ '--icon-url': `url("${iconUrlByName[name]}")` } as CSSProperties}
    />
  )
}
