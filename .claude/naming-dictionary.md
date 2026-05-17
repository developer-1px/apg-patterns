---
last_commit: 7ea773da7543699e6765bf512c655d97e5116ce8
last_updated: 2026-05-17
---

## Verbs
| fragment | count | roles | identifiers |
|----------|-------|-------|-------------|
| define | 7 | register (registry insert) | defineAriaSource, defineStateProjection, definePredicate, defineVisibleOrder, defineNavigationTarget, defineKeyToken, defineDomEventHandlerProp |
| resolve | 8 | dispatch (kernel registry lookup+invoke): resolveAriaSource, resolveStateProjection, resolveVisibleOrder, resolveKeyToken, resolveEventTemplate, resolveNavigationTarget; compute (treeview helper): resolveTreeKeyboardBinding, resolveTreeviewNavigationTarget; search: resolveTypeaheadTarget |
| is | 4 | predicate (boolean): isRegisteredAriaSource, isRegisteredStateProjection, isRegisteredVisibleOrder, isRegisteredNavigationTarget |
| create | 4 | factory | createPatternRuntime, createParentByKey, createTabsRuntime, createTreeviewRuntime |
| reduce | 2 | event→data reducer | reducePatternData, reduceTabsData |
| evaluate | 1 | combinator | evaluatePredicate |
| use | 2 | React hook | useTreeviewPattern, useTabsPattern |
| get | 1 | derive state | getTreeItemState |

## Postfixes
| fragment | count | rule | identifiers |
|----------|-------|------|-------------|
| Schema | 25+ | Zod schema definition | KeySchema, PatternDataSchema, ... |
| Definition | 4 | parsed Zod schema (constant data) | listboxDefinition, gridDefinition, tabsDefinition, treeviewDefinition |
| DefinitionSchema | 2 | refined PatternDefinition variant | TabsDefinitionSchema, TreeviewDefinitionSchema |
| Runtime | 5 | runtime object (factory result) | PatternRuntime, TabsRuntime, TreeviewRuntime, ReactTreeviewRuntime, ReactTabsRuntime |
| Resolver | 5 | callback type | AriaSourceResolver, StateProjectionResolver, PredicateResolver, VisibleOrderResolver, NavigationTargetResolver |
| Input | 3 | factory input record | CreatePatternRuntimeInput, CreateTabsRuntimeInput, CreateTreeviewRuntimeInput |
| Context | 2 | resolver execution context | PatternRuntimeContext, NavigationTargetContext |
| Projection | 3 | declarative projection spec | AriaProjection, StateProjection, FocusProjection |
| Binding | 3 | declarative binding spec | KeyboardBinding, PartEventBinding, ResolvedKeyboardBinding |
| Props | 4 | DOM slot props | SlotProps, TreeviewSlotProps, ReactTreeviewProps, ReactTabsProps |
| Options | 1 | runtime options (all-optional config) | PatternOptions |
| Data | 1 | observable pattern state | PatternData |

## Synonym Map
| canonical | known synonyms | notes |
|-----------|---------------|-------|
| resolve | dispatch (removed) | kernel registry lookup+invoke. dispatch was a single-instance drift, unified into resolve |
| create | — | sole factory verb |
| define | — | sole registry register verb |

## Role Map
| fragment | role | verb | examples |
|----------|------|------|----------|
| resolve | kernel registry dispatch | resolve | resolveAriaSource, resolveNavigationTarget |
| resolve | treeview-layer compute | resolve (specific suffix) | resolveTreeviewNavigationTarget, resolveTreeKeyboardBinding |
| resolve | search/match | resolve | resolveTypeaheadTarget |
| define | registry insert | define | defineAriaSource, defineKeyToken |
| is | boolean check | is | isRegisteredAriaSource |
| create | object factory | create | createPatternRuntime, createTreeviewRuntime |

## Naming Conventions
- File: kebab/camelCase mixed by responsibility. PatternKernel infra in `src/`, pattern-specific in `src/patterns/<name>/{definition,runtime}.ts`
- Type: PascalCase
- Function/const: camelCase
- Pattern definition naming: `<pattern>Definition` (constant) + `<Pattern>DefinitionSchema` (refined schema). `Pattern` prefix dropped from intermediate names — pattern name in folder is enough namespace.
