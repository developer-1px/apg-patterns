import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

import {
  publicNpmRegistry,
  readRegistryReleaseState,
  validatePackageRegistryConfig,
} from './verify-npm-registry-release.mjs'

function main() {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
  const state = verifyExternalReleaseState(packageJson)

  if (state.failures.length > 0) {
    console.error(`External release state check failed:\n${state.failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exit(1)
  }

  const notes = state.notes.length > 0 ? ` ${state.notes.join('; ')}.` : ''
  console.log(`External release state is ready for ${packageJson.name}@${packageJson.version}.${notes}`)
}

export function verifyExternalReleaseState(packageJson, probes = defaultProbes) {
  const failures = validatePackageRegistryConfig(packageJson, publicNpmRegistry)
  const notes = []
  const packageRepository = parseGitHubRepositoryUrl(packageRepositoryUrl(packageJson.repository))

  if (!packageRepository) {
    failures.push('package repository metadata must use a GitHub repository URL')
  } else {
    assertGitHubPackageMetadata(failures, packageJson, packageRepository)
  }

  const originUrl = probes.readOriginUrl()
  const originRepository = parseGitHubRepositoryUrl(originUrl)
  if (!originUrl) {
    failures.push('git origin remote is required before external publishing')
  } else if (!originRepository) {
    failures.push(`git origin must be a GitHub repository URL: ${originUrl}`)
  } else if (packageRepository && !sameRepository(originRepository, packageRepository)) {
    failures.push(
      `git origin ${formatRepository(originRepository)} must match package repository ${formatRepository(packageRepository)}`,
    )
  }

  if (packageRepository) {
    const repositoryUrl = gitHttpsRepositoryUrl(packageRepository)
    const repositoryName = formatRepository(packageRepository)
    const visibilityState = probes.readGitHubRepositoryVisibility(repositoryName)
    if (visibilityState.visibility === 'PUBLIC') {
      notes.push(`GitHub repository visibility is PUBLIC for ${repositoryName}`)
    } else {
      const detail = visibilityState.detail ? `: ${visibilityState.detail}` : ''
      failures.push(`GitHub repository visibility must be PUBLIC for ${repositoryName}${detail}`)
    }

    const repositoryState = probes.readPublicGitHead(repositoryUrl)
    if (repositoryState.ok) {
      notes.push(`public GitHub repository is reachable at ${repositoryUrl}`)
    } else {
      const detail = repositoryState.detail ? `: ${repositoryState.detail}` : ''
      failures.push(`public GitHub repository must be reachable at ${repositoryUrl}${detail}`)
    }
  }

  if (packageJson.name && packageJson.version) {
    const registryState = probes.readRegistryReleaseState(packageJson.name, packageJson.version, publicNpmRegistry)
    failures.push(...registryState.failures)
    notes.push(...registryState.notes)
  }

  return { failures, notes }
}

export function parseGitHubRepositoryUrl(url) {
  if (typeof url !== 'string' || url.trim().length === 0) return null
  const normalizedUrl = url.trim().replace(/^git\+/, '').replace(/\.git$/, '')
  const match = /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([^/\s]+)\/([^/\s]+)$/.exec(normalizedUrl)
  if (!match) return null
  return {
    owner: match[1],
    repo: match[2],
  }
}

export function parseGitHubRepositoryVisibility(repositoryName, status, body) {
  if (status !== 200) {
    return { visibility: '', detail: `GitHub API HTTP ${status}` }
  }

  let repository
  try {
    repository = JSON.parse(body)
  } catch (error) {
    return { visibility: '', detail: `GitHub API returned invalid JSON for ${repositoryName}: ${error.message}` }
  }

  if (!repository || typeof repository !== 'object' || Array.isArray(repository)) {
    return { visibility: '', detail: `GitHub API returned unexpected repository metadata for ${repositoryName}` }
  }

  return {
    visibility: repository.private === false ? 'PUBLIC' : 'PRIVATE',
    detail: '',
  }
}

function packageRepositoryUrl(repository) {
  if (typeof repository === 'string') return repository
  if (repository && typeof repository === 'object' && !Array.isArray(repository) && typeof repository.url === 'string') {
    return repository.url
  }
  return ''
}

function assertGitHubPackageMetadata(failures, packageJson, repository) {
  const expectedRepository = {
    type: 'git',
    url: `git+https://github.com/${repository.owner}/${repository.repo}.git`,
  }
  const expectedBugs = {
    url: `https://github.com/${repository.owner}/${repository.repo}/issues`,
  }
  const expectedHomepage = githubPagesHomepage(repository)

  assertJsonEqual(failures, 'repository', packageJson.repository, expectedRepository)
  assertJsonEqual(failures, 'bugs', packageJson.bugs, expectedBugs)
  if (packageJson.homepage !== expectedHomepage) {
    failures.push(`homepage must be ${expectedHomepage}`)
  }
}

function githubPagesHomepage(repository) {
  return `https://${repository.owner}.github.io/${repository.repo}/`
}

function assertJsonEqual(failures, label, actual, expected) {
  if (JSON.stringify(sortJson(actual)) !== JSON.stringify(sortJson(expected))) {
    failures.push(`${label} must match the public GitHub repository`)
  }
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])]))
}

function sameRepository(left, right) {
  return left.owner === right.owner && left.repo === right.repo
}

function formatRepository(repository) {
  return `${repository.owner}/${repository.repo}`
}

function gitHttpsRepositoryUrl(repository) {
  return `https://github.com/${repository.owner}/${repository.repo}.git`
}

const defaultProbes = {
  readOriginUrl() {
    const result = spawnSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
    })
    return result.status === 0 ? result.stdout.trim() : ''
  },
  readGitHubRepositoryVisibility(repositoryName) {
    const result = spawnSync(
      'curl',
      [
        '--silent',
        '--show-error',
        '--location',
        '--header',
        'Accept: application/vnd.github+json',
        '--write-out',
        '\n%{http_code}',
        `https://api.github.com/repos/${repositoryName}`,
      ],
      { encoding: 'utf8' },
    )
    if (result.status !== 0) {
      const detail = `${result.stderr}\n${result.stdout}`.trim().split('\n').find(Boolean) ?? ''
      return { visibility: '', detail }
    }

    const lines = result.stdout.split('\n')
    const status = Number.parseInt(lines.pop() ?? '', 10)
    return parseGitHubRepositoryVisibility(repositoryName, status, lines.join('\n'))
  },
  readPublicGitHead(repositoryUrl) {
    const result = spawnSync('git', ['ls-remote', repositoryUrl, 'HEAD'], {
      encoding: 'utf8',
    })
    if (result.status === 0 && result.stdout.trim().length > 0) {
      return { ok: true, detail: '' }
    }
    const detail = `${result.stderr}\n${result.stdout}`.trim().split('\n').find(Boolean) ?? ''
    return { ok: false, detail }
  },
  readRegistryReleaseState,
}

if (isMainModule()) {
  main()
}

function isMainModule() {
  return import.meta.url === pathToFileURL(process.argv[1]).href
}
