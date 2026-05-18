import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'
import { readDemoEntryKeyboardShortcuts } from './readDemoEntryKeyboardShortcuts.mjs'

let tempDir

afterEach(async () => {
  if (tempDir) await rm(tempDir, { recursive: true, force: true })
  tempDir = undefined
})

describe('readDemoEntryKeyboardShortcuts', () => {
  it('reads key and keyboard shortcuts from the same demo metadata object', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'apg-demo-entry-'))
    await writeEntry('tabs', `
      const tabsDemoDefinition = {
        key: 'tabs',
        label: 'Tabs',
        keyboardShortcuts: ['ArrowRight', 'ArrowLeft'],
      }
      const unrelated = { key: 'notTabs' }
    `)

    const shortcuts = await readDemoEntryKeyboardShortcuts(pathToFileURL(`${tempDir}/`))

    expect([...shortcuts.entries()]).toEqual([['tabs', ['ArrowRight', 'ArrowLeft']]])
  })

  it('ignores metadata objects with non-literal shortcut values', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'apg-demo-entry-'))
    await writeEntry('button', `
      const shortcut = 'Enter'
      const buttonDemoDefinition = {
        key: 'button',
        label: 'Button',
        keyboardShortcuts: [shortcut],
      }
    `)

    const shortcuts = await readDemoEntryKeyboardShortcuts(pathToFileURL(`${tempDir}/`))

    expect([...shortcuts.entries()]).toEqual([])
  })
})

async function writeEntry(patternKey, source) {
  const patternDir = join(tempDir, patternKey)
  await mkdir(patternDir)
  await writeFile(join(patternDir, 'entry.tsx'), source)
}
