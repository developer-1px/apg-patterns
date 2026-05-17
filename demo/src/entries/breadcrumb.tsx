import { Breadcrumb } from '../Breadcrumb'
import { initialBreadcrumbData } from '../breadcrumbData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'breadcrumb',
  label: 'Breadcrumb',
  order: 14,
  useDemoPattern: (_onEvent) => {
    return {
      key: 'breadcrumb',
      label: 'Breadcrumb',
      keyboardShortcuts: ['Tab', 'Enter'],
      sourceNames: ['Breadcrumb.tsx', 'breadcrumbData.ts', 'breadcrumb/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(initialBreadcrumbData),
      preview: <Breadcrumb />,
      reset: () => {},
    }
  },
}
