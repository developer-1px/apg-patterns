import type { Key } from '../../schema'
import type { SpinbuttonData } from './spinbuttonRenderItem'

export interface SpinbuttonRuntimeState {
  activeKey: Key | null
  valueByKey: Readonly<Record<Key, string | number | boolean | null>>
}

export function getSpinbuttonRuntimeState(data: SpinbuttonData): SpinbuttonRuntimeState {
  return {
    activeKey: data.state?.activeKey ?? null,
    valueByKey: data.state?.valueByKey ?? {},
  }
}
