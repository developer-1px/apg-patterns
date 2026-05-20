import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const registry = 'https://registry.npmjs.org/'
const failures = []

if (!packageJson.name) failures.push('package name is required')
if (!packageJson.version) failures.push('package version is required')
if (packageJson.private === true) failures.push('package must not be private')
if (packageJson.name?.startsWith('@') && packageJson.publishConfig?.access !== 'public') {
  failures.push('scoped package must set publishConfig.access to public')
}

if (packageJson.name && packageJson.version) {
  assertVersionIsUnpublished(packageJson.name, packageJson.version)
}

if (failures.length > 0) {
  console.error(`npm registry release preflight failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`${packageJson.name}@${packageJson.version} is not published on ${registry}.`)

function assertVersionIsUnpublished(name, version) {
  const result = spawnSync('npm', [
    'view',
    `${name}@${version}`,
    'version',
    '--json',
    '--registry',
    registry,
    '--loglevel',
    'silent',
  ], {
    encoding: 'utf8',
  })

  if (result.status === 0) {
    const publishedVersion = readJsonOutput(result.stdout)
    if (publishedVersion === version) {
      failures.push(`${name}@${version} is already published on ${registry}`)
      return
    }
    failures.push(`npm registry returned unexpected version metadata for ${name}@${version}`)
    return
  }

  const output = `${result.stdout}\n${result.stderr}`
  if (/\bE404\b/.test(output) || /not found/i.test(output)) return

  failures.push(`could not verify ${name}@${version} on ${registry}: ${output.trim() || `npm exited with status ${result.status}`}`)
}

function readJsonOutput(source) {
  try {
    return JSON.parse(source)
  } catch {
    return source.trim()
  }
}
