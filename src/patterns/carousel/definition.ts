import { PatternDefinitionSchema } from '../../schema'

export const CarouselDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'carousel') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "carousel"' })
  if (value.rootRole !== 'region') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "region"' })
  if (!value.parts.root) ctx.addIssue({ code: 'custom', path: ['parts', 'root'], message: 'carousel requires parts.root' })
  if (!value.parts.slide) ctx.addIssue({ code: 'custom', path: ['parts', 'slide'], message: 'carousel requires parts.slide' })
  if (!value.parts.prev) ctx.addIssue({ code: 'custom', path: ['parts', 'prev'], message: 'carousel requires parts.prev' })
  if (!value.parts.next) ctx.addIssue({ code: 'custom', path: ['parts', 'next'], message: 'carousel requires parts.next' })
})

export const carouselDefinition = CarouselDefinitionSchema.parse({
  apgPattern: 'carousel',
  rootRole: 'region',
  containedRoles: ['group', 'button'],
  focusModel: 'rovingTabIndex',
  parts: {
    root: {
      role: 'region',
      aria: [
        { attribute: 'aria-roledescription', from: 'options.roledescription' },
        { attribute: 'aria-label', from: 'refs.label' },
      ],
    },
    slide: {
      role: 'group',
      aria: [
        { attribute: 'aria-roledescription', from: 'options.slideRoledescription' },
        { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
        { attribute: 'aria-hidden', from: 'state.inactiveKey' },
      ],
    },
    prev: {
      role: 'button',
      aria: [{ attribute: 'aria-label', from: 'items.label' }],
      events: [{ event: 'click', events: [{ type: 'navigate', direction: 'previous' }] }],
    },
    next: {
      role: 'button',
      aria: [{ attribute: 'aria-label', from: 'items.label' }],
      events: [{ event: 'click', events: [{ type: 'navigate', direction: 'next' }] }],
    },
    playPause: {
      role: 'button',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-pressed', from: 'state.expandedKeys' },
      ],
    },
    picker: {
      role: 'button',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-pressed', from: 'state.selectedKeys' },
      ],
      events: [{ event: 'click', events: [{ type: 'select', key: '$key' }] }],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      previous: { kind: 'linearWrap', action: 'previous' },
      next: { kind: 'linearWrap', action: 'next' },
    },
  },
  keyboard: [],
  transitions: [
    {
      on: 'select',
      actions: [
        { kind: 'set', field: 'activeKey', value: { from: '$event.extentKey' } },
        { kind: 'replaceSet', field: 'selectedKeys', values: [{ from: '$event.extentKey' }] },
      ],
    },
  ],
})

export const serializableCarouselDefinition = JSON.parse(
  JSON.stringify(carouselDefinition),
) as typeof carouselDefinition
