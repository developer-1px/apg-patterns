import { Button } from './Button'
import { buttonVariantItems, buttonVariants, type ButtonVariantKey } from './buttonData'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'button',
  label: 'Button',
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<ButtonVariantKey>(
      'action',
      buttonVariants.action.data,
      (variant) => buttonVariants[variant].data,
      (variant, data, event) => buttonVariants[variant].reduce(data, event),
    )
    return {
      key: 'button',
      label: 'Button',
      keyboardShortcuts: ['Enter', 'Space'],
      sourceNames: ['Button.tsx', 'button/entry.tsx', 'buttonData.ts', 'button/useButtonPattern.ts', 'button/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox orientation="horizontal" value={host.variant} items={buttonVariantItems} label="button variants" idPrefix="button-variant" onChange={host.selectVariant} />,
      preview: <Button data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}
