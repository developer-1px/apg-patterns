import { PatternDefinitionSchema } from '../../schema'

// APG Breadcrumb pattern
// https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
//
// Structure: <nav aria-label="Breadcrumb"><ol><li><a>…</a></li>…<li><a aria-current="page">…</a></li></ol></nav>
// Static pattern: no keyboard model, no interactive state. The single ARIA
// projection is aria-current="page" on the final crumb's link.
export const BreadcrumbDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'breadcrumb') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "breadcrumb"' })
  if (value.rootRole !== 'navigation') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "navigation"' })
  if (!value.parts.root) ctx.addIssue({ code: 'custom', path: ['parts', 'root'], message: 'breadcrumb requires parts.root' })
  if (!value.parts.crumb) ctx.addIssue({ code: 'custom', path: ['parts', 'crumb'], message: 'breadcrumb requires parts.crumb' })
})

export const breadcrumbDefinition = BreadcrumbDefinitionSchema.parse({
  apgPattern: 'breadcrumb',
  rootRole: 'navigation',
  containedRoles: ['list', 'listitem', 'link'],
  parts: {
    root: {
      role: 'navigation',
      aria: [
        { attribute: 'aria-label', from: 'options.label' },
      ],
    },
    list: {
      role: 'list',
    },
    crumb: {
      role: 'link',
      aria: [
        { attribute: 'aria-current', from: 'state.currentKey' },
        { attribute: 'href', from: 'items.href' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
})
