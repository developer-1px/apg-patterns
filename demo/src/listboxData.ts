import { PatternDataSchema } from '../../src'

export const initialListboxData = PatternDataSchema.parse({
  items: {
    a: { label: 'Apple' },
    b: { label: 'Banana' },
    c: { label: 'Cherry' },
  },
  relations: {
    rootKeys: ['a', 'b', 'c'],
    childrenByKey: { a: [], b: [], c: [] },
  },
  state: {
    activeKey: 'b',
    selectedKeys: ['b'],
  },
  refs: { label: 'Fruits' },
})
