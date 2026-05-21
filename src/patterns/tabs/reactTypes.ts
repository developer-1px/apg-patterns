import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { TabsRuntime } from './runtime'

export interface ReactTabsRuntime extends Omit<TabsRuntime, 'getTablistProps' | 'getTabProps' | 'getTabPanelProps'> {
  getTablistProps(): ReactPatternProps
  getTabProps(key: string): ReactPatternProps
  getTabPanelProps(key: string): ReactPatternProps
}
