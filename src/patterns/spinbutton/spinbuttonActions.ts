import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternValueStepDirection } from '../../schema'
import type { SpinbuttonData } from './spinbuttonRenderItem'

export interface ReactSpinbuttonActions {
  focus(key: Key): void
  step(key: Key, direction: PatternValueStepDirection): void
}

export function createSpinbuttonActions(runtime: PatternRuntime<SpinbuttonData>): ReactSpinbuttonActions {
  return {
    focus: (key) => runtime.emit({ type: 'focus', key }),
    step: (key, direction) => {
      runtime.emit({ type: 'focus', key })
      runtime.emit({ type: 'valueStep', key, direction })
    },
  }
}
