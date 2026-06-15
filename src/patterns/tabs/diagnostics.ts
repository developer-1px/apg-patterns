import type { Key, PatternData } from '../../schema'

export type TabsDataDiagnosticCode =
  | 'tabs.tab.missingControls'
  | 'tabs.tabpanel.missingOwner'
  | 'tabs.tabpanel.ownerMismatch'

export interface TabsDataDiagnostic {
  code: TabsDataDiagnosticCode
  severity: 'warning'
  message: string
  path: readonly (string | number)[]
  tabKey?: Key
  panelKey?: Key
  ownerKey?: Key
}

export function getTabsDataDiagnostics(data: PatternData): readonly TabsDataDiagnostic[] {
  const diagnostics: TabsDataDiagnostic[] = []
  const rootKeys = data.relations?.rootKeys ?? []
  const controlsByKey = data.relations?.controlsByKey ?? {}
  const ownerByKey = data.relations?.ownerByKey ?? {}

  for (const tabKey of rootKeys) {
    const controlledKeys = controlsByKey[tabKey] ?? []
    if (controlledKeys.length === 0) {
      diagnostics.push({
        code: 'tabs.tab.missingControls',
        severity: 'warning',
        message: `tab "${tabKey}" should control a tabpanel via relations.controlsByKey`,
        path: ['relations', 'controlsByKey', tabKey],
        tabKey,
      })
      continue
    }

    for (const panelKey of controlledKeys) {
      const ownerKey = ownerByKey[panelKey]
      if (!ownerKey) {
        diagnostics.push({
          code: 'tabs.tabpanel.missingOwner',
          severity: 'warning',
          message: `tabpanel "${panelKey}" should point back to tab "${tabKey}" via relations.ownerByKey`,
          path: ['relations', 'ownerByKey', panelKey],
          tabKey,
          panelKey,
        })
        continue
      }

      if (ownerKey !== tabKey) {
        diagnostics.push({
          code: 'tabs.tabpanel.ownerMismatch',
          severity: 'warning',
          message: `tabpanel "${panelKey}" owner "${ownerKey}" should match tab "${tabKey}"`,
          path: ['relations', 'ownerByKey', panelKey],
          tabKey,
          panelKey,
          ownerKey,
        })
      }
    }
  }

  return diagnostics
}
