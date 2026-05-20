export type ModifierKeyName =
  | 'Alt'
  | 'AltGraph'
  | 'CapsLock'
  | 'Control'
  | 'Fn'
  | 'FnLock'
  | 'Hyper'
  | 'Meta'
  | 'NumLock'
  | 'ScrollLock'
  | 'Shift'
  | 'Super'
  | 'Symbol'
  | 'SymbolLock'

export interface KeyInput {
  key: string
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
  isComposing?: boolean
  repeat?: boolean
  location?: number
  code?: string
  getModifierState?: (key: ModifierKeyName) => boolean
  modifierState?: Readonly<Record<string, boolean>>
  keyCode?: number
  timeStamp?: number
}

export interface ParsedShortcut {
  control: boolean
  shift: boolean
  alt: boolean
  altGraph?: true
  meta: boolean
  key: string
}

export interface TypeaheadBuffer {
  feed(e: KeyInput): string | null
  value(): string
  reset(): void
  snapshot(): TypeaheadSnapshot
}

export interface TypeaheadSnapshot {
  timeoutMs: number
  query: string
  lastTime: number
}

export interface TypeaheadOptions {
  timeoutMs?: number
  initial?: Pick<TypeaheadSnapshot, 'query' | 'lastTime'>
}

export function matchesShortcut(e: KeyInput, shortcuts: string): boolean {
  return parseShortcut(shortcuts).some((shortcut) => matchOne(e, shortcut))
}

export function createTypeaheadBuffer(options: TypeaheadOptions = {}): TypeaheadBuffer {
  const timeoutMs = options.timeoutMs ?? 500
  let query = options.initial?.query ?? ''
  let lastTime = options.initial?.lastTime ?? 0

  function reset(): void {
    query = ''
    lastTime = 0
  }

  function feed(e: KeyInput): string | null {
    if (!isPrintable(e)) return null
    const now = e.timeStamp || Date.now()
    if (now - lastTime > timeoutMs) query = ''
    query += e.key
    lastTime = now
    return query
  }

  function snapshot(): TypeaheadSnapshot {
    return { timeoutMs, query, lastTime }
  }

  return { feed, value: () => query, reset, snapshot }
}

function parseShortcut(input: string): ParsedShortcut[] {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseSingle)
}

function parseSingle(token: string): ParsedShortcut {
  const parts = token.split('+')
  if (parts.length === 0 || parts[parts.length - 1] === '') {
    throw new Error(`Invalid shortcut: "${token}"`)
  }
  const out: ParsedShortcut = {
    control: false,
    shift: false,
    alt: false,
    meta: false,
    key: normalizeParsedKey(parts[parts.length - 1]!),
  }
  for (let i = 0; i < parts.length - 1; i += 1) {
    const modifier = parts[i]!.toLowerCase()
    if (modifier === 'mod') {
      if (resolveMod() === 'Meta') out.meta = true
      else out.control = true
    } else if (modifier === 'control') out.control = true
    else if (modifier === 'shift') out.shift = true
    else if (modifier === 'alt') out.alt = true
    else if (modifier === 'altgraph') out.altGraph = true
    else if (modifier === 'meta') out.meta = true
    else throw new Error(`Unknown modifier "${parts[i]}" in "${token}". Allowed: Mod, Control, Shift, Alt, AltGraph, Meta.`)
  }
  return out
}

function matchOne(e: KeyInput, shortcut: ParsedShortcut): boolean {
  if (shortcut.key !== 'Control' && e.ctrlKey !== shortcut.control) return false
  if (shortcut.key !== 'Shift' && e.shiftKey !== shortcut.shift) return false
  if (shortcut.key !== 'Alt' && e.altKey !== shortcut.alt) return false
  if (shortcut.key !== 'AltGraph' && getModifierState(e, 'AltGraph') !== Boolean(shortcut.altGraph)) return false
  if (shortcut.key !== 'Meta' && e.metaKey !== shortcut.meta) return false
  return normalizeMatchKey(e.key) === normalizeMatchKey(shortcut.key)
}

function getModifierState(input: KeyInput, key: ModifierKeyName): boolean {
  if (typeof input.getModifierState === 'function') return input.getModifierState(key)
  if (input.modifierState) return input.modifierState[key] ?? false
  return false
}

function isPrintable(e: KeyInput): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false
  if (e.isComposing) return false
  return e.key.length === 1
}

function normalizeParsedKey(raw: string): string {
  const key = raw.toLowerCase()
  if (key === 'plus') return '+'
  if (key === 'space') return ' '
  return raw
}

function normalizeMatchKey(key: string): string {
  if (key.length === 1) return key.toLowerCase()
  if (key === 'Space') return ' '
  if (key === 'Plus') return '+'
  return key.toLowerCase()
}

function resolveMod(): 'Meta' | 'Control' {
  return isAppleOS() ? 'Meta' : 'Control'
}

function isAppleOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
    ?? navigator.platform
    ?? ''
  return /Mac|iPhone|iPad|iPod/i.test(platform)
}
