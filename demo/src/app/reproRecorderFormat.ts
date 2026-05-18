export type RecorderEntry = {
  seq: number
  time: string
  type: string
  key?: string
  target: string
  defaultPrevented: boolean
  snapshot: string
}

export function describeElement(element: EventTarget | Element | null): string {
  if (!(element instanceof Element)) return 'null'
  const tag = element.tagName.toLowerCase()
  const role = element.getAttribute('role')
  const id = element.id ? `#${element.id}` : ''
  const label = element.getAttribute('aria-label')
  const text = element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 48)
  const name = label ?? text
  return `${tag}${id}${role ? `[role=${role}]` : ''}${name ? ` "${name}"` : ''}`
}

export function serializePreview(target?: EventTarget | Element | null): string {
  const root = target instanceof Element
    ? target.closest<HTMLElement>('[data-demo-preview]') ?? document
    : document
  const combobox = root.querySelector<HTMLElement>('[role="combobox"]')
  if (combobox) return serializeCombobox(combobox)

  const listbox = root.querySelector<HTMLElement>('[role="listbox"]')
  if (listbox) return serializeListbox(listbox)

  return 'preview pattern: not found'
}

export function serializeCombobox(combobox = document.querySelector<HTMLElement>('[role="combobox"]')): string {
  if (!combobox) return 'combobox: not found'

  const activeId = combobox.getAttribute('aria-activedescendant')
  const activeOption = activeId ? document.getElementById(activeId) : null
  const popupId = combobox.getAttribute('aria-controls')
  const popup = popupId ? document.getElementById(popupId) : null
  const input = combobox instanceof HTMLInputElement ? combobox : null

  const lines = [
    `combobox "${getName(combobox)}"`,
    `  focus=${document.activeElement === combobox}`,
    `  value=${JSON.stringify(input?.value ?? '')}`,
    `  expanded=${combobox.getAttribute('aria-expanded') ?? 'null'}`,
    `  activeDescendant=${activeId ?? 'null'}${activeOption ? ` "${getName(activeOption)}"` : ''}`,
    `  activeVisible=${activeOption ? isVisibleWithin(activeOption, popup) : 'n/a'}`,
  ]

  if (popup) {
    lines.push(`popup #${popup.id} scrollTop=${popup.scrollTop} clientHeight=${popup.clientHeight}`)
    const options = Array.from(popup.querySelectorAll<HTMLElement>('[role="option"]'))
    for (const option of options) {
      const selected = option.getAttribute('aria-selected')
      const marker = option === activeOption ? '>' : ' '
      lines.push(`${marker} option #${option.id} "${getName(option)}" selected=${selected ?? 'null'} data-active=${option.hasAttribute('data-active')}`)
    }
  } else {
    lines.push(`popup: not found (${popupId ?? 'no aria-controls'})`)
  }

  return lines.join('\n')
}

export function serializeListbox(listbox = document.querySelector<HTMLElement>('[role="listbox"]')): string {
  if (!listbox) return 'listbox: not found'

  const activeId = listbox.getAttribute('aria-activedescendant')
  const activeOption = activeId ? document.getElementById(activeId) : null
  const focusedOption = document.activeElement instanceof HTMLElement && document.activeElement.getAttribute('role') === 'option'
    ? document.activeElement
    : null
  const activeElement = activeOption ?? focusedOption

  const lines = [
    `listbox "${getName(listbox)}"`,
    `  focus=${document.activeElement === listbox}`,
    `  focusedOption=${focusedOption ? `#${focusedOption.id || '(no id)'} "${getName(focusedOption)}"` : 'null'}`,
    `  activeDescendant=${activeId ?? 'null'}${activeOption ? ` "${getName(activeOption)}"` : ''}`,
    `  activeVisible=${activeElement instanceof HTMLElement ? isVisibleWithin(activeElement, listbox) : 'n/a'}`,
  ]

  const options = Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]'))
  for (const option of options) {
    const selected = option.getAttribute('aria-selected')
    const marker = option === activeElement ? '>' : ' '
    lines.push(`${marker} option #${option.id || '(no id)'} "${getName(option)}" selected=${selected ?? 'null'} data-active=${option.hasAttribute('data-active')}`)
  }

  return lines.join('\n')
}

export function formatRecording(entries: RecorderEntry[]): string {
  if (entries.length === 0) return 'REC: no events'
  return entries.map((entry) => {
    const key = entry.key ? ` ${entry.key}` : ''
    return `[${entry.seq}] ${entry.time} ${entry.type}${key} -> ${entry.target} prevented=${entry.defaultPrevented}\n${entry.snapshot}`
  }).join('\n\n')
}

function getName(element: Element): string {
  return element.getAttribute('aria-label')
    ?? element.getAttribute('aria-labelledby')
    ?? element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60)
    ?? ''
}

function isVisibleWithin(element: HTMLElement, container: HTMLElement | null): boolean {
  if (!container) return false
  const elementTop = element.offsetTop
  const elementBottom = elementTop + element.offsetHeight
  return elementTop >= container.scrollTop && elementBottom <= container.scrollTop + container.clientHeight
}
