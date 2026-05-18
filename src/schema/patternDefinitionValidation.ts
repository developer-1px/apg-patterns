import type { z } from 'zod'

export function validatePatternDefinition(
  value: {
    rootRole: string
    parts: Record<string, { role: string }>
    react?: {
      root: { part: string }
      renderItems?: {
        variants?: readonly {
          fields: Record<string, { kind: string; part?: string }>
          props: Record<string, { part: string }>
        }[]
      }
    }
  },
  ctx: z.RefinementCtx,
): void {
  const rootParts = Object.entries(value.parts).filter(([, part]) => part.role === value.rootRole)
  if (rootParts.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['parts'],
      message: `no part with role="${value.rootRole}" — definition must contain exactly one root part whose role matches rootRole.`,
    })
  } else if (rootParts.length > 1) {
    ctx.addIssue({
      code: 'custom',
      path: ['parts'],
      message: `multiple parts (${rootParts.map(([n]) => `"${n}"`).join(', ')}) share rootRole="${value.rootRole}" — exactly one allowed.`,
    })
  }
  validateReactFacadeParts(value, ctx)
}

function validateReactFacadeParts(
  value: {
    parts: Record<string, unknown>
    react?: {
      root: { part: string }
      renderItems?: {
        variants?: readonly {
          fields: Record<string, { kind: string; part?: string }>
          props: Record<string, { part: string }>
        }[]
      }
    }
  },
  ctx: z.RefinementCtx,
): void {
  if (!value.react) return
  const hasPart = (part: string) => Object.prototype.hasOwnProperty.call(value.parts, part)
  if (!hasPart(value.react.root.part)) {
    ctx.addIssue({ code: 'custom', path: ['react', 'root', 'part'], message: `unknown react root part "${value.react.root.part}".` })
  }
  for (const [variantIndex, variant] of (value.react.renderItems?.variants ?? []).entries()) {
    for (const [field, source] of Object.entries(variant.fields)) {
      if (source.kind === 'partState' && source.part && !hasPart(source.part)) {
        ctx.addIssue({ code: 'custom', path: ['react', 'renderItems', 'variants', variantIndex, 'fields', field, 'part'], message: `unknown partState part "${source.part}".` })
      }
    }
    for (const [propName, prop] of Object.entries(variant.props)) {
      if (!hasPart(prop.part)) {
        ctx.addIssue({ code: 'custom', path: ['react', 'renderItems', 'variants', variantIndex, 'props', propName, 'part'], message: `unknown react prop part "${prop.part}".` })
      }
    }
  }
}
