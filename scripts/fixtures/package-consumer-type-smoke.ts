import {
  Button,
  buttonDefinition,
  createPatternRuntime,
  type KeyInput,
  type PatternData,
  type PatternEvent,
} from '@interactive-os/apg-patterns'

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
void Component
void runtime
