import {
  Button,
  buttonDefinition,
  createPatternRuntime,
  type KeyInput,
  type PatternData,
  type PatternEvent,
} from '@interactive-os/apg-patterns'
import { buttonDefinition as coreButtonDefinition } from '@interactive-os/apg-patterns/core'
import { Button as ReactButton } from '@interactive-os/apg-patterns/react'

const data: PatternData = {
  items: { primary: { label: 'Primary' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}

const events: PatternEvent[] = []
const runtime = createPatternRuntime({
  definition: buttonDefinition,
  data,
  onEvent: (event) => events.push(event),
})

const keyInput: KeyInput = {
  key: 'Enter',
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
}

runtime.resolveKeyboardBinding(keyInput, 'primary')

const Component: typeof Button = Button
const SubpathComponent: typeof ReactButton = ReactButton
const CoreDefinition: typeof buttonDefinition = coreButtonDefinition
void Component
void SubpathComponent
void CoreDefinition
void runtime
