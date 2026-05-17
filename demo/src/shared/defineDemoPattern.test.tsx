import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { defineDemoPattern, type DemoPatternDefinition } from './defineDemoPattern'

const definition = {
  key: 'example',
  label: 'Example',
  keyboardShortcuts: ['Enter'],
  sources: {
    main: 'Example.tsx',
    entry: 'example/entry.tsx',
    data: ['exampleData.ts'],
    hooks: ['example/useExamplePattern.ts'],
    definition: 'example/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Preview',
    props: {
      label: '$state.label',
    },
  },
} as const satisfies DemoPatternDefinition

describe('defineDemoPattern', () => {
  it('turns a validated definition and runtime context into a PatternEntry', () => {
    const entry = defineDemoPattern({
      definition,
      useRuntime: () => ({
        inspect: 'state',
        context: {
          values: { state: { label: 'Rendered' } },
          actions: {},
          components: {
            Preview: ({ label }) => <button type="button">{label}</button>,
          },
        },
      }),
    })

    const demo = entry.useDemoPattern(() => undefined)
    render(<>{demo.preview}</>)

    expect(entry.key).toBe('example')
    expect(demo.keyboardShortcuts).toEqual(['Enter'])
    expect(demo.sourceNames).toEqual([
      'Example.tsx',
      'example/entry.tsx',
      'exampleData.ts',
      'example/useExamplePattern.ts',
      'example/definition.ts',
      'kernel/patternRuntime.ts',
      'kernel/patternReducer.ts',
      'kernel/patternKernel.ts',
      'schema/index.ts',
    ])
    expect(screen.getByRole('button', { name: 'Rendered' })).toBeTruthy()
  })

  it('rejects invalid definitions before an entry is created', () => {
    expect(() =>
      defineDemoPattern({
        definition: { ...definition, key: 'Bad Key' },
        useRuntime: () => {
          throw new Error('unused')
        },
      }),
    ).toThrow()
  })
})
