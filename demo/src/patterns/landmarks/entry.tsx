import { useState } from 'react'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'
import { renderDataInspect } from '../../shared/inspect'
import { Landmarks } from './Landmarks'
import {
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
    definition: 'landmarks/definition.ts',
    includeKernel: false,
  },
  controls: {
    kind: 'stack',
    gap: 'md',
    children: [
      {
        kind: 'listbox',
        value: '$state.variant',
        items: '$model.variantItems',
        label: 'landmark examples',
        idPrefix: 'landmarks-variant',
        onChange: '$actions.selectVariant',
      },
    ],
  },
  view: {
    kind: 'component',
    component: 'Landmarks',
    props: {
      regions: '$state.regions',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: landmarksDemoDefinition,
  useRuntime: () => {
    const [variant, setVariant] = useState<LandmarkVariantKey>(initialLandmarkVariant)
    const current = landmarkVariants[variant]

    return {
      inspect: renderDataInspect({
        items: Object.fromEntries(current.regions.map((region) => [region.key, { label: region.label }])),
        relations: { rootKeys: current.regions.map((region) => region.key) },
        state: { variant, rolesByKey: Object.fromEntries(current.regions.map((region) => [region.key, region.role])) },
        refs: { label: current.label },
      }),
      context: {
        values: {
          state: {
            variant,
            regions: current.regions,
          },
          model: { variantItems: landmarkVariantItems },
        },
        actions: {
          selectVariant: setVariant,
        },
        components: { Landmarks },
      },
    }
  },
})
