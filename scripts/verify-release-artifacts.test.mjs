import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { verifyReleaseArtifacts } from './verify-release-artifacts.mjs'

const packageJson = {
  name: '@scope/pkg',
  version: '1.2.3',
}
const tarballFilename = 'scope-pkg-1.2.3.tgz'
const tempRoots = []

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true })
  }
})

describe('verify-release-artifacts', () => {
  it('accepts npm pack metadata and tarball digests', () => {
    const root = createArtifacts()

    expect(verifyReleaseArtifacts(packageJson, root).failures).toEqual([])
  })

  it('rejects extra files in release-artifacts', () => {
    const root = createArtifacts()
    writeFileSync(join(root, 'extra.txt'), 'extra')

    expect(verifyReleaseArtifacts(packageJson, root).failures).toContain(
      'release-artifacts must contain only npm-pack.json and scope-pkg-1.2.3.tgz'.replace('release-artifacts', root),
    )
  })

  it('rejects a tarball that does not match npm-pack.json integrity', () => {
    const root = createArtifacts()
    writeFileSync(join(root, tarballFilename), 'changed')

    const failures = verifyReleaseArtifacts(packageJson, root).failures

    expect(failures).toContain(`${join(root, tarballFilename)} sha1 digest must match npm-pack.json shasum`)
    expect(failures).toContain(`${join(root, tarballFilename)} sha512 digest must match npm-pack.json integrity`)
  })

  it('requires npm pack metadata', () => {
    const root = createArtifacts({ includePackJson: false })

    expect(verifyReleaseArtifacts(packageJson, root).failures).toContain(`${join(root, 'npm-pack.json')} is required`)
  })
})

function createArtifacts(options = {}) {
  const root = mkdtempSync(join(tmpdir(), 'apg-release-artifacts-'))
  tempRoots.push(root)
  const tarball = Buffer.from('tarball bytes')
  writeFileSync(join(root, tarballFilename), tarball)

  if (options.includePackJson !== false) {
    writeFileSync(
      join(root, 'npm-pack.json'),
      JSON.stringify([
        {
          name: packageJson.name,
          version: packageJson.version,
          id: `${packageJson.name}@${packageJson.version}`,
          filename: tarballFilename,
          size: tarball.byteLength,
          unpackedSize: 42,
          shasum: createHash('sha1').update(tarball).digest('hex'),
          integrity: `sha512-${createHash('sha512').update(tarball).digest('base64')}`,
          files: [{ path: 'package.json', size: 42, mode: 420 }],
          entryCount: 1,
          bundled: [],
        },
      ]),
    )
  }

  return root
}
