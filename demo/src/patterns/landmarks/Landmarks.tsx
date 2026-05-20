import { useLandmarksPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import type { LandmarkDataItem } from './landmarksData'

export function Landmarks({
  data,
  onEvent = () => undefined,
  options,
}: {
  data: PatternData<LandmarkDataItem>
  onEvent?: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const landmarks = useLandmarksPattern(data, onEvent, options)
  return (
    <div {...landmarks.rootProps} className="grid max-w-2xl gap-2 text-sm text-zinc-800 dark:text-zinc-200">
      {landmarks.items.map((item) => (
        <LandmarkBox key={item.key} kind={item.kind} props={item.landmarkProps}>
          {data.items[item.key]?.content ?? item.label}
        </LandmarkBox>
      ))}
    </div>
  )
}

function LandmarkBox({
  kind,
  props,
  children,
}: {
  kind: ReturnType<typeof useLandmarksPattern>['items'][number]['kind']
  props: ReturnType<typeof useLandmarksPattern>['items'][number]['landmarkProps']
  children: string
}) {
  const className = 'border border-zinc-200 px-3 py-2 dark:border-white/10'

  if (kind === 'banner') return <header {...props} className={className}>{children}</header>
  if (kind === 'contentinfo') return <footer {...props} className={className}>{children}</footer>
  if (kind === 'main') return <main {...props} className={className}>{children}</main>
  if (kind === 'navigation') return <nav {...props} className={className}>{children}</nav>
  if (kind === 'complementary') return <aside {...props} className={className}>{children}</aside>
  if (kind === 'form') return <form {...props} className={className}>{children}</form>
  if (kind === 'region') return <section {...props} className={className}>{children}</section>
  return <div {...props} className={className}>{children}</div>
}
