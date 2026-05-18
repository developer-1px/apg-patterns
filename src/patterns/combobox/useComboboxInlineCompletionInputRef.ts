import { useRef } from 'react'

export function useComboboxInlineCompletionInputRef({
  inlineCompletion,
  variant,
}: {
  inlineCompletion: { start: number; end: number } | null
  variant: 'selectOnly' | 'listAutocomplete' | 'listWithInlineAutocomplete'
}): (node: HTMLInputElement | null) => void {
  const inputRef = useRef<HTMLInputElement>(null)
  return (node) => {
    inputRef.current = node
    if (variant === 'listWithInlineAutocomplete' && inlineCompletion && node) {
      node.setSelectionRange(inlineCompletion.start, inlineCompletion.end)
    }
  }
}
