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
    ['kernel/slotProps.ts', ['resolveAriaProjections', 'resolveFocusProjection']],
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
    ['treegrid/predicates.ts', ['definePredicate']],
    ['button/buttonRootProps.ts', ['createButtonRootProps']],
    ['tooltip/tooltipTriggerProps.ts', ['createTooltipTriggerProps']],
    ['windowsplitter/windowSplitterSeparatorProps.ts', ['createWindowSplitterSeparatorProps']],
    ['menu/menuButtonProps.ts', ['createMenuButtonMenuProps', 'createMenuButtonTriggerProps']],
    ['alert/alertProps.ts', ['createAlertRootProps']],
    ['alertdialog/alertDialogProps.ts', ['createAlertDialogDialogProps', 'createAlertDialogActionProps']],
    ['listbox/createListboxRootProps.ts', ['createListboxRootProps']],
    ['treeview/adaptTreeviewProps.ts', ['adaptTreeviewProps']],
    ['accordion/accordionRenderItem.ts', ['createAccordionRenderItem']],
  ])('uses specific identity needles for helper source %s', (sourceName, needles) => {
    expect(sourceIdentityNeedles(sourceName, 'button')).toEqual(needles)
  })

  it('keeps pattern implementation helpers on the generic export fallback', () => {
    expect(sourceIdentityNeedles('accordion/parts.ts', 'accordion')).toEqual(['export '])
  })
})
