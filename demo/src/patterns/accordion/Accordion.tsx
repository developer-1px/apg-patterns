import {
  useAccordionPattern,
  type PatternData,
  type PatternEvent,
  type PatternItem,
  type PatternOptions,
} from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'

type AccordionItem = PatternItem & {
  content?: string
}

interface AccordionProps {
  data: PatternData<AccordionItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}

export function Accordion({ data, onEvent, options }: AccordionProps) {
  const accordion = useAccordionPattern(data, onEvent, options)

  return (
    <div
      {...accordion.rootProps}
      className="grid max-w-xl gap-px overflow-hidden rounded-md border border-zinc-200 dark:border-white/10"
    >
      {accordion.renderItems.map((section) => {
        const panelContent = section.panelKey ? data.items[section.panelKey]?.content ?? '' : ''
        return (
          <div key={section.key} className="overflow-hidden">
            <h3 className="m-0">
              <button
                {...section.headerProps}
                className={cx(ds.button, ds.expandable, 'w-full justify-between rounded-none bg-transparent')}
              >
                <span>{section.label}</span>
                <Icon name={section.state.expanded ? 'minus' : 'plus'} className="text-xs text-zinc-500 dark:text-zinc-400" />
              </button>
            </h3>
            {section.state.expanded && section.panelProps ? (
              <div
                {...section.panelProps}
                className="border-t border-zinc-200 px-3 py-2 text-sm leading-relaxed text-zinc-700 dark:border-white/10 dark:text-zinc-300"
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
