import { createApgTypeaheadBuffer, type ApgTypeaheadBuffer, type KeyInput } from '../../internal/keyboard'
import { findApgTypeaheadMatch } from '../../internal/collectionNavigation'
import { getPatternItemTextValue } from '../../internal/patternItemText'
import {
  PatternDataSchema,
  PatternEventSchema,
  PatternOptionsSchema,
  type Key,
  type PatternData,
  type PatternEvent,
  type PatternOptions,
} from '../../schema'
import { treeviewDefinition } from './definition'
import { createPatternRuntime, type PatternRuntime, type SlotProps } from '../../kernel/patternRuntime'
import { resolveVisibleOrder } from '../../kernel/patternKernel'
import { createElementId } from '../../kernel/domIds'
import { withNonEnumerableMeta } from '../../kernel/domEventBindings'

export type TreeviewRenderState = Record<'active' | 'selected' | 'disabled' | 'expanded', boolean> & {
  checked?: boolean | 'mixed'
}

export interface TreeviewRenderItem {
  key: Key
  state: TreeviewRenderState
  slotProps: {
    treeitem: SlotProps
    indicator?: SlotProps
  }
}

export interface TreeviewRuntime {
  definition: typeof treeviewDefinition
  data: PatternData
  options: PatternOptions
  items: readonly TreeviewRenderItem[]
  slotProps: {
    tree: SlotProps
  }
  getTreeProps(): SlotProps
  getTreeItemProps(key: Key): SlotProps
  getTreeItemState(key: Key): TreeviewRenderState
  getIndicatorProps(key: Key): SlotProps
  keyToElementId(key: Key): string
  emit(event: PatternEvent): void
}

interface CreateTreeviewRuntimeInput {
  data: unknown
  onEvent: (event: PatternEvent) => void
  options?: unknown
  typeaheadBuffer?: ApgTypeaheadBuffer
  keyToElementId?: (key: Key) => string
}

const treeviewDefaultOptions = {
  selectionMode: 'single',
  focusStrategy: 'rovingTabIndex',
  followFocus: false,
  itemClickAction: 'select',
  indicatorClickAction: 'toggleExpand',
  typeaheadEnabled: true,
  elementIdPrefix: 'treeitem-',
} satisfies PatternOptions

export function createTreeviewRuntime(input: CreateTreeviewRuntimeInput): TreeviewRuntime {
  const data = PatternDataSchema.parse(input.data)
  const parsedOptions = PatternOptionsSchema.parse(input.options ?? {})
  const options = { ...treeviewDefaultOptions, ...parsedOptions }
  const emit = (event: PatternEvent) => input.onEvent(withNonEnumerableMeta(PatternEventSchema.parse(event)))
  const keyToElementId = input.keyToElementId ?? ((key: Key) => createElementId(options.elementIdPrefix ?? treeviewDefaultOptions.elementIdPrefix, key))
  const typeahead = input.typeaheadBuffer ?? createApgTypeaheadBuffer()
  const runtime = createPatternRuntime({
    definition: treeviewDefinition,
    data,
    options,
    keyToElementId,
    onEvent: emit,
  })

  const getTreeProps = (): SlotProps => createTreeProps({ runtime, data, options, typeahead, emit })

  const getTreeItemProps = (key: Key): SlotProps => {
    return runtime.getPartProps('treeitem', key)
  }

  const getTreeItemState = (key: Key): TreeviewRenderState => {
    return toTreeviewRenderState(runtime.getItemState(key, 'treeitem'))
  }

  const getIndicatorProps = (key: Key): SlotProps => {
    const { role: _role, id: _id, ...props } = runtime.getPartProps('indicator', key)
    return props
  }

  return {
    definition: treeviewDefinition,
    data,
    options,
    get items() {
      return createTreeviewRenderItems(data, getTreeItemProps, getIndicatorProps, getTreeItemState)
    },
    get slotProps() {
      return { tree: getTreeProps() }
    },
    getTreeProps,
    getTreeItemProps,
    getTreeItemState,
    getIndicatorProps,
    keyToElementId,
    emit,
  }
}

function createTreeviewRenderItems(
  data: PatternData,
  getTreeItemProps: (key: Key) => SlotProps,
  getIndicatorProps: (key: Key) => SlotProps,
  resolveState: (key: Key) => TreeviewRenderState,
): readonly TreeviewRenderItem[] {
  return resolveTreeviewVisibleKeys(data).map((key) => ({
    key,
    state: resolveState(key),
    slotProps: { treeitem: getTreeItemProps(key), indicator: getIndicatorProps(key) },
  }))
}

function toTreeviewRenderState(state: Record<string, unknown>): TreeviewRenderState {
  const out: TreeviewRenderState = { active: false, selected: false, disabled: false, expanded: false }
  out.active = Boolean(state.active)
  out.selected = Boolean(state.selected)
  out.disabled = Boolean(state.disabled)
  out.expanded = Boolean(state.expanded)
  if (state.checked !== undefined) out.checked = state.checked as boolean | 'mixed'
  return out
}

function resolveTreeviewVisibleKeys(data: PatternData): readonly Key[] {
  return resolveVisibleOrder(treeviewDefinition.navigation.visibleOrder, data)
}

function resolveTypeaheadTarget(query: string | null, data: PatternData, options: PatternOptions): Key | null {
  if (options.typeaheadEnabled === false) return null
  if (!query) return null

  return findApgTypeaheadMatch(
    resolveTreeviewVisibleKeys(data).map((key) => ({
      item: key,
      label: getPatternItemTextValue(data, key),
    })),
    query,
  )
}

function createTreeProps({
  runtime,
  data,
  options,
  typeahead,
  emit,
}: {
  runtime: PatternRuntime
  data: PatternData
  options: PatternOptions
  typeahead: ApgTypeaheadBuffer
  emit: (event: PatternEvent) => void
}): SlotProps {
  const props = runtime.getPartProps('tree')
  return {
    ...props,
    onKeyDown: (event: KeyInput & { preventDefault?: () => void }) => {
      const active = data.state?.activeKey ?? runtime.visibleKeys[0]
      if (!active) return
      const typeaheadQuery = options.typeaheadEnabled === false ? null : typeahead.feed(event)
      const typeaheadTarget = resolveTypeaheadTarget(typeaheadQuery, data, options)
      if (typeaheadTarget) {
        event.preventDefault?.()
        emit({ type: 'focus', key: typeaheadTarget, meta: { reason: 'typeahead' } })
        return
      }
      runtime.getRootKeyboardHandler()(event)
    },
  }
}
