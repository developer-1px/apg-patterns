import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { handlePatternTrapFocus, usePatternEffects } from '../../adapters/reactPatternEffects'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { dialogDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'

registerKernelBuiltins()

export interface ReactDialogRuntime {
  open: boolean
  triggerProps: ReactPatternProps
  overlayProps: ReactPatternProps
  dialogProps: ReactPatternProps
  titleProps: ReactPatternProps
  descriptionProps: ReactPatternProps
  cancelProps: ReactPatternProps
  submitProps: ReactPatternProps
  labelOf(key: Key): string
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useDialogPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactDialogRuntime {
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'dialog-')
  const runtime = createPatternRuntime({ definition: dialogDefinition, data, options: runtimeOptions, onEvent, keyToElementId })
  const keys = getDialogRuntimeKeys(data)

  usePatternEffects({ definition: dialogDefinition, data: runtime.data, keyToElementId })

  return {
    open: keys.triggerKey ? data.state?.expandedKeys?.includes(keys.triggerKey) ?? false : false,
    get triggerProps() {
      return keys.triggerKey ? reactProps(runtime.getPartProps('trigger', keys.triggerKey)) : {}
    },
    get overlayProps() {
      return reactProps(runtime.getPartProps('overlay'))
    },
    get dialogProps() {
      return keys.dialogKey ? createDialogProps({ runtime, data, keyToElementId, dialogKey: keys.dialogKey }) : {}
    },
    get titleProps() {
      return keys.titleKey ? reactProps(runtime.getPartProps('title', keys.titleKey)) : {}
    },
    get descriptionProps() {
      return keys.descriptionKey ? reactProps(runtime.getPartProps('description', keys.descriptionKey)) : {}
    },
    get cancelProps() {
      return reactProps(runtime.getPartProps('cancel', 'cancel'))
    },
    get submitProps() {
      return reactProps(runtime.getPartProps('submit', 'submit'))
    },
    labelOf: (key) => data.items[key]?.label ?? key,
    get ids() {
      return { forKey: keyToElementId }
    },
    keyToElementId,
  }
}

function getDialogRuntimeKeys(data: PatternData): {
  triggerKey: Key | null
  dialogKey: Key | null
  titleKey: Key | null
  descriptionKey: Key | null
} {
  const triggerKey = data.relations?.rootKeys?.[0] ?? (data.items.trigger ? 'trigger' : null)
  const dialogKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? (data.items.dialog ? 'dialog' : null) : data.items.dialog ? 'dialog' : null
  const titleKey = dialogKey ? data.relations?.ownerByKey?.[dialogKey] ?? (data.items.title ? 'title' : null) : data.items.title ? 'title' : null
  const descriptionKey = dialogKey ? data.relations?.controlsByKey?.[dialogKey]?.[0] ?? (data.items.description ? 'description' : null) : data.items.description ? 'description' : null

  return { triggerKey, dialogKey, titleKey, descriptionKey }
}

function createDialogProps({
  runtime,
  data,
  keyToElementId,
  dialogKey,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternData
  keyToElementId: (key: Key) => string
  dialogKey: Key
}): ReactPatternProps {
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return reactProps({
    ...runtime.getPartProps('dialog', dialogKey),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      rootKeyDown(reactKeyInput(event))
      handlePatternTrapFocus({ event, definition: dialogDefinition, data, keyToElementId })
    },
    tabIndex: -1,
  })
}
