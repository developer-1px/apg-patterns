import type { LandmarkRegion, LandmarkRegionRole } from './landmarksData'

export function Landmarks({ regions }: { regions: readonly LandmarkRegion[] }) {
  return (
    <div className="grid max-w-2xl gap-2 text-sm text-zinc-800 dark:text-zinc-200">
      {regions.map((region) => (
        <LandmarkBox key={region.key} region={region} />
      ))}
    </div>
  )
}

function LandmarkBox({ region }: { region: LandmarkRegion }) {
  const props = landmarkProps(region.role, region.label)
  const className = 'rounded-lg border border-zinc-200 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]'

  if (region.role === 'banner') return <header {...props} className={className}>{region.content}</header>
  if (region.role === 'contentinfo') return <footer {...props} className={className}>{region.content}</footer>
  if (region.role === 'main') return <main {...props} className={className}>{region.content}</main>
  if (region.role === 'navigation') return <nav {...props} className={className}>{region.content}</nav>
  if (region.role === 'complementary') return <aside {...props} className={className}>{region.content}</aside>
  if (region.role === 'search') return <div {...props} role="search" className={className}>{region.content}</div>
  if (region.role === 'form') return <form {...props} className={className}>{region.content}</form>
  return <section {...props} className={className}>{region.content}</section>
}

function landmarkProps(role: LandmarkRegionRole, label: string) {
  if (role === 'banner' || role === 'contentinfo' || role === 'main') return {}
  return { 'aria-label': label }
}
