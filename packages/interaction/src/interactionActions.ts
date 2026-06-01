import type { InteractionKeyAction } from './interactionOwnership'

export type InteractionActionMap = object

export type InteractionActionDescriptorFor<TActions extends InteractionActionMap> = {
  readonly [Type in keyof TActions & string]: TActions[Type] extends undefined | void
    ? { readonly type: Type; readonly params?: never }
    : { readonly type: Type; readonly params: TActions[Type] }
}[keyof TActions & string]

export type InteractionActionOf<
  TActions extends InteractionActionMap,
  TType extends keyof TActions & string,
> = Extract<InteractionActionDescriptorFor<TActions>, { readonly type: TType }>

export interface InteractionActionRouteLike {
  readonly matchedKeyRule?: {
    readonly action?: InteractionKeyAction
  } | null
}

export interface InteractionActionHelpers<TActions extends InteractionActionMap> {
  is<TType extends keyof TActions & string>(
    action: InteractionKeyAction | null | undefined,
    type: TType,
  ): action is InteractionKeyAction & InteractionActionOf<TActions, TType>
  get<TType extends keyof TActions & string>(
    action: InteractionKeyAction | null | undefined,
    type: TType,
  ): InteractionActionOf<TActions, TType> | null
  getRoute<TType extends keyof TActions & string>(
    route: InteractionActionRouteLike,
    type: TType,
  ): InteractionActionOf<TActions, TType> | null
}

export function createInteractionActions<TActions extends InteractionActionMap>(): InteractionActionHelpers<TActions> {
  return {
    is(action, type) {
      return isInteractionAction<TActions, typeof type>(action, type)
    },
    get(action, type) {
      return getInteractionAction<TActions, typeof type>(action, type)
    },
    getRoute(route, type) {
      return getInteractionRouteAction<TActions, typeof type>(route, type)
    },
  }
}

export function isInteractionAction<
  TActions extends InteractionActionMap,
  TType extends keyof TActions & string,
>(
  action: InteractionKeyAction | null | undefined,
  type: TType,
): action is InteractionKeyAction & InteractionActionOf<TActions, TType> {
  return action?.type === type
}

export function getInteractionAction<
  TActions extends InteractionActionMap,
  TType extends keyof TActions & string,
>(
  action: InteractionKeyAction | null | undefined,
  type: TType,
): InteractionActionOf<TActions, TType> | null {
  return isInteractionAction<TActions, TType>(action, type) ? action : null
}

export function getInteractionRouteAction<
  TActions extends InteractionActionMap,
  TType extends keyof TActions & string,
>(
  route: InteractionActionRouteLike,
  type: TType,
): InteractionActionOf<TActions, TType> | null {
  return getInteractionAction<TActions, TType>(route.matchedKeyRule?.action, type)
}
