import { useState } from 'react'
import { Button } from '../Button'
import { buttonVariantItems, buttonVariants, reduceButtonData, type ButtonVariantKey } from '../buttonData'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'button',
  label: 'Button',
  order: 15,
  useDemoPattern: (onEvent) => {
    const [variant, setVariant] = useState<ButtonVariantKey>('action')
    const [data, setData] = useState(buttonVariants.action.data)
    return {
      key: 'button',
      label: 'Button',
      keyboardShortcuts: ['Enter', 'Space'],
      sourceNames: ['Button.tsx', 'buttonData.ts', 'button/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      variants: <VariantListbox value={variant} items={buttonVariantItems} label="button variants" idPrefix="button-variant" onChange={(next) => {
        setVariant(next)
        setData(buttonVariants[next].data)
      }} />,
      preview: <Button data={data} variant={variant} onEvent={(event) => {
        onEvent(event)
        setData((current) => reduceButtonData(current, event))
      }} />,
      reset: () => setData(buttonVariants[variant].data),
    }
  },
}
