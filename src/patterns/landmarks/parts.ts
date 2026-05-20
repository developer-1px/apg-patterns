export const landmarksParts = {
  root: { role: 'document' },
  banner: { role: 'banner' },
  complementary: { role: 'complementary' },
  contentinfo: { role: 'contentinfo' },
  form: {
    role: 'form',
    aria: [{ attribute: 'aria-label', from: 'items.label' }],
  },
  main: { role: 'main' },
  navigation: {
    role: 'navigation',
    aria: [{ attribute: 'aria-label', from: 'items.label' }],
  },
  region: {
    role: 'region',
    aria: [{ attribute: 'aria-label', from: 'items.label' }],
  },
  search: {
    role: 'search',
    aria: [{ attribute: 'aria-label', from: 'items.label' }],
  },
} as const
