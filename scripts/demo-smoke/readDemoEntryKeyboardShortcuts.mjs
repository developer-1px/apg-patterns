import { readFile, readdir } from 'node:fs/promises'
import ts from 'typescript'

export async function readDemoEntryKeyboardShortcuts(demoPatternsDir) {
  const entries = new Map()
  const patternDirs = await readdir(demoPatternsDir, { withFileTypes: true })

  for (const patternDir of patternDirs) {
    if (!patternDir.isDirectory()) continue
    const entryUrl = new URL(`${patternDir.name}/entry.tsx`, demoPatternsDir)
    let source
    try {
      source = await readFile(entryUrl, 'utf8')
    } catch {
      continue
    }

    const sourceFile = ts.createSourceFile(entryUrl.pathname, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const metadata = extractDemoEntryMetadata(sourceFile)
    if (metadata.key && metadata.keyboardShortcuts) entries.set(metadata.key, metadata.keyboardShortcuts)
  }

  return entries
}

function extractDemoEntryMetadata(sourceFile) {
  const metadata = { key: null, keyboardShortcuts: null }

  function visit(node) {
    if (ts.isPropertyAssignment(node)) {
      const name = propertyNameText(node.name)
      if (name === 'key' && ts.isStringLiteralLike(node.initializer)) {
        metadata.key = node.initializer.text
      }
      if (name === 'keyboardShortcuts' && ts.isArrayLiteralExpression(node.initializer)) {
        metadata.keyboardShortcuts = node.initializer.elements.map((element) => (
          ts.isStringLiteralLike(element) ? element.text : null
        ))
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return metadata
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return name.text
  return null
}
