import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'

export function createMenuButtonActions({
  data,
  itemKeys,
  triggerKey,
  runtime,
  onEvent,
}: {
  data: PatternData
  itemKeys: readonly Key[]
  triggerKey: Key | null
  runtime: PatternRuntime
  onEvent(event: PatternEvent): void
}): {
  closeAndFocusTrigger(): void
  activateActiveItem(): void
} {
  const closeAndFocusTrigger = () => {
    if (!triggerKey) return
    onEvent({ type: 'expand', key: triggerKey, expanded: false })
    document.getElementById(runtime.keyToElementId(triggerKey))?.focus({ preventScroll: true })
  }
  const activateActiveItem = () => {
    const activeKey = data.state?.activeKey && itemKeys.includes(data.state.activeKey) ? data.state.activeKey : itemKeys[0]
    if (!activeKey) return
    onEvent({ type: 'activate', key: activeKey })
    closeAndFocusTrigger()
  }
  return { closeAndFocusTrigger, activateActiveItem }
}
