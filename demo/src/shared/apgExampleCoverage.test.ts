import { describe, expect, it } from 'vitest'
import { apgExampleCoverage, exampleId, officialApgExamples } from './apgExampleCoverage'
import { patternEntries } from './demoPatterns'

describe('APG example coverage', () => {
  it('tracks every official APG example slug', () => {
    const official = Object.entries(officialApgExamples).flatMap(([apgPattern, examples]) =>
      examples.map((example) => exampleId(apgPattern, example)),
    )
    const covered = apgExampleCoverage.map((item) => exampleId(item.apgPattern, item.example))

    expect(new Set(covered)).toEqual(new Set(official))
    expect(covered).toHaveLength(official.length)
  })

  it('references registered demo patterns', () => {
    const registered = new Set(patternEntries.map((entry) => entry.key))
    const missing = apgExampleCoverage.filter((item) => !registered.has(item.demoPattern))

    expect(missing).toEqual([])
  })
})
