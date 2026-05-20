import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const secretPatterns = [
  {
    label: 'private key block',
    pattern: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/,
  },
  {
    label: 'npm auth token config',
    pattern: /\/\/registry\.npmjs\.org\/:_authToken\s*=\s*\S+/i,
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

const sensitiveAssignmentPattern =
  /(?:^|[\s"'`{,])([A-Z0-9_]*(?:SECRET|PASSWORD|TOKEN|API[_-]?KEY|AUTH[_-]?TOKEN)[A-Z0-9_]*)\s*[:=]\s*["']?([A-Za-z0-9_./+=:-]{24,})/gi

function main() {
  const files = gitFiles()
  const failures = scanPublicSourceFiles(files)

  if (failures.length > 0) {
    console.error(`Public source safety check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exit(1)
  }

  console.log(`Public source safety scanned ${files.length} tracked files for credential material.`)
}

export function scanPublicSourceFiles(files, readSource = readTrackedText) {
  const failures = []

  for (const file of files) {
    const source = readSource(file)
    if (!source) continue

    for (const { label, pattern } of secretPatterns) {
      if (pattern.test(source)) failures.push(`${file} contains ${label}`)
    }

    sensitiveAssignmentPattern.lastIndex = 0
    for (const match of source.matchAll(sensitiveAssignmentPattern)) {
      const [, name, value] = match
      if (isSafePlaceholder(value)) continue
      failures.push(`${file} contains sensitive assignment ${name}`)
    }
  }

  return failures
}

function gitFiles() {
  const stdout = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  return stdout.split('\0').filter(Boolean).sort((left, right) => left.localeCompare(right))
}

function readTrackedText(file) {
  if (!existsSync(file)) return ''
  const buffer = readFileSync(file)
  if (buffer.includes(0)) return ''
  return buffer.toString('utf8')
}

function isSafePlaceholder(value) {
  return /^(?:x+|\*+|<[^>]+>|\$\{[^}]+\})$/i.test(value)
}

if (isMainModule()) {
  main()
}

function isMainModule() {
  return import.meta.url === pathToFileURL(process.argv[1]).href
}
