import { COMBOBOX_TOKEN } from './navigation'

export const comboboxParts = {
  combobox: {
    role: 'combobox',
    aria: [
      { attribute: 'aria-expanded', from: 'combobox.popupOpen' },
      { attribute: 'aria-haspopup', from: 'options.haspopup' },
      { attribute: 'aria-autocomplete', from: 'options.autocomplete' },
      { attribute: 'aria-activedescendant', from: 'state.activeKey.elementId' },
      { attribute: 'aria-label', from: 'refs.label' },
    ],
    events: [
      {
        event: 'input',
        events: [{ type: 'inputValue', key: COMBOBOX_TOKEN }],
      },
    ],
  },
  listbox: {
    role: 'listbox',
    aria: [{ attribute: 'aria-label', from: 'items.label' }],
  },
  option: {
    role: 'option',
    aria: [{ attribute: 'aria-selected', from: 'state.selectedKeys' }],
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'selected', from: 'state.selectedKeys' },
    ],
  },
} as const
