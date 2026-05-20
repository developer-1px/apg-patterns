import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const trackedFiles = gitFiles(['ls-files'])
const ignoredTrackedFiles = gitFiles(['ls-files', '-i', '--exclude-standard', '-c'])
const releaseCheckWorkflowPath = '.github/workflows/release-check.yml'
const publishWorkflowPath = '.github/workflows/publish.yml'
const checkoutActionRef = 'actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd'
const setupNodeActionRef = 'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e'
const uploadArtifactActionRef = 'actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02'
const forbiddenNpmTokenAuthMarkers = [
  'NPM_TOKEN',
  'NODE_AUTH_TOKEN',
  '//registry.npmjs.org/:_authToken',
  '_authToken',
  'npm token',
]
const forbiddenTrackedRules = [
  {
    label: 'coverage output',
    matches: (path) => path.startsWith('coverage/'),
  },
  {
    label: 'package build output',
    matches: (path) => path.startsWith('dist/'),
  },
  {
    label: 'demo build output',
    matches: (path) => path.startsWith('demo/dist/'),
  },
  {
    label: 'release artifacts',
    matches: (path) => path.startsWith('release-artifacts/'),
  },
  {
    label: 'installed dependencies',
    matches: (path) => path.startsWith('node_modules/'),
  },
  {
    label: 'Codex local environment files',
    matches: (path) => path.startsWith('.codex/'),
  },
  {
    label: 'IDE project files',
    matches: (path) => path.startsWith('.idea/'),
  },
  {
    label: 'local Claude lock files',
    matches: (path) => /^\.claude\/.*\.lock$/.test(path),
  },
  {
    label: 'local environment files',
    matches: (path) => path === '.env' || path === '.env.local' || path.endsWith('/.env') || path.endsWith('/.env.local'),
  },
  {
    label: 'local log files',
    matches: (path) => path.endsWith('.log'),
  },
  {
    label: 'macOS metadata',
    matches: (path) => path === '.DS_Store' || path.endsWith('/.DS_Store'),
  },
]

const failures = []

if (ignoredTrackedFiles.length > 0) {
  failures.push(`git tracks files that are ignored by .gitignore:\n${formatList(ignoredTrackedFiles)}`)
}

for (const rule of forbiddenTrackedRules) {
  const matches = trackedFiles.filter(rule.matches)
  if (matches.length > 0) {
    failures.push(`git tracks ${rule.label}:\n${formatList(matches)}`)
  }
}

assertBugDocsResolved()
assertReleaseCheckWorkflow()
assertPublishWorkflow()

if (failures.length > 0) {
  console.error(`Repository hygiene check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`Repository hygiene covers ${trackedFiles.length} tracked files.`)

function gitFiles(args) {
  const stdout = execFileSync('git', [...args, '-z'], { encoding: 'utf8' })
  return stdout.split('\0').filter(Boolean).sort((left, right) => left.localeCompare(right))
}

function formatList(paths) {
  return paths.map((path) => `  ${path}`).join('\n')
}

function assertBugDocsResolved() {
  const bugDocs = trackedFiles.filter((path) => /^docs\/bugs\/.+\.md$/.test(path))
  for (const path of bugDocs) {
    const source = readFileSync(path, 'utf8')
    if (!/^- Status:\s+Resolved\s*$/m.test(source)) {
      failures.push(`${path} must be marked "Status: Resolved" before release`)
    }
    if (!/^- Progress:\s+100\s*\/\s*100\s*$/m.test(source)) {
      failures.push(`${path} must be marked "Progress: 100 / 100" before release`)
    }
    if (!/^- Resolution:\s+\S.+$/m.test(source)) {
      failures.push(`${path} must include a concrete Resolution line`)
    }
  }
}

function assertReleaseCheckWorkflow() {
  const source = readTrackedWorkflow(releaseCheckWorkflowPath, 'external release verification')
  assertWorkflowIncludes(releaseCheckWorkflowPath, source, [
    'pull_request:',
    'branches:',
    '- main',
    checkoutActionRef,
    setupNodeActionRef,
    'node-version: 24',
    'registry-url: https://registry.npmjs.org',
    'package-manager-cache: false',
    'npm install -g npm@11.6.2',
    'npm ci',
    'npm run release:check',
    'npm pack --pack-destination release-artifacts --json > release-artifacts/npm-pack.json',
    uploadArtifactActionRef,
    'if-no-files-found: error',
    'contents: read',
  ])
}

function assertPublishWorkflow() {
  const source = readTrackedWorkflow(publishWorkflowPath, 'npm trusted publishing')
  assertWorkflowIncludes(publishWorkflowPath, source, [
    'workflow_dispatch:',
    'contents: read',
    'id-token: write',
    'environment: npm',
    checkoutActionRef,
    setupNodeActionRef,
    'node-version: 24',
    'registry-url: https://registry.npmjs.org',
    'package-manager-cache: false',
    'npm install -g npm@11.6.2',
    'npm ci',
    'npm run release:check',
    "VERIFY_RELEASE_TAG: 'true'",
    'npm pack --pack-destination release-artifacts --json > release-artifacts/npm-pack.json',
    uploadArtifactActionRef,
    'if-no-files-found: error',
    'npm publish --access public --provenance --registry https://registry.npmjs.org/',
  ])
  assertWorkflowExcludes(publishWorkflowPath, source, forbiddenNpmTokenAuthMarkers)
}

function readTrackedWorkflow(path, purpose) {
  if (!trackedFiles.includes(path)) {
    failures.push(`${path} must be tracked for ${purpose}`)
    return ''
  }
  if (!existsSync(path)) {
    failures.push(`${path} is required for ${purpose}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

function assertWorkflowIncludes(path, source, requiredMarkers) {
  assertWorkflowActionsPinned(path, source)
  for (const marker of requiredMarkers) {
    if (!source.includes(marker)) failures.push(`${path} must include ${marker}`)
  }
}

function assertWorkflowExcludes(path, source, forbiddenMarkers) {
  for (const marker of forbiddenMarkers) {
    if (source.includes(marker)) failures.push(`${path} must not include static npm token auth marker ${marker}`)
  }
}

function assertWorkflowActionsPinned(path, source) {
  for (const match of source.matchAll(/^\s*uses:\s*([^@\s]+)@([^\s#]+)/gm)) {
    const [, action, ref] = match
    if (!/^[a-f0-9]{40}$/.test(ref)) {
      failures.push(`${path} must pin ${action} to a full commit SHA, not ${ref}`)
    }
  }
}
