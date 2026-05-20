import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repoRoot = new URL('../', import.meta.url)
const apiReferencePath = new URL('API.md', repoRoot)
const shouldWrite = process.argv.includes('--write')
const failures = []

if (!existsSync(apiReferencePath)) {
  throw new Error('API.md is required')
}

let apiReference = readFileSync(apiReferencePath, 'utf8')
const rootExports = declarationExports('dist/index.d.ts')
const coreExports = declarationExports('dist/core.d.ts')
const reactExports = declarationExports('dist/react.d.ts')

expectExactExportSet(rootExports, coreExports, 'root exports', './core exports')

const reactOnlyExports = reactExports.filter((name) => !coreExports.includes(name))
const nextApiReference = shouldWrite
  ? replaceExportBlock(replaceExportBlock(apiReference, 'root-core', coreExports), 'react-only', reactOnlyExports)
  : apiReference
const wroteApiReference = shouldWrite && nextApiReference !== apiReference
if (wroteApiReference) {
  writeFileSync(apiReferencePath, nextApiReference)
  apiReference = nextApiReference
}

assertContains("import { createPatternRuntime } from '@interactive-os/apg-patterns'")
assertContains("import { createPatternRuntime } from '@interactive-os/apg-patterns/core'")
assertContains("import { Button, useButtonPattern } from '@interactive-os/apg-patterns/react'")
assertExportBlock('root-core', coreExports)
assertExportBlock('react-only', reactOnlyExports)

if (failures.length > 0) {
  console.error(`API reference check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`${wroteApiReference ? 'Updated API reference and verified' : 'API reference covers'} ${coreExports.length} root/core exports and ${reactOnlyExports.length} React-only exports.`)

function declarationExports(packagePath) {
  const filePath = fileURLToPath(new URL(packagePath, repoRoot))
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
      getCurrentDirectory: () => fileURLToPath(repoRoot),
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

function expectExactExportSet(actual, expected, actualLabel, expectedLabel) {
  expectExportSuperset(actual, expected, actualLabel, expectedLabel)
  expectExportSuperset(expected, actual, expectedLabel, actualLabel)
}

function expectExportSuperset(actual, expected, actualLabel, expectedLabel) {
  const actualSet = new Set(actual)
  const missingNames = expected.filter((name) => !actualSet.has(name))
  if (missingNames.length > 0) {
    failures.push(`${actualLabel} must include every ${expectedLabel}: ${missingNames.join(', ')}`)
  }
}

function assertContains(text) {
  if (!apiReference.includes(text)) failures.push(`API.md must include ${text}`)
}

function assertExportBlock(name, exports) {
  const actual = readExportBlock(name)
  if (actual === null) return

  const expected = exportBlockSource(exports)
  if (actual !== expected) failures.push(`API.md ${name} export block is out of date`)
}

function replaceExportBlock(source, name, exports) {
  const markers = exportBlockMarkers(name, source)
  if (!markers) return source

  return `${source.slice(0, markers.startIndex + markers.startMarker.length)}\n${exportBlockSource(exports)}\n${source.slice(markers.endIndex)}`
}

function readExportBlock(name) {
  const markers = exportBlockMarkers(name, apiReference)
  if (!markers) return null
  return apiReference.slice(markers.startIndex + markers.startMarker.length, markers.endIndex).trim()
}

function exportBlockMarkers(name, source) {
  const startMarker = `<!-- apg-api:${name}:start -->`
  const endMarker = `<!-- apg-api:${name}:end -->`
  const startIndex = source.indexOf(startMarker)
  const endIndex = source.indexOf(endMarker)
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    failures.push(`API.md is missing ${name} export markers`)
    return null
  }

  return { startMarker, startIndex, endIndex }
}

function exportBlockSource(exports) {
  return ['```txt', ...exports, '```'].join('\n')
}
