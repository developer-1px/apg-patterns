import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const failures = []
const maxPackedBytes = 600_000
const maxUnpackedBytes = 4_000_000
const expectedReactPeerRange = '^18.0.0 || ^19.0.0'
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
const declarationByteBudgets = {
  'dist/index.d.ts': 20_000,
  'dist/index.d.cts': 20_000,
  'dist/core.d.ts': 450_000,
  'dist/core.d.cts': 450_000,
  'dist/react.d.ts': 100_000,
  'dist/react.d.cts': 100_000,
}
const expectedExportEntries = {
  '.': {
    import: {
      types: './dist/index.d.ts',
      default: './dist/index.js',
    },
    require: {
      types: './dist/index.d.cts',
      default: './dist/index.cjs',
    },
  },
  './core': {
    import: {
      types: './dist/core.d.ts',
      default: './dist/core.js',
    },
    require: {
      types: './dist/core.d.cts',
      default: './dist/core.cjs',
    },
  },
  './react': {
    import: {
      types: './dist/react.d.ts',
      default: './dist/react.js',
    },
    require: {
      types: './dist/react.d.cts',
      default: './dist/react.cjs',
    },
  },
}
const expectedExportSubpaths = [...Object.keys(expectedExportEntries), './package.json']
const expectedPackageFiles = [
  'dist',
  'docs/proposals',
  'README.md',
  'API.md',
  'INTERFACE_STABILITY.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'RELEASE.md',
  'SECURITY.md',
  'LICENSE',
]
const requiredPackageKeywords = ['aria', 'wai-aria', 'apg', 'patterns', 'react', 'zod', 'a11y']
const expectedPublishConfig = {
  access: 'public',
  provenance: true,
  registry: 'https://registry.npmjs.org/',
}
const allowedRuntimeDependencyLicenses = {
  zod: new Set(['MIT']),
}
const hangulTextPattern = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/
const packedSensitiveTextPatterns = [
  {
    label: 'private key block',
    pattern: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/,
  },
  {
    label: 'npm auth token config',
    pattern: /\/\/registry\.npmjs\.org\/:_authToken\s*=/i,
  },
  {
    label: 'npm access token',
    pattern: /\bnpm_[A-Za-z0-9]{36,}\b/,
  },
  {
    label: 'GitHub access token',
    pattern: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/,
  },
  {
    label: 'AWS access key id',
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  },
  {
    label: 'Slack access token',
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
  },
  {
    label: 'basic-auth URL',
    pattern: /https?:\/\/[^\s/:@]+:[^\s/@]+@/,
  },
]
const packedSensitiveAssignmentPattern = /(?:^|[\s"'`{,])([A-Z0-9_]*(?:SECRET|PASSWORD|TOKEN|API[_-]?KEY|AUTH[_-]?TOKEN)[A-Z0-9_]*)\s*[:=]\s*["']?([A-Za-z0-9_./+=:-]{20,})/gi
const packedMarkdownDeferredPlaceholderPatterns = [
  {
    label: 'deferred repository metadata placeholder',
    pattern: /\bonce repository metadata is configured\b/i,
  },
  {
    label: 'unfinished release-note placeholder',
    pattern: /\b(?:TODO|FIXME|TBD|coming soon)\b/i,
  },
]
const allowedDeclarationExternalSpecifiers = {
  'dist/index.d.ts': new Set(['zod']),
  'dist/index.d.cts': new Set(['zod']),
  'dist/core.d.ts': new Set(['zod']),
  'dist/core.d.cts': new Set(['zod']),
  'dist/react.d.ts': new Set(['zod', 'react']),
  'dist/react.d.cts': new Set(['zod', 'react']),
}

if (packageJson.private === true) failures.push('package must not be private')
if (!packageJson.name) failures.push('package name is required')
if (!packageJson.description) failures.push('package description is required')
if (!packageJson.license) failures.push('package license is required')
if (!packageAuthorName(packageJson.author)) failures.push('package author is required')
assertPackageVersion()
assertPackageKeywords()
const packageManagerMatch = /^npm@(\d+\.\d+\.\d+)$/.exec(packageJson.packageManager ?? '')
if (!packageManagerMatch) {
  failures.push('packageManager must pin the npm version')
} else {
  assertPinnedPackageManagerVersion(packageManagerMatch[1])
}
if (typeof packageJson.engines?.node !== 'string') failures.push('engines.node is required')
assertPublishConfig()
assertPublicRepositoryMetadata()
if (!existsSync('README.md')) failures.push('README.md is required')
if (!existsSync('API.md')) failures.push('API.md is required')
if (!existsSync('INTERFACE_STABILITY.md')) failures.push('INTERFACE_STABILITY.md is required')
if (!existsSync('CHANGELOG.md')) failures.push('CHANGELOG.md is required')
if (!existsSync('CONTRIBUTING.md')) failures.push('CONTRIBUTING.md is required')
if (!existsSync('RELEASE.md')) failures.push('RELEASE.md is required')
if (!existsSync('SECURITY.md')) failures.push('SECURITY.md is required')
if (!existsSync('LICENSE')) failures.push('LICENSE is required')
assertDocumentationMetadata()
assertReadmeCommandExamples()
assertPackageScripts()
assertPackageLock()
assertPackageFiles()
assertDependencyNames('dependencies', packageJson.dependencies, ['zod'])
assertDependencyNames('peerDependencies', packageJson.peerDependencies, ['react'])
assertDependencyNames('optionalDependencies', packageJson.optionalDependencies, [])
assertDependencyNames('bundledDependencies', packageJson.bundledDependencies, [])
if (packageJson.peerDependencies?.react !== expectedReactPeerRange) {
  failures.push(`react peer dependency must be ${expectedReactPeerRange}`)
}
if (packageJson.peerDependencies?.react && packageJson.peerDependenciesMeta?.react?.optional !== true) {
  failures.push('react peer dependency must be optional because the root and ./core entries are React-free')
}

assertPublicExports()

for (const [section, dependencies] of Object.entries(dependencySections(packageJson))) {
  for (const [name, spec] of Object.entries(dependencies)) {
    if (typeof spec !== 'string') continue
    if (/^(file|link|workspace):/.test(spec)) failures.push(`${section}.${name} uses local-only spec ${spec}`)
  }
}

for (const sourceImport of productionIndexImports()) {
  failures.push(`production source imports the public barrel: ${sourceImport}`)
}

const pack = readPackManifest()
assertPackMetadata(pack)
const publishDryRun = readPublishDryRunManifest()
assertPublishDryRunMatchesPack(publishDryRun, pack)
const packedPaths = new Set(pack.files.map((file) => file.path))
assertPackFileMetadata(pack.files)
const requiredPackedPaths = [
  'package.json',
  'README.md',
  'API.md',
  'INTERFACE_STABILITY.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'RELEASE.md',
  'SECURITY.md',
  'LICENSE',
  'docs/proposals/2026-05-18-llm-friendly-apg-react-api.md',
  'docs/proposals/2026-05-18-react-facade-zod-blind-loop.md',
  'docs/proposals/2026-05-24-interaction-ownership-incubation.md',
  'docs/proposals/2026-05-24-interaction-ownership-technical-research.md',
  'docs/proposals/2026-05-26-interaction-declarative-interface-references.md',
  'dist/index.js',
  'dist/index.js.map',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.ts',
  'dist/index.d.cts',
  'dist/core.js',
  'dist/core.js.map',
  'dist/core.cjs',
  'dist/core.cjs.map',
  'dist/core.d.ts',
  'dist/core.d.cts',
  'dist/react.js',
  'dist/react.js.map',
  'dist/react.cjs',
  'dist/react.cjs.map',
  'dist/react.d.ts',
  'dist/react.d.cts',
]

for (const requiredPath of requiredPackedPaths) {
  if (!packedPaths.has(requiredPath)) failures.push(`packed tarball missing ${requiredPath}`)
}

assertRuntimeExternalImports(packedPaths)
assertPackedMarkdownLinks(packedPaths)
assertPackedMarkdownHasNoDeferredPlaceholders(packedPaths)

for (const declarationPath of requiredPackedPaths.filter(isPublicDeclarationPath)) {
  if (declarationByteBudgets[declarationPath] === undefined) {
    failures.push(`${declarationPath} is missing a declaration size budget`)
  }
}

if (pack.size > maxPackedBytes) failures.push(`packed tarball size ${pack.size} exceeds ${maxPackedBytes} bytes`)
if (pack.unpackedSize > maxUnpackedBytes) failures.push(`unpacked package size ${pack.unpackedSize} exceeds ${maxUnpackedBytes} bytes`)

for (const sideEffectPath of packageJson.sideEffects ?? []) {
  if (typeof sideEffectPath !== 'string') continue
  const packedPath = sideEffectPath.replace(/^\.\//, '')
  if (!packedPaths.has(packedPath)) failures.push(`sideEffects references unpacked path ${sideEffectPath}`)
}

for (const [label, packagePath] of manifestRuntimePaths(packageJson)) {
  const packedPath = packagePath.replace(/^\.\//, '')
  if (!packedPaths.has(packedPath)) failures.push(`${label} references unpacked path ${packagePath}`)
}

for (const file of pack.files) {
  assertPackedTextHasNoHangul(file.path)
  assertPackedTextHasNoSensitiveMaterial(file.path)
  if (!isAllowedPackedPath(file.path)) failures.push(`packed tarball includes unexpected path ${file.path}`)
  if (/^(src|demo|scripts|coverage)\//.test(file.path)) failures.push(`packed tarball includes non-runtime path ${file.path}`)
  if (/\.test\.[cm]?[jt]sx?$/.test(file.path)) failures.push(`packed tarball includes test file ${file.path}`)
  if (/^dist\/.*\.(?:js|cjs)$/.test(file.path)) assertRuntimeSourceMapReference(file.path, packedPaths)
  if (/^dist\/.*\.map$/.test(file.path)) assertPortableSourceMap(file.path)
  if (isPublicDeclarationPath(file.path)) {
    assertDeclarationSizeBudget(file)
    assertDeclarationImports(file.path, packedPaths)
    assertReactFreeDeclarationHasNoLooseAny(file.path)
  }
}

for (const entry of reactFreeEntries()) {
  for (const runtimePath of runtimeClosure(entry.esm)) {
    if (hasReactModuleImport(readFileSync(runtimePath, 'utf8'))) {
      failures.push(`React-free ${entry.label} ESM output imports react: ${relativePath(runtimePath)}`)
    }
  }

  for (const runtimePath of runtimeClosure(entry.cjs)) {
    if (hasReactModuleImport(readFileSync(runtimePath, 'utf8'))) {
      failures.push(`React-free ${entry.label} CJS output imports react: ${relativePath(runtimePath)}`)
    }
  }

  for (const declarationPath of entry.declarations) {
    if (hasReactModuleImport(readFileSync(declarationPath, 'utf8'))) {
      failures.push(`React-free ${entry.label} declarations import react: ${declarationPath}`)
    }
  }
}

if (failures.length > 0) {
  console.error(`Publish readiness check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`Publish readiness covers ${pack.files.length} packed files and npm provenance publish dry-run metadata.`)

function dependencySections(pkg) {
  return {
    dependencies: pkg.dependencies ?? {},
    peerDependencies: pkg.peerDependencies ?? {},
    optionalDependencies: pkg.optionalDependencies ?? {},
    bundledDependencies: pkg.bundledDependencies ?? {},
  }
}

function assertPackageVersion() {
  if (typeof packageJson.version !== 'string' || packageJson.version.length === 0) {
    failures.push('package version is required')
    return
  }
  if (!semverPattern.test(packageJson.version)) {
    failures.push(`package version must be a valid SemVer 2.0.0 version: ${packageJson.version}`)
  }
  if (packageJson.version === '0.0.0') {
    failures.push('package version must be publishable, not 0.0.0')
  }
}

function assertDocumentationMetadata() {
  const readme = readTextIfExists('README.md')
  const apiReference = readTextIfExists('API.md')
  const interfaceStabilityGuide = readTextIfExists('INTERFACE_STABILITY.md')
  const changelog = readTextIfExists('CHANGELOG.md')
  const contributingGuide = readTextIfExists('CONTRIBUTING.md')
  const releaseGuide = readTextIfExists('RELEASE.md')
  const securityPolicy = readTextIfExists('SECURITY.md')
  const license = readTextIfExists('LICENSE')
  const packageName = packageJson.name
  const packageVersion = packageJson.version
  const packageAuthor = packageAuthorName(packageJson.author)

  if (packageName && readme && !readme.startsWith(`# ${packageName}\n`)) {
    failures.push('README title must match package name')
  }
  if (packageName && apiReference && !apiReference.startsWith(`# ${packageName} API Reference\n`)) {
    failures.push('API.md title must match package name')
  }
  if (packageName && interfaceStabilityGuide && !interfaceStabilityGuide.startsWith(`# ${packageName} Interface Stability\n`)) {
    failures.push('INTERFACE_STABILITY.md title must match package name')
  }
  if (readme && !/\bAPI\.md\b/.test(readme)) {
    failures.push('README must link to API.md')
  }
  if (interfaceStabilityGuide && readme && !/\bINTERFACE_STABILITY\.md\b/.test(readme)) {
    failures.push('README must link to INTERFACE_STABILITY.md')
  }
  if (changelog && readme && !/\bCHANGELOG\.md\b/.test(readme)) {
    failures.push('README must link to CHANGELOG.md')
  }
  if (contributingGuide && readme && !/\bCONTRIBUTING\.md\b/.test(readme)) {
    failures.push('README must link to CONTRIBUTING.md')
  }
  if (releaseGuide && readme && !/\bRELEASE\.md\b/.test(readme)) {
    failures.push('README must link to RELEASE.md')
  }
  if (securityPolicy && readme && !/\bSECURITY\.md\b/.test(readme)) {
    failures.push('README must link to SECURITY.md')
  }
  if (license && readme && !/\bLICENSE\b/.test(readme)) {
    failures.push('README must link to LICENSE')
  }
  assertReadmeCompatibility(readme)
  assertReadmeCodeStructure(readme)
  assertInterfaceStabilityGuide(interfaceStabilityGuide)
  if (packageName && readme && !new RegExp(`\\bnpm\\s+install\\s+${escapeRegExp(packageName)}\\b`).test(readme)) {
    failures.push('README must document installing the package by its package name')
  }
  if (
    packageName &&
    packageJson.peerDependencies?.react &&
    readme &&
    !new RegExp(`\\bnpm\\s+install\\s+${escapeRegExp(packageName)}\\s+react\\b`).test(readme)
  ) {
    failures.push('README must document installing react for the React adapter')
  }
  if (packageName && packageJson.exports?.['./core'] && readme && !readme.includes(`${packageName}/core`)) {
    failures.push('README must document the ./core subpath')
  }
  if (packageName && packageJson.exports?.['./react'] && readme && !readme.includes(`${packageName}/react`)) {
    failures.push('README must document the ./react subpath')
  }
  if (packageVersion && changelog && !new RegExp(`^##\\s+${escapeRegExp(packageVersion)}\\s*$`, 'm').test(changelog)) {
    failures.push('CHANGELOG must include the current package version')
  }
  if (packageJson.license === 'MIT' && license && !/^MIT License\s*$/m.test(license)) {
    failures.push('LICENSE must contain the MIT license heading')
  }
  if (packageAuthor && license && !new RegExp(`^Copyright \\(c\\) \\d{4} ${escapeRegExp(packageAuthor)}\\s*$`, 'm').test(license)) {
    failures.push('LICENSE copyright holder must match package author')
  }
  assertContributingGuide(contributingGuide)
  assertReleaseGuide(releaseGuide)
  assertSecurityPolicy(securityPolicy)
}

function assertInterfaceStabilityGuide(source) {
  if (!source) return
  const requiredMarkers = [
    '## Permanent Contract',
    '## Not A Stability Contract',
    '## Breaking Change Rule',
    '## Cleanup Rule',
    '## Validation Gates',
    '@interactive-os/aria/core',
    '@interactive-os/aria/react',
    'PatternData',
    'PatternEvent',
    'PatternDefinition',
    'createPatternRuntime',
    'useXPattern(data, onEvent, options?)',
    'React-free',
  ]
  for (const marker of requiredMarkers) {
    if (!source.includes(marker)) failures.push(`INTERFACE_STABILITY.md must mention ${marker}`)
  }
}

function assertContributingGuide(contributingGuide) {
  if (!contributingGuide) return
  if (!contributingGuide.startsWith('# Contributing\n')) {
    failures.push('CONTRIBUTING.md must start with a Contributing title')
  }

  const requiredMarkers = [
    'npm ci',
    'npm run check',
    'npm run check:source-safety',
    'npm run build',
    'npm run update:api',
    'npm run release:check',
    'npm run check:external',
    'npm run check:signatures',
    'VERIFY_RELEASE_TAG=true',
    'v<package.version>',
    'release-artifacts/',
    'npm-pack.json',
    'npm run check:release-artifacts',
    '@interactive-os/aria/core',
    '@interactive-os/aria/react',
    'npm run check:publish',
  ]
  for (const marker of requiredMarkers) {
    if (!contributingGuide.includes(marker)) failures.push(`CONTRIBUTING.md must include ${marker}`)
  }
}

function assertSecurityPolicy(securityPolicy) {
  if (!securityPolicy) return
  if (!securityPolicy.startsWith('# Security Policy\n')) {
    failures.push('SECURITY.md must start with a Security Policy title')
  }

  const requiredMarkers = [
    '## Supported Versions',
    '## Reporting a Vulnerability',
    'latest published version',
    'private npm owner contact channel',
    'Do not include access tokens, private keys, production data',
  ]
  for (const marker of requiredMarkers) {
    if (!securityPolicy.includes(marker)) failures.push(`SECURITY.md must include ${marker}`)
  }
}

function assertReleaseGuide(releaseGuide) {
  if (!releaseGuide) return
  if (!releaseGuide.startsWith('# Release Checklist\n')) {
    failures.push('RELEASE.md must start with a Release Checklist title')
  }

  const requiredMarkers = [
    'git remote get-url origin',
    'repository',
    'bugs',
    'homepage',
    'npm trusted publisher',
    'Publish Package',
    'GitHub environment `npm`',
    'concurrency grouped by git ref',
    'publish <package.name>@<package.version>',
    'NPM_TOKEN',
    'NODE_AUTH_TOKEN',
    '_authToken',
    'npm run release:check',
    'npm run check:signatures',
    'npm run check:external',
    'v<package.version>',
    'release-artifacts/',
    'npm-pack.json',
    'npm run check:release-artifacts',
    'npm publish --access public --provenance --registry https://registry.npmjs.org/',
  ]
  for (const marker of requiredMarkers) {
    if (!releaseGuide.includes(marker)) failures.push(`RELEASE.md must include ${marker}`)
  }
}

function assertPublishConfig() {
  if (!packageJson.publishConfig || typeof packageJson.publishConfig !== 'object' || Array.isArray(packageJson.publishConfig)) {
    failures.push('publishConfig is required')
    return
  }

  assertExactKeys('publishConfig', packageJson.publishConfig, Object.keys(expectedPublishConfig))
  for (const [key, expected] of Object.entries(expectedPublishConfig)) {
    if (packageJson.publishConfig[key] !== expected) {
      failures.push(`publishConfig.${key} must be ${expected}`)
    }
  }
}

function assertPublicRepositoryMetadata() {
  const originUrl = readGitOriginUrl()
  const originRepository = parseGitHubRepositoryUrl(originUrl)
  const packageRepository = packageRepositoryUrl(packageJson.repository)
  const packageRepositoryInfo = parseGitHubRepositoryUrl(packageRepository)

  if (originUrl && !originRepository) {
    failures.push(`git origin must be a GitHub repository URL for npm trusted publishing metadata: ${originUrl}`)
    return
  }

  if (originRepository) {
    assertGitHubPackageMetadata(originRepository)
    return
  }

  if (!packageRepositoryInfo) {
    failures.push('package repository metadata must use a GitHub repository URL')
    return
  }
  assertGitHubPackageMetadata(packageRepositoryInfo)
}

function readGitOriginUrl() {
  try {
    return execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function packageRepositoryUrl(repository) {
  if (typeof repository === 'string') return repository
  if (repository && typeof repository === 'object' && !Array.isArray(repository) && typeof repository.url === 'string') {
    return repository.url
  }
  return ''
}

function parseGitHubRepositoryUrl(url) {
  if (typeof url !== 'string' || url.trim().length === 0) return null
  const normalizedUrl = url.trim().replace(/^git\+/, '').replace(/\.git$/, '')
  const match = /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([^/\s]+)\/([^/\s]+)$/.exec(normalizedUrl)
  if (!match) return null
  return {
    owner: match[1],
    repo: match[2],
  }
}

function assertGitHubPackageMetadata(repository) {
  const expectedRepository = {
    type: 'git',
    url: `git+https://github.com/${repository.owner}/${repository.repo}.git`,
  }
  const expectedBugs = {
    url: `https://github.com/${repository.owner}/${repository.repo}/issues`,
  }
  const expectedHomepage = githubPagesHomepage(repository)

  if (!packageJson.repository || typeof packageJson.repository !== 'object' || Array.isArray(packageJson.repository)) {
    failures.push('package repository metadata must be an object with type and url')
  } else {
    assertExactKeys('repository', packageJson.repository, ['type', 'url'])
    assertJsonEqual('repository', packageJson.repository, expectedRepository)
  }

  if (!packageJson.bugs || typeof packageJson.bugs !== 'object' || Array.isArray(packageJson.bugs)) {
    failures.push('package bugs metadata must be an object with url')
  } else {
    assertExactKeys('bugs', packageJson.bugs, ['url'])
    assertJsonEqual('bugs', packageJson.bugs, expectedBugs)
  }

  if (packageJson.homepage !== expectedHomepage) {
    failures.push(`homepage must be ${expectedHomepage}`)
  }
}

function githubPagesHomepage(repository) {
  return `https://${repository.owner}.github.io/${repository.repo}/`
}

function assertReadmeCompatibility(readme) {
  if (!readme) return
  const section = readSection(readme, 'Compatibility')
  if (!section) {
    failures.push('README must document runtime compatibility')
    return
  }

  const plainSection = section.replace(/`/g, '')
  const nodeRange = packageJson.engines?.node
  const reactRange = packageJson.peerDependencies?.react
  const packageManager = packageJson.packageManager

  if (nodeRange && !plainSection.includes(`Node.js ${nodeRange}`)) {
    failures.push(`README Compatibility must document Node.js ${nodeRange}`)
  }
  if (packageManager && !plainSection.includes(`Release verification uses ${packageManager}`)) {
    failures.push(`README Compatibility must document release verification with ${packageManager}`)
  }
  if (reactRange && !plainSection.includes(`React ${reactRange}`)) {
    failures.push(`README Compatibility must document React ${reactRange}`)
  }
  if (reactRange && !plainSection.includes('optional peer dependency')) {
    failures.push('README Compatibility must document React as an optional peer dependency')
  }
  if (packageJson.dependencies?.zod && !plainSection.includes('Runtime dependency: zod')) {
    failures.push('README Compatibility must document zod as the runtime dependency')
  }
  if (packageJson.exports?.['./core'] && !plainSection.includes('core') && !plainSection.includes('./core')) {
    failures.push('README Compatibility must document the React-free core entry')
  }
}

function assertReadmeCodeStructure(readme) {
  if (!readme) return
  const section = readSection(readme, 'Code Structure')
  if (!section) {
    failures.push('README must document the source, demo, and release-script code structure')
    return
  }

  const requiredStructureMarkers = [
    'src/',
    'index.ts: React-free root public entry',
    'core.ts: React-free schema, runtime, and pattern-definition entry',
    'react.ts: React adapter and preset-component entry',
    'schema/: serializable contracts and Zod validators',
    'kernel/: runtime resolution, reducers, events, and state helpers',
    'patterns/: APG definitions, runtime helpers, hooks, and presets',
    'adapters/: React prop, effect, focus, and id helpers',
    'demo/src/',
    'app/: demo shell, routing, source viewer, and repro recorder',
    'patterns/: APG previews, demo data, and APG behavior tests',
    'shared/: demo registry, state hosts, variant controls, and inspectors',
    'scripts/',
    'verify-*.mjs and smoke-*.mjs: API, package, publish, consumer, and demo gates',
  ]

  for (const marker of requiredStructureMarkers) {
    if (!section.includes(marker)) failures.push(`README Code Structure must include ${marker}`)
  }
}

function readSection(source, heading) {
  const match = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, 'm').exec(source)
  if (!match) return ''
  const afterHeading = source.slice(match.index + match[0].length)
  const nextHeadingOffset = afterHeading.search(/\n## /)
  return nextHeadingOffset === -1 ? afterHeading : afterHeading.slice(0, nextHeadingOffset)
}

function assertReadmeCommandExamples() {
  const readme = readFileSync('README.md', 'utf8')
  if (packageJson.packageManager?.startsWith('npm@') && /\b(?:pnpm|yarn)\s+(?:add|install|demo|run)\b/.test(readme)) {
    failures.push('README command examples must use npm because packageManager is npm')
  }

  const scripts = new Set(Object.keys(packageJson.scripts ?? {}))
  for (const [, script] of readme.matchAll(/\bnpm\s+run\s+([A-Za-z0-9:_-]+)/g)) {
    if (!scripts.has(script)) failures.push(`README command references missing package script "${script}"`)
  }
  if (/\bnpm\s+test\b/.test(readme) && !scripts.has('test')) {
    failures.push('README command references missing package script "test"')
  }

  assertReadmePublishCommand(readme)
}

function assertReadmePublishCommand(readme) {
  const publishCommands = [...readme.matchAll(/^\s*npm\s+publish\b[^\r\n]*/gm)].map((match) => match[0].trim())
  if (packageJson.name?.startsWith('@') && packageJson.publishConfig?.access === 'public') {
    if (!publishCommands.some(hasPublicAccessPublishFlag)) {
      failures.push('README must document publishing the scoped package with npm publish --access public')
    }
    for (const command of publishCommands) {
      if (!hasPublicAccessPublishFlag(command)) {
        failures.push(`README npm publish command must include --access public: ${command}`)
      }
    }
  }
  if (packageJson.publishConfig?.provenance === true) {
    if (!publishCommands.some(hasProvenancePublishFlag)) {
      failures.push('README must document publishing with npm provenance')
    }
    for (const command of publishCommands) {
      if (!hasProvenancePublishFlag(command)) {
        failures.push(`README npm publish command must include --provenance: ${command}`)
      }
    }
  }
  if (packageJson.publishConfig?.registry) {
    if (!publishCommands.some(hasRegistryPublishFlag)) {
      failures.push('README must document publishing to the public npm registry')
    }
    for (const command of publishCommands) {
      if (!hasRegistryPublishFlag(command)) {
        failures.push(`README npm publish command must include the public npm registry: ${command}`)
      }
    }
  }

  const releaseCheckIndex = readme.indexOf('npm run release:check')
  const publishIndexes = publishCommands.map((command) => readme.indexOf(command)).filter((index) => index >= 0)
  const publishIndex = publishIndexes.length > 0 ? Math.min(...publishIndexes) : -1
  if (publishIndex >= 0 && (releaseCheckIndex < 0 || publishIndex < releaseCheckIndex)) {
    failures.push('README must document npm run release:check before npm publish --access public')
  }
}

function hasPublicAccessPublishFlag(command) {
  return /(?:^|\s)--access(?:=|\s+)public(?:\s|$)/.test(command)
}

function hasProvenancePublishFlag(command) {
  return /(?:^|\s)--provenance(?:\s|$)/.test(command)
}

function hasRegistryPublishFlag(command) {
  return /(?:^|\s)--registry(?:=|\s+)https:\/\/registry\.npmjs\.org\/?(?:\s|$)/.test(command)
}

function assertPackageScripts() {
  const scripts = packageJson.scripts ?? {}
  if (scripts.prepublishOnly !== 'npm run release:check') {
    failures.push('prepublishOnly must run npm run release:check')
  }
  if (scripts['release:check'] !== 'npm run check && npm run check:signatures && npm run check:registry && npm run check:release-ref') {
    failures.push('release:check must run npm run check && npm run check:signatures && npm run check:registry && npm run check:release-ref')
  }
  if (scripts['check:signatures'] !== 'npm audit signatures') {
    failures.push('check:signatures must run npm audit signatures')
  }
  if (scripts['check:source-safety'] !== 'node scripts/verify-public-source-safety.mjs') {
    failures.push('check:source-safety must run node scripts/verify-public-source-safety.mjs')
  }
  if (scripts['check:release-ref'] !== 'node scripts/verify-release-git-ref.mjs') {
    failures.push('check:release-ref must run node scripts/verify-release-git-ref.mjs')
  }
  if (scripts['check:release-artifacts'] !== 'node scripts/verify-release-artifacts.mjs') {
    failures.push('check:release-artifacts must run node scripts/verify-release-artifacts.mjs')
  }
  if (scripts['check:external'] !== 'node scripts/verify-external-release-state.mjs') {
    failures.push('check:external must run node scripts/verify-external-release-state.mjs')
  }
  if (scripts['check:react-peer'] !== 'node scripts/verify-react-peer-compatibility.mjs') {
    failures.push('check:react-peer must run node scripts/verify-react-peer-compatibility.mjs')
  }
  if (!scripts.check?.includes('npm run check:react-peer')) {
    failures.push('check must run npm run check:react-peer')
  }
  if (!scripts.check?.includes('npm run check:source-safety')) {
    failures.push('check must run npm run check:source-safety')
  }

  for (const script of forbiddenLifecycleScripts()) {
    if (Object.hasOwn(scripts, script)) failures.push(`package script "${script}" must not run during install or pack`)
  }
}

function forbiddenLifecycleScripts() {
  return [
    'preinstall',
    'install',
    'postinstall',
    'prepare',
    'prepack',
    'postpack',
    'prepublish',
    'publish',
    'postpublish',
  ]
}

function assertPackageLock() {
  const packageLock = readJsonIfExists('package-lock.json')
  if (!packageLock) {
    failures.push('package-lock.json is required for reproducible publish checks')
    return
  }

  if (packageLock.lockfileVersion !== 3) failures.push('package-lock.json must use lockfileVersion 3')
  assertJsonEqual('package-lock name', packageLock.name, packageJson.name)
  assertJsonEqual('package-lock version', packageLock.version, packageJson.version)

  const rootPackage = packageLock.packages?.['']
  if (!rootPackage || typeof rootPackage !== 'object' || Array.isArray(rootPackage)) {
    failures.push('package-lock.json must contain packages[""] root metadata')
    return
  }

  assertJsonEqual('package-lock root name', rootPackage.name, packageJson.name)
  assertJsonEqual('package-lock root version', rootPackage.version, packageJson.version)
  assertJsonEqual('package-lock root license', rootPackage.license, packageJson.license)
  assertJsonEqual('package-lock root engines', rootPackage.engines ?? {}, packageJson.engines ?? {})
  assertJsonEqual('package-lock root dependencies', rootPackage.dependencies ?? {}, packageJson.dependencies ?? {})
  assertJsonEqual('package-lock root devDependencies', rootPackage.devDependencies ?? {}, packageJson.devDependencies ?? {})
  assertJsonEqual('package-lock root peerDependencies', rootPackage.peerDependencies ?? {}, packageJson.peerDependencies ?? {})
  assertJsonEqual(
    'package-lock root peerDependenciesMeta',
    rootPackage.peerDependenciesMeta ?? {},
    packageJson.peerDependenciesMeta ?? {},
  )
  assertPackageLockRuntimeDependencies(packageLock)
}

function assertPackageLockRuntimeDependencies(packageLock) {
  for (const [name, spec] of Object.entries(packageJson.dependencies ?? {})) {
    const lockPath = `node_modules/${name}`
    const lockPackage = packageLock.packages?.[lockPath]
    if (!lockPackage || typeof lockPackage !== 'object' || Array.isArray(lockPackage)) {
      failures.push(`package-lock.json is missing runtime dependency ${lockPath}`)
      continue
    }

    if (!semverPattern.test(lockPackage.version ?? '')) {
      failures.push(`package-lock runtime dependency ${name} must resolve to a SemVer version`)
    }
    if (!matchesDeclaredDependencySpec(lockPackage.version, spec)) {
      failures.push(`package-lock runtime dependency ${name}@${lockPackage.version} must satisfy ${spec}`)
    }
    if (lockPackage.dev === true) failures.push(`package-lock runtime dependency ${name} must not be marked dev`)
    if (lockPackage.optional === true) failures.push(`package-lock runtime dependency ${name} must not be optional`)
    if (lockPackage.hasInstallScript === true) {
      failures.push(`package-lock runtime dependency ${name} must not run install scripts`)
    }
    if (lockPackage.dependencies && Object.keys(lockPackage.dependencies).length > 0) {
      failures.push(`package-lock runtime dependency ${name} must not add transitive runtime dependencies`)
    }
    if (!runtimeDependencyResolvedPattern(name).test(lockPackage.resolved ?? '')) {
      failures.push(`package-lock runtime dependency ${name} must resolve from the npm registry`)
    }
    if (!/^sha512-[A-Za-z0-9+/=]+$/.test(lockPackage.integrity ?? '')) {
      failures.push(`package-lock runtime dependency ${name} must include sha512 integrity`)
    }

    const allowedLicenses = allowedRuntimeDependencyLicenses[name]
    if (!allowedLicenses) {
      failures.push(`package-lock runtime dependency ${name} is missing an allowed license policy`)
    } else if (!allowedLicenses.has(lockPackage.license)) {
      failures.push(`package-lock runtime dependency ${name} license ${lockPackage.license} is not allowed`)
    }
  }
}

function matchesDeclaredDependencySpec(version, spec) {
  if (typeof version !== 'string' || typeof spec !== 'string') return false
  if (spec.startsWith('^')) {
    const [major, minor, patch] = version.split('.').map((part) => Number.parseInt(part, 10))
    const [minMajor, minMinor, minPatch] = spec.slice(1).split('.').map((part) => Number.parseInt(part, 10))
    if ([major, minor, patch, minMajor, minMinor, minPatch].some((part) => Number.isNaN(part))) return false
    if (major !== minMajor) return false
    if (minor < minMinor || (minor === minMinor && patch < minPatch)) return false
    if (minMajor === 0 && minMinor === 0) return minor === minMinor && patch === minPatch
    if (minMajor === 0) return minor === minMinor
    return true
  }
  return version === spec
}

function runtimeDependencyResolvedPattern(name) {
  return new RegExp(`^https://registry\\.npmjs\\.org/${escapeRegExp(name)}/-/`)
}

function assertPackageFiles() {
  if (!Array.isArray(packageJson.files)) {
    failures.push('files must be an explicit publish whitelist')
    return
  }

  const expected = new Set(expectedPackageFiles)
  const seen = new Set()
  for (const file of packageJson.files) {
    if (typeof file !== 'string') {
      failures.push('files entries must be strings')
      continue
    }
    if (seen.has(file)) failures.push(`files contains duplicate entry ${file}`)
    seen.add(file)
    if (!expected.has(file)) failures.push(`files contains unexpected entry ${file}`)
  }

  for (const file of expectedPackageFiles) {
    if (!seen.has(file)) failures.push(`files must include ${file}`)
  }
}

function assertPackageKeywords() {
  if (!Array.isArray(packageJson.keywords) || packageJson.keywords.length === 0) {
    failures.push('package keywords are required for npm discoverability')
    return
  }

  const seen = new Set()
  for (const keyword of packageJson.keywords) {
    if (typeof keyword !== 'string') {
      failures.push('package keywords must be strings')
      continue
    }
    if (keyword.length === 0 || keyword.trim() !== keyword) {
      failures.push(`package keyword must be non-empty and trimmed: ${JSON.stringify(keyword)}`)
      continue
    }
    if (keyword !== keyword.toLowerCase() || !/^[a-z0-9][a-z0-9-]*$/.test(keyword)) {
      failures.push(`package keyword must be lowercase npm-search text: ${keyword}`)
    }
    if (seen.has(keyword)) failures.push(`package keywords contains duplicate entry ${keyword}`)
    seen.add(keyword)
  }

  for (const keyword of requiredPackageKeywords) {
    if (!seen.has(keyword)) failures.push(`package keywords must include ${keyword}`)
  }
}

function readTextIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    failures.push(`${path} must contain valid JSON: ${error.message}`)
    return null
  }
}

function assertJsonEqual(label, actual, expected) {
  const actualSource = JSON.stringify(sortJson(actual))
  const expectedSource = JSON.stringify(sortJson(expected))
  if (actualSource !== expectedSource) failures.push(`${label} must match package.json`)
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]))
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function assertPinnedPackageManagerVersion(expectedVersion) {
  let actualVersion
  try {
    actualVersion = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim()
  } catch (error) {
    failures.push(`could not verify npm version from packageManager: ${error.message}`)
    return
  }

  if (actualVersion !== expectedVersion) {
    failures.push(`npm --version must match packageManager ${packageJson.packageManager}; actual npm@${actualVersion}`)
  }
}

function packageAuthorName(author) {
  if (typeof author === 'string') return author.trim()
  if (author && typeof author === 'object' && typeof author.name === 'string') return author.name.trim()
  return ''
}

function assertDependencyNames(section, dependencies, expectedNames) {
  const names = dependencies
    ? Array.isArray(dependencies)
      ? dependencies
      : Object.keys(dependencies)
    : []
  const expected = new Set(expectedNames)
  for (const name of names) {
    if (!expected.has(name)) failures.push(`${section}.${name} is not part of the publish dependency surface`)
  }
  for (const name of expected) {
    if (!names.includes(name)) failures.push(`${section}.${name} is required`)
  }
}

function reactFreeEntries() {
  return [
    {
      label: 'root',
      esm: 'dist/index.js',
      cjs: 'dist/index.cjs',
      declarations: ['dist/index.d.ts', 'dist/index.d.cts'],
    },
    {
      label: 'core',
      esm: 'dist/core.js',
      cjs: 'dist/core.cjs',
      declarations: ['dist/core.d.ts', 'dist/core.d.cts'],
    },
  ]
}

function assertPublicExports() {
  if (!packageJson.exports || typeof packageJson.exports !== 'object' || Array.isArray(packageJson.exports)) {
    failures.push('exports must be an object')
    return
  }

  assertExactKeys('exports', packageJson.exports, expectedExportSubpaths)
  for (const [subpath, expected] of Object.entries(expectedExportEntries)) {
    assertExportConditions(subpath, packageJson.exports[subpath], expected)
  }
  if (packageJson.exports['./package.json'] !== './package.json') {
    failures.push('exports["./package.json"] must expose package metadata')
  }
  if (packageJson.main !== expectedExportEntries['.'].require.default) {
    failures.push(`main must match exports["."].require.default ${expectedExportEntries['.'].require.default}`)
  }
  if (packageJson.module !== expectedExportEntries['.'].import.default) {
    failures.push(`module must match exports["."].import.default ${expectedExportEntries['.'].import.default}`)
  }
  if (packageJson.types !== expectedExportEntries['.'].import.types) {
    failures.push(`types must match exports["."].import.types ${expectedExportEntries['.'].import.types}`)
  }
}

function assertExportConditions(subpath, entry, expected) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    failures.push(`exports["${subpath}"] is required`)
    return
  }
  assertExactKeys(`exports["${subpath}"]`, entry, ['import', 'require'])
  assertConditionalExportBranch(subpath, 'import', entry.import, expected.import)
  assertConditionalExportBranch(subpath, 'require', entry.require, expected.require)
}

function assertConditionalExportBranch(subpath, condition, entry, expected) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    failures.push(`exports["${subpath}"].${condition} is required`)
    return
  }
  assertExactKeys(`exports["${subpath}"].${condition}`, entry, ['types', 'default'])
  for (const branchCondition of ['types', 'default']) {
    if (entry[branchCondition] !== expected[branchCondition]) {
      failures.push(`exports["${subpath}"].${condition}.${branchCondition} must be ${expected[branchCondition]}`)
    }
  }
}

