export function sourceIdentityNeedles(sourceName, patternKey) {
  const entrySource = sourceName.match(/^([^/]+)\/entry\.tsx$/)
  if (entrySource) {
    const [, sourcePatternKey] = entrySource
    return sourcePatternKey === (patternKey === 'menuAndMenubar' ? 'menu' : patternKey)
      ? ['export const entry']
      : [patternKey]
  }

  if (sourceName.endsWith('.tsx')) {
    const componentName = sourceName.replace(/\.tsx$/, '')
    return [`export function ${componentName}`]
  }
  if (sourceName.endsWith('Data.ts')) {
    return []
  }

  if (sourceName === 'kernel/patternRuntime.ts') return ['createPatternRuntime']
  if (sourceName === 'kernel/rootKeyboardHandler.ts') return ['createRootKeyboardHandler']
  if (sourceName === 'kernel/runtimePartProps.ts') return ['resolveRuntimePartProps']
  if (sourceName === 'kernel/slotProps.ts') return ['resolveAriaProjections', 'resolveFocusProjection']
  if (sourceName === 'kernel/patternReducer.ts') return ['reducePatternData']
  if (sourceName === 'kernel/patternKernel.ts') return ['defineAriaSource']
  if (sourceName === 'kernel/domEventRegistry.ts') return ['defineDomEvent']
  if (sourceName === 'kernel/runtimeItemState.ts') return ['resolveRuntimeItemState']
  if (sourceName === 'kernel/patternTransitions.ts') return ['reduceDeclarativeTransitions']
  if (sourceName === 'kernel/transitionValue.ts') return ['resolveTransitionValue']
  if (sourceName === 'kernel/patternEventTemplate.ts') return ['resolveEventTemplate']
  if (sourceName === 'kernel/kernelNavigationTargets.ts') return ['defineNavigationTarget']
  if (sourceName === 'kernel/kernelPredicates.ts') return ['definePredicate']
  if (sourceName === 'kernel/kernelStateProjections.ts') return ['defineStateProjection']
  if (sourceName === 'schema/index.ts') return ["export * from './patternDefinition'"]
  if (sourceName === 'schema/eventTemplate.ts') return ['EventTemplateSchema']
  if (sourceName === 'schema/patternDefinitionValidation.ts') return ['validatePatternDefinition']

  const patternSource = sourceName.match(/^([^/]+)\/(.+)\.ts$/)
  if (patternSource) {
    const [, sourcePatternKey, fileName] = patternSource
    if (fileName === 'predicates') return ['definePredicate']
    if (fileName === 'definition') {
      if (sourcePatternKey === 'menu') return ['menuButtonDefinition', 'menubarDefinition']
      return [`apgPattern: '${sourcePatternKey}'`]
    }
    if (fileName.endsWith('Sources')) return ['defineAriaSource']
    if (fileName.endsWith('Navigation')) return ['defineNavigationTarget']
    if (fileName.endsWith('Actions')) return [`create${pascalCase(fileName.replace(/Actions$/, ''))}Actions`]
    if (fileName.endsWith('RuntimeState')) return [`get${pascalCase(fileName.replace(/RuntimeState$/, ''))}RuntimeState`]
    if (fileName === 'menuButtonProps') return ['createMenuButtonMenuProps', 'createMenuButtonTriggerProps']
    if (fileName.startsWith('create')) return [fileName]
    if (fileName.startsWith('adapt')) return [fileName]
    if (sourcePatternKey === 'alert' && fileName === 'alertProps') return ['createAlertRootProps']
    if (sourcePatternKey === 'alertdialog' && fileName === 'alertDialogProps') return ['createAlertDialogDialogProps', 'createAlertDialogActionProps']
    if (fileName.endsWith('Props')) return [`create${pascalCase(fileName)}`]
    if (fileName.endsWith('RenderItem')) return [`create${pascalCase(fileName)}`]
    if (fileName === 'windowSplitterState') return ['getWindowSplitterState']
    if (/^use[A-Z].*Pattern$/.test(fileName)) return [`export function ${fileName}`]
    if (fileName === 'runtime') return []
    if (fileName === 'navigation') return []
    return ['export ']
  }

  if (sourceName === 'treeContract.ts') return ['initialData']
  if (sourceName === 'treeVariants.ts') return ['treeVariants']

  return [patternKey]
}

function pascalCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
