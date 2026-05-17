import type { CSSProperties } from 'react'

const iconUrlByName = {
  'arrow-down': new URL('lucide-static/icons/arrow-down.svg', import.meta.url).href,
  'arrow-left': new URL('lucide-static/icons/arrow-left.svg', import.meta.url).href,
  'arrow-right': new URL('lucide-static/icons/arrow-right.svg', import.meta.url).href,
  'arrow-up': new URL('lucide-static/icons/arrow-up.svg', import.meta.url).href,
  check: new URL('lucide-static/icons/check.svg', import.meta.url).href,
  'chevron-right': new URL('lucide-static/icons/chevron-right.svg', import.meta.url).href,
  copy: new URL('lucide-static/icons/copy.svg', import.meta.url).href,
  'circle-dot': new URL('lucide-static/icons/circle-dot.svg', import.meta.url).href,
  file: new URL('lucide-static/icons/file.svg', import.meta.url).href,
  folder: new URL('lucide-static/icons/folder.svg', import.meta.url).href,
  'grip-vertical': new URL('lucide-static/icons/grip-vertical.svg', import.meta.url).href,
  minus: new URL('lucide-static/icons/minus.svg', import.meta.url).href,
  'move-horizontal': new URL('lucide-static/icons/move-horizontal.svg', import.meta.url).href,
  plus: new URL('lucide-static/icons/plus.svg', import.meta.url).href,
  square: new URL('lucide-static/icons/square.svg', import.meta.url).href,
  'square-check': new URL('lucide-static/icons/square-check.svg', import.meta.url).href,
  'trash-2': new URL('lucide-static/icons/trash-2.svg', import.meta.url).href,
  x: new URL('lucide-static/icons/x.svg', import.meta.url).href,
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
