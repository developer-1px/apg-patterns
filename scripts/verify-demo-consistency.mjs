import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const demoPatternDir = 'demo/src/patterns'
const srcPatternDir = 'src/patterns'
const folderKeyOverrides = { menu: 'menuAndMenubar' }
const failures = []

const demoEntries = readDemoEntries()
const srcFolders = readdirSync(srcPatternDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(srcPatternDir, entry.name, 'definition.ts')))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b))

for (const folder of srcFolders) {
  const expectedKey = folderKeyOverrides[folder] ?? folder
  const demoEntry = demoEntries.get(folder)
  if (!demoEntry) {
    failures.push(`missing demo entry for src pattern folder: ${folder}`)
    continue
  }
  if (demoEntry.key !== expectedKey) {
    failures.push(`${folder}: demo key ${demoEntry.key} does not match expected ${expectedKey}`)
  }

  verifySourceFile(`${folder}: main source`, path.join(demoPatternDir, folder, demoEntry.sources.main))
  verifySourceFile(`${folder}: entry source`, path.join(demoPatternDir, folder, 'entry.tsx'))
  verifySourceName(`${folder}: entry source name`, demoEntry.sources.entry, `${folder}/entry.tsx`)
  verifySourceName(`${folder}: definition source name`, demoEntry.sources.definition, `${folder}/definition.ts`)
  verifySourceFile(`${folder}: definition source`, path.join(srcPatternDir, folder, 'definition.ts'))

  const declaredHooks = [...(demoEntry.sources.hooks ?? [])].sort((a, b) => a.localeCompare(b))
  const actualHooks = readdirSync(path.join(srcPatternDir, folder))
    .filter((file) => /^use[A-Z].*Pattern\.ts$/.test(file))
    .map((file) => `${folder}/${file}`)
    .sort((a, b) => a.localeCompare(b))
  if (declaredHooks.join('\n') !== actualHooks.join('\n')) {
    failures.push(`${folder}: hook source metadata mismatch; expected [${actualHooks.join(', ')}], actual [${declaredHooks.join(', ')}]`)
  }

  for (const source of demoEntry.sources.data ?? []) {
    verifySourceFile(`${folder}: data source ${source}`, path.join(demoPatternDir, folder, source))
  }
  for (const source of demoEntry.sources.runtime ?? []) {
    verifySourceFile(`${folder}: runtime source ${source}`, path.join(srcPatternDir, source))
  }
  for (const source of demoEntry.sources.extra ?? []) {
    const filePath = source.includes('/')
      ? path.join(srcPatternDir, source)
      : path.join(demoPatternDir, folder, source)
    verifySourceFile(`${folder}: extra source ${source}`, filePath)
  }
}

for (const folder of demoEntries.keys()) {
  if (!srcFolders.includes(folder)) failures.push(`stale demo entry without src pattern folder: ${folder}`)
}

if (failures.length > 0) {
  console.error(`Demo/source consistency check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`Demo/source consistency covers ${demoEntries.size} demo pattern entries.`)

function readDemoEntries() {
  const entries = new Map()
  for (const dirent of readdirSync(demoPatternDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue
    const entryPath = path.join(demoPatternDir, dirent.name, 'entry.tsx')
    if (!existsSync(entryPath)) continue
    const sourceFile = ts.createSourceFile(entryPath, readFileSync(entryPath, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const metadata = extractDemoDefinition(sourceFile)
    if (!metadata) {
      failures.push(`${dirent.name}: could not read demo definition metadata`)
      continue
    }
    entries.set(dirent.name, metadata)
  }
  return entries
}

function extractDemoDefinition(sourceFile) {
  let metadata = null

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const candidate = readDefinitionObject(node)
      if (candidate?.key && candidate.sources) metadata = candidate
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return metadata
}

function readDefinitionObject(node) {
  const result = {}
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const name = propertyNameText(property.name)
    if (!name) continue
    if (name === 'key' && ts.isStringLiteralLike(property.initializer)) result.key = property.initializer.text
    if (name === 'sources' && ts.isObjectLiteralExpression(property.initializer)) result.sources = readSourcesObject(property.initializer)
  }
  return result
}

function readSourcesObject(node) {
  const sources = {}
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const name = propertyNameText(property.name)
    if (!name) continue
    const value = property.initializer
    if (ts.isStringLiteralLike(value)) sources[name] = value.text
    if (ts.isArrayLiteralExpression(value)) {
      sources[name] = value.elements
        .filter((element) => ts.isStringLiteralLike(element))
        .map((element) => element.text)
    }
    if (value.kind === ts.SyntaxKind.TrueKeyword) sources[name] = true
    if (value.kind === ts.SyntaxKind.FalseKeyword) sources[name] = false
  }
  return sources
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return name.text
  return null
}

function verifySourceName(label, actual, expected) {
  if (actual !== expected) failures.push(`${label}: expected ${expected}, actual ${actual ?? 'missing'}`)
}

function verifySourceFile(label, filePath) {
  if (!existsSync(filePath)) failures.push(`${label} missing file: ${filePath}`)
}
