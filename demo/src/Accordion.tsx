import { useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import {
  accordionDefinition,
  createPatternRuntime,
  type PatternData,
  type PatternEvent,
} from '../../src'
import { accordionSections } from './accordionData'

type Props = HTMLAttributes<HTMLElement>

const ID_PREFIX = 'accordion-'
const keyToElementId = (key: string) =>
  `${ID_PREFIX}${String(key).toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`

export interface AccordionProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function Accordion({ data, onEvent }: AccordionProps) {
  const runtime = createPatternRuntime({
    definition: accordionDefinition,
    data,
    options: {},
    onEvent,
    keyToElementId,
  })

  const rootKeys = data.relations?.rootKeys ?? []
  const expandedKeys = data.state?.expandedKeys ?? []
  const activeKey = data.state?.activeKey ?? rootKeys[0]
  const groupProps = runtime.getRootProps() as Props
  const rootRef = useRef<HTMLDivElement>(null)
  const didMountRef = useRef(false)

  useLayoutEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (!activeKey) return
    if (!rootRef.current?.contains(document.activeElement)) return
    document.getElementById(keyToElementId(activeKey))?.focus({ preventScroll: true })
  }, [activeKey])

  return (
    <div
      {...groupProps}
      ref={rootRef}
      className="grid max-w-xl gap-1 border border-zinc-200 rounded dark:border-zinc-800"
    >
      {rootKeys.map((key) => {
        const headerProps = runtime.getItemProps('header', key) as Props
        const panelKey = data.relations?.controlsByKey?.[key]?.[0]
        const expanded = expandedKeys.includes(key)
        const section = accordionSections.find((s) => s.key === key)
        const label = section?.label ?? data.items[key]?.label ?? key
        const panelContent =
          (panelKey ? (data.items[panelKey] as { content?: string })?.content : undefined) ??
          section?.content ??
          ''
        return (
          <div key={key} className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
            <h3 className="m-0">
              <button
                type="button"
                {...headerProps}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:outline-zinc-500"
              >
                <span>{label}</span>
                <span aria-hidden="true">{expanded ? '−' : '+'}</span>
              </button>
            </h3>
            {expanded && panelKey ? (
              <div
                {...(runtime.getItemProps('panel', panelKey) as Props)}
                className="px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                {panelContent}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
