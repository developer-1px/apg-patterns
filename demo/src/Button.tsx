import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type PatternData, type PatternEvent } from '../../src'
import { buttonDefinition } from '../../src/patterns/button/definition'
import type { ButtonVariantKey } from './buttonData'

type Props = HTMLAttributes<HTMLElement>

const buttonClass =
  'inline-flex h-8 items-center rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500'

export interface ButtonProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  variant?: ButtonVariantKey
}

export function Button({ data, onEvent, variant = 'action' }: ButtonProps) {
  const runtime = createPatternRuntime({
    definition: buttonDefinition,
    data,
    options: {},
    onEvent,
    keyToElementId: (key) => `button-${key}`,
  })

  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return null

  const key = rootKeys[0]!
  const { onKeyDown: _ignore, ...props } = runtime.getPartProps('button', key) as Props
  const label = data.items[key]?.label ?? ''

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const result = runtime.resolveKeyboardBinding(event as unknown as KeyInput, key)
    if (!result) return
    if (result.preventDefault) event.preventDefault()
    for (const next of result.events) runtime.emit(next)
  }
  const onFocus = () => runtime.emit({ type: 'focus', key })

  if (variant === 'toggle') {
    return (
      <div role="button" {...props} tabIndex={0} onKeyDown={onKeyDown} onFocus={onFocus} className={buttonClass}>
        {label}
      </div>
    )
  }

  // Action variant — use native <button>. Drop role attribute (native button has implicit role).
  const { role: _role, ...rest } = props as Props & { role?: string }
  return (
    <button type="button" {...rest} onKeyDown={onKeyDown} onFocus={onFocus} className={buttonClass}>
      {label}
    </button>
  )
}