function assertExactKeys(label, value, expectedKeys) {
  const expected = new Set(expectedKeys)
  const actualKeys = Object.keys(value)
  for (const key of actualKeys) {
    if (!expected.has(key)) failures.push(`${label} contains unexpected key ${key}`)
  }
  for (const key of expectedKeys) {
    if (!Object.hasOwn(value, key)) failures.push(`${label} is missing ${key}`)
  }
  if (actualKeys.length === expectedKeys.length && actualKeys.some((key, index) => key !== expectedKeys[index])) {
    failures.push(`${label} keys must stay ordered as ${expectedKeys.join(', ')}`)
  }
}

function readPackManifest() {
  const stdout = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })
  const result = JSON.parse(stdout)
  if (!Array.isArray(result) || !result[0]?.files) throw new Error('npm pack --dry-run did not return file metadata')
  return result[0]
}

function readPublishDryRunManifest() {
  const stdout = execFileSync('npm', ['publish', '--dry-run', '--ignore-scripts', '--provenance', '--json'], {
    encoding: 'utf8',
  })
  const result = JSON.parse(stdout)
  if (!result || typeof result !== 'object' || Array.isArray(result) || !Array.isArray(result.files)) {
    throw new Error('npm publish --dry-run --provenance did not return file metadata')
  }
  return result
}

