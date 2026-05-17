import { Button } from '../Button'
import { buttonVariantItems, buttonVariants, type ButtonVariantKey } from '../buttonData'
import { useVariantPatternDataHost } from '../demoHostState'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'button',
  label: 'Button',
  order: 15,
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
      sourceNames: ['Button.tsx', 'buttonData.ts', 'button/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox value={host.variant} items={buttonVariantItems} label="button variants" idPrefix="button-variant" onChange={host.selectVariant} />,
      preview: <Button data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}
