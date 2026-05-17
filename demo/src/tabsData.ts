import { PatternDataSchema } from '../../src'

export const initialTabsData = PatternDataSchema.parse({
  items: {
    overview: { label: 'Overview' },
    code: { label: 'Code' },
    audit: { label: 'Audit' },
    overviewPanel: { label: 'Overview panel' },
    codePanel: { label: 'Code panel' },
    auditPanel: { label: 'Audit panel' },
  },
  relations: {
    rootKeys: ['overview', 'code', 'audit'],
    controlsByKey: {
      overview: ['overviewPanel'],
      code: ['codePanel'],
      audit: ['auditPanel'],
    },
    ownerByKey: {
      overviewPanel: 'overview',
      codePanel: 'code',
      auditPanel: 'audit',
    },
  },
  state: {
    activeKey: 'overview',
    selectedKeys: ['overview'],
  },
  refs: { label: 'Sections' },
})