function assertPackMetadata(pack) {
  if (pack.name !== packageJson.name) failures.push(`npm pack name must be ${packageJson.name}`)
  if (pack.version !== packageJson.version) failures.push(`npm pack version must be ${packageJson.version}`)
  if (pack.id !== `${packageJson.name}@${packageJson.version}`) {
    failures.push(`npm pack id must be ${packageJson.name}@${packageJson.version}`)
  }
  if (pack.filename !== expectedPackFilename()) {
    failures.push(`npm pack filename must be ${expectedPackFilename()}`)
  }
  if (!/^[a-f0-9]{40}$/.test(pack.shasum ?? '')) failures.push('npm pack must report a sha1 shasum')
  if (!/^sha512-[A-Za-z0-9+/=]+$/.test(pack.integrity ?? '')) failures.push('npm pack must report sha512 integrity')
  if (pack.entryCount !== pack.files.length) failures.push('npm pack entryCount must match files.length')
  if (!Array.isArray(pack.bundled) || pack.bundled.length > 0) failures.push('npm pack must not bundle dependencies')
}

function assertPublishDryRunMatchesPack(publishDryRun, pack) {
  for (const field of ['id', 'name', 'version', 'size', 'unpackedSize', 'shasum', 'integrity', 'filename', 'entryCount']) {
    if (publishDryRun[field] !== pack[field]) {
      failures.push(`npm publish --dry-run --provenance ${field} must match npm pack --dry-run`)
    }
  }

  if (!Array.isArray(publishDryRun.bundled) || publishDryRun.bundled.length > 0) {
    failures.push('npm publish --dry-run --provenance must not bundle dependencies')
  }

  const packFiles = JSON.stringify(normalizePackFiles(pack.files))
  const publishFiles = JSON.stringify(normalizePackFiles(publishDryRun.files))
  if (publishFiles !== packFiles) {
    failures.push('npm publish --dry-run --provenance file list must match npm pack --dry-run')
  }
}

