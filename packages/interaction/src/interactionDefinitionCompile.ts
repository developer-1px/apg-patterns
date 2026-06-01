import type {
  InteractionDefinitionKeyInput,
  InteractionKeyModifier,
  InteractionKeyPlatformBinding,
  InteractionKeyRuleDefinition,
  InteractionOwnerDefinition,
  InteractionCondition,
} from './interactionDefinitionTypes'
import type {
  InteractionKeyInput,
  InteractionKeyPlatformRule,
  InteractionKeyRule,
  InteractionKeyRuleKind,
  InteractionKeyTargetKind,
  InteractionOwner,
  InteractionOwnerKind,
  InteractionRestoreTarget,
} from './interactionOwnership'

interface InteractionConditionContext {
  definition: InteractionOwnerDefinition
  input: InteractionDefinitionKeyInput
}

interface ResolvedInteractionKeyPlatformBinding extends InteractionKeyPlatformRule {
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export function createInteractionOwner(definition: InteractionOwnerDefinition): InteractionOwner {
  return compileInteractionOwnerUnchecked(definition)
}

export function compileInteractionOwnerUnchecked(definition: InteractionOwnerDefinition): InteractionOwner {
  const keyRules = (definition.keyRules ?? []).map(toRuntimeKeyRule)
  const runtimeKind = runtimeKindForDefinition(definition)

  return {
    id: definition.id,
    kind: runtimeKind,
    diagnostics: {
      label: definition.diagnostics?.label,
      role: definition.diagnostics?.role,
      focusStrategy: definition.focus?.strategy,
      keyRules,
    },
    ownsKey(keyInput) {
      return findMatchingRule(definition, keyInput, (rule) => {
        const ruleKind = rule.kind ?? 'custom'
        if (ruleKind === 'restore') return false
        if (ruleKind === 'shell') return runtimeKind === 'shell'
        return true
      }) !== null
    },
    allowsNativeKey(keyInput) {
      return findMatchingRule(definition, keyInput, (rule) =>
        (rule.kind ?? 'custom') !== 'restore' && ruleAllowsNativeTarget(rule, keyInput, runtimeKind),
      ) !== null
    },
    restoreKeys(keyInput) {
      return findMatchingRule(definition, keyInput, (rule) => (rule.kind ?? 'custom') === 'restore') !== null
    },
    allowsShellKey(keyInput) {
      return shellRulesAllowKey(definition, keyInput)
    },
    restoreTarget: toRuntimeRestoreTarget(definition),
  }
}

export function compileInteractionOwnersUnchecked(
  definitions: readonly InteractionOwnerDefinition[],
): InteractionOwner[] {
  return [...definitions]
    .sort((first, second) => (first.priority ?? 0) - (second.priority ?? 0))
    .map((definition) => compileInteractionOwnerUnchecked(definition))
}

export function evaluateInteractionCondition(
  condition: InteractionCondition,
  definition: InteractionOwnerDefinition,
  input: InteractionDefinitionKeyInput,
): boolean {
  return evaluateCondition(condition, { definition, input })
}

function findMatchingRule(
  definition: InteractionOwnerDefinition,
  input: InteractionKeyInput,
  predicate: (rule: InteractionKeyRuleDefinition) => boolean,
): InteractionKeyRuleDefinition | null {
  for (const rule of definition.keyRules ?? []) {
    if (!predicate(rule)) continue
    if (!ruleMatchesInput(rule, definition, input)) continue
    return rule
  }

  return null
}

function ruleMatchesInput(
  rule: InteractionKeyRuleDefinition,
  definition: InteractionOwnerDefinition,
  input: InteractionKeyInput,
): boolean {
  const binding = resolveDefinitionKeyBinding(rule, input.platform)
  if (!binding.keys.includes(input.key)) return false
  if (binding.code && (!input.code || !binding.code.includes(input.code))) return false
  if (rule.targetKinds && !rule.targetKinds.includes(input.targetKind ?? 'unknown')) return false
  if (!definitionBindingModifiersMatch(binding, input)) return false
  if (rule.when && !evaluateCondition(rule.when, { definition, input })) return false
  return true
}

function modifierRequested(modifiers: readonly InteractionKeyModifier[], modifier: InteractionKeyModifier): boolean {
  return modifiers.includes(modifier)
}

function resolveDefinitionKeyBinding(
  rule: InteractionKeyRuleDefinition,
  platform: InteractionKeyInput['platform'],
): ResolvedInteractionKeyPlatformBinding {
  const platformRule = platform ? rule.platform?.[platform] : undefined
  const modifiers = platformRule?.modifiers ?? rule.modifiers ?? []

  return {
    keys: platformRule?.keys ?? rule.keys,
    code: platformRule?.code ?? rule.code,
    altKey: modifierRequested(modifiers, 'Alt'),
    ctrlKey: modifierRequested(modifiers, 'Control'),
    metaKey: modifierRequested(modifiers, 'Meta'),
    shiftKey: modifierRequested(modifiers, 'Shift'),
  }
}

function definitionBindingModifiersMatch(
  binding: ResolvedInteractionKeyPlatformBinding,
  input: InteractionKeyInput,
): boolean {
  return binding.altKey === (input.altKey ?? false)
    && binding.ctrlKey === (input.ctrlKey ?? false)
    && binding.metaKey === (input.metaKey ?? false)
    && binding.shiftKey === (input.shiftKey ?? false)
}

function shellRulesAllowKey(definition: InteractionOwnerDefinition, input: InteractionKeyInput): boolean {
  if (definition.shellRules?.allowGlobal !== true) return false
  const blockWhen = definition.shellRules.blockWhen
  if (!blockWhen) return true
  return !evaluateCondition(blockWhen, { definition, input })
}

function ruleAllowsNativeTarget(
  rule: InteractionKeyRuleDefinition,
  input: InteractionKeyInput,
  runtimeKind: InteractionOwnerKind,
): boolean {
  const targetKind = input.targetKind ?? 'unknown'
  if (targetKind === 'text-input' || targetKind === 'textarea' || targetKind === 'select' || targetKind === 'contenteditable') {
    return runtimeKind === 'shell'
      ? rule.targetPolicy?.nativeText === 'allow-shell'
      : rule.targetPolicy?.nativeText === 'allow-owner'
  }
  if (targetKind === 'native-control') {
    return runtimeKind === 'shell'
      ? rule.targetPolicy?.nativeControl === 'allow-shell'
      : rule.targetPolicy?.nativeControl === 'allow-owner'
  }
  return false
}

function evaluateCondition(condition: InteractionCondition, context: InteractionConditionContext): boolean {
  switch (condition.type) {
    case 'all':
      return condition.conditions.every((child) => evaluateCondition(child, context))
    case 'any':
      return condition.conditions.some((child) => evaluateCondition(child, context))
    case 'not':
      return !evaluateCondition(condition.condition, context)
    case 'target.kind':
      return matchesOne(context.input.targetKind ?? 'unknown', condition)
    case 'owner.kind':
      return matchesOne(context.definition.kind, condition)
    case 'owner.mode':
      return context.definition.mode !== undefined && matchesOne(context.definition.mode, condition)
    case 'key.value':
      return matchesOne(context.input.key, condition)
    case 'key.modifier':
      return modifierIsPressed(condition.includes, context.input)
    case 'context.value': {
      const value = context.input.context?.[condition.key]
      return value !== undefined && matchesOne(value, condition)
    }
  }
}

function matchesOne<T>(
  value: T,
  condition: { readonly equals?: T; readonly in?: readonly T[] },
): boolean {
  if (condition.equals !== undefined && value === condition.equals) return true
  if (condition.in?.includes(value)) return true
  return false
}

function modifierIsPressed(modifier: InteractionKeyModifier, input: InteractionKeyInput): boolean {
  if (modifier === 'Alt') return input.altKey ?? false
  if (modifier === 'Control') return input.ctrlKey ?? false
  if (modifier === 'Meta') return input.metaKey ?? false
  return input.shiftKey ?? false
}

function toRuntimeKeyRule(rule: InteractionKeyRuleDefinition): InteractionKeyRule {
  const modifiers = rule.modifiers ?? []

  return {
    id: rule.id,
    keys: rule.keys,
    kind: (rule.kind ?? 'custom') as InteractionKeyRuleKind,
    altKey: modifierRequested(modifiers, 'Alt'),
    ctrlKey: modifierRequested(modifiers, 'Control'),
    metaKey: modifierRequested(modifiers, 'Meta'),
    shiftKey: modifierRequested(modifiers, 'Shift'),
    ...(rule.code !== undefined ? { code: rule.code } : {}),
    ...(rule.label !== undefined || rule.description !== undefined ? { label: rule.label ?? rule.description } : {}),
    action: rule.action,
    ...(rule.platform !== undefined ? { platform: toRuntimePlatformRules(rule) } : {}),
    ...(rule.targetKinds !== undefined ? { targetKinds: rule.targetKinds as readonly InteractionKeyTargetKind[] } : {}),
    ...(rule.preventDefault !== undefined ? { preventDefault: rule.preventDefault } : {}),
    ...(rule.stopPropagation !== undefined ? { stopPropagation: rule.stopPropagation } : {}),
  }
}

function toRuntimePlatformRules(rule: InteractionKeyRuleDefinition): InteractionKeyRule['platform'] {
  if (!rule.platform) return undefined
  return {
    ...(rule.platform.mac ? { mac: toRuntimePlatformRule(rule.platform.mac) } : {}),
    ...(rule.platform.windows ? { windows: toRuntimePlatformRule(rule.platform.windows) } : {}),
    ...(rule.platform.linux ? { linux: toRuntimePlatformRule(rule.platform.linux) } : {}),
  }
}

function toRuntimePlatformRule(rule: InteractionKeyPlatformBinding): InteractionKeyPlatformRule {
  const modifiers = rule.modifiers ?? []

  return {
    keys: rule.keys,
    code: rule.code,
    altKey: modifierRequested(modifiers, 'Alt'),
    ctrlKey: modifierRequested(modifiers, 'Control'),
    metaKey: modifierRequested(modifiers, 'Meta'),
    shiftKey: modifierRequested(modifiers, 'Shift'),
  }
}

function runtimeKindForDefinition(definition: InteractionOwnerDefinition): InteractionOwnerKind {
  if (definition.runtimeKind) return definition.runtimeKind
  if (definition.kind === 'shell') return 'shell'
  if (
    definition.kind === 'dialog'
    || definition.kind === 'popover'
    || definition.kind === 'input'
    || definition.kind === 'form'
    || definition.kind === 'editor'
    || definition.kind === 'native-control'
    || definition.kind === 'temporary-control'
  ) {
    return 'temporary-control'
  }
  return 'pattern'
}

function toRuntimeRestoreTarget(definition: InteractionOwnerDefinition): InteractionRestoreTarget | undefined {
  const target = definition.focus?.restore
  if (!target || target.kind === 'none') return undefined

  if (target.kind === 'first' || target.kind === 'selected' || target.kind === 'last-active') {
    return {
      kind: 'active-cursor',
      ownerId: definition.id,
      label: target.label ?? target.kind,
    }
  }

  return {
    kind: target.kind,
    ownerId: definition.id,
    label: target.label,
    ...('elementId' in target ? { elementId: target.elementId } : {}),
  }
}
