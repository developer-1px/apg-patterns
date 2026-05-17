import type { AnchorHTMLAttributes, HTMLAttributes, KeyboardEvent, MouseEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type PatternData, type PatternEvent } from '../../src'
import { linkDefinition } from '../../src/patterns/link/definition'

type Props = HTMLAttributes<HTMLElement>

const linkClass =
  'inline-flex items-center text-sm text-blue-700 underline outline-none hover:text-blue-900 focus:outline focus:outline-2 focus:outline-blue-400 dark:text-blue-300 dark:hover:text-blue-100'

export interface LinkProps {
  data: PatternData
  onEvent?: (event: PatternEvent) => void
}

export function Link({ data, onEvent }: LinkProps) {
  const rootKey = data.relations?.rootKeys?.[0] ?? null
  const href = rootKey ? String((data.items[rootKey] as { href?: unknown } | undefined)?.href ?? '#') : '#'

  const runtime = createPatternRuntime({
    definition: linkDefinition,
    data,
    options: {},
    onEvent: onEvent ?? (() => {}),
    keyToElementId: (key) => `link-${key}`,
  })

  if (!rootKey) return null
  const { onKeyDown: _ignore, ...partProps } = runtime.getPartProps('link', rootKey) as Props & {
    onClick?: (event: MouseEvent<HTMLElement>) => void
  }
  const rootKeyboard = runtime.getRootKeyboardHandler()
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) =>
    rootKeyboard(event as unknown as KeyInput & { preventDefault?: () => void })

  const label = data.items[rootKey]?.label ?? rootKey
  const variant = (data.items[rootKey] as { variant?: string } | undefined)?.variant ?? 'anchor'

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
