export const carouselTransitions = [
  {
    on: 'select',
    actions: [
      { kind: 'set', field: 'activeKey', value: { from: '$event.extentKey' } },
      { kind: 'replaceSet', field: 'selectedKeys', values: [{ from: '$event.extentKey' }] },
    ],
  },
] as const
