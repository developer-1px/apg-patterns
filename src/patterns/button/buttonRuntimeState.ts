import type { Key, PatternData } from '../../schema'

export function getButtonRuntimeState(data: PatternData, key: Key | null): {
  activeKey: Key | null
  pressed: boolean | null
  disabled: boolean
} {
  const pressed = key ? data.state?.pressedByKey?.[key] : undefined
  return {
    activeKey: data.state?.activeKey ?? null,
    pressed: pressed === undefined ? null : Boolean(pressed),
    disabled: key ? data.state?.disabledKeys?.includes(key) ?? false : false,
  }
}