function normalizePackFiles(files) {
  return [...files]
    .map((file) => ({ path: file.path, size: file.size, mode: file.mode }))
    .sort((left, right) => left.path.localeCompare(right.path))
}

function assertPackFileMetadata(files) {
  const seenPaths = new Set()
  for (const file of files) {
    if (!file || typeof file !== 'object' || Array.isArray(file)) {
      failures.push('npm pack file metadata entries must be objects')
      continue
    }
    if (typeof file.path !== 'string' || file.path.length === 0) {
      failures.push('npm pack file metadata entries must include a path')
      continue
    }
    if (seenPaths.has(file.path)) {
      failures.push(`npm pack file metadata contains duplicate path ${file.path}`)
      continue
    }
    seenPaths.add(file.path)
    if (file.path.startsWith('/') || file.path.includes('\\') || file.path.split('/').includes('..')) {
      failures.push(`npm pack file metadata path must be a portable relative POSIX path: ${file.path}`)
    }
    if (/[\u0000-\u001F\u007F]/.test(file.path)) {
      failures.push(`npm pack file metadata path must not contain control characters: ${JSON.stringify(file.path)}`)
    }
    if (!existsSync(file.path)) {
      failures.push(`npm pack file metadata references missing path ${file.path}`)
      continue
    }

    const fileStat = statSync(file.path)
    if (!fileStat.isFile()) failures.push(`npm pack file metadata path must be a file: ${file.path}`)
    if (file.size !== fileStat.size) {
      failures.push(`npm pack file metadata size for ${file.path} must match filesystem size ${fileStat.size}`)
    }
    if (file.mode !== 0o644) {
      failures.push(`npm pack file metadata mode for ${file.path} must be 0644`)
    }
  }
}

