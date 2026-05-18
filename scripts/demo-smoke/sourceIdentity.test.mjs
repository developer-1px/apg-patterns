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
    ['kernel/rootKeyboardHandler.ts', ['createRootKeyboardHandler']],
    ['kernel/runtimePartProps.ts', ['resolveRuntimePartProps']],
    ['kernel/kernelStateProjections.ts', ['defineStateProjection']],
    ['schema/eventTemplate.ts', ['EventTemplateSchema']],
    ['schema/patternDefinitionValidation.ts', ['validatePatternDefinition']],
  ])('uses specific identity needles for shared source %s', (sourceName, needles) => {
    expect(sourceIdentityNeedles(sourceName, 'accordion')).toEqual(needles)
  })

  it.each([
    ['button/buttonActions.ts', ['createButtonActions']],
    ['link/linkActions.ts', ['createLinkActions']],
    ['windowsplitter/windowSplitterActions.ts', ['createWindowSplitterActions']],
    ['alert/alertRuntimeState.ts', ['getAlertRuntimeState']],
    ['carousel/carouselRuntimeState.ts', ['getCarouselRuntimeState']],
    ['windowsplitter/windowSplitterState.ts', ['getWindowSplitterState']],
  ])('uses specific identity needles for helper source %s', (sourceName, needles) => {
    expect(sourceIdentityNeedles(sourceName, 'button')).toEqual(needles)
  })

  it('keeps pattern implementation helpers on the generic export fallback', () => {
    expect(sourceIdentityNeedles('accordion/parts.ts', 'accordion')).toEqual(['export '])
  })
})
