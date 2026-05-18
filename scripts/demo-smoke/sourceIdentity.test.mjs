import { describe, expect, it } from 'vitest'
import { sourceIdentityNeedles } from './sourceIdentity.mjs'

describe('sourceIdentityNeedles', () => {
  it.each([
    ['kernel/patternRuntime.ts', ['createPatternRuntime']],
    ['kernel/patternReducer.ts', ['reducePatternData']],
    ['kernel/domEventRegistry.ts', ['defineDomEvent']],
    ['kernel/runtimeItemState.ts', ['resolveRuntimeItemState']],
    ['kernel/patternTransitions.ts', ['reduceDeclarativeTransitions']],
    ['kernel/transitionValue.ts', ['resolveTransitionValue']],
    ['kernel/patternEventTemplate.ts', ['resolveEventTemplate']],
    ['schema/eventTemplate.ts', ['EventTemplateSchema']],
  ])('uses specific identity needles for shared source %s', (sourceName, needles) => {
    expect(sourceIdentityNeedles(sourceName, 'accordion')).toEqual(needles)
  })

  it('keeps pattern implementation helpers on the generic export fallback', () => {
    expect(sourceIdentityNeedles('accordion/parts.ts', 'accordion')).toEqual(['export '])
  })
})
