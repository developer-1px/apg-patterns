import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const distRoot = 'dist'

if (!existsSync(distRoot)) {
  throw new Error('dist directory is missing; run tsup before normalizing source maps')
}

for (const filename of readdirSync(distRoot)) {
  if (!/\.(?:js|cjs)$/.test(filename)) continue

  const runtimePath = join(distRoot, filename)
  const mapFilename = `${filename}.map`
  const mapPath = join(distRoot, mapFilename)
  if (!existsSync(mapPath)) throw new Error(`${runtimePath} references missing source map ${mapPath}`)

  const source = readFileSync(runtimePath, 'utf8')
  const lines = source
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith('//# sourceMappingURL='))
  const normalized = `${lines.join('\n').trimEnd()}\n//# sourceMappingURL=${basename(mapPath)}\n`

  if (normalized !== source) writeFileSync(runtimePath, normalized)
}
