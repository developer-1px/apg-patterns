import type { Key, PatternData } from '../../schema'

export type WindowSplitterDataDiagnosticCode = 'windowsplitter.separator.missingControls'

export interface WindowSplitterDataDiagnostic {
  code: WindowSplitterDataDiagnosticCode
  severity: 'warning'
  message: string
  path: readonly (string | number)[]
  key: Key
}

export function getWindowSplitterDataDiagnostics(data: PatternData): readonly WindowSplitterDataDiagnostic[] {
  const diagnostics: WindowSplitterDataDiagnostic[] = []
  const rootKeys = data.relations?.rootKeys ?? []
  const controlsByKey = data.relations?.controlsByKey ?? {}

  for (const key of rootKeys) {
    if (controlsByKey[key]?.length) continue
    diagnostics.push({
      code: 'windowsplitter.separator.missingControls',
      severity: 'warning',
      message: `separator "${key}" should control a primary pane via relations.controlsByKey`,
      path: ['relations', 'controlsByKey', key],
      key,
    })
  }

  return diagnostics
}
