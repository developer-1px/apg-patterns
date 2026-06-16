import type { PatternData } from '../../schema'

export function getDialogRuntimeKeys(data: PatternData) {
  const triggerKey = data.relations?.rootKeys?.[0] ?? (data.items.trigger ? 'trigger' : null)
  const relationDialogKey = [data.relations?.ownerByKey, data.relations?.controlsByKey]
    .flatMap((relation) => Object.keys(relation ?? {}))
    .find((key) => key in data.items) ?? null
  const dialogKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? (data.items.dialog ? 'dialog' : null) ?? relationDialogKey : data.items.dialog ? 'dialog' : relationDialogKey
  const titleKey = dialogKey ? data.relations?.ownerByKey?.[dialogKey] ?? (data.items.title ? 'title' : null) : data.items.title ? 'title' : null
  const descriptionKey = dialogKey ? data.relations?.controlsByKey?.[dialogKey]?.[0] ?? (data.items.description ? 'description' : null) : data.items.description ? 'description' : null

  return { triggerKey, dialogKey, titleKey, descriptionKey }
}