function assertPackedTextHasNoHangul(path) {
  const source = readFileSync(path, 'utf8')
  if (hangulTextPattern.test(source)) {
    failures.push(`${path} contains Hangul text in the published package`)
  }
}

function assertPackedTextHasNoSensitiveMaterial(path) {
  const source = readFileSync(path, 'utf8')
  for (const { label, pattern } of packedSensitiveTextPatterns) {
    if (pattern.test(source)) failures.push(`${path} contains ${label}`)
  }

  for (const match of source.matchAll(packedSensitiveAssignmentPattern)) {
    const [, key, value] = match
    if (isPlaceholderSecretValue(value)) continue
    failures.push(`${path} contains credential-like assignment ${key}`)
  }
}

function isPlaceholderSecretValue(value) {
  return /^(?:x+|<[^>]+>|\$\{[^}]+}|example|placeholder|redacted|your[-_a-z0-9]*|change[-_a-z0-9]*)$/i.test(value)
}

function expectedPackFilename() {
  return `${packageJson.name.replace(/^@/, '').replace(/\//g, '-')}-${packageJson.version}.tgz`
}

function isAllowedPackedPath(path) {
  return requiredPackedPaths.includes(path) || /^dist\/chunk-[A-Z0-9]+\.(?:js|cjs)(?:\.map)?$/.test(path)
}

