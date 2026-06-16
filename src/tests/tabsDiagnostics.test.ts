import { describe, expect, it } from 'vitest'
import type { PatternData } from '../schema'
import { getTabsDataDiagnostics } from '../patterns/tabs/diagnostics'
import { createTabsRuntime } from '../patterns/tabs/runtime'

const completeTabsData: PatternData = {
  items: {
    sheetOne: { label: 'Sheet 1' },
    sheetTwo: { label: 'Sheet 2' },
    panelOne: { label: 'Panel 1' },
    panelTwo: { label: 'Panel 2' },
  },
  relations: {
    rootKeys: ['sheetOne', 'sheetTwo'],
    controlsByKey: { sheetOne: ['panelOne'], sheetTwo: ['panelTwo'] },
    ownerByKey: { panelOne: 'sheetOne', panelTwo: 'sheetTwo' },
  },
  state: { selectedKeys: ['sheetOne'] },
}

const incompleteTabsData: PatternData = {
  items: {
    sheetOne: { label: 'Sheet 1' },
    sheetTwo: { label: 'Sheet 2' },
    sheetThree: { label: 'Sheet 3' },
    panelOne: { label: 'Panel 1' },
    panelTwo: { label: 'Panel 2' },
  },
  relations: {
    rootKeys: ['sheetOne', 'sheetTwo', 'sheetThree'],
    controlsByKey: { sheetOne: ['panelOne'], sheetTwo: ['panelTwo'] },
    ownerByKey: { panelTwo: 'sheetOne' },
  },
  state: { selectedKeys: ['sheetOne'] },
}

describe('tabs data diagnostics', () => {
  it('returns no diagnostics when tab and tabpanel relations are complete', () => {
    expect(getTabsDataDiagnostics(completeTabsData)).toEqual([])
    expect(createTabsRuntime({ data: completeTabsData, onEvent: () => undefined }).diagnostics).toEqual([])
  })

  it('reports missing tab controls and panel owner mismatches through the runtime', () => {
    const diagnostics = createTabsRuntime({ data: incompleteTabsData, onEvent: () => undefined }).diagnostics

    expect(diagnostics).toEqual([
      {
        code: 'tabs.tabpanel.missingOwner',
        severity: 'warning',
        message: 'tabpanel "panelOne" should point back to tab "sheetOne" via relations.ownerByKey',
        path: ['relations', 'ownerByKey', 'panelOne'],
        tabKey: 'sheetOne',
        panelKey: 'panelOne',
      },
      {
        code: 'tabs.tabpanel.ownerMismatch',
        severity: 'warning',
        message: 'tabpanel "panelTwo" owner "sheetOne" should match tab "sheetTwo"',
        path: ['relations', 'ownerByKey', 'panelTwo'],
        tabKey: 'sheetTwo',
        panelKey: 'panelTwo',
        ownerKey: 'sheetOne',
      },
      {
        code: 'tabs.tab.missingControls',
        severity: 'warning',
        message: 'tab "sheetThree" should control a tabpanel via relations.controlsByKey',
        path: ['relations', 'controlsByKey', 'sheetThree'],
        tabKey: 'sheetThree',
      },
    ])
  })
})
