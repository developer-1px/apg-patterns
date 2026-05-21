import { checkboxDefinition, PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'

export type CheckboxVariantKey = 'twoState' | 'triState'

interface CheckboxVariant {
  label: string
  data: PatternData
  reduce: (data: PatternData, event: PatternEvent) => PatternData
  groupLabel?: string
}

const twoStateInitial = PatternDataSchema.parse({
  items: {
    updates: { label: 'Email updates' },
  },
  relations: {
    rootKeys: ['updates'],
    childrenByKey: { updates: [] },
  },
  state: {
    activeKey: 'updates',
    checkedByKey: { updates: false },
  },
})

const triStateInitial = PatternDataSchema.parse({
  items: {
    parent: { label: 'All conditions' },
    terms: { label: 'Accept terms of service' },
    privacy: { label: 'Accept privacy policy' },
  },
  relations: {
    rootKeys: ['parent', 'terms', 'privacy'],
    childrenByKey: { parent: ['terms', 'privacy'] },
  },
  state: {
    activeKey: 'parent',
    checkedByKey: { parent: false, terms: false, privacy: false },
  },
  refs: { label: 'Conditions' },
})

function syncTriState(data: PatternData): PatternData {
  const children = data.relations?.childrenByKey?.parent ?? []
  if (children.length === 0) return data
  const checked = data.state?.checkedByKey ?? {}
  const states = children.map((k) => checked[k])
  const allTrue = states.every((v) => v === true)
  const allFalse = states.every((v) => v === false || v === undefined)
  const parent: boolean | 'mixed' = allTrue ? true : allFalse ? false : 'mixed'
  return { ...data, state: { ...data.state, checkedByKey: { ...checked, parent } } }
}

function reduceTriState(data: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'check' && event.key === 'parent') {
    const children = data.relations?.childrenByKey?.parent ?? []
    const current = data.state?.checkedByKey?.parent
    const nextChecked = current === true ? false : true
    const nextByKey = { ...(data.state?.checkedByKey ?? {}) }
    for (const k of children) nextByKey[k] = nextChecked
    nextByKey.parent = nextChecked
    return { ...data, state: { ...data.state, checkedByKey: nextByKey } }
  }
  const next = reducePatternData(checkboxDefinition, data, event)
  return event.type === 'check' ? syncTriState(next) : next
}

export const checkboxVariants: Record<CheckboxVariantKey, CheckboxVariant> = {
  twoState: {
    label: 'Two-State',
    data: twoStateInitial,
    reduce: (data, event) => reducePatternData(checkboxDefinition, data, event),
  },
  triState: {
    label: 'Tri-State (Mixed)',
    data: triStateInitial,
    reduce: reduceTriState,
    groupLabel: 'Conditions',
  },
}

export const checkboxVariantItems: readonly { key: CheckboxVariantKey; label: string }[] = Object.entries(checkboxVariants).map(([key, value]) => ({
  key: key as CheckboxVariantKey,
  label: value.label,
}))
