import type { HTMLAttributes } from 'react'
import type { TabsRuntime } from './runtime'

export type ReactTabsProps = HTMLAttributes<HTMLElement>

export interface ReactTabsRuntime extends Omit<TabsRuntime, 'getTablistProps' | 'getTabProps' | 'getTabPanelProps'> {
  getTablistProps(): ReactTabsProps
  getTabProps(key: string): ReactTabsProps
  getTabPanelProps(key: string): ReactTabsProps
}
