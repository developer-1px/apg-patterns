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
  let metadata = { key: null, keyboardShortcuts: null }

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const objectMetadata = extractObjectMetadata(node)
      if (objectMetadata.key && objectMetadata.keyboardShortcuts) metadata = objectMetadata
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return metadata
}

function extractObjectMetadata(objectLiteral) {
  const metadata = { key: null, keyboardShortcuts: null }

  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const name = propertyNameText(property.name)
    if (name === 'key' && ts.isStringLiteralLike(property.initializer)) {
      metadata.key = property.initializer.text
    }
    if (name === 'keyboardShortcuts' && ts.isArrayLiteralExpression(property.initializer)) {
      const shortcuts = property.initializer.elements.map((element) => (
        ts.isStringLiteralLike(element) ? element.text : null
      ))
      metadata.keyboardShortcuts = shortcuts.every((shortcut) => shortcut !== null) ? shortcuts : null
    }
  }

  return metadata
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return name.text
  return null
}
