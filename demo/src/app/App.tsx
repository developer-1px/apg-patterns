import { useReducer } from 'react'
import { ActiveDemoWorkspace } from './ActiveDemoWorkspace'
import { PatternMenu } from './PatternMenu'
import { defaultAppState, readInitialAppState, reduceAppState } from './appState'
import { ds } from '../shared/designSystem'

export function App() {
  const [state, dispatch] = useReducer(reduceAppState, defaultAppState, readInitialAppState)

  return (
    <main className={`grid min-h-dvh grid-cols-1 gap-3 bg-zinc-100/90 px-3 py-3 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-4 sm:py-4 ${state.rightPanelOpen ? 'lg:grid-cols-[220px_minmax(420px,1fr)_minmax(420px,0.92fr)]' : 'lg:grid-cols-[220px_minmax(420px,1fr)]'} lg:h-dvh lg:grid-rows-[minmax(0,1fr)] lg:gap-4 lg:px-5 lg:py-5`}>
      <section className={`${ds.panel} overflow-auto`}>
        <h1 className="mb-4 truncate text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-500">patterns</h1>
        <PatternMenu value={state.patternKey} onChange={(patternKey) => dispatch({ type: 'selectPattern', patternKey })} />
      </section>

      <ActiveDemoWorkspace key={state.patternKey} state={state} dispatch={dispatch} />
    </main>
  )
}
