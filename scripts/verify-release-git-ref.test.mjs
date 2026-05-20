import { describe, expect, it } from 'vitest'

import {
  expectedReleaseTag,
  shouldRequireReleaseTag,
  validateReleaseGitRef,
} from './verify-release-git-ref.mjs'

describe('verify-release-git-ref', () => {
  it('derives the expected version tag', () => {
    expect(expectedReleaseTag('1.2.3')).toBe('v1.2.3')
  })

  it('keeps tag enforcement opt-in outside publish workflows', () => {
    expect(shouldRequireReleaseTag({})).toBe(false)

    const result = validateReleaseGitRef({ version: '1.2.3' }, {})

    expect(result.failures).toEqual([])
    expect(result.notes).toEqual(['tag enforcement is disabled; set VERIFY_RELEASE_TAG=true for publish workflows'])
  })

  it('requires a matching GitHub tag when strict mode runs in actions', () => {
    expect(
      validateReleaseGitRef(
        { version: '1.2.3' },
        {
          VERIFY_RELEASE_TAG: 'true',
          GITHUB_ACTIONS: 'true',
          GITHUB_REF_TYPE: 'tag',
          GITHUB_REF_NAME: 'v1.2.3',
        },
      ).failures,
    ).toEqual([])
  })

  it('rejects a GitHub branch publish ref', () => {
    expect(
      validateReleaseGitRef(
        { version: '1.2.3' },
        {
          VERIFY_RELEASE_TAG: 'true',
          GITHUB_ACTIONS: 'true',
          GITHUB_REF_TYPE: 'branch',
          GITHUB_REF_NAME: 'main',
        },
      ).failures,
    ).toEqual([
      'publish workflow must run from git tag v1.2.3, not branch',
      'publish workflow git ref must be v1.2.3, not main',
    ])
  })

  it('rejects a mismatched GitHub tag publish ref', () => {
    expect(
      validateReleaseGitRef(
        { version: '1.2.3' },
        {
          GITHUB_WORKFLOW: 'Publish Package',
          GITHUB_ACTIONS: 'true',
          GITHUB_REF_TYPE: 'tag',
          GITHUB_REF_NAME: 'v1.2.4',
        },
      ).failures,
    ).toEqual(['publish workflow git ref must be v1.2.3, not v1.2.4'])
  })

  it('checks local HEAD tags when strict mode runs outside GitHub Actions', () => {
    expect(
      validateReleaseGitRef(
        { version: '1.2.3' },
        { VERIFY_RELEASE_TAG: 'true' },
        { headTags: ['v1.2.3'] },
      ).failures,
    ).toEqual([])

    expect(
      validateReleaseGitRef(
        { version: '1.2.3' },
        { VERIFY_RELEASE_TAG: 'true' },
        { headTags: ['v1.2.2'] },
      ).failures,
    ).toEqual(['local publish preflight must run at git tag v1.2.3'])
  })
})