function assertPackedMarkdownLinks(packedPaths) {
  const markdownPaths = [...packedPaths].filter((path) => /\.md$/i.test(path))
  for (const markdownPath of markdownPaths) {
    const source = readFileSync(markdownPath, 'utf8')
    for (const target of markdownLinkTargets(source)) {
      if (isExternalMarkdownTarget(target)) continue
      const targetPath = normalizeMarkdownTarget(markdownPath, target)
      if (!targetPath) continue
      if (!packedPaths.has(targetPath)) {
        failures.push(`${markdownPath} links to ${target}, but ${targetPath} is not packed`)
      }
    }
  }
}

function assertPackedMarkdownHasNoDeferredPlaceholders(packedPaths) {
  const markdownPaths = [...packedPaths].filter((path) => /\.md$/i.test(path))
  for (const markdownPath of markdownPaths) {
    const source = readFileSync(markdownPath, 'utf8')
    for (const { label, pattern } of packedMarkdownDeferredPlaceholderPatterns) {
      if (pattern.test(source)) failures.push(`${markdownPath} contains ${label}`)
    }
  }
}

function markdownLinkTargets(source) {
  return [...source.matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g)]
    .map((match) => match[1].trim())
    .filter(Boolean)
}

function isExternalMarkdownTarget(target) {
  return /^(?:https?:|mailto:|#)/i.test(target)
}

function normalizeMarkdownTarget(fromPath, target) {
  const withoutHash = target.split('#')[0]
  if (!withoutHash || /^(?:https?:|mailto:)/i.test(withoutHash)) return null
  const normalized = relativePath(resolve(dirname(fromPath), decodeURI(withoutHash))).replace(/\\/g, '/')
  return normalized.startsWith('..') ? null : normalized
}

function isPublicDeclarationPath(path) {
  return /^dist\/(?:index|core|react)\.d\.(ts|cts)$/.test(path)
}

function assertRuntimeExternalImports(packedPaths) {
  const allowedRuntimePackages = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ])
  const seenRuntimePackages = new Set()

  for (const runtimePath of packedPaths) {
    if (!/^dist\/.*\.(?:js|cjs)$/.test(runtimePath)) continue

    const source = stripComments(readFileSync(runtimePath, 'utf8'))
    for (const specifier of runtimeImportSpecifiers(source)) {
      if (specifier.startsWith('.') || specifier.startsWith('node:')) continue

      const packageName = packageNameFromSpecifier(specifier)
      seenRuntimePackages.add(packageName)
      if (!allowedRuntimePackages.has(packageName)) {
        failures.push(`${runtimePath} imports undeclared runtime package ${specifier}`)
      }
    }
  }

  for (const packageName of allowedRuntimePackages) {
    if (!seenRuntimePackages.has(packageName)) {
      failures.push(`runtime output does not keep ${packageName} as an external package import`)
    }
  }
}

