export interface ReproMeta {
  url: string
  startedAt: string
  duration: number
  eventCount: number
}

export type InputEntry = {
  seq: number
  time: string
  ch: 'input'
  type: 'keydown' | 'click' | 'focus'
  key?: string
  target: string
  source: string | null
  focus: string
  prevented: boolean
  ariaTree: string
}

export type StateEntry = {
  seq: number
  time: string
  ch: 'state'
  command: string
  payload: unknown
  diff: string[]
  context?: string
}

export type RouteEntry = {
  seq: number
  time: string
  ch: 'route'
  from: string
  to: string
  method: 'pushState' | 'replaceState' | 'popstate' | 'hashchange'
}

export type ConsoleEntry = {
  seq: number
  time: string
  ch: 'console'
  level: 'error' | 'warn'
  message: string
}

export type ReproEvent = InputEntry | StateEntry | RouteEntry | ConsoleEntry

export function formatTimelineAsText(meta: ReproMeta, timeline: ReproEvent[]): string {
  const lines: string[] = [
    `# REC ${meta.url}`,
    `# ${meta.startedAt} | ${(meta.duration / 1000).toFixed(1)}s | ${meta.eventCount} events`,
    '',
  ]

  let lastSource = ''
  let index = 0
  while (index < timeline.length) {
    const event = timeline[index]
    if (event.ch !== 'input') {
      lines.push(formatStandalone(event))
      lines.push('')
      index += 1
      continue
    }

    const key = event.key ? ` ${event.key}` : ''
    const sourceChanged = event.source !== null && event.source !== lastSource
    if (event.source) lastSource = event.source
    const source = sourceChanged ? ` <- ${event.source}` : ''

    let next = index + 1
    const trailing: string[] = []
    while (next < timeline.length && timeline[next].ch !== 'input') {
      trailing.push(formatTrailing(timeline[next]))
      next += 1
    }

    if (event.ariaTree === '(no changes)' && trailing.length === 0) {
      lines.push(`[${event.seq}] ${event.time} ${event.type}${key} -> ${event.target} (no changes)`)
    } else {
      lines.push(`[${event.seq}] ${event.time} ${event.type}${key} -> ${event.target}${source}`)
      const metaLine = [
        event.focus !== event.target ? `focus: ${event.focus}` : '',
        event.prevented ? 'prevented' : '',
      ].filter(Boolean).join(' | ')
      if (metaLine) lines.push(metaLine)
      for (const treeLine of event.ariaTree.split('\n')) lines.push(`  ${treeLine}`)
      for (const line of trailing) lines.push(line)
    }
    lines.push('')
    index = next
  }

  return lines.join('\n')
}

function formatStandalone(event: ReproEvent): string {
  if (event.ch === 'state') return `[${event.seq}] ${event.time} -> ${event.command}: ${formatDiffs(event.diff)}${event.context ? ` (${event.context})` : ''}`
  if (event.ch === 'route') return `[${event.seq}] ${event.time} route ${event.method}: ${event.from} -> ${event.to}`
  return `[${event.seq}] ${event.time} ${event.level}: ${event.message}`
}

function formatTrailing(event: ReproEvent): string {
  if (event.ch === 'state') return `  -> ${event.command}: ${formatDiffs(event.diff)}${event.context ? ` (${event.context})` : ''}`
  if (event.ch === 'route') return `  route ${event.method}: ${event.from} -> ${event.to}`
  if (event.ch === 'console') return `  ${event.level}: ${event.message}`
  return ''
}

function formatDiffs(diff: string[]): string {
  return diff.length > 0 ? diff.join(', ') : 'no diff'
}
