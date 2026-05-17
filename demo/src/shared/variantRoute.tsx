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
