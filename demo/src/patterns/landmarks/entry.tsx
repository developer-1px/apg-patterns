import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import { Landmarks } from './Landmarks'
import {
  buildLandmarkData,
  initialLandmarkVariant,
  landmarkVariantItems,
  landmarkVariants,
  type LandmarkVariantKey,
} from './landmarksData'

const landmarksDemoDefinition = {
  key: 'landmarks',
  label: 'Landmarks',
  keyboardShortcuts: [],
  sources: {
    main: 'Landmarks.tsx',
    entry: 'landmarks/entry.tsx',
    data: ['landmarksData.ts'],
    hooks: ['landmarks/useLandmarksPattern.ts'],
    definition: 'landmarks/definition.ts',
  },
  controls: {
    kind: 'listbox',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'landmark examples',
    idPrefix: 'landmarks-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Landmarks',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<LandmarkVariantKey>({
  definition: landmarksDemoDefinition,
  initialVariant: initialLandmarkVariant,
  initialData: buildLandmarkData(initialLandmarkVariant, landmarkVariants[initialLandmarkVariant]),
  dataByVariant: (variant) => buildLandmarkData(variant, landmarkVariants[variant]),
  reduce: (_variant, data) => data,
  variantItems: landmarkVariantItems,
  componentName: 'Landmarks',
  component: Landmarks,
})
