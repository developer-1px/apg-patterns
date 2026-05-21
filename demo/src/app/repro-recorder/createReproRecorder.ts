import type { PatternEvent } from '../../../../src/schema/patternEvent'
import { diffARIATree, findRoleContainer, serializeARIATree } from './reproARIATree'
import { formatTimelineAsText, type ReproEvent, type ReproMeta } from './reproRecorderFormat'

type PatternEventDetail = {
  event: PatternEvent
  patternKey?: string
  sourceName?: string
  rightMode?: string
}

type ReproRecording = {
  text: string
  meta: ReproMeta
  timeline: ReproEvent[]
}

declare global {
  interface WindowEventMap {
    'apg-pattern-event': CustomEvent<PatternEventDetail>
  }
}

function describeTarget(el: Element | null): string {
  if (!el || !(el instanceof Element)) return 'null'
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  const role = el.getAttribute('role')
  const text = el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 40)
  return `${tag}${id}${role ? `[role="${role}"]` : ''}${text ? ` "${text}"` : ''}`.slice(0, 160)
}

function describeFocus(el: Element | null): string {
  if (!el || el === document.body) return 'body'
  return describeTarget(el)
}

function getComponentInfo(el: Element | null): { stack: string[]; source: string | null } {
  if (!el || !(el instanceof HTMLElement)) return { stack: [], source: null }

  let source: string | null = null
  let current: HTMLElement | null = el
  while (current && current !== document.body) {
    const attr = current.getAttribute('data-inspector-line')
    if (attr) {
      source = attr
      break
    }
    current = current.parentElement
  }

  const component = el.closest<HTMLElement>('[data-component]')
  return { stack: component?.dataset.component ? [component.dataset.component] : [], source }
}

