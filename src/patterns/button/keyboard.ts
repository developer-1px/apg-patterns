const togglePressEvents = (pressed: boolean) => [
  { type: 'press', key: '$activeKey', pressed },
  { type: 'activate', key: '$activeKey' },
] as const

const activateButtonCases = [
  { case: 'when', when: { kind: 'isPressed', key: '$activeKey' }, events: togglePressEvents(false) },
  { case: 'otherwise', events: togglePressEvents(true) },
] as const

export const buttonKeyboard = [
  {
    shortcut: 'Enter',
    preventDefault: true,
    cases: activateButtonCases,
  },
  {
    shortcut: 'Space',
    preventDefault: true,
    cases: activateButtonCases,
  },
] as const
