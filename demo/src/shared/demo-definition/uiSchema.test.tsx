import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderUiNode } from './renderUiNode'
import type { UiNode, UiRenderContext } from './uiSchema'

const view = {
  kind: 'stack',
  children: [
    {
      kind: 'listbox',
      orientation: 'horizontal',
      value: '$state.variant',
      items: '$model.variantItems',
      label: 'variants',
      idPrefix: 'variant',
      onChange: '$actions.selectVariant',
    },
    {
      kind: 'component',
      component: 'Preview',
      props: {
        variant: '$state.variant',
      },
    },
  ],
} as const satisfies UiNode

const variantItems = [
  { key: 'action', label: 'Action' },
  { key: 'toggle', label: 'Toggle' },
] as const

function SchemaDemo() {
  const [variant, setVariant] = useState('action')
  const context: UiRenderContext = {
    values: {
      state: { variant },
      model: { variantItems },
    },
    actions: {
      selectVariant: setVariant,
    },
    components: {
      Preview: ({ variant }) => (
        <button type="button" aria-pressed={variant === 'toggle' ? false : undefined}>
          {variant === 'toggle' ? 'Mute' : 'Save'}
        </button>
      ),
    },
  }
  return renderUiNode(view, context)
}

describe('uiSchema', () => {
  it('renders a declared listbox and updates a declared preview component from keyboard interaction', () => {
    render(<SchemaDemo />)

    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('aria-pressed')).toBe(null)

    fireEvent.keyDown(screen.getByRole('listbox', { name: 'variants' }), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(screen.getByRole('option', { name: 'Toggle' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: 'Mute' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('fails before rendering when a binding is missing', () => {
    expect(() =>
      renderUiNode(
        { ...view, children: [{ ...view.children[1], props: { variant: '$state.missing' } }] },
        {
          values: { state: { variant: 'action' }, model: { variantItems } },
          actions: { selectVariant: () => undefined },
          components: { Preview: () => null },
        },
      ),
    ).toThrow('[uiSchema] unresolved binding: $state.missing')
  })

  it('fails before rendering when a component is missing', () => {
    expect(() =>
      renderUiNode(
        { kind: 'component', component: 'Missing' },
        {
          values: {},
          actions: {},
          components: {},
        },
      ),
    ).toThrow('[uiSchema] unknown component: Missing')
  })
})
