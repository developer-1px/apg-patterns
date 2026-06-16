import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const packageRoot = new URL('../', import.meta.url)
const apiReference = readFileSync(new URL('API.md', packageRoot), 'utf8')
const failures = []

const runtimeExports = await runtimeExportNames('dist/runtime.js')
const apgExports = await runtimeExportNames('dist/apg.js')
const definitionExports = await runtimeExportNames('dist/definition.js')
const reactExports = await runtimeExportNames('dist/react.js')

const runtimeDeclarationExports = declarationExports('dist/runtime.d.ts')
const apgDeclarationExports = declarationExports('dist/apg.d.ts')
const reactDeclarationExports = declarationExports('dist/react.d.ts')

const runtimeTypeExports = runtimeDeclarationExports.filter((name) => !runtimeExports.includes(name))
const apgTypeExports = apgDeclarationExports.filter((name) => !apgExports.includes(name))
const reactTypeExports = reactDeclarationExports.filter((name) => !reactExports.includes(name))

assertExportBlock('Runtime Exports', runtimeExports)
assertExportBlock('Runtime Type Exports', runtimeTypeExports)
assertExportBlock('APG Bridge Exports', apgExports)
assertExportBlock('APG Bridge Type Exports', apgTypeExports)
assertExportBlock('Definition Exports', definitionExports)
assertExportBlock('React Exports', reactExports)
assertExportBlock('React Type Exports', reactTypeExports)

if (failures.length > 0) {
  console.error(`interaction API reference check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`interaction API reference covers ${runtimeExports.length} runtime values, ${runtimeTypeExports.length} runtime types, ${apgExports.length} APG bridge values, ${apgTypeExports.length} APG bridge types, ${definitionExports.length} definition values, ${reactExports.length} React values, and ${reactTypeExports.length} React types.`)

function declarationExports(packagePath) {
  const filePath = fileURLToPath(new URL(packagePath, packageRoot))
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    skipLibCheck: true,
  })
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
  if (diagnostics.length > 0) {
    failures.push(`${packagePath} has declaration diagnostics:\n${ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: (filename) => filename,
      getCurrentDirectory: () => fileURLToPath(packageRoot),
      getNewLine: () => '\n',
    })}`)
  }

  const sourceFile = program.getSourceFile(filePath)
  const symbol = sourceFile ? program.getTypeChecker().getSymbolAtLocation(sourceFile) : null
  if (!symbol) {
    failures.push(`${packagePath} does not have a declaration module symbol`)
    return []
  }

  return program.getTypeChecker()
    .getExportsOfModule(symbol)
    .map((exported) => exported.getName())
    .sort((left, right) => left.localeCompare(right))
}

async function runtimeExportNames(packagePath) {
  return Object.keys(await import(new URL(packagePath, packageRoot)))
    .sort((left, right) => left.localeCompare(right))
}

function assertExportBlock(heading, expected) {
  const actual = readExportBlock(heading)
  if (actual === null) return

  const actualSource = exportBlockSource(actual)
  const expectedSource = exportBlockSource(expected)
  if (actualSource !== expectedSource) {
    const missing = expected.filter((name) => !actual.includes(name))
    const extra = actual.filter((name) => !expected.includes(name))
    failures.push(`${heading} is out of date${missing.length ? `; missing: ${missing.join(', ')}` : ''}${extra.length ? `; extra: ${extra.join(', ')}` : ''}`)
  }
}

function readExportBlock(heading) {
  const headingMarker = `## ${heading}`
  const headingIndex = apiReference.indexOf(headingMarker)
  if (headingIndex === -1) {
    failures.push(`API.md is missing heading "${headingMarker}"`)
    return null
  }

  const fenceStart = apiReference.indexOf('```txt', headingIndex)
  if (fenceStart === -1) {
    failures.push(`API.md is missing txt export block for "${heading}"`)
    return null
  }

  const contentStart = apiReference.indexOf('\n', fenceStart)
  const fenceEnd = apiReference.indexOf('```', contentStart)
  if (contentStart === -1 || fenceEnd === -1) {
    failures.push(`API.md has an unterminated txt export block for "${heading}"`)
    return null
  }

  return apiReference
    .slice(contentStart + 1, fenceEnd)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
}

function exportBlockSource(exports) {
  return exports.join('\n')
}
