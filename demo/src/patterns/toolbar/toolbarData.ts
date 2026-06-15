import { toolbarDefinition } from '../../../../src/patterns/toolbar/definition'
import { createToolbarPatternData, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

export type ToolbarVariantKey = 'toolbar' | 'help'

const formattingToolbarData = createToolbarPatternData([
  { key: 'bold', label: 'Bold' },
  { key: 'italic', label: 'Italic' },
  { key: 'underline', label: 'Underline' },
  { key: 'alignLeft', label: 'Align left', selected: true },
  { key: 'alignCenter', label: 'Align center' },
  { key: 'alignRight', label: 'Align right' },
], {
  activeKey: 'bold',
  label: 'Text formatting',
})

const helpToolbarData = createToolbarPatternData([
  { key: 'back', label: 'Back' },
  { key: 'contents', label: 'Contents', selected: true },
  { key: 'index', label: 'Index' },
  { key: 'search', label: 'Search' },
  { key: 'next', label: 'Next' },
], {
  activeKey: 'contents',
  label: 'Help',
})

export const toolbarVariants: Record<ToolbarVariantKey, { label: string; data: PatternData }> = {
  toolbar: { label: 'Formatting', data: formattingToolbarData },
  help: { label: 'Help', data: helpToolbarData },
}

export const toolbarVariantItems = variantItemsFrom(toolbarVariants)
export const initialToolbarData = toolbarVariants.toolbar.data

export function reduceToolbarData(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(toolbarDefinition, data, event)
}
