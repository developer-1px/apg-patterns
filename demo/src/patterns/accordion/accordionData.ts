import { PatternDataSchema, type PatternData, type PatternEvent, type PatternItem } from '../../../../src/react'
import { accordionDefinition, reducePatternData } from '../../../../src/react'

type AccordionItem = PatternItem & {
  content?: string
}

type AccordionSectionSpec = {
  key: string
  label: string
  content: string
}

const buildAccordionData = (
  sections: readonly AccordionSectionSpec[],
  initialExpanded: readonly string[] = [],
  label = 'Sections',
): PatternData<AccordionItem> => {
  const items: Record<string, { label: string; content?: string }> = {}
  const controlsByKey: Record<string, string[]> = {}
  const ownerByKey: Record<string, string> = {}
  const rootKeys: string[] = []
  for (const section of sections) {
    const panelKey = `${section.key}-panel`
    items[section.key] = { label: section.label }
    items[panelKey] = { label: `${section.label} panel`, content: section.content }
    rootKeys.push(section.key)
    controlsByKey[section.key] = [panelKey]
    ownerByKey[panelKey] = section.key
  }
  return PatternDataSchema.parse({
    items,
    relations: { rootKeys, controlsByKey, ownerByKey },
    state: {
      activeKey: rootKeys[0],
      expandedKeys: [...initialExpanded],
    },
    refs: { label },
  })
}

export const reduceAccordionData = (data: PatternData, event: PatternEvent): PatternData =>
  reducePatternData(accordionDefinition, data, event)

const defaultSections: readonly AccordionSectionSpec[] = [
  {
    key: 'personal',
    label: 'Personal Information',
    content: 'Name, contact details, and date of birth. Used to set up your profile.',
  },
  {
    key: 'billing',
    label: 'Billing Address',
    content: 'Street, city, postal code, and country for invoices and receipts.',
  },
  {
    key: 'shipping',
    label: 'Shipping Address',
    content: 'Where physical goods will be delivered. Optional if you only buy digital items.',
  },
  {
    key: 'preferences',
    label: 'Preferences',
    content: 'Notification settings, language, and theme.',
  },
]

export const initialAccordionData: PatternData<AccordionItem> = buildAccordionData(defaultSections, [], 'Account')
