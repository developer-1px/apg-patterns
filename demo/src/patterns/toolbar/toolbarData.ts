import { toolbarDefinition } from '../../../../src/patterns/toolbar/definition'
import { PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'

export type ToolbarVariantKey = 'toolbar' | 'help'

const formattingToolbarData = PatternDataSchema.parse({
  items: {
    bold: { label: 'Bold' },
    italic: { label: 'Italic' },
    underline: { label: 'Underline' },
    alignLeft: { label: 'Align left' },
    alignCenter: { label: 'Align center' },
    alignRight: { label: 'Align right' },
  },
  relations: {
    rootKeys: ['bold', 'italic', 'underline', 'alignLeft', 'alignCenter', 'alignRight'],
    childrenByKey: {
      bold: [], italic: [], underline: [], alignLeft: [], alignCenter: [], alignRight: [],
    },
  },
  state: {
    activeKey: 'bold',
    selectedKeys: ['alignLeft'],
  },
  refs: {
    label: 'Text formatting',
  },
})

const helpToolbarData = PatternDataSchema.parse({
  items: {
    back: { label: 'Back' },
    contents: { label: 'Contents' },
    index: { label: 'Index' },
    search: { label: 'Search' },
    next: { label: 'Next' },
  },
  relations: {
    rootKeys: ['back', 'contents', 'index', 'search', 'next'],
    childrenByKey: {
      back: [], contents: [], index: [], search: [], next: [],
    },
  },
  state: {
    activeKey: 'contents',
    selectedKeys: ['contents'],
  },
  refs: {
    label: 'Help',
  },
})

export const toolbarVariants: Record<ToolbarVariantKey, { label: string; data: PatternData }> = {
  toolbar: { label: 'Formatting', data: formattingToolbarData },
  help: { label: 'Help', data: helpToolbarData },
}

export const toolbarVariantItems = Object.entries(toolbarVariants).map(([key, value]) => ({ key: key as ToolbarVariantKey, label: value.label }))
export const initialToolbarData = toolbarVariants.toolbar.data

export function reduceToolbarData(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(toolbarDefinition, data, event)
}
