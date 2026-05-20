import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { landmarksDefinition } from './definition'

export type LandmarkKind = 'banner' | 'complementary' | 'contentinfo' | 'form' | 'main' | 'navigation' | 'region' | 'search'

interface LandmarkItem extends PatternItem {
  kind?: string
}

export interface ReactLandmarkItem {
  key: Key
  kind: LandmarkKind
  label: string
  landmarkProps: ReactPatternProps
}

export interface ReactLandmarksRuntime {
  rootProps: ReactPatternProps
  items: readonly ReactLandmarkItem[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useLandmarksPattern(data: PatternData<LandmarkItem>, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactLandmarksRuntime {
  const runtimeOptions: PatternOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'landmark-')
  const runtime = createPatternRuntime({
    definition: landmarksDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })

  return {
    get rootProps() {
      return reactProps(runtime.getPartProps('root'))
    },
    get items() {
      return (data.relations?.rootKeys ?? Object.keys(data.items)).map((key) => {
        const item = data.items[key]
        const kind = toLandmarkKind(item?.kind)
        return {
          key,
          kind,
          label: item?.label ?? key,
          landmarkProps: reactProps(runtime.getPartProps(kind, key)),
        }
      })
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function toLandmarkKind(kind: unknown): LandmarkKind {
  if (
    kind === 'banner' ||
    kind === 'complementary' ||
    kind === 'contentinfo' ||
    kind === 'form' ||
    kind === 'main' ||
    kind === 'navigation' ||
    kind === 'region' ||
    kind === 'search'
  ) {
    return kind
  }
  return 'region'
}