function currentUrl(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export function isReproRecorderShortcut(event: KeyboardEvent): boolean {
  const modShiftSlash = (event.metaKey || event.ctrlKey) && event.shiftKey && (event.key === '\\' || event.code === 'Backslash')
  const altShiftR = event.altKey && event.shiftKey && event.code === 'KeyR'
  return modShiftSlash || altShiftR
}

function isModifierOnlyKey(event: KeyboardEvent): boolean {
  return event.key === 'Shift' || event.key === 'Meta' || event.key === 'Control' || event.key === 'Alt'
}

function patternEventDiff(event: PatternEvent): string[] {
  if (event.type === 'focus') return [`activeKey=${event.key}`]
  if (event.type === 'navigate') return [`direction=${event.direction}`]
  if (event.type === 'select') return [`selectedKeys=${event.keys.join(',')}`]
  if (event.type === 'selectAll') return ['selectAll']
  if (event.type === 'selectColumn') return ['selectColumn']
  if (event.type === 'selectRow') return ['selectRow']
  if (event.type === 'extendSelection') return [`direction=${event.direction}`]
  if (event.type === 'expand') return [`${event.key}.expanded=${event.expanded}`]
  if (event.type === 'expandActiveRow') return [`activeRow.expanded=${event.expanded}`]
  if (event.type === 'check') return [`${event.key}.checked=${event.checked}`]
  if (event.type === 'press') return [`${event.key}.pressed=${event.pressed ?? true}`]
  if (event.type === 'value') return [`${event.key}.value=${JSON.stringify(event.value)}`]
  if (event.type === 'activate') return [`activate=${event.key}`]
  if (event.type === 'dismiss') return ['dismiss']
  return []
}

function contextFromDetail(detail: PatternEventDetail): string | undefined {
  const rightModeLabel = detail.rightMode === 'source' ? 'code' : detail.rightMode === 'log' ? 'events' : detail.rightMode
  const context = [detail.patternKey, detail.sourceName, rightModeLabel].filter(Boolean).join(' / ')
  return context || undefined
}

export function createReproRecorder() {
  let timeline: ReproEvent[] = []
  let active = false
  let seq = 0
  let startTime = 0
  let startedAtWallTime = 0
  let lastAriaTree = ''
  let lastContainer: Element | null = null
  let isFirstInput = true
  let lastFocusDesc = ''
  let lastUrl = ''
  const cleanups: (() => void)[] = []

  const elapsed = () => {
    const ms = Math.round(performance.now() - startTime)
    return ms < 1000 ? `+${ms}ms` : `+${(ms / 1000).toFixed(1)}s`
  }
  const nextSeq = () => {
    seq += 1
    return seq
  }

  function captureAriaTree(target: Element): string {
    const container = findRoleContainer(target)
    const containerChanged = container !== lastContainer
    lastContainer = container
    const current = container ? serializeARIATree(container, document.activeElement) : '(no role container found)'
    if (isFirstInput || containerChanged) {
      isFirstInput = false
      lastAriaTree = current
      return current
    }
    const diff = diffARIATree(lastAriaTree, current)
    lastAriaTree = current
    return diff
  }

  function pushInputEntry(type: 'keydown' | 'click' | 'focus', target: Element | null, prevented: boolean, key?: string) {
    const info = getComponentInfo(target)
    const source = info.source ? `${info.stack.at(-1) ?? ''} (${info.source})`.trim() : info.stack.at(-1) ?? null
    const entry: ReproEvent = {
      seq: nextSeq(),
      time: elapsed(),
      ch: 'input',
      type,
      ...(key !== undefined ? { key } : {}),
      target: describeTarget(target),
      source,
      focus: describeFocus(document.activeElement),
      prevented,
      ariaTree: '(pending)',
    }
    timeline.push(entry)
    requestAnimationFrame(() => {
      entry.ariaTree = target ? captureAriaTree(target) : '(no role container found)'
      entry.focus = describeFocus(document.activeElement)
    })
  }

  function onKeydown(event: KeyboardEvent) {
    if (!active) return
    if (isReproRecorderShortcut(event)) return
    if (isModifierOnlyKey(event)) return
    const key = `${event.ctrlKey || event.metaKey ? 'Mod+' : ''}${event.shiftKey ? 'Shift+' : ''}${event.altKey ? 'Alt+' : ''}${event.key === ' ' ? 'Space' : event.key}`
    pushInputEntry('keydown', event.target instanceof Element ? event.target : null, event.defaultPrevented, key)
  }

  function onClick(event: MouseEvent) {
    if (!active) return
    pushInputEntry('click', event.target instanceof Element ? event.target : null, event.defaultPrevented)
  }

  function onFocusIn(event: FocusEvent) {
    if (!active) return
    const target = event.target instanceof Element ? event.target : null
    const desc = describeTarget(target)
    if (desc === lastFocusDesc) return
    lastFocusDesc = desc
    pushInputEntry('focus', target, false)
  }

  function onPatternEvent(event: CustomEvent<PatternEventDetail>) {
    if (!active) return
    const entry: ReproEvent = {
      seq: nextSeq(),
      time: elapsed(),
      ch: 'state',
      command: event.detail.event.type,
      payload: event.detail.event,
      diff: patternEventDiff(event.detail.event),
      context: contextFromDetail(event.detail),
    }
    timeline.push(entry)
  }

  function pushRouteEntry(method: 'pushState' | 'replaceState' | 'popstate' | 'hashchange', to: string) {
    if (!active || to === lastUrl) return
    timeline.push({ seq: nextSeq(), time: elapsed(), ch: 'route', from: lastUrl, to, method })
    lastUrl = to
  }

  function interceptConsole() {
    function wrap(level: 'error' | 'warn') {
      const original = console[level]
      console[level] = (...args: unknown[]) => {
        if (active) {
          timeline.push({
            seq: nextSeq(),
            time: elapsed(),
            ch: 'console',
            level,
            message: args.map((arg) => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ').slice(0, 500),
          })
        }
        original.apply(console, args)
      }
      return () => { console[level] = original }
    }

    const restoreError = wrap('error')
    const restoreWarn = wrap('warn')
    return () => {
      restoreError()
      restoreWarn()
    }
  }

  return {
    start() {
      cleanups.forEach((cleanup) => cleanup())
      cleanups.length = 0
      timeline = []
      active = true
      seq = 0
      startTime = performance.now()
      startedAtWallTime = Date.now()
      lastAriaTree = ''
      lastContainer = null
      isFirstInput = true
      lastFocusDesc = ''
      lastUrl = currentUrl()

      const originalPushState = history.pushState.bind(history)
      const originalReplaceState = history.replaceState.bind(history)
      const onPopState = () => pushRouteEntry('popstate', currentUrl())
      const onHashChange = () => pushRouteEntry('hashchange', currentUrl())
      history.pushState = (...args) => {
        originalPushState(...args)
        pushRouteEntry('pushState', currentUrl())
      }
      history.replaceState = (...args) => {
        originalReplaceState(...args)
        pushRouteEntry('replaceState', currentUrl())
      }

      window.addEventListener('keydown', onKeydown, true)
      window.addEventListener('click', onClick, true)
      window.addEventListener('focusin', onFocusIn, true)
      window.addEventListener('apg-pattern-event', onPatternEvent)
      window.addEventListener('popstate', onPopState)
      window.addEventListener('hashchange', onHashChange)
      const restoreConsole = interceptConsole()

      cleanups.push(
        () => window.removeEventListener('keydown', onKeydown, true),
        () => window.removeEventListener('click', onClick, true),
        () => window.removeEventListener('focusin', onFocusIn, true),
        () => window.removeEventListener('apg-pattern-event', onPatternEvent),
        () => window.removeEventListener('popstate', onPopState),
        () => window.removeEventListener('hashchange', onHashChange),
        () => { history.pushState = originalPushState; history.replaceState = originalReplaceState },
        restoreConsole,
      )
    },

    stop(): ReproRecording {
      active = false
      cleanups.forEach((cleanup) => cleanup())
      cleanups.length = 0
      const meta = {
        url: currentUrl(),
        startedAt: new Date(startedAtWallTime).toISOString(),
        duration: Math.round(performance.now() - startTime),
        eventCount: timeline.length,
      }
      return { text: formatTimelineAsText(meta, timeline), meta, timeline }
    },

    get isActive() {
      return active
    },
  }
}
