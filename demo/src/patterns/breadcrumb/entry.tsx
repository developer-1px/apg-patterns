import { Breadcrumb } from './Breadcrumb'
import { initialBreadcrumbData } from './breadcrumbData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'breadcrumb',
  label: 'Breadcrumb',
  useDemoPattern: (onEvent) => {
    return {
      key: 'breadcrumb',
      label: 'Breadcrumb',
      keyboardShortcuts: ['Tab', 'Enter'],
      sourceNames: ['Breadcrumb.tsx', 'breadcrumbData.ts', 'breadcrumb/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(initialBreadcrumbData),
      preview: <Breadcrumb data={initialBreadcrumbData} onEvent={onEvent} />,
      // stateless — no reset
    }
  },
}
