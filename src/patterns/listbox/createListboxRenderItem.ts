import type { Key, PatternData } from '../../schema'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { ReactListboxRenderItem, ReactPatternProps, ReactRenderItemState } from '../../adapters/reactTypes'
import { handleListboxMultiClick } from './handleListboxMultiSelect'

export function createListboxRenderItem(runtime: PatternRuntime, key: Key): ReactListboxRenderItem {
  const optionProps = toReactProps(runtime.getPartProps('option', key))
  return {
    kind: 'option',
    key,
    label: getLabel(runtime.data, key),
    textValue: getTextValue(runtime.data, key),
    state: getItemState(runtime, key, 'option'),
    optionProps: withListboxOptionClick(runtime, key, optionProps),
  }
}

function withListboxOptionClick(runtime: PatternRuntime, key: Key, props: ReactPatternProps): ReactPatternProps {
  const onClick = props.onClick
  return {
    ...props,
    onClick: (event) => {
      if (handleListboxMultiClick(runtime, key, event)) return
      onClick?.(event)
    },
  }
}

function getLabel(data: PatternData, key: Key): string {
  return data.items[key]?.label ?? key
}

function getTextValue(data: PatternData, key: Key): string {
  return data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key
}

function getItemState(runtime: PatternRuntime, key: Key, part: string): ReactRenderItemState {
  const state = runtime.getItemState(key, part)
  return {
    active: Boolean(state.active),
    selected: Boolean(state.selected),
    disabled: Boolean(state.disabled),
  }
}

function toReactProps(props: Record<string, unknown>): ReactPatternProps {
  return props as ReactPatternProps
}
