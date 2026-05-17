export interface AlertDialogData {
  triggerLabel: string
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
}

export const initialAlertDialogData: AlertDialogData = {
  triggerLabel: 'Discard draft',
  title: 'Discard draft?',
  description: 'Your changes will be lost. This action cannot be undone.',
  confirmLabel: 'Discard',
  cancelLabel: 'Cancel',
}
