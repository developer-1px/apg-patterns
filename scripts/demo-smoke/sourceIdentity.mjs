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

  const patternSource = sourceName.match(/^([^/]+)\/(.+)\.ts$/)
  if (patternSource) {
    const [, sourcePatternKey, fileName] = patternSource
    if (fileName === 'definition') {
      if (sourcePatternKey === 'menu') return ["apgPattern: 'menubar'"]
      return [`apgPattern: '${sourcePatternKey}'`]
    }
    if (/^use[A-Z].*Pattern$/.test(fileName)) return [`export function ${fileName}`]
    if (fileName === 'runtime') return []
    if (fileName === 'navigation') return []
  }

  if (sourceName === 'kernel/patternRuntime.ts') return ['createPatternRuntime']
  if (sourceName === 'kernel/patternReducer.ts') return ['reducePatternData']
  if (sourceName === 'kernel/patternKernel.ts') return ['defineAriaSource']
  if (sourceName === 'schema/index.ts') return ["export * from './patternDefinition'"]
  if (sourceName === 'treeContract.ts') return ['initialData']
  if (sourceName === 'treeVariants.ts') return ['treeVariants']

  return [patternKey]
}
