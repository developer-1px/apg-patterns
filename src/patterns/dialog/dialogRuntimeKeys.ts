import type { Key, PatternData } from '../../schema'

export function getDialogRuntimeKeys(data: PatternData) {
  const triggerKey = data.relations?.rootKeys?.[0] ?? (data.items.trigger ? 'trigger' : null)
  const relationDialogKey = firstExistingRelationKey(data, data.relations?.ownerByKey, data.relations?.controlsByKey)
  const dialogKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? (data.items.dialog ? 'dialog' : null) ?? relationDialogKey : data.items.dialog ? 'dialog' : relationDialogKey
  const titleKey = dialogKey ? data.relations?.ownerByKey?.[dialogKey] ?? (data.items.title ? 'title' : null) : data.items.title ? 'title' : null
  const descriptionKey = dialogKey ? data.relations?.controlsByKey?.[dialogKey]?.[0] ?? (data.items.description ? 'description' : null) : data.items.description ? 'description' : null

  return { triggerKey, dialogKey, titleKey, descriptionKey }
}

function firstExistingRelationKey(data: PatternData, ...relations: Array<Readonly<Record<string, unknown>> | undefined>): Key | null {
  for (const relation of relations) {
    for (const key of Object.keys(relation ?? {})) {
      if (key in data.items) return key
    }
  }
  return null
}
