import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const defaultArtifactsDir = 'release-artifacts'

function main() {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
  const artifactsDir = process.argv[2] ?? defaultArtifactsDir
  const state = verifyReleaseArtifacts(packageJson, artifactsDir)

  if (state.failures.length > 0) {
    console.error(`Release artifact check failed:\n${state.failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exit(1)
  }

  console.log(`Release artifact check verified ${state.tarballFilename} and npm-pack.json.`)
}

export function verifyReleaseArtifacts(packageJson, artifactsDir = defaultArtifactsDir) {
  const failures = []
  const packJsonPath = join(artifactsDir, 'npm-pack.json')
  const expectedTarball = expectedPackFilename(packageJson)

  if (!existsSync(artifactsDir)) {
    return { failures: [`${artifactsDir} is required`], tarballFilename: expectedTarball }
  }
  if (!statSync(artifactsDir).isDirectory()) {
    return { failures: [`${artifactsDir} must be a directory`], tarballFilename: expectedTarball }
  }
  if (!existsSync(packJsonPath)) {
    failures.push(`${packJsonPath} is required`)
  }

  const entries = readdirSync(artifactsDir).sort((left, right) => left.localeCompare(right))
  const expectedEntries = ['npm-pack.json', expectedTarball].sort((left, right) => left.localeCompare(right))
  if (JSON.stringify(entries) !== JSON.stringify(expectedEntries)) {
    failures.push(`${artifactsDir} must contain only ${expectedEntries.join(' and ')}`)
  }

  const pack = readPackManifest(packJsonPath, failures)
  if (pack) {
    assertPackMetadata(failures, packageJson, pack, expectedTarball)
  }

  const tarballPath = join(artifactsDir, expectedTarball)
  if (!existsSync(tarballPath)) {
    failures.push(`${tarballPath} is required`)
  } else if (pack) {
    assertTarballDigest(failures, tarballPath, pack)
  }

  return { failures, tarballFilename: expectedTarball }
}

function readPackManifest(packJsonPath, failures) {
  if (!existsSync(packJsonPath)) return null
  let parsed
  try {
    parsed = JSON.parse(readFileSync(packJsonPath, 'utf8'))
  } catch (error) {
    failures.push(`${packJsonPath} must contain valid JSON: ${error.message}`)
    return null
  }
  if (!Array.isArray(parsed) || parsed.length !== 1 || !parsed[0] || typeof parsed[0] !== 'object') {
    failures.push(`${packJsonPath} must contain one npm pack metadata object`)
    return null
  }
  return parsed[0]
}

function assertPackMetadata(failures, packageJson, pack, expectedTarball) {
  const expectedId = `${packageJson.name}@${packageJson.version}`
  if (pack.name !== packageJson.name) failures.push(`npm-pack.json name must be ${packageJson.name}`)
  if (pack.version !== packageJson.version) failures.push(`npm-pack.json version must be ${packageJson.version}`)
  if (pack.id !== expectedId) failures.push(`npm-pack.json id must be ${expectedId}`)
  if (basename(pack.filename ?? '') !== expectedTarball) failures.push(`npm-pack.json filename must be ${expectedTarball}`)
  if (!Number.isInteger(pack.size) || pack.size <= 0) failures.push('npm-pack.json size must be a positive integer')
  if (!Number.isInteger(pack.unpackedSize) || pack.unpackedSize <= 0) {
    failures.push('npm-pack.json unpackedSize must be a positive integer')
  }
  if (!/^[a-f0-9]{40}$/.test(pack.shasum ?? '')) failures.push('npm-pack.json shasum must be a sha1 hex digest')
  if (!/^sha512-[A-Za-z0-9+/=]+$/.test(pack.integrity ?? '')) {
    failures.push('npm-pack.json integrity must be a sha512 integrity string')
  }
  if (!Array.isArray(pack.files) || pack.files.length === 0) failures.push('npm-pack.json files must be non-empty')
  if (Array.isArray(pack.files) && pack.entryCount !== pack.files.length) {
    failures.push('npm-pack.json entryCount must match files.length')
  }
  if (!Array.isArray(pack.bundled) || pack.bundled.length > 0) {
    failures.push('npm-pack.json must not report bundled dependencies')
  }
}

function assertTarballDigest(failures, tarballPath, pack) {
  const tarball = readFileSync(tarballPath)
  if (Number.isInteger(pack.size) && statSync(tarballPath).size !== pack.size) {
    failures.push(`${tarballPath} size must match npm-pack.json size`)
  }
  const shasum = createHash('sha1').update(tarball).digest('hex')
  if (pack.shasum && shasum !== pack.shasum) {
    failures.push(`${tarballPath} sha1 digest must match npm-pack.json shasum`)
  }
  const integrity = `sha512-${createHash('sha512').update(tarball).digest('base64')}`
  if (pack.integrity && integrity !== pack.integrity) {
    failures.push(`${tarballPath} sha512 digest must match npm-pack.json integrity`)
  }
}

function expectedPackFilename(packageJson) {
  const name = packageJson.name.replace(/^@/, '').replace(/\//g, '-')
  return `${name}-${packageJson.version}.tgz`
}

if (isMainModule()) {
  main()
}

function isMainModule() {
  return import.meta.url === pathToFileURL(process.argv[1]).href
}
