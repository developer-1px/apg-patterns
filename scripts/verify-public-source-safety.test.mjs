import { describe, expect, it } from 'vitest'

import { scanPublicSourceFiles } from './verify-public-source-safety.mjs'

describe('verify-public-source-safety', () => {
  it('accepts public source without credential material', () => {
    const failures = scanPublicSourceFiles(['README.md'], () => 'Use npm trusted publishing without static tokens.')

    expect(failures).toEqual([])
  })

  it('rejects concrete access token patterns', () => {
    const leakedToken = `ghp_${'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL'}`
    const failures = scanPublicSourceFiles(['leak.txt'], () => `token=${leakedToken}`)

    expect(failures).toContain('leak.txt contains GitHub access token')
    expect(failures).toContain('leak.txt contains sensitive assignment token')
  })

  it('rejects private key blocks', () => {
    const keyHeader = ['-----BEGIN', 'PRIVATE KEY-----'].join(' ')
    const keyFooter = ['-----END', 'PRIVATE KEY-----'].join(' ')
    const failures = scanPublicSourceFiles(['key.pem'], () => `${keyHeader}\nabc\n${keyFooter}`)

    expect(failures).toContain('key.pem contains private key block')
  })

  it('allows documented placeholder values', () => {
    const failures = scanPublicSourceFiles(['example.md'], () => 'TOKEN=<token>\nAPI_KEY=${API_KEY}\nPASSWORD=********')

    expect(failures).toEqual([])
  })
})
