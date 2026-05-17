import { Breadcrumb } from './Breadcrumb'
import { initialBreadcrumbData } from './breadcrumbData'
import { type PatternEntry } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/data'

export const entry: PatternEntry = {
  key: 'breadcrumb',
  label: 'Breadcrumb',
  order: 14,
  useDemoPattern: (onEvent) => {
    return {
      key: 'breadcrumb',
      label: 'Breadcrumb',
      keyboardShortcuts: ['Tab', 'Enter'],
      sourceNames: ['Breadcrumb.tsx', 'breadcrumbData.ts', 'breadcrumb/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(initialBreadcrumbData),
      preview: <Breadcrumb data={initialBreadcrumbData} onEvent={onEvent} />,
      reset: () => {},
    }
  },
}
