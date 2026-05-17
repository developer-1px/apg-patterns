import type { AnchorHTMLAttributes, HTMLAttributes, KeyboardEvent, MouseEvent } from 'react'
import { useMemo } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type PatternData, type PatternEvent } from '../../src'
import { linkDefinition } from '../../src/patterns/link/definition'
import type { LinkVariantKey } from './linkData'

type Props = HTMLAttributes<HTMLElement>

const linkClass =
  'inline-flex items-center text-sm text-blue-700 underline outline-none hover:text-blue-900 focus:outline focus:outline-2 focus:outline-blue-400 dark:text-blue-300 dark:hover:text-blue-100'

export interface LinkProps {
  data: PatternData
  href: string
  variant?: LinkVariantKey
  onActivate?: (key: string, href: string) => void
  onEvent?: (event: PatternEvent) => void
}

export function Link({ data, href, variant = 'anchor', onActivate, onEvent }: LinkProps) {
  const rootKey = data.relations?.rootKeys?.[0] ?? null

  const emit = (event: PatternEvent) => {
    onEvent?.(event)
    if (event.type === 'activate' && onActivate) onActivate(event.key, href)
  }

  const runtime = useMemo(
    () =>
      createPatternRuntime({
        definition: linkDefinition,
        data,
        options: {},
        onEvent: emit,
        keyToElementId: (key) => `link-${key}`,
      }),
    [data],
  )

  if (!rootKey) return null
  const { onKeyDown: _ignore, ...partProps } = runtime.getPartProps('link', rootKey) as Props & {
    onClick?: (event: MouseEvent<HTMLElement>) => void
  }
  const rootKeyboard = runtime.getRootKeyboardHandler()
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) =>
    rootKeyboard(event as unknown as KeyInput & { preventDefault?: () => void })

  const label = data.items[rootKey]?.label ?? rootKey

  if (variant === 'spanRole') {
    return (
      <span {...partProps} onKeyDown={onKeyDown} className={linkClass} data-href={href}>
        {label}
      </span>
    )
  }

  const anchorProps = partProps as AnchorHTMLAttributes<HTMLAnchorElement>
  return (
    <a {...anchorProps} href={href} onKeyDown={onKeyDown} className={linkClass}>
      {label}
    </a>
  )
}
