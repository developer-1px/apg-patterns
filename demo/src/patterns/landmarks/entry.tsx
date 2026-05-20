import type { PatternEvent } from '../../../../src/react'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import { renderDataInspect } from '../../shared/inspect'
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
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: landmarksDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<LandmarkVariantKey>(
      initialLandmarkVariant,
      buildLandmarkData(landmarkVariants[initialLandmarkVariant]),
      (variant) => buildLandmarkData(landmarkVariants[variant]),
      (_variant, data) => data,
    )

    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: {
            variant: host.variant,
            data: host.data,
          },
          model: { variantItems: landmarkVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: { Landmarks },
      },
    }
  },
})
