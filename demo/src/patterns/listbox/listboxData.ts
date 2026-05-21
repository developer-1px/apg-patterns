import { PatternDataSchema } from '../../../../src/react'

export const initialListboxData = PatternDataSchema.parse({
  items: {
    a: { label: 'Apple', textValue: 'apple' },
    b: { label: 'Banana', textValue: 'banana' },
    c: { label: 'Cherry', textValue: 'cherry' },
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

const scrollableLabels = [
  'Aardvark', 'Albatross', 'Alligator', 'Anteater', 'Antelope', 'Armadillo',
  'Baboon', 'Badger', 'Barracuda', 'Bear', 'Beaver', 'Bison',
  'Camel', 'Capybara', 'Caribou', 'Cheetah', 'Chinchilla', 'Cobra',
  'Dingo', 'Dolphin', 'Donkey', 'Dragonfly', 'Duck',
  'Eagle', 'Echidna', 'Elephant', 'Emu',
]

export const initialScrollableListboxData = PatternDataSchema.parse({
  items: Object.fromEntries(
    scrollableLabels.map((label, index) => [
      `s${index}`,
      { label, textValue: label.toLowerCase() },
    ]),
  ),
  relations: {
    rootKeys: scrollableLabels.map((_l, index) => `s${index}`),
    childrenByKey: Object.fromEntries(scrollableLabels.map((_l, index) => [`s${index}`, []])),
  },
  state: {
    activeKey: 's0',
    selectedKeys: ['s0'],
    posInSetByKey: Object.fromEntries(scrollableLabels.map((_l, index) => [`s${index}`, index + 1])),
    setSizeByKey: Object.fromEntries(scrollableLabels.map((_l, index) => [`s${index}`, scrollableLabels.length])),
  },
  refs: { label: 'Animals' },
})

const groupedOptions: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'v-asparagus', label: 'Asparagus' },
  { key: 'v-broccoli', label: 'Broccoli' },
  { key: 'v-carrots', label: 'Carrots' },
  { key: 'f-apple', label: 'Apples' },
  { key: 'f-banana', label: 'Bananas' },
  { key: 'f-cherry', label: 'Cherries' },
  { key: 'gr-rice', label: 'Rice' },
  { key: 'gr-oats', label: 'Oats' },
]

export const groupedListboxStructure: ReadonlyArray<{
  groupKey: string
  groupLabel: string
  optionKeys: readonly string[]
}> = [
  { groupKey: 'g-veg', groupLabel: 'Vegetables', optionKeys: ['v-asparagus', 'v-broccoli', 'v-carrots'] },
  { groupKey: 'g-fruit', groupLabel: 'Fruits', optionKeys: ['f-apple', 'f-banana', 'f-cherry'] },
  { groupKey: 'g-grain', groupLabel: 'Grains', optionKeys: ['gr-rice', 'gr-oats'] },
]

export const initialGroupedListboxData = PatternDataSchema.parse({
  items: Object.fromEntries(
    groupedOptions.map(({ key, label }) => [key, { label, textValue: label.toLowerCase() }]),
  ),
  relations: {
    rootKeys: groupedListboxStructure.flatMap((g) => g.optionKeys),
    childrenByKey: Object.fromEntries(
      groupedListboxStructure.flatMap((g) => g.optionKeys).map((key) => [key, []]),
    ),
  },
  state: {
    activeKey: 'v-asparagus',
    selectedKeys: ['v-asparagus'],
  },
  refs: { label: 'Grocery' },
})

const rearrangeableLabels = ['Leonardo', 'Donatello', 'Raphael', 'Michelangelo', 'Splinter', 'April']

export const initialRearrangeableListboxData = PatternDataSchema.parse({
  items: Object.fromEntries(
    rearrangeableLabels.map((label, index) => [
      `r${index}`,
      { label, textValue: label.toLowerCase() },
    ]),
  ),
  relations: {
    rootKeys: rearrangeableLabels.map((_l, index) => `r${index}`),
    childrenByKey: Object.fromEntries(rearrangeableLabels.map((_l, index) => [`r${index}`, []])),
  },
  state: {
    activeKey: 'r0',
    selectedKeys: ['r0'],
    disabledKeys: [],
  },
  refs: { label: 'Important Characters' },
})