function packageNameFromSpecifier(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/')
  return specifier.split('/')[0]
}

function assertDeclarationSizeBudget(file) {
  const maxBytes = declarationByteBudgets[file.path]
  if (maxBytes !== undefined && file.size > maxBytes) {
    failures.push(`${file.path} size ${file.size} exceeds ${maxBytes} bytes`)
  }
}

function assertDeclarationImports(declarationPath, packedPaths) {
  const allowedExternal = allowedDeclarationExternalSpecifiers[declarationPath]
  if (!allowedExternal) {
    failures.push(`${declarationPath} is missing an allowed declaration import specifier list`)
    return
  }

  const source = stripComments(readFileSync(declarationPath, 'utf8'))
  for (const specifier of importSpecifiers(source)) {
    if (specifier.startsWith('.')) {
      const packedDeclarationPath = resolveDeclarationSpecifier(declarationPath, specifier)
      if (!packedDeclarationPath || !packedPaths.has(packedDeclarationPath)) {
        failures.push(`${declarationPath} imports unpacked declaration path ${specifier}`)
      }
      continue
    }

    if (!allowedExternal.has(specifier)) {
      failures.push(`${declarationPath} exposes unexpected external declaration import ${specifier}`)
    }
  }
}

function assertReactFreeDeclarationHasNoLooseAny(declarationPath) {
  if (!/^dist\/(?:index|core)\.d\.(?:ts|cts)$/.test(declarationPath)) return

  const source = stripStringLiterals(stripComments(readFileSync(declarationPath, 'utf8')))
  if (/(^|[^A-Za-z0-9_$]):\s*any\b/.test(source)) {
    failures.push(`${declarationPath} exposes a loose any annotation`)
  }
}

