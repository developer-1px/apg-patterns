import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { defineDemoPattern, defineStateDemoPattern, defineVariantDemoPattern, type DemoPatternDefinition } from './defineDemoPattern'
import type { PatternData, PatternEvent } from '../../../src'

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

    let renderedDemo: ReturnType<typeof entry.useDemoPattern> | undefined
    function Harness() {
      const demo = entry.useDemoPattern(() => undefined)
      renderedDemo = demo
      return <>{demo.preview}</>
    }
    render(<Harness />)

    expect(entry.key).toBe('example')
    expect(renderedDemo?.keyboardShortcuts).toEqual(['Enter'])
    expect(renderedDemo?.sourceNames).toEqual([
      'Example.tsx',
      'example/entry.tsx',
      'exampleData.ts',
      'example/useExamplePattern.ts',
      'example/definition.ts',
      'kernel/patternRuntime.ts',
      'kernel/runtimeKeyboard.ts',
      'kernel/domEventBindings.ts',
      'kernel/slotProps.ts',
      'kernel/patternReducer.ts',
      'kernel/patternKernel.ts',
      'kernel/keyTokenRegistry.ts',
      'kernel/kernelRegistries.ts',
      'kernel/patternEventTemplate.ts',
      'kernel/patternRelations.ts',
      'schema/index.ts',
      'schema/patternDefinition.ts',
      'schema/patternDefinitionVocabulary.ts',
    ])
    expect(screen.getByRole('button', { name: 'Rendered' })).toBeTruthy()
  })

  it('renders declared controls outside the preview node', () => {
    const entry = defineDemoPattern({
      definition: {
        ...definition,
        controls: {
          kind: 'listbox',
          label: 'variants',
          idPrefix: 'variant',
          items: '$model.items',
          value: '$state.value',
          onChange: '$actions.selectValue',
        },
      },
      useRuntime: () => ({
        inspect: 'state',
        context: {
          values: {
            state: { label: 'Rendered', value: 'one' },
            model: { items: [{ key: 'one', label: 'One' }] },
          },
          actions: { selectValue: () => undefined },
          components: {
            Preview: ({ label }) => <button type="button">{label}</button>,
          },
        },
      }),
    })

    const demo = entry.useDemoPattern(() => undefined)
    render(
      <>
        {demo.variants}
        <div data-preview>{demo.preview}</div>
      </>,
    )

    expect(screen.getByRole('listbox', { name: 'variants' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Rendered' }).closest('[data-preview]')).toBeTruthy()
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

  it('rejects duplicate keyboard shortcuts before an entry is created', () => {
    expect(() =>
      defineDemoPattern({
        definition: { ...definition, keyboardShortcuts: ['Enter', 'Enter'] },
        useRuntime: () => {
          throw new Error('unused')
        },
      }),
    ).toThrow('[defineDemoPattern] duplicate example keyboardShortcuts: Enter')
  })

  it('rejects duplicate source names before an entry is created', () => {
    expect(() =>
      defineDemoPattern({
        definition: {
          ...definition,
          sources: {
            ...definition.sources,
            data: ['Example.tsx'],
          },
        },
        useRuntime: () => {
          throw new Error('unused')
        },
      }),
    ).toThrow('[defineDemoPattern] duplicate example sources: Example.tsx')
  })

  it.each([
    ['main', { main: 'example/Example.tsx' }, 'invalid example sources main: example/Example.tsx'],
    ['entry', { entry: 'entry.tsx' }, 'invalid example sources entry: entry.tsx'],
    ['definition', { definition: 'definition.ts' }, 'invalid example sources definition: definition.ts'],
    ['data', { data: ['example/data.ts'] }, 'invalid example sources data: example/data.ts'],
    ['hooks', { hooks: ['example/keyboard.ts'] }, 'invalid example sources hooks: example/keyboard.ts'],
    ['runtime', { runtime: ['runtime.ts'] }, 'invalid example sources runtime: runtime.ts'],
  ] as const)('rejects source names in the wrong %s role', (_role, sourceOverride, message) => {
    expect(() =>
      defineDemoPattern({
        definition: {
          ...definition,
          sources: {
            ...definition.sources,
            ...sourceOverride,
          },
        },
        useRuntime: () => {
          throw new Error('unused')
        },
      }),
    ).toThrow(`[defineDemoPattern] ${message}`)
  })

  it('builds a state-backed demo runtime from a schema definition', () => {
    const initialData: PatternData = {
      items: { root: { label: 'Off' } },
      relations: { rootKeys: ['root'] },
      state: { activeKey: 'root' },
    }
    const dataDefinition = {
      ...definition,
      view: {
        kind: 'component',
        component: 'Preview',
        props: {
          data: '$state.data',
          onEvent: '$actions.dispatchEvent',
        },
      },
    } as const satisfies DemoPatternDefinition
    const entry = defineStateDemoPattern({
      definition: dataDefinition,
      initialData,
      reduce: (data) => ({ ...data, items: { root: { label: 'On' } } }),
      componentName: 'Preview',
      component: ({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) => (
        <button type="button" onClick={() => onEvent({ type: 'press', key: 'root' })}>{data.items.root?.label}</button>
      ),
    })
    const onEvent = vi.fn()

    function Harness() {
      const demo = entry.useDemoPattern(onEvent)
      return (
        <>
          <output data-testid="inspect">{demo.inspect}</output>
          {demo.preview}
        </>
      )
    }
    render(<Harness />)

    expect(screen.getByRole('button', { name: 'Off' })).toBeTruthy()
    expect(screen.getByTestId('inspect').textContent).toContain('items')
    fireEvent.click(screen.getByRole('button', { name: 'Off' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'press', key: 'root' })
    expect(screen.getByRole('button', { name: 'On' })).toBeTruthy()
  })

  it('builds a variant-backed demo runtime with declared controls', () => {
    const initialData: PatternData = {
      items: { root: { label: 'Action' } },
      relations: { rootKeys: ['root'] },
      state: { activeKey: 'root' },
    }
    const variantDefinition = {
      ...definition,
      view: {
        kind: 'component',
        component: 'Preview',
        props: {
          data: '$state.data',
        },
      },
      controls: {
        kind: 'listbox',
        label: 'variants',
        idPrefix: 'variant',
        items: '$model.variantItems',
        value: '$state.variant',
        onChange: '$actions.selectVariant',
      },
    } as const satisfies DemoPatternDefinition

    const entry = defineVariantDemoPattern({
      definition: variantDefinition,
      initialVariant: 'action',
      initialData,
      dataByVariant: (variant: 'action' | 'toggle') => ({
        ...initialData,
        items: { root: { label: variant === 'toggle' ? 'Toggle' : 'Action' } },
      }),
      reduce: (_variant, data) => data,
      variantItems: [
        { key: 'action', label: 'Action' },
        { key: 'toggle', label: 'Toggle' },
      ],
      componentName: 'Preview',
      component: ({ data }: { data: PatternData }) => <button type="button">{data.items.root?.label}</button>,
    })

    function Harness() {
      const demo = entry.useDemoPattern(() => undefined)
      return (
        <>
          {demo.variants}
          {demo.preview}
        </>
      )
    }
    render(<Harness />)

    expect(screen.getByRole('listbox', { name: 'variants' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Action' })).toBeTruthy()
  })
})
