import type { Key, PatternData } from '../../schema'
import { getDialogRuntimeKeys } from '../dialog/dialogRuntimeKeys'

interface AlertDialogRuntimeKeys extends ReturnType<typeof getDialogRuntimeKeys> {
  confirmKey: Key | null
  cancelKey: Key | null
}

export function getAlertDialogRuntimeKeys(data: PatternData): AlertDialogRuntimeKeys {
  return {
    ...getDialogRuntimeKeys(data),
    confirmKey: data.items.confirm ? 'confirm' : null,
    cancelKey: data.items.cancel ? 'cancel' : null,
  }
}