function resolveDeclarationSpecifier(fromPath, specifier) {
  const resolved = relativePath(resolve(dirname(fromPath), specifier))
  if (resolved.endsWith('.d.ts') || resolved.endsWith('.d.cts')) return resolved
  if (resolved.endsWith('.js')) return `${resolved.slice(0, -3)}.d.ts`
  if (resolved.endsWith('.cjs')) return `${resolved.slice(0, -4)}.d.cts`
  return null
}

function assertRuntimeSourceMapReference(runtimePath, packedPaths) {
  const source = readFileSync(runtimePath, 'utf8')
  const expectedMapPath = `${runtimePath}.map`
  const expectedSpecifier = expectedMapPath.replace(/^dist\//, '')
  const matches = [...source.matchAll(/\/\/# sourceMappingURL=([^\r\n]+)/g)].map((match) => match[1].trim())
  if (matches.length !== 1) {
    failures.push(`${runtimePath} must contain exactly one sourceMappingURL comment`)
    return
  }
  if (matches[0] !== expectedSpecifier) failures.push(`${runtimePath} sourceMappingURL must be ${expectedSpecifier}`)
  if (!packedPaths.has(expectedMapPath)) failures.push(`${runtimePath} sourceMappingURL references unpacked path ${expectedMapPath}`)
}

function assertPortableSourceMap(mapPath) {
  const source = readFileSync(mapPath, 'utf8')
  const localPaths = [process.cwd(), process.env.HOME].filter(Boolean)
  for (const localPath of localPaths) {
    if (source.includes(localPath)) failures.push(`${mapPath} contains local filesystem path ${localPath}`)
  }

  let map
  try {
    map = JSON.parse(source)
  } catch {
    failures.push(`${mapPath} must be valid JSON`)
    return
  }

  if (map.version !== 3) failures.push(`${mapPath} must be a v3 source map`)
  if (typeof map.sourceRoot === 'string' && map.sourceRoot.length > 0) {
    failures.push(`${mapPath} must not use sourceRoot because packed sourcemaps should be portable`)
  }

  for (const sourcePath of map.sources ?? []) {
    if (/^(?:\/|[A-Za-z]:[\\/]|file:|https?:)/.test(sourcePath)) {
      failures.push(`${mapPath} contains non-portable source path ${sourcePath}`)
    }
    if (sourcePath.includes('node_modules/')) failures.push(`${mapPath} contains dependency source path ${sourcePath}`)
    if (!sourcePath.startsWith('../src/')) failures.push(`${mapPath} source path must stay under ../src/: ${sourcePath}`)
  }

  assertSourceMapContent(mapPath, map)
}

function assertSourceMapContent(mapPath, map) {
  const sources = Array.isArray(map.sources) ? map.sources : []
  if (sources.length === 0) return

  if (!Array.isArray(map.sourcesContent)) {
    failures.push(`${mapPath} must include sourcesContent for package debugging`)
    return
  }
  if (map.sourcesContent.length !== sources.length) {
    failures.push(`${mapPath} sourcesContent length must match sources length`)
  }
  for (let index = 0; index < map.sourcesContent.length; index += 1) {
    if (typeof map.sourcesContent[index] !== 'string' || map.sourcesContent[index].length === 0) {
      failures.push(`${mapPath} sourcesContent[${index}] must contain source text`)
    }
  }
}

function manifestRuntimePaths(pkg) {
  const paths = []
  for (const field of ['main', 'module', 'types']) {
    if (typeof pkg[field] === 'string') paths.push([field, pkg[field]])
  }
  collectExportPaths(pkg.exports, 'exports', paths)
  return paths
}

function collectExportPaths(value, label, paths) {
  if (typeof value === 'string') {
    paths.push([label, value])
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    collectExportPaths(child, `${label}.${key}`, paths)
  }
}

function runtimeClosure(entryPath) {
  const out = []
  const seen = new Set()
  visitRuntimePath(resolve(entryPath), out, seen)
  return out
}

function visitRuntimePath(path, out, seen) {
  if (seen.has(path)) return
  seen.add(path)
  out.push(path)
  const source = readFileSync(path, 'utf8')
  for (const specifier of runtimeImportSpecifiers(source)) {
    if (!specifier.startsWith('.')) continue
    visitRuntimePath(resolve(dirname(path), specifier), out, seen)
  }
}

function runtimeImportSpecifiers(source) {
  return importSpecifiers(source)
}

function importSpecifiers(source) {
  const specifiers = []
  const importPattern = /\b(?:import|export)\b(?:[^'"]*\bfrom\s*)?['"]([^'"]+)['"]|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  for (const match of source.matchAll(importPattern)) {
    specifiers.push(match[1] ?? match[2] ?? match[3])
  }
  return specifiers
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '')
}

function stripStringLiterals(source) {
  return source.replace(/(['"`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g, '')
}

function hasReactModuleImport(source) {
  return /\b(?:import|export)\b(?:[^'"]*\bfrom\s*)?['"]react['"]|\brequire\s*\(\s*['"]react['"]\s*\)|\bimport\s*\(\s*['"]react['"]\s*\)/.test(source)
}

function relativePath(path) {
  return path.replace(`${process.cwd()}/`, '')
}

function productionIndexImports() {
  const sourceRoot = resolve('src')
  const publicIndex = resolve(sourceRoot, 'index.ts')
  const failures = []

  for (const file of sourceFiles(sourceRoot)) {
    if (resolve(file) === publicIndex) continue
    const source = readFileSync(file, 'utf8')
    for (const specifier of relativeImportSpecifiers(source)) {
      if (resolvesToSourceIndex(file, specifier, publicIndex)) {
        failures.push(`${file}:${specifier}`)
      }
    }
  }

  return failures
}

function sourceFiles(directory) {
  const out = []
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry)
    const testsRoot = resolve('src/tests')
    if (path === testsRoot || path.startsWith(`${testsRoot}/`)) continue
    const stat = statSync(path)
    if (stat.isDirectory()) {
      out.push(...sourceFiles(path))
      continue
    }
    if (/\.(test|d)\.[cm]?[tj]sx?$/.test(path)) continue
    if (/\.[cm]?tsx?$/.test(path)) out.push(path)
  }
  return out
}

function relativeImportSpecifiers(source) {
  const specifiers = []
  const importPattern = /\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]|\bimport\s+['"](\.{1,2}\/[^'"]+)['"]|\bimport\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)|\brequire\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g
  for (const match of source.matchAll(importPattern)) {
    specifiers.push(match[1] ?? match[2] ?? match[3] ?? match[4])
  }
  return specifiers
}

function resolvesToSourceIndex(file, specifier, publicIndex) {
  const base = resolve(dirname(file), specifier)
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    resolve(base, 'index.ts'),
    resolve(base, 'index.tsx'),
  ].some((candidate) => candidate === publicIndex)
}
