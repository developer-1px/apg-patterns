import type { Key, PatternData } from '../../schema'

interface AlertDialogRuntimeKeys {
  triggerKey: Key | null
  dialogKey: Key | null
  titleKey: Key | null
  descriptionKey: Key | null
  confirmKey: Key | null
  cancelKey: Key | null
}

export function getAlertDialogRuntimeKeys(data: PatternData): AlertDialogRuntimeKeys {
  const triggerKey = data.relations?.rootKeys?.[0] ?? (data.items.trigger ? 'trigger' : null)
  const dialogKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? (data.items.dialog ? 'dialog' : null) : data.items.dialog ? 'dialog' : null
  const titleKey = dialogKey ? data.relations?.ownerByKey?.[dialogKey] ?? (data.items.title ? 'title' : null) : data.items.title ? 'title' : null
  const descriptionKey = dialogKey ? data.relations?.controlsByKey?.[dialogKey]?.[0] ?? (data.items.description ? 'description' : null) : data.items.description ? 'description' : null

  return {
    triggerKey,
    dialogKey,
    titleKey,
    descriptionKey,
    confirmKey: data.items.confirm ? 'confirm' : null,
    cancelKey: data.items.cancel ? 'cancel' : null,
  }
}
