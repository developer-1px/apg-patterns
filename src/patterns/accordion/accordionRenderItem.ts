import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { ReactAccordionRenderItem } from '../../adapters/reactTypes'

export function createAccordionRenderItem(runtime: PatternRuntime, key: Key): ReactAccordionRenderItem {
  const panelKey = runtime.data.relations?.controlsByKey?.[key]?.[0] ?? null
  const state = runtime.getItemState(key, 'header')
  return {
    kind: 'section',
    key,
    label: getLabel(runtime.data, key),
    textValue: getTextValue(runtime.data, key),
    panelKey,
    state: {
      active: Boolean(state.active),
      expanded: Boolean(state.expanded),
      disabled: runtime.data.state?.disabledKeys?.includes(key) ?? false,
    },
    headerProps: reactProps({
      type: 'button',
      ...toReactProps(runtime.getItemProps('header', key)),
    }),
    panelProps: panelKey ? toReactProps(runtime.getItemProps('panel', panelKey)) : null,
  }
}

function getLabel(data: PatternData, key: Key): string {
  return data.items[key]?.label ?? key
}

function getTextValue(data: PatternData, key: Key): string {
  return data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key
}

export function toReactProps(props: Record<string, unknown>): ReactPatternProps {
  return reactProps(props)
}
