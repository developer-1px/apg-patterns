export {
  createInteractionOwnershipRegistry,
  matchInteractionKeyRule,
  resolveInteractionRestoreTarget,
  type InteractionKeyAction,
  type InteractionKeyInput,
  type InteractionKeyPlatformRule,
  type InteractionKeyTargetKind,
  type InteractionKeyRule,
  type InteractionKeyRuleKind,
  type InteractionMatchedKeyRule,
  type InteractionOwner,
  type InteractionOwnerDiagnostics,
  type InteractionOwnerId,
  type InteractionOwnerKind,
  type InteractionOwnershipRegistry,
  type InteractionOwnershipSnapshot,
  type InteractionPlatform,
  type InteractionRestoreInput,
  type InteractionRestoreReason,
  type InteractionRestoreTarget,
  type InteractionRestoreTargetKind,
  type InteractionRestoreTargetResolver,
  type InteractionSerializableValue,
} from './interactionOwnership'

export {
  compileInteractionOwnerUnchecked,
  compileInteractionOwnersUnchecked,
  createInteractionOwner,
  evaluateInteractionCondition,
} from './interactionDefinitionCompile'

export type {
  InteractionActionDescriptor,
  InteractionCondition,
  InteractionDefinitionKeyInput,
  InteractionFocusContainment,
  InteractionFocusDefinition,
  InteractionFocusGuardPolicy,
  InteractionFocusStrategy,
  InteractionFocusTarget,
  InteractionKeyModifier,
  InteractionKeyPlatformBinding,
  InteractionKeyRuleDefinition,
  InteractionOwnerDefinition,
  InteractionOwnerDefinitionKind,
  InteractionOwnerDiagnosticsDefinition,
  InteractionOwnerRuntimeKind,
  InteractionOwnerScope,
  InteractionShellRulesDefinition,
  InteractionTargetPolicy,
} from './interactionDefinitionTypes'

export {
  createInteractionActions,
  getInteractionAction,
  getInteractionRouteAction,
  isInteractionAction,
  type InteractionActionDescriptorFor,
  type InteractionActionHelpers,
  type InteractionActionMap,
  type InteractionActionOf,
  type InteractionActionRouteLike,
} from './interactionActions'

export {
  compileInteractionCommandBindings,
  compileInteractionCommandDefinitions,
  defineInteractionCommandDefinitions,
  formatInteractionCommandBinding,
  formatInteractionCommandKeyboardShortcut,
  formatInteractionCommandPointerInput,
  getInteractionCommandBindingSummary,
  getInteractionCommandMapping,
  type InteractionCommandBindingDefinition,
  type InteractionCommandBindingSummaryInput,
  type InteractionCommandCompiledBinding,
  type InteractionCommandDefinition,
  type InteractionCommandKeyboardShortcutDefinition,
  type InteractionCommandLabelOptions,
  type InteractionCommandMapping,
  type InteractionCommandPointerInputDefinition,
  type InteractionCommandShortcutModifier,
} from './interactionCommand'

export {
  createInteractionRouter,
  shellOwner,
  temporaryControl,
  type InteractionRouter,
  type InteractionRouterOptions,
  type InteractionShellOwnerOptions,
  type InteractionShortcutAction,
  type InteractionShortcutBinding,
  type InteractionShortcutKeyMap,
  type InteractionShortcutList,
  type InteractionShortcutModifier,
  type InteractionShortcutOwnerOptions,
  type InteractionTemporaryControlOptions,
} from './interactionShortcut'

export {
  routeInteractionKey,
  type InteractionRouteReason,
  type InteractionRouteResult,
  type InteractionRouteStatus,
} from './interactionRouting'

export { classifyInteractionKeyTarget } from './interactionKeyTarget'

export {
  evaluateInteractionFocusGuard,
  evaluateInteractionFocusTarget,
  type InteractionFocusGuardAction,
  type InteractionFocusGuardInput,
  type InteractionFocusGuardReason,
  type InteractionFocusGuardResult,
} from './interactionFocusGuard'

export {
  createInteractionDiagnosticsSnapshot,
  describeInteractionDomFocus,
  type InteractionDiagnosticsOptions,
  type InteractionDiagnosticsSnapshot,
  type InteractionDomFocusSnapshot,
} from './interactionDiagnostics'

export {
  detectInteractionPlatform,
  handleInteractionKeyboardEvent,
  interactionKeyInputFromKeyboardEvent,
  resolveInteractionPrimaryModifier,
  routeInteractionKeyboardEvent,
  type HandleInteractionKeyboardEventOptions,
  type InteractionKeyboardEventInputOptions,
  type InteractionKeyboardEventLike,
  type InteractionKeyboardEventRoute,
  type InteractionKeyboardRouteCallback,
} from './interactionKeyboardEvent'
