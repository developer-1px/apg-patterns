import {
  useAccordionPattern,
  type PatternData,
  type PatternEvent,
  type PatternItem,
  type PatternOptions,
} from '../../../../src'

type AccordionItem = PatternItem & {
  content?: string
}

export interface AccordionProps {
  data: PatternData<AccordionItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}

export function Accordion({ data, onEvent, options }: AccordionProps) {
  const accordion = useAccordionPattern(data, onEvent, options)

  return (
    <div
      {...accordion.rootProps}
      className="grid max-w-xl gap-1 border border-zinc-200 rounded dark:border-zinc-800"
    >
      {accordion.renderItems.map((section) => {
        const panelContent = section.panelKey ? data.items[section.panelKey]?.content ?? '' : ''
        return (
          <div key={section.key} className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0">
            <h3 className="m-0">
              <button
                {...section.headerProps}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:outline-zinc-500"
              >
                <span>{section.label}</span>
                <span aria-hidden="true">{section.state.expanded ? '−' : '+'}</span>
              </button>
            </h3>
            {section.state.expanded && section.panelProps ? (
              <div
                {...section.panelProps}
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
