import { toolbarDefinition } from '../../../../src/patterns/toolbar/definition'
import { PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src'

export const initialToolbarData = PatternDataSchema.parse({
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

export function reduceToolbarData(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(toolbarDefinition, data, event)
}
