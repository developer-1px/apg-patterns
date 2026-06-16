import type { PatternData } from '../../schema'
import { getDialogRuntimeKeys } from '../dialog/dialogRuntimeKeys'

export function getAlertDialogRuntimeKeys(data: PatternData) {
  return {
    ...getDialogRuntimeKeys(data),
    confirmKey: data.items.confirm ? 'confirm' : null,
    cancelKey: data.items.cancel ? 'cancel' : null,
  }
}
