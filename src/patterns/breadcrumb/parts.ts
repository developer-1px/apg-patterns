export const breadcrumbParts = {
  root: {
    role: 'navigation',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
    ],
  },
  list: {
    role: 'list',
  },
  crumb: {
    role: 'link',
    aria: [
      { attribute: 'aria-current', from: 'state.currentByKey' },
    ],
  },
} as const
