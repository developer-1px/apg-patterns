import { describe, expect, it } from 'vitest'

import {
  parseGitHubRepositoryUrl,
  verifyExternalReleaseState,
} from './verify-external-release-state.mjs'

const packageJson = {
  name: '@scope/pkg',
  version: '1.0.0',
  publishConfig: {
    access: 'public',
    registry: 'https://registry.npmjs.org/',
  },
  repository: {
    type: 'git',
    url: 'git+https://github.com/scope/pkg.git',
  },
  bugs: {
    url: 'https://github.com/scope/pkg/issues',
  },
  homepage: 'https://github.com/scope/pkg#readme',
}

describe('verify-external-release-state', () => {
  it('parses common GitHub repository URL forms', () => {
    expect(parseGitHubRepositoryUrl('git+https://github.com/scope/pkg.git')).toEqual({ owner: 'scope', repo: 'pkg' })
    expect(parseGitHubRepositoryUrl('git@github.com:scope/pkg.git')).toEqual({ owner: 'scope', repo: 'pkg' })
    expect(parseGitHubRepositoryUrl('ssh://git@github.com/scope/pkg.git')).toEqual({ owner: 'scope', repo: 'pkg' })
  })

  it('accepts aligned public repository and available npm package state', () => {
    expect(verifyExternalReleaseState(packageJson, readyProbes()).failures).toEqual([])
  })

  it('rejects a private GitHub repository', () => {
    expect(
      verifyExternalReleaseState(packageJson, {
        ...readyProbes(),
        readGitHubRepositoryVisibility: () => ({ visibility: 'PRIVATE', detail: '' }),
      }).failures,
    ).toContain('GitHub repository visibility must be PUBLIC for scope/pkg')
  })

  it('requires a configured origin remote before external publishing', () => {
    expect(
      verifyExternalReleaseState(packageJson, {
        ...readyProbes(),
        readOriginUrl: () => '',
      }).failures,
    ).toContain('git origin remote is required before external publishing')
  })

  it('rejects an origin that does not match package repository metadata', () => {
    expect(
      verifyExternalReleaseState(packageJson, {
        ...readyProbes(),
        readOriginUrl: () => 'https://github.com/other/pkg.git',
      }).failures,
    ).toContain('git origin other/pkg must match package repository scope/pkg')
  })

  it('rejects an unreachable public GitHub repository', () => {
    expect(
      verifyExternalReleaseState(packageJson, {
        ...readyProbes(),
        readPublicGitHead: () => ({ ok: false, detail: 'Repository not found.' }),
      }).failures,
    ).toContain('public GitHub repository must be reachable at https://github.com/scope/pkg.git: Repository not found.')
  })
})

function readyProbes() {
  return {
    readOriginUrl: () => 'https://github.com/scope/pkg.git',
    readGitHubRepositoryVisibility: () => ({ visibility: 'PUBLIC', detail: '' }),
    readPublicGitHead: () => ({ ok: true, detail: '' }),
    readRegistryReleaseState: () => ({ failures: [], notes: ['package name has no published versions'] }),
  }
}
