import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tempRoot = mkdtempSync(join(tmpdir(), 'apg-patterns-readme-'))

try {
  assertBuildOutputExists()
  const examples = readReadmeExamples()
  const tarballPath = packCurrentPackage(tempRoot)
  const consumerRoot = join(tempRoot, 'consumer')
  const nodeModules = join(consumerRoot, 'node_modules')

  installPackedPackage(tarballPath, nodeModules)
  linkPackageDependency(nodeModules, 'zod')
  linkPackageDependency(nodeModules, 'react')
  linkPackageDependency(nodeModules, '@types/react')
  linkPackageDependency(nodeModules, 'csstype')

  writeFileSync(join(consumerRoot, 'package.json'), JSON.stringify({ private: true, type: 'module' }, null, 2))
  const filenames = examples.map((example) => {
    writeFileSync(join(consumerRoot, example.filename), example.source)
    return example.filename
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

  runRootQuickStartExample(consumerRoot, examples)

  console.log(`README type-checks ${examples.length} TypeScript examples against the packed package under NodeNext and Bundler module resolution and executes the root Quick Start.`)
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

function packCurrentPackage(destination) {
  const stdout = execFileSync('npm', ['pack', '--pack-destination', destination, '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  const result = JSON.parse(stdout)
  const filename = result[0]?.filename
  if (!filename) throw new Error('npm pack did not return a tarball filename')
  const tarballPath = join(destination, filename)
  if (!existsSync(tarballPath)) throw new Error(`npm pack did not create ${tarballPath}`)
  return tarballPath
}

function installPackedPackage(tarballPath, nodeModules) {
  const packageScopeRoot = join(nodeModules, '@interactive-os')
  mkdirSync(packageScopeRoot, { recursive: true })
  execFileSync('tar', ['-xzf', tarballPath, '-C', packageScopeRoot], { cwd: repoRoot })
  renameSync(join(packageScopeRoot, 'package'), join(packageScopeRoot, 'apg-patterns'))
}

function readReadmeExamples() {
  const readme = readFileSync(join(repoRoot, 'README.md'), 'utf8')
  const quickStartExamples = readQuickStartExamples(readme)
  const reactApiExamples = readReactApiExamples(readme)
  return [
    ...quickStartExamples.map((source, index) => ({
      filename: `readme-quick-start-${index + 1}.tsx`,
      source,
    })),
    ...reactApiExamples,
  ]
}

function readQuickStartExamples(readme) {
  const section = readSection(readme, 'Quick Start')
  if (!section) throw new Error('README is missing a Quick Start section')

  const examples = tsxCodeBlocks(section)
  if (examples.length !== 2) {
    throw new Error(`README Quick Start must contain exactly 2 tsx examples; found ${examples.length}`)
  }

  return examples
}

function readReactApiExamples(readme) {
  const section = readSection(readme, 'React API')
  if (!section) throw new Error('README is missing a React API section')

  const examples = tsxCodeBlocks(section)
  if (examples.length !== 3) {
    throw new Error(`README React API must contain exactly 3 tsx examples; found ${examples.length}`)
  }

  const [componentExample, listboxExample, treeviewExample] = examples
  if (!componentExample.trimStart().startsWith('<Accordion')) {
    throw new Error('README React API first tsx example must be the preset component surface')
  }
  if (!listboxExample.includes('useListboxPattern')) {
    throw new Error('README React API second tsx example must cover useListboxPattern renderItems')
  }
  if (!treeviewExample.includes('useTreeviewPattern')) {
    throw new Error('README React API third tsx example must cover useTreeviewPattern renderItems')
  }

  return [
    {
      filename: 'readme-react-api-components.tsx',
      source: reactPresetComponentExampleSource(componentExample),
    },
    {
      filename: 'readme-react-api-listbox.tsx',
      source: reactRenderItemsExampleSource({
        hook: 'useListboxPattern',
        name: 'ReadmeListboxRenderItems',
        snippet: listboxExample,
      }),
    },
    {
      filename: 'readme-react-api-treeview.tsx',
      source: reactRenderItemsExampleSource({
        hook: 'useTreeviewPattern',
        name: 'ReadmeTreeviewRenderItems',
        snippet: treeviewExample,
      }),
    },
  ]
}

function readSection(source, heading) {
  const match = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, 'm').exec(source)
  if (!match) return ''
  const afterHeading = source.slice(match.index + match[0].length)
  const nextHeadingOffset = afterHeading.search(/\n## /)
  return nextHeadingOffset === -1 ? afterHeading : afterHeading.slice(0, nextHeadingOffset)
}

function tsxCodeBlocks(source) {
  return [...source.matchAll(/```tsx\n([\s\S]*?)\n```/g)].map((match) => match[1])
}

function reactPresetComponentExampleSource(snippet) {
  const componentNames = [...snippet.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1])
  const uniqueComponentNames = [...new Set(componentNames)]
  return `import { ${uniqueComponentNames.join(', ')}, type PatternData, type PatternEvent } from '@interactive-os/apg-patterns/react'

const data: PatternData = {
  items: { primary: { label: 'Primary' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}
const onEvent = (event: PatternEvent) => { void event }

export function ReadmeReactPresetComponents() {
  return (
    <>
${indent(snippet, 6)}
    </>
  )
}
`
}

function reactRenderItemsExampleSource({ hook, name, snippet }) {
  return `import { ${hook}, type PatternData, type PatternEvent, type PatternOptions } from '@interactive-os/apg-patterns/react'

const data: PatternData = {
  items: { primary: { label: 'Primary' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}
const onEvent = (event: PatternEvent) => { void event }
const options: PatternOptions = {}

export function ${name}() {
${indent(snippet, 2)}
}
`
}

function runRootQuickStartExample(consumerRoot, examples) {
  const rootQuickStart = examples.find((example) => example.filename === 'readme-quick-start-1.tsx')
  if (!rootQuickStart) throw new Error('README root Quick Start example is missing')

  const output = ts.transpileModule(rootQuickStart.source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
    },
  })
  const filename = 'readme-quick-start-runtime.mjs'
  writeFileSync(join(consumerRoot, filename), output.outputText)
  execFileSync(process.execPath, [filename], { cwd: consumerRoot, stdio: 'pipe' })
}

function indent(source, spaces) {
  const prefix = ' '.repeat(spaces)
  return source.split('\n').map((line) => `${prefix}${line}`).join('\n')
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
