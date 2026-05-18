import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import { useListboxDemoRuntime } from './listboxDemoRuntime'

const listboxDemoDefinition = {
  key: 'listbox',
  label: 'Listbox',
  keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space'],
  sources: {
    main: 'Listbox.tsx',
    entry: 'listbox/entry.tsx',
    data: ['RearrangeableListbox.tsx', 'listboxData.ts'],
    hooks: ['listbox/useListboxPattern.ts'],
    definition: 'listbox/definition.ts',
    extra: [
      'listbox/createListboxRenderItem.ts',
      'listbox/createListboxRootProps.ts',
      'listbox/effects.ts',
      'listbox/handleListboxMultiClick.ts',
      'listbox/handleListboxMultiKeyDown.ts',
      'listbox/handleListboxMultiSelect.ts',
      'listbox/keyboard.ts',
      'listbox/listboxMultiSelectionRange.ts',
      'listbox/parts.ts',
      'listbox/react.ts',
      'listbox/resolveListboxTypeaheadTarget.ts',
      'listbox/inspect.ts',
    ],
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'listbox variants',
    idPrefix: 'listbox-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'ListboxPreview',
    props: {
      variant: '$state.variant',
      data: '$state.data',
      options: '$state.options',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: listboxDemoDefinition,
  useRuntime: useListboxDemoRuntime,
})
