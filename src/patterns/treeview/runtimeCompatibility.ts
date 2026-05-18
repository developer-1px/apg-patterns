import type { KeyInput } from '@interactive-os/keyboard'
import type { Key, KeyboardBinding, PatternData, PatternEvent, PatternOptions } from '../../schema'
import {
  createParentByKey,
  resolveNavigationTarget,
} from '../../kernel/patternKernel'
import { treeviewDefinition } from './definition'
import { resolveTreeKeyboardBinding, type ResolvedKeyboardBinding } from './keyboardBinding'
import { resolveTreeviewVisibleKeys } from './typeahead'

const defaultOptions = {
  selectionMode: 'single',
  focusStrategy: 'rovingTabIndex',
  followFocus: false,
  itemClickAction: 'select',
  indicatorClickAction: 'toggleExpand',
  typeaheadEnabled: true,
  elementIdPrefix: 'treeitem-',
} satisfies PatternOptions

export function resolveTreeviewKeyboardBinding(
  input: KeyInput,
  activeKey: Key,
  data: PatternData,
  options: PatternOptions = defaultOptions,
  keyboard: readonly KeyboardBinding[] = treeviewDefinition.keyboard,
): ResolvedKeyboardBinding | null {
  return resolveTreeKeyboardBinding({ input, activeKey, data, options, keyboard })
}

export function resolveTreeviewNavigationTarget(
  direction: Extract<PatternEvent, { type: 'navigate' }>,
  activeKey: Key,
  data: PatternData,
  parentByKey: ReadonlyMap<Key, Key> = createParentByKey(data),
): Key | null {
  const target = treeviewDefinition.navigation.targets[direction.direction]
  if (!target) return null
  return resolveNavigationTarget(target, {
    activeKey,
    data,
    parentByKey,
    visibleKeys: resolveTreeviewVisibleKeys(data),
  })
}
