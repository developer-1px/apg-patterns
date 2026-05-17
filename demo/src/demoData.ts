import type { PatternData, PatternEvent } from '../../src'

export const initialData = {
  items: {
    docs: { label: 'Docs', textValue: 'docs' },
    adr: { label: 'ADR', textValue: 'adr' },
    runtime: { label: 'Runtime', textValue: 'runtime' },
    schema: { label: 'Schema', textValue: 'schema' },
    demo: { label: 'Demo', textValue: 'demo' },
  },
  relations: {
    rootKeys: ['docs', 'demo'],
    childrenByKey: {
      docs: ['adr', 'runtime', 'schema'],
      adr: [],
      runtime: [],
      schema: [],
      demo: [],
    },
  },
  state: {
    activeKey: 'docs',
    expandedKeys: ['docs'],
    selectedKeys: ['runtime'],
    levelByKey: { docs: 1, demo: 1, adr: 2, runtime: 2, schema: 2 },
    posInSetByKey: { docs: 1, demo: 2, adr: 1, runtime: 2, schema: 3 },
    setSizeByKey: { docs: 2, demo: 2, adr: 3, runtime: 3, schema: 3 },
    typeaheadTextByKey: { docs: 'docs', adr: 'adr', runtime: 'runtime', schema: 'schema', demo: 'demo' },
  },
  refs: { label: 'APG treeview contract demo' },
} satisfies PatternData

type Action = PatternEvent | { type: 'reset' }
type NavigateDirection = Extract<PatternEvent, { type: 'navigate' }>['direction']

export function reduceData(data: PatternData, event: Action): PatternData {
  if (event.type === 'reset') return initialData
  if (event.type === 'focus') return { ...data, state: { ...data.state, activeKey: event.key } }
  if (event.type === 'navigate') return data
  if (event.type === 'select') {
    return {
      ...data,
      state: { ...data.state, anchorKey: event.anchorKey, extentKey: event.extentKey, selectedKeys: [...event.keys] },
    }
  }
  if (event.type === 'expand') {
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.expanded) expanded.add(event.key)
    else expanded.delete(event.key)
    const activeKey = data.state?.activeKey
    const nextActiveKey = !event.expanded && activeKey && isDescendant(data, event.key, activeKey) ? event.key : activeKey
    return {
      ...data,
      state: { ...data.state, activeKey: nextActiveKey ?? event.key, expandedKeys: [...expanded] },
    }
  }
  return data
}

export function resolveTarget(direction: NavigateDirection, data: PatternData) {
  const visible = getVisible(data)
  const active = data.state?.activeKey
  if (!active) return visible[0]
  const index = visible.indexOf(active)
  if (direction === 'next') return visible[Math.min(index + 1, visible.length - 1)]
  if (direction === 'previous') return visible[Math.max(index - 1, 0)]
  if (direction === 'first') return visible[0]
  if (direction === 'last') return visible[visible.length - 1]
  if (direction === 'child') return data.relations?.childrenByKey?.[active]?.[0]
  if (direction === 'parent') {
    for (const [parent, children] of Object.entries(data.relations?.childrenByKey ?? {})) {
      if (children.includes(active)) return parent
    }
    return visible[0]
  }
  return undefined
}

function getVisible(data: PatternData) {
  const expanded = new Set(data.state?.expandedKeys ?? [])
  const visit = (key: string): string[] => [key, ...(expanded.has(key) ? (data.relations?.childrenByKey?.[key] ?? []).flatMap(visit) : [])]
  return (data.relations?.rootKeys ?? []).flatMap(visit)
}

function isDescendant(data: PatternData, ancestorKey: string, key: string): boolean {
  const children = data.relations?.childrenByKey?.[ancestorKey] ?? []
  return children.includes(key) || children.some((child) => isDescendant(data, child, key))
}
