import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const demoPatternDir = 'demo/src/patterns'
const srcPatternDir = 'src/patterns'
const failures = []

const demoEntries = readDemoEntries()
verifyDemoVariantSchemaKeys()
const srcFolders = readdirSync(srcPatternDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(srcPatternDir, entry.name, 'definition.ts')))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b))

for (const folder of srcFolders) {
  const demoEntry = demoEntries.get(folder)
  if (!demoEntry) {
    failures.push(`missing demo entry for src pattern folder: ${folder}`)
    continue
  }
  if (demoEntry.key !== folder) {
    failures.push(`${folder}: demo key ${demoEntry.key} does not match expected ${folder}`)
  }

  const mainSourcePath = path.join(demoPatternDir, folder, demoEntry.sources.main)
  verifySourceFile(`${folder}: main source`, mainSourcePath)
  verifySourceFile(`${folder}: entry source`, path.join(demoPatternDir, folder, 'entry.tsx'))
  verifySourceName(`${folder}: entry source name`, demoEntry.sources.entry, `${folder}/entry.tsx`)
  verifySourceName(`${folder}: definition source name`, demoEntry.sources.definition, `${folder}/definition.ts`)
  verifySourceFile(`${folder}: definition source`, path.join(srcPatternDir, folder, 'definition.ts'))
  verifyDemoViewContract(folder, demoEntry)
  verifyMainComponentSourceContract(folder, mainSourcePath)

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
    if (name === 'view' && ts.isObjectLiteralExpression(property.initializer)) result.view = readObject(property.initializer)
  }
  return result
}

function readSourcesObject(node) {
  return readObject(node)
}

function readObject(node) {
  const sources = {}
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const name = propertyNameText(property.name)
    if (!name) continue
    const value = property.initializer
    if (ts.isStringLiteralLike(value)) sources[name] = value.text
    if (ts.isObjectLiteralExpression(value)) sources[name] = readObject(value)
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

function verifyDemoViewContract(folder, demoEntry) {
  const view = demoEntry.view
  if (view?.kind !== 'component') {
    failures.push(`${folder}: demo view must render a component`)
    return
  }
  const props = view.props ?? {}
  if (props.data !== '$state.data') failures.push(`${folder}: demo view must pass data from $state.data`)
  if (props.onEvent !== '$actions.dispatchEvent') {
    failures.push(`${folder}: demo view must pass onEvent from $actions.dispatchEvent`)
  }
}

function verifyMainComponentSourceContract(folder, filePath) {
  if (!existsSync(filePath)) return
  const text = readFileSync(filePath, 'utf8')
  if (/\bdata\?\s*:/.test(text)) failures.push(`${folder}: main demo component must require data`)
  if (/\bonEvent\?\s*:/.test(text)) failures.push(`${folder}: main demo component must require onEvent`)
  if (/\buseReducer\s*\(/.test(text)) failures.push(`${folder}: main demo component must not own reducer state`)
}

function verifyDemoVariantSchemaKeys() {
  for (const filePath of readSourceFiles(demoPatternDir)) {
    const sourceFile = ts.createSourceFile(filePath, readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true, filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
    const imports = readNamedImports(sourceFile, filePath)
    const variantKeyArrays = readVariantKeyArrays(sourceFile)
    const zodEnumArrayNames = readZodEnumArrayNames(sourceFile)

    for (const array of variantKeyArrays) {
      if (!zodEnumArrayNames.has(array.name)) continue
      const variantImport = resolveVariantImport(array.name, imports)
      if (!variantImport) continue
      const objectKeys = readImportedObjectKeys(variantImport)
      if (!objectKeys) continue
      if (array.keys.join('\n') !== objectKeys.join('\n')) {
        failures.push(`${filePath}: ${array.name} must match ${variantImport.importedName} keys; expected [${objectKeys.join(', ')}], actual [${array.keys.join(', ')}]`)
      }
    }
  }
}

function readSourceFiles(root) {
  const files = []
  for (const dirent of readdirSync(root, { withFileTypes: true })) {
    const filePath = path.join(root, dirent.name)
    if (dirent.isDirectory()) files.push(...readSourceFiles(filePath))
    else if (/\.(?:ts|tsx)$/.test(dirent.name) && !/\.test\.(?:ts|tsx)$/.test(dirent.name)) files.push(filePath)
  }
  return files
}

function readNamedImports(sourceFile, filePath) {
  const imports = []
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    if (!ts.isStringLiteralLike(statement.moduleSpecifier)) continue
    const bindings = statement.importClause?.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) continue
    for (const specifier of bindings.elements) {
      imports.push({
        localName: specifier.name.text,
        importedName: specifier.propertyName?.text ?? specifier.name.text,
        modulePath: statement.moduleSpecifier.text,
        importerPath: filePath,
      })
    }
  }
  return imports
}

function readVariantKeyArrays(sourceFile) {
  const arrays = []
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && /VariantKeys$/i.test(node.name.text)) {
      const initializer = node.initializer ? unwrapExpression(node.initializer) : null
      if (initializer && ts.isArrayLiteralExpression(initializer)) {
        const keys = initializer.elements
          .map((element) => unwrapExpression(element))
          .filter((element) => ts.isStringLiteralLike(element))
          .map((element) => element.text)
        if (keys.length === initializer.elements.length) arrays.push({ name: node.name.text, keys })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return arrays
}

function readZodEnumArrayNames(sourceFile) {
  const names = new Set()
  function visit(node) {
    if (
      ts.isCallExpression(node)
      && ts.isPropertyAccessExpression(node.expression)
      && node.expression.name.text === 'enum'
      && ts.isIdentifier(node.expression.expression)
      && node.expression.expression.text === 'z'
      && node.arguments.length > 0
      && ts.isIdentifier(node.arguments[0])
    ) {
      names.add(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return names
}

function resolveVariantImport(arrayName, imports) {
  const prefix = arrayName.replace(/VariantKeys$/i, '').toLowerCase()
  const candidates = imports.filter((item) => /Variants$/.test(item.localName))
  return candidates.find((item) => item.localName.toLowerCase() === `${prefix}variants`) ?? (candidates.length === 1 ? candidates[0] : null)
}

function readImportedObjectKeys(variantImport) {
  if (!variantImport.modulePath.startsWith('.')) return null
  const modulePath = resolveImportPath(variantImport.importerPath, variantImport.modulePath)
  if (!modulePath) return null
  const sourceFile = ts.createSourceFile(modulePath, readFileSync(modulePath, 'utf8'), ts.ScriptTarget.Latest, true, modulePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== variantImport.importedName) continue
      const initializer = declaration.initializer ? unwrapExpression(declaration.initializer) : null
      if (!initializer || !ts.isObjectLiteralExpression(initializer)) return null
      return initializer.properties
        .filter((property) => ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property))
        .map((property) => propertyNameText(property.name))
        .filter(Boolean)
    }
  }
  return null
}

function resolveImportPath(importerPath, modulePath) {
  const basePath = path.resolve(path.dirname(importerPath), modulePath)
  for (const candidate of [`${basePath}.ts`, `${basePath}.tsx`, path.join(basePath, 'index.ts'), path.join(basePath, 'index.tsx')]) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

function unwrapExpression(node) {
  let current = node
  while (
    ts.isAsExpression(current)
    || ts.isSatisfiesExpression(current)
    || ts.isParenthesizedExpression(current)
    || ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression
  }
  return current
}
