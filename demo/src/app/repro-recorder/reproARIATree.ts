const CONTAINER_ROLES = new Set([
  'listbox',
  'tree',
  'treegrid',
  'grid',
  'table',
  'tablist',
  'menu',
  'menubar',
  'toolbar',
  'radiogroup',
  'group',
  'dialog',
  'alertdialog',
  'navigation',
  'main',
  'region',
  'application',
  'combobox',
])

const ARIA_STATE_ATTRS = [
  'aria-controls',
  'aria-selected',
  'aria-expanded',
  'aria-checked',
  'aria-disabled',
  'aria-pressed',
  'aria-level',
  'aria-activedescendant',
  'aria-current',
  'aria-invalid',
  'aria-required',
  'aria-valuemin',
  'aria-valuemax',
  'aria-valuenow',
  'aria-valuetext',
] as const

const IMPLICIT_ROLES: Record<string, string> = {
  a: 'link',
  aside: 'complementary',
  button: 'button',
  dialog: 'dialog',
  footer: 'contentinfo',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
  header: 'banner',
  input: 'textbox',
  li: 'listitem',
  main: 'main',
  nav: 'navigation',
  ol: 'list',
  select: 'combobox',
  table: 'table',
  td: 'cell',
  textarea: 'textbox',
  th: 'columnheader',
  tr: 'row',
  ul: 'list',
}

function implicitRole(el: Element): string | null {
  return IMPLICIT_ROLES[el.tagName.toLowerCase()] ?? null
}

function describeElementName(el: Element): string {
  return el.getAttribute('aria-label')
    ?? el.getAttribute('aria-labelledby')
    ?? (el.children.length === 0 ? el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 50) : null)
    ?? ''
}

function getActiveDescendant(activeEl: Element | null): Element | null {
  const id = activeEl?.getAttribute('aria-activedescendant')
  return id ? document.getElementById(id) : null
}

function getControlledElements(el: Element): Element[] {
  const ids = el.getAttribute('aria-controls')?.trim().split(/\s+/).filter(Boolean) ?? []
  return ids.flatMap((id) => {
    const controlled = document.getElementById(id)
    return controlled && !el.contains(controlled) ? [controlled] : []
  })
}

function formatAriaValue(attr: string, val: string): string {
  if (attr !== 'aria-activedescendant') return val === 'true' ? attr.replace('aria-', '') : `${attr.replace('aria-', '')}=${val}`

  const target = document.getElementById(val)
  const targetName = target ? describeElementName(target) : ''
  return `activedescendant=${val}${targetName ? ` "${targetName}"` : ''}`
}

function serializeARIANode(el: Element, depth: number, activeEl: Element | null, activeDescendant: Element | null, visited: Set<Element>): string {
  if (visited.has(el)) return ''
  visited.add(el)
  const role = el.getAttribute('role') || implicitRole(el)
  if (!role) return ''

  const attrs: string[] = []
  for (const attr of ARIA_STATE_ATTRS) {
    const val = el.getAttribute(attr)
    if (val !== null) attrs.push(formatAriaValue(attr, val))
  }
  if (el === activeEl) attrs.push('< focus')
  if (el === activeDescendant) attrs.push('< active-descendant')

  const indent = '  '.repeat(depth)
  const name = describeElementName(el)
  const line = `${indent}- ${role}${name ? ` "${name}"` : ''}${attrs.length > 0 ? ` [${attrs.join(', ')}]` : ''}`

  const childLines: string[] = []
  for (const child of el.children) {
    const childRole = child.getAttribute('role') || implicitRole(child)
    if (childRole) {
      const serialized = serializeARIANode(child, depth + 1, activeEl, activeDescendant, visited)
      if (serialized) childLines.push(serialized)
    } else {
      for (const grandchild of child.children) {
        const serialized = serializeARIANode(grandchild, depth + 1, activeEl, activeDescendant, visited)
        if (serialized) childLines.push(serialized)
      }
    }
  }
  for (const controlled of getControlledElements(el)) {
    const serialized = serializeARIANode(controlled, depth + 1, activeEl, activeDescendant, visited)
    if (serialized) childLines.push(serialized)
  }

  return childLines.length > 0 ? `${line}\n${childLines.join('\n')}` : line
}

export function findRoleContainer(el: Element | null): Element | null {
  let current = el
  while (current && current !== document.body) {
    const role = current.getAttribute('role')
    if (role && CONTAINER_ROLES.has(role)) return current
    current = current.parentElement
  }
  return document.querySelector('[data-demo-preview]') ?? null
}

export function serializeARIATree(container: Element, activeEl: Element | null): string {
  const activeDescendant = getActiveDescendant(activeEl)
  const visited = new Set<Element>()
  const serialized = serializeARIANode(container, 0, activeEl, activeDescendant, visited)
    || Array.from(container.children)
      .map((child) => serializeARIANode(child, 0, activeEl, activeDescendant, visited))
      .filter(Boolean)
      .join('\n')
  return serialized || '(no ARIA nodes)'
}

export function diffARIATree(prev: string, current: string): string {
  if (prev === current) return '(no changes)'

  const prevLines = prev.split('\n')
  const currentLines = current.split('\n')
  const prevSet = new Set(prevLines)
  const currentSet = new Set(currentLines)
  const removed = prevLines.filter((line) => !currentSet.has(line))
  const added = currentLines.filter((line) => !prevSet.has(line))

  if (removed.length === 0 && added.length === 0) return '(no changes)'

  return [
    ...removed.map((line) => `- ${line.trimStart()}`),
    ...added.map((line) => `+ ${line.trimStart()}`),
    `(${added.length} added, ${removed.length} removed, ${currentLines.length - added.length} unchanged)`,
  ].join('\n')
}
