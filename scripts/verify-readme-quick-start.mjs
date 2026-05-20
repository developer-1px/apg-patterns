import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tempRoot = mkdtempSync(join(tmpdir(), 'apg-patterns-readme-'))

try {
  assertBuildOutputExists()
  const examples = readQuickStartExamples()
  const consumerRoot = join(tempRoot, 'consumer')
  const nodeModules = join(consumerRoot, 'node_modules')

  mkdirSync(join(nodeModules, '@interactive-os'), { recursive: true })
  symlinkSync(repoRoot, join(nodeModules, '@interactive-os', 'apg-patterns'), 'dir')
  linkPackageDependency(nodeModules, 'zod')
  linkPackageDependency(nodeModules, 'react')
  linkPackageDependency(nodeModules, '@types/react')
  linkPackageDependency(nodeModules, 'csstype')

  writeFileSync(join(consumerRoot, 'package.json'), JSON.stringify({ private: true, type: 'module' }, null, 2))
  const filenames = examples.map((source, index) => {
    const filename = `readme-quick-start-${index + 1}.tsx`
    writeFileSync(join(consumerRoot, filename), source)
    return filename
  })

  writeFileSync(join(consumerRoot, 'tsconfig.nodenext.json'), tsconfigSource({
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    include: filenames,
  }))
  writeFileSync(join(consumerRoot, 'tsconfig.bundler.json'), tsconfigSource({
    module: 'ESNext',
    moduleResolution: 'Bundler',
    include: filenames,
  }))

  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.nodenext.json', '--noEmit'], {
    cwd: consumerRoot,
    stdio: 'pipe',
  })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.bundler.json', '--noEmit'], {
    cwd: consumerRoot,
    stdio: 'pipe',
  })

  console.log(`README Quick Start type-checks ${examples.length} examples under NodeNext and Bundler module resolution.`)
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}

function assertBuildOutputExists() {
  for (const packagePath of ['dist/index.d.ts', 'dist/react.d.ts']) {
    if (!existsSync(join(repoRoot, packagePath))) {
      throw new Error(`Missing ${packagePath}; run npm run build before npm run check:readme`)
    }
  }
}

function readQuickStartExamples() {
  const readme = readFileSync(join(repoRoot, 'README.md'), 'utf8')
  const quickStartMatch = /^## Quick Start\s*$/m.exec(readme)
  if (!quickStartMatch) throw new Error('README is missing a Quick Start section')

  const sectionStart = quickStartMatch.index + quickStartMatch[0].length
  const afterQuickStart = readme.slice(sectionStart)
  const nextSectionOffset = afterQuickStart.search(/\n## /)
  const section = nextSectionOffset === -1 ? afterQuickStart : afterQuickStart.slice(0, nextSectionOffset)
  const examples = [...section.matchAll(/```tsx\n([\s\S]*?)\n```/g)].map((match) => match[1])

  if (examples.length !== 2) {
    throw new Error(`README Quick Start must contain exactly 2 tsx examples; found ${examples.length}`)
  }

  return examples
}

function linkPackageDependency(nodeModules, name) {
  const source = join(repoRoot, 'node_modules', name)
  if (!existsSync(source)) throw new Error(`Missing local dependency for README smoke: ${source}`)
  const target = join(nodeModules, name)
  mkdirSync(dirname(target), { recursive: true })
  symlinkSync(source, target, 'dir')
}

function tsconfigSource({ module, moduleResolution, include }) {
  return JSON.stringify({
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module,
      moduleResolution,
      jsx: 'react-jsx',
      lib: ['ES2022', 'DOM'],
      skipLibCheck: false,
    },
    include,
  }, null, 2)
}
