import {
  useAccordionPattern,
  type PatternData,
  type PatternEvent,
  type PatternItem,
  type PatternOptions,
} from '../../../../src'
import { Icon } from '../../shared/Icon'

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
      className="grid max-w-xl gap-1 rounded-xl bg-zinc-100/70 p-1 shadow-inner shadow-zinc-200/50 dark:bg-white/[0.045] dark:shadow-black/10"
    >
      {accordion.renderItems.map((section) => {
        const panelContent = section.panelKey ? data.items[section.panelKey]?.content ?? '' : ''
        return (
          <div key={section.key} className="overflow-hidden rounded-lg">
            <h3 className="m-0">
              <button
                {...section.headerProps}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-zinc-800 outline-none transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-white/[0.06] dark:focus-visible:outline-zinc-500"
              >
                <span>{section.label}</span>
                <Icon name={section.state.expanded ? 'minus' : 'plus'} className="text-xs text-zinc-500 dark:text-zinc-400" />
              </button>
            </h3>
            {section.state.expanded && section.panelProps ? (
              <div
                {...section.panelProps}
                className="bg-white/55 px-3 pb-3 pt-1 text-sm leading-relaxed text-zinc-700 dark:bg-white/[0.035] dark:text-zinc-300"
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
