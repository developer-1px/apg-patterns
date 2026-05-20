import { readdir, readFile } from 'node:fs/promises'
import ts from 'typescript'

const repoRoot = new URL('../', import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', repoRoot), 'utf8'))
const expectedReactPeerRange = '^18.0.0 || ^19.0.0'
const allowedReactImports = new Set([
  'ComponentPropsWithoutRef',
  'CSSProperties',
  'HTMLAttributes',
  'InputHTMLAttributes',
  'KeyboardEvent',
  'MouseEvent',
  'PointerEvent',
  'ReactNode',
  'createElement',
  'useLayoutEffect',
  'useMemo',
  'useRef',
])
const failures = []

if (packageJson.peerDependencies?.react !== expectedReactPeerRange) {
  failures.push(`peerDependencies.react must be "${expectedReactPeerRange}"`)
}
if (packageJson.peerDependenciesMeta?.react?.optional !== true) {
  failures.push('peerDependenciesMeta.react.optional must be true')
}

const sourceFiles = await listFiles(new URL('src/', repoRoot), 'src')
const productionFiles = sourceFiles.filter((filePath) => {
  if (!/\.[cm]?[jt]sx?$/.test(filePath)) return false
  if (filePath.startsWith('src/tests/')) return false
  return true
})

for (const filePath of productionFiles) {
  const source = await readFile(new URL(filePath, repoRoot), 'utf8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true)
  inspectImports(filePath, sourceFile)
}

if (failures.length > 0) {
  console.error(`React peer compatibility check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`React peer compatibility keeps ${productionFiles.length} production source files within the React 18/19 peer surface.`)

async function listFiles(rootUrl, prefix) {
  const entries = await readdir(rootUrl, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = `${prefix}/${entry.name}`
    if (entry.isDirectory()) {
      files.push(...await listFiles(new URL(`${entry.name}/`, rootUrl), entryPath))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

function inspectImports(filePath, sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue

    const specifier = statement.moduleSpecifier.text
    if (specifier === 'react-dom' || specifier.startsWith('react-dom/')) {
      failures.push(`${filePath} must not import ${specifier}; React DOM stays outside the published package source`)
      continue
    }
    if (specifier !== 'react') continue

    const importClause = statement.importClause
    if (!importClause) continue
    if (importClause.name) failures.push(`${filePath} must use named React imports instead of a default React import`)
    if (!importClause.namedBindings) continue

    if (ts.isNamespaceImport(importClause.namedBindings)) {
      failures.push(`${filePath} must use named React imports instead of a React namespace import`)
      continue
    }

    for (const importSpecifier of importClause.namedBindings.elements) {
      const importedName = (importSpecifier.propertyName ?? importSpecifier.name).text
      if (!allowedReactImports.has(importedName)) {
        failures.push(`${filePath} imports React API ${importedName}, which is outside the checked React 18/19 peer surface`)
      }
    }
  }
}
