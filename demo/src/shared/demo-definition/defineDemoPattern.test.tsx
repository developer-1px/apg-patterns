import { fireEvent, render, screen } from '@testing-library/react'
import { Component, useState, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { defineDemoPattern, defineStateDemoPattern, defineVariantDemoPattern, type DemoPatternDefinition } from './index'
import type { PatternData, PatternEvent } from '../../../../src/react'

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

const unusedRuntime = () => {
  throw new Error('useRuntime should not be called')
}

class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null }

  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }

  render() {
    if (this.state.message) return <output data-testid="render-error">{this.state.message}</output>
    return this.props.children
  }
}

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
      'kernel/rootKeyboardHandler.ts',
      'kernel/runtimeKeyboard.ts',
      'kernel/runtimePartProps.ts',
      'kernel/domEventBindings.ts',
      'kernel/domEventRegistry.ts',
      'kernel/slotProps.ts',
      'kernel/runtimeItemState.ts',
      'kernel/patternReducer.ts',
      'kernel/patternTransitions.ts',
      'kernel/transitionValue.ts',
      'kernel/patternKernel.ts',
      'kernel/keyTokenRegistry.ts',
      'kernel/kernelRegistries.ts',
      'kernel/patternEventTemplate.ts',
      'kernel/patternRelations.ts',
      'schema/index.ts',
      'schema/eventTemplate.ts',
      'schema/patternDefinition.ts',
      'schema/patternDefinitionValidation.ts',
      'schema/patternDefinitionVocabulary.ts',
      'kernel/kernelAriaSources.ts',
      'kernel/kernelBuiltins.ts',
      'kernel/kernelNavigationTargets.ts',
      'kernel/kernelPredicates.ts',
      'kernel/kernelStateProjections.ts',
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

  it.each([
    ['unknown binding root', { view: { kind: 'component', component: 'Preview', props: { label: '$missing.label' } } }, '[uiSchema] unknown binding root: $missing.label', undefined],
    ['non-string listbox value', {
      controls: { kind: 'listbox', label: 'variants', idPrefix: 'variant', items: '$model.items', value: '$state.value', onChange: '$actions.selectValue' },
    }, '[uiSchema] binding is not a string: $state.value', undefined],
    ['non-listbox items', {
      controls: { kind: 'listbox', label: 'variants', idPrefix: 'variant', items: '$model.items', value: '$state.value', onChange: '$actions.selectValue' },
    }, '[uiSchema] binding is not listbox items: $model.items', { values: { state: { label: 'Rendered', value: 'one' }, model: { items: { key: 'one', label: 'One' } } }, actions: { selectValue: () => undefined } }],
    ['non-function action', {
      controls: { kind: 'listbox', label: 'variants', idPrefix: 'variant', items: '$model.items', value: '$state.value', onChange: '$actions.selectValue' },
    }, '[uiSchema] binding is not an action: $actions.selectValue', { values: { state: { label: 'Rendered', value: 'one' }, model: { items: [{ key: 'one', label: 'One' }] } }, actions: { selectValue: 'nope' } }],
  ] as const)('surfaces %s render errors after pointer input', (_name, override, message, runtimeContext) => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const entry = defineDemoPattern({
      definition: { ...definition, ...override } as DemoPatternDefinition,
      useRuntime: () => ({
        inspect: 'state',
        context: {
          values: runtimeContext?.values ?? { state: { label: 'Rendered', value: 1 }, model: { items: [{ key: 'one', label: 'One' }] } },
          actions: runtimeContext?.actions ?? { selectValue: () => undefined },
          components: {
            Preview: ({ label }) => <button type="button">{String(label)}</button>,
          },
        },
      }),
    })

    function MalformedDemo() {
      const demo = entry.useDemoPattern(() => undefined)
      return <>{demo.variants ?? demo.preview}</>
    }

    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open malformed demo</button>
          <ErrorBoundary>{open ? <MalformedDemo /> : null}</ErrorBoundary>
        </>
      )
    }

    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Open malformed demo' }))

    expect(screen.getByTestId('render-error').textContent).toBe(message)
    errorSpy.mockRestore()
  })

  it('rejects invalid definitions before an entry is created', () => {
    expect(() =>
      defineDemoPattern({
        definition: { ...definition, key: 'Bad Key' },
        useRuntime: unusedRuntime,
      }),
    ).toThrow()
  })

  it('rejects duplicate keyboard shortcuts before an entry is created', () => {
    expect(() =>
      defineDemoPattern({
        definition: { ...definition, keyboardShortcuts: ['Enter', 'Enter'] },
        useRuntime: unusedRuntime,
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
        useRuntime: unusedRuntime,
      }),
    ).toThrow('[defineDemoPattern] duplicate example sources: Example.tsx')
  })

  it.each([
    ['definition', { definition: 'button/definition.ts' }, 'mismatched example sources definition: button/definition.ts'],
    ['hooks', { hooks: ['button/useButtonPattern.ts'] }, 'mismatched example sources hooks: button/useButtonPattern.ts'],
    ['runtime', { runtime: ['button/keyboard.ts'] }, 'mismatched example sources runtime: button/keyboard.ts'],
    ['extra', { extra: ['button/inspect.ts'] }, 'mismatched example sources extra: button/inspect.ts'],
  ] as const)('rejects %s sources from a different pattern prefix', (_role, sourceOverride, message) => {
    expect(() =>
      defineDemoPattern({
        definition: {
          ...definition,
          sources: {
            ...definition.sources,
            ...sourceOverride,
          },
        },
        useRuntime: unusedRuntime,
      }),
    ).toThrow(`[defineDemoPattern] ${message}`)
  })

  it('adds collected implementation sources for the declared pattern entry', () => {
    const entry = defineDemoPattern({
      definition: {
        ...definition,
        key: 'button',
        sources: {
          main: 'Button.tsx',
          entry: 'button/entry.tsx',
          data: ['buttonData.ts'],
          hooks: ['button/useButtonPattern.ts'],
          definition: 'button/definition.ts',
        },
      },
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

    expect(demo.sourceNames).toContain('button/buttonActions.ts')
    expect(demo.sourceNames).toContain('button/keyboard.ts')
    expect(demo.sourceNames.filter((sourceName) => sourceName === 'button/useButtonPattern.ts')).toHaveLength(1)
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
        useRuntime: unusedRuntime,
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
