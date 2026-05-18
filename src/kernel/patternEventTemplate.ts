import type { EventTemplate, Key, PatternData, PatternEvent } from '../schema'
import { resolveKeyToken, type PatternRuntimeContext } from './patternKernel'

export function resolveEventTemplate(
  template: EventTemplate,
  activeKey: Key,
  data: PatternData,
  keyContext?: Key,
  ctx?: PatternRuntimeContext,
): readonly PatternEvent[] {
  if (template.type === 'navigate') return [{ type: 'navigate', direction: template.direction }]
  if (template.type === 'selectAll') return [{ type: 'selectAll' }]
  if (template.type === 'selectColumn') return [{ type: 'selectColumn' }]
  if (template.type === 'selectRow') return [{ type: 'selectRow' }]
  if (template.type === 'extendSelection') return [{ type: 'extendSelection', direction: template.direction }]
  if (template.type === 'expandActiveRow') return [{ type: 'expandActiveRow', expanded: template.expanded }]
  if (template.type === 'inputValue') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'inputValue', ...(key ? { key } : {}), value: template.value ?? '', ...(template.inline !== undefined ? { inline: template.inline } : {}) }]
  }
  if (template.type === 'commitValue') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'commitValue', ...(key ? { key } : {}), value: template.value ?? '' }]
  }
  if (template.type === 'typeahead') return [{ type: 'typeahead', query: template.query }]
  if (template.type === 'dismiss') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'dismiss', ...(key ? { key } : {}) }]
  }
  if (template.type === 'reorder') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'reorder', ...(key ? { key } : {}), keys: template.keys }]
  }
  if (template.type === 'remove') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'remove', ...(key ? { key } : {}), keys: template.keys, activeKey: template.activeKey, selectedKeys: template.selectedKeys }]
  }
  if (template.type === 'editEnd') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'editEnd', ...(key ? { key } : {}) }]
  }
  const key = resolveKeyToken(template.key, keyContext, activeKey, ctx)
  if (template.type === 'focus') return [{ type: 'focus', key }]
  if (template.type === 'activate') return [{ type: 'activate', key }]
  if (template.type === 'select') return [{ type: 'select', keys: [key], anchorKey: key, extentKey: key }]
  if (template.type === 'expand') {
    const expanded = template.expanded ?? !(data.state?.expandedKeys?.includes(key) ?? false)
    return [{ type: 'expand', key, expanded }]
  }
  if (template.type === 'check') return [{ type: 'check', key, checked: template.checked ?? true }]
  if (template.type === 'press') return [{ type: 'press', key, pressed: template.pressed }]
  if (template.type === 'value') return [{ type: 'value', key, value: template.value }]
  if (template.type === 'valueStep') return [{ type: 'valueStep', key, direction: template.direction }]
  if (template.type === 'collapse') return [{ type: 'collapse', key }]
  if (template.type === 'close') return [{ type: 'close', key }]
  if (template.type === 'sort') return [{ type: 'sort', key, sort: template.sort }]
  if (template.type === 'editStart') return [{ type: 'editStart', key, ...(template.value !== undefined ? { value: template.value } : {}) }]
  if (template.type === 'editDraft') return [{ type: 'editDraft', key, value: template.value }]
  return []
}
