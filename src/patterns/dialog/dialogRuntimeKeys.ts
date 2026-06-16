import type { Key, PatternData } from '../../schema'

export interface DialogRuntimeKeys {
  triggerKey: Key | null
  dialogKey: Key | null
  titleKey: Key | null
  descriptionKey: Key | null
}

export function getDialogRuntimeKeys(data: PatternData): DialogRuntimeKeys {
  const triggerKey = data.relations?.rootKeys?.[0] ?? (data.items.trigger ? 'trigger' : null)
  const relationDialogKey = firstExistingRelationOwnerKey(data) ?? firstExistingRelationControllerKey(data)
  const dialogKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? (data.items.dialog ? 'dialog' : null) ?? relationDialogKey : data.items.dialog ? 'dialog' : relationDialogKey
  const titleKey = dialogKey ? data.relations?.ownerByKey?.[dialogKey] ?? (data.items.title ? 'title' : null) : data.items.title ? 'title' : null
  const descriptionKey = dialogKey ? data.relations?.controlsByKey?.[dialogKey]?.[0] ?? (data.items.description ? 'description' : null) : data.items.description ? 'description' : null

  return { triggerKey, dialogKey, titleKey, descriptionKey }
}

function firstExistingRelationOwnerKey(data: PatternData): Key | null {
  for (const key of Object.keys(data.relations?.ownerByKey ?? {})) {
    if (key in data.items) return key
  }
  return null
}

function firstExistingRelationControllerKey(data: PatternData): Key | null {
  for (const key of Object.keys(data.relations?.controlsByKey ?? {})) {
    if (key in data.items) return key
  }
  return null
}
