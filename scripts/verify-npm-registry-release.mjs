import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const publicNpmRegistry = 'https://registry.npmjs.org/'

if (isMainModule()) {
  main()
}

function main() {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
  const failures = validatePackageRegistryConfig(packageJson, publicNpmRegistry)
  const notes = []

  if (packageJson.name && packageJson.version) {
    const registryState = readRegistryReleaseState(packageJson.name, packageJson.version, publicNpmRegistry)
    failures.push(...registryState.failures)
    notes.push(...registryState.notes)
  }

  if (failures.length > 0) {
    console.error(`npm registry release preflight failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exit(1)
  }

  console.log(`${packageJson.name}@${packageJson.version} is not published on ${publicNpmRegistry}${formatNotes(notes)}`)
}

export function validatePackageRegistryConfig(packageJson, registry = publicNpmRegistry) {
  const failures = []
  if (!packageJson.name) failures.push('package name is required')
  if (!packageJson.version) failures.push('package version is required')
  if (packageJson.private === true) failures.push('package must not be private')
  if (packageJson.name?.startsWith('@') && packageJson.publishConfig?.access !== 'public') {
    failures.push('scoped package must set publishConfig.access to public')
  }
  if (packageJson.publishConfig?.registry !== registry) {
    failures.push(`publishConfig.registry must be ${registry}`)
  }
  return failures
}

function readRegistryReleaseState(name, version, registry) {
  const result = spawnSync('npm', [
    'view',
    name,
    'version',
    'versions',
    'dist-tags',
    '--json',
    '--registry',
    registry,
    '--loglevel',
    'silent',
  ], {
    encoding: 'utf8',
  })

  if (result.status === 0) {
    return validateRegistryMetadata(name, version, readJsonOutput(result.stdout), registry)
  }

  const output = `${result.stdout}\n${result.stderr}`
  if (isNotFoundOutput(output)) {
    return {
      failures: [],
      notes: ['package name has no published versions'],
    }
  }

  return {
    failures: [`could not verify ${name}@${version} on ${registry}: ${output.trim() || `npm exited with status ${result.status}`}`],
    notes: [],
  }
}

export function validateRegistryMetadata(name, version, metadata, registry = publicNpmRegistry) {
  const failures = []
  const notes = []

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {
      failures: [`npm registry returned unexpected package metadata for ${name}`],
      notes,
    }
  }

  const versions = normalizeVersions(metadata.versions)
  const latestVersion = metadata['dist-tags']?.latest ?? metadata.version

  if (versions.includes(version) || metadata.version === version) {
    failures.push(`${name}@${version} is already published on ${registry}`)
  }

  if (latestVersion) {
    const comparison = compareSemver(version, latestVersion)
    if (comparison === null) {
      failures.push(`could not compare package version ${version} with latest dist-tag ${latestVersion}`)
    } else if (comparison <= 0) {
      failures.push(`${name}@${version} must be greater than latest dist-tag ${latestVersion} before publishing with the default latest tag`)
    } else {
      notes.push(`latest dist-tag is ${latestVersion}`)
    }
  } else if (versions.length > 0) {
    failures.push(`${name} has published versions but no latest dist-tag on ${registry}`)
  } else {
    notes.push('package name has no published versions')
  }

  return { failures, notes }
}

export function compareSemver(leftVersion, rightVersion) {
  const left = parseSemver(leftVersion)
  const right = parseSemver(rightVersion)
  if (!left || !right) return null

  for (const key of ['major', 'minor', 'patch']) {
    if (left[key] > right[key]) return 1
    if (left[key] < right[key]) return -1
  }

  return comparePrerelease(left.prerelease, right.prerelease)
}

function parseSemver(version) {
  if (typeof version !== 'string') return null
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(version)
  if (!match) return null
  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
    prerelease: match[4] ? match[4].split('.') : [],
  }
}

function comparePrerelease(left, right) {
  if (left.length === 0 && right.length === 0) return 0
  if (left.length === 0) return 1
  if (right.length === 0) return -1

  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    const leftPart = left[index]
    const rightPart = right[index]
    if (leftPart === undefined) return -1
    if (rightPart === undefined) return 1
    const comparison = comparePrereleaseIdentifier(leftPart, rightPart)
    if (comparison !== 0) return comparison
  }

  return 0
}

function comparePrereleaseIdentifier(leftPart, rightPart) {
  const leftNumeric = /^(0|[1-9]\d*)$/.test(leftPart)
  const rightNumeric = /^(0|[1-9]\d*)$/.test(rightPart)

  if (leftNumeric && rightNumeric) {
    const leftNumber = Number.parseInt(leftPart, 10)
    const rightNumber = Number.parseInt(rightPart, 10)
    if (leftNumber > rightNumber) return 1
    if (leftNumber < rightNumber) return -1
    return 0
  }
  if (leftNumeric) return -1
  if (rightNumeric) return 1
  if (leftPart > rightPart) return 1
  if (leftPart < rightPart) return -1
  return 0
}

function normalizeVersions(versions) {
  if (Array.isArray(versions)) return versions.filter((version) => typeof version === 'string')
  if (typeof versions === 'string') return [versions]
  return []
}

function isNotFoundOutput(output) {
  return /\bE404\b/.test(output) || /not found/i.test(output)
}

function formatNotes(notes) {
  if (notes.length === 0) return '.'
  return `; ${notes.join('; ')}.`
}

function isMainModule() {
  return process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
}

export function readJsonOutput(source) {
  try {
    return JSON.parse(source)
  } catch {
    return source.trim()
  }
}
