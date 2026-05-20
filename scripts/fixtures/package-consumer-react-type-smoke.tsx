import {
  buttonDefinition,
  createPatternRuntime,
  type KeyInput,
  type PatternData,
  type PatternEvent,
} from '@interactive-os/apg-patterns'
import { buttonDefinition as coreButtonDefinition } from '@interactive-os/apg-patterns/core'
import { Button, useButtonPattern, type ButtonProps } from '@interactive-os/apg-patterns/react'
import type { ReactElement } from 'react'

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

function ButtonConsumer(props: Pick<ButtonProps, 'data' | 'onEvent'>): ReactElement {
  const button = useButtonPattern(props.data, props.onEvent)
  void button.rootProps
  return <Button data={props.data} onEvent={props.onEvent} className="primary">Save</Button>
}

const Component: typeof Button = Button
const SubpathElement: ReactElement = <ButtonConsumer data={data} onEvent={(event) => events.push(event)} />
const CoreDefinition: typeof buttonDefinition = coreButtonDefinition
void Component
void SubpathElement
void CoreDefinition
void runtime
