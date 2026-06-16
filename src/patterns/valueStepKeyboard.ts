export const valueStep = (direction: string) => ({
  events: [{ type: 'valueStep', key: '$activeKey', direction }],
})
