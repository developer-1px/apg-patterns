import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternOptions } from '../../schema'
import { useButtonPattern } from './useButtonPattern'

export interface ButtonProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  children?: ReactNode
}

export function Button({ data, onEvent, options, className, children }: ButtonProps) {
  const button = useButtonPattern(data, onEvent, options)
  if (!button.key) return null
  return createElement('button', { ...button.rootProps, className } as ComponentPropsWithoutRef<'button'>, children ?? button.label)
}
