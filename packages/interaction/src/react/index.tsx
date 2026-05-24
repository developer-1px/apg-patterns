import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import {
  createInteractionOwnershipRegistry,
  type InteractionOwner,
  type InteractionOwnerId,
  type InteractionOwnershipRegistry,
} from '../interactionOwnership'
import {
  handleInteractionKeyboardEvent,
  type HandleInteractionKeyboardEventOptions,
  type InteractionKeyboardEventRoute,
} from '../interactionKeyboardEvent'
import {
  evaluateInteractionFocusTarget,
  type InteractionFocusGuardResult,
} from '../interactionFocusGuard'

const InteractionRegistryContext = createContext<InteractionOwnershipRegistry | null>(null)

export interface InteractionProviderProps {
  children: ReactNode
  registry?: InteractionOwnershipRegistry
}

export function InteractionProvider({ children, registry }: InteractionProviderProps) {
  const ownedRegistry = useMemo(() => registry ?? createInteractionOwnershipRegistry(), [registry])
  return (
    <InteractionRegistryContext.Provider value={ownedRegistry}>
      {children}
    </InteractionRegistryContext.Provider>
  )
}

export function useInteractionRegistry(): InteractionOwnershipRegistry {
  const registry = useContext(InteractionRegistryContext)
  if (!registry) throw new Error('[interaction/react] InteractionProvider is required')
  return registry
}

export interface UseInteractionOwnerOptions {
  active?: boolean
}

export function useInteractionOwner(owner: InteractionOwner, options?: UseInteractionOwnerOptions): void {
  const registry = useInteractionRegistry()
  const active = options?.active === true

  useEffect(() => registry.register(owner), [owner, registry])

  useEffect(() => {
    if (active) registry.activate(owner.id)
  }, [active, owner.id, registry])
}

export type UseInteractionKeyboardHandlerOptions = Omit<HandleInteractionKeyboardEventOptions, 'event' | 'registry'>

export function useInteractionKeyboardHandler(
  options?: UseInteractionKeyboardHandlerOptions,
): (event: KeyboardEvent<HTMLElement>) => InteractionKeyboardEventRoute {
  const registry = useInteractionRegistry()

  return useCallback((event: KeyboardEvent<HTMLElement>) => {
    return handleInteractionKeyboardEvent({
      ...(options ?? {}),
      registry,
      event,
    })
  }, [options, registry])
}

export type InteractionFocusGuardCallback = (
  result: InteractionFocusGuardResult,
  event: FocusEvent<HTMLElement>,
) => void

export interface UseInteractionFocusGuardHandlerOptions {
  targetOwnerId?: InteractionOwnerId | null
  getTargetOwnerId?: (target: EventTarget | null) => InteractionOwnerId | null
  onFocusGuard?: InteractionFocusGuardCallback
}

export function useInteractionFocusGuardHandler(
  options?: UseInteractionFocusGuardHandlerOptions,
): (event: FocusEvent<HTMLElement>) => InteractionFocusGuardResult {
  const registry = useInteractionRegistry()

  return useCallback((event: FocusEvent<HTMLElement>) => {
    const targetOwnerId = options?.getTargetOwnerId?.(event.target)
      ?? options?.targetOwnerId
      ?? null
    const result = evaluateInteractionFocusTarget(registry, event.target, { targetOwnerId })
    options?.onFocusGuard?.(result, event)
    return result
  }, [options, registry])
}
