import type { PatternData } from '../../../../src'

export function renderDataInspect(data: PatternData): string {
  return JSON.stringify(
    { items: data.items, relations: data.relations, state: data.state, refs: data.refs },
    null,
    2,
  )
}
