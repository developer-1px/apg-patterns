import { createContext, type ReactNode, useContext } from 'react'

const VariantRoutePatternContext = createContext<string | null>(null)

export function VariantRouteProvider({ patternKey, children }: { patternKey: string; children: ReactNode }) {
  return (
    <VariantRoutePatternContext.Provider value={patternKey}>
      {children}
    </VariantRoutePatternContext.Provider>
  )
}

export function useVariantRoutePattern() {
  return useContext(VariantRoutePatternContext)
}

export function readVariantRoute(routePattern: string | null) {
  if (typeof window === 'undefined') return null
  if (!routePattern) return null
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  if (params.get('pattern') !== routePattern) return null
  return params.get('variant')
}

export function writeVariantRoute(routePattern: string | null, variant: string) {
  if (typeof window === 'undefined') return
  if (!routePattern) return
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  if (params.get('pattern') !== routePattern) return
  params.set('variant', variant)
  const nextHash = `#${params.toString()}`
  if (window.location.hash !== nextHash) window.history.replaceState(null, '', nextHash)
}
