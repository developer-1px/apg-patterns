import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

if (isMainModule()) {
  main()
}

function main() {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
  const strict = shouldRequireReleaseTag(process.env)
  const result = validateReleaseGitRef(packageJson, process.env, {
    headTags: strict && process.env.GITHUB_ACTIONS !== 'true' ? readHeadTags() : undefined,
  })

  if (result.failures.length > 0) {
    console.error(`Release git ref check failed:\n${result.failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exit(1)
  }

  console.log(`Release git ref check expects ${expectedReleaseTag(packageJson.version)}${formatNotes(result.notes)}`)
}

export function validateReleaseGitRef(packageJson, env = {}, options = {}) {
  const failures = []
  const notes = []
  const version = packageJson.version

  if (typeof version !== 'string' || version.length === 0) {
    failures.push('package version is required before validating the release git ref')
    return { failures, notes }
  }

  const expectedTag = expectedReleaseTag(version)
  if (!shouldRequireReleaseTag(env)) {
    notes.push('tag enforcement is disabled; set VERIFY_RELEASE_TAG=true for publish workflows')
    return { failures, notes }
  }

  if (env.GITHUB_ACTIONS === 'true') {
    if (env.GITHUB_REF_TYPE !== 'tag') {
      failures.push(`publish workflow must run from git tag ${expectedTag}, not ${env.GITHUB_REF_TYPE || 'unknown ref type'}`)
    }
    if (env.GITHUB_REF_NAME !== expectedTag) {
      failures.push(`publish workflow git ref must be ${expectedTag}, not ${env.GITHUB_REF_NAME || 'unknown ref'}`)
    }
    return { failures, notes }
  }

  const headTags = options.headTags ?? []
  if (!headTags.includes(expectedTag)) {
    failures.push(`local publish preflight must run at git tag ${expectedTag}`)
  }
  return { failures, notes }
}

export function shouldRequireReleaseTag(env = {}) {
  return env.VERIFY_RELEASE_TAG === 'true' || env.GITHUB_WORKFLOW === 'Publish Package'
}

export function expectedReleaseTag(version) {
  return `v${version}`
}

function readHeadTags() {
  const result = spawnSync('git', ['tag', '--points-at', 'HEAD'], { encoding: 'utf8' })
  if (result.status !== 0) return []
  return result.stdout.split(/\r?\n/).map((tag) => tag.trim()).filter(Boolean)
}

function formatNotes(notes) {
  if (notes.length === 0) return '.'
  return `; ${notes.join('; ')}.`
}

function isMainModule() {
  return process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}
