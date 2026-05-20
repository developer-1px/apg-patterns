import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const trackedFiles = gitFiles(['ls-files'])
const ignoredTrackedFiles = gitFiles(['ls-files', '-i', '--exclude-standard', '-c'])
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
