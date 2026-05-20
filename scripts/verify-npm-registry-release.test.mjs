import { describe, expect, it } from 'vitest'

import {
  compareSemver,
  validatePackageRegistryConfig,
  validateRegistryMetadata,
} from './verify-npm-registry-release.mjs'

describe('verify-npm-registry-release', () => {
  it('compares SemVer versions with prerelease ordering', () => {
    expect(compareSemver('1.0.1', '1.0.0')).toBe(1)
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0)
    expect(compareSemver('1.0.0-alpha.2', '1.0.0-alpha.10')).toBe(-1)
    expect(compareSemver('1.0.0', '1.0.0-rc.1')).toBe(1)
    expect(compareSemver('1.0.0+build.1', '1.0.0+build.2')).toBe(0)
    expect(compareSemver('01.0.0', '1.0.0')).toBe(null)
  })

  it('accepts a new version above the latest dist-tag', () => {
    const state = validateRegistryMetadata('@scope/pkg', '1.2.0', {
      version: '1.1.0',
      versions: ['1.0.0', '1.1.0'],
      'dist-tags': { latest: '1.1.0' },
    })

    expect(state.failures).toEqual([])
    expect(state.notes).toEqual(['latest dist-tag is 1.1.0'])
  })

  it('rejects an already-published version', () => {
    const state = validateRegistryMetadata('@scope/pkg', '1.1.0', {
      version: '1.1.0',
      versions: ['1.0.0', '1.1.0'],
      'dist-tags': { latest: '1.1.0' },
    })

    expect(state.failures).toContain('@scope/pkg@1.1.0 is already published on https://registry.npmjs.org/')
  })

  it('rejects a version that would move latest backward', () => {
    const state = validateRegistryMetadata('@scope/pkg', '1.1.0', {
      version: '1.2.0',
      versions: ['1.0.0', '1.2.0'],
      'dist-tags': { latest: '1.2.0' },
    })

    expect(state.failures).toContain(
      '@scope/pkg@1.1.0 must be greater than latest dist-tag 1.2.0 before publishing with the default latest tag',
    )
  })

  it('requires scoped package public npm registry settings', () => {
    expect(
      validatePackageRegistryConfig({
        name: '@scope/pkg',
        version: '1.0.0',
        publishConfig: {
          access: 'public',
          registry: 'https://registry.npmjs.org/',
        },
      }),
    ).toEqual([])

    expect(
      validatePackageRegistryConfig({
        name: '@scope/pkg',
        version: '1.0.0',
        publishConfig: {
          access: 'restricted',
          registry: 'https://registry.example.com/',
        },
      }),
    ).toEqual([
      'scoped package must set publishConfig.access to public',
      'publishConfig.registry must be https://registry.npmjs.org/',
    ])
  })
})
