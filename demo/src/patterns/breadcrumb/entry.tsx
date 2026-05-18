import { Breadcrumb } from './Breadcrumb'
import { initialBreadcrumbData } from './breadcrumbData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const breadcrumbDemoDefinition = {
  key: 'breadcrumb',
  label: 'Breadcrumb',
  keyboardShortcuts: ['Tab', 'Enter'],
  sources: {
    main: 'Breadcrumb.tsx',
    entry: 'breadcrumb/entry.tsx',
    hooks: ['breadcrumb/useBreadcrumbPattern.ts'],
    data: ['breadcrumbData.ts'],
    definition: 'breadcrumb/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Breadcrumb',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: breadcrumbDemoDefinition,
  initialData: initialBreadcrumbData,
  reduce: (data) => data,
  componentName: 'Breadcrumb',
  component: Breadcrumb,
})
