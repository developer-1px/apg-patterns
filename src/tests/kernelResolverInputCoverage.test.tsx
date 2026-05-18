import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
		  createParentByKey,
		  defineAriaSource,
		  defineNavigationTarget,
		  definePredicate,
		  defineStateProjection,
		  defineVisibleOrder,
		  evaluatePredicate,
		  hasKeyToken,
		  reducePatternData,
		  resolveAriaSource,
		  resolveKeyToken,
		  resolveNavigationTarget,
		  resolveStateProjection,
		  resolveVisibleOrder,
		  type PatternData,
	  type PatternDefinition,
	  type Predicate,
		} from '../index'
import { predicateRegistry } from '../kernel/kernelRegistries'
import { treegridDefinition } from '../patterns/treegrid/definition'
import { treeviewDefinition } from '../patterns/treeview/definition'

const treegridData = {
  items: {
    parent: { label: 'Parent' },
    child: { label: 'Child' },
    name: { label: 'Name' },
    parentName: { label: 'Parent name' },
    childName: { label: 'Child name' },
  },
  relations: {
    rootKeys: ['parent'],
    childrenByKey: { parent: ['child'] },
    rowKeys: ['parent', 'child'],
    columnKeys: ['name'],
    cells: [
      { rowKey: 'parent', columnKey: 'name', cellKey: 'parentName' },
      { rowKey: 'child', columnKey: 'name', cellKey: 'childName' },
    ],
  },
  state: { activeKey: 'childName', expandedKeys: ['parent'] },
} satisfies PatternData

const selectionDefinition = {
  apgPattern: 'selection-grid',
  rootRole: 'grid',
  containedRoles: ['gridcell'],
  focusModel: 'rovingTabIndex',
  parts: {
    root: { role: 'grid' },
    cell: { role: 'gridcell' },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
} satisfies PatternDefinition

const selectionData = {
  items: {
    ghost: { label: 'Ghost' },
    a1: { label: 'A1' },
    a2: { label: 'A2' },
    b1: { label: 'B1' },
    b2: { label: 'B2' },
  },
  relations: {
    rootKeys: ['ghost', 'a1', 'a2', 'b1', 'b2'],
    cells: [
      { rowKey: 'a', columnKey: 'one', cellKey: 'a1' },
      { rowKey: 'a', columnKey: 'two', cellKey: 'a2' },
      { rowKey: 'b', columnKey: 'one', cellKey: 'b1' },
      { rowKey: 'b', columnKey: 'two', cellKey: 'b2' },
    ],
  },
  state: { activeKey: 'a1', selectedKeys: ['a1'] },
  refs: { label: 'Selection grid' },
} satisfies PatternData

function KernelResolverHost() {
  const [result, setResult] = useState('')
  const parentByKey = createParentByKey(treegridData)
  const visibleKeys = ['parentName', 'childName']
  const rowTarget = (name: keyof typeof treegridDefinition.navigation.targets) => treegridDefinition.navigation.targets[name]!

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const target = treegridDefinition.navigation.targets.parentRow!
          setResult(String(resolveNavigationTarget(target, {
            activeKey: 'childName',
            data: treegridData,
            parentByKey,
            visibleKeys,
          })))
        }}
      >
        Resolve parent cell
      </button>
      <button
        type="button"
        onClick={() => {
          const target = treegridDefinition.navigation.targets.pageDown!
          setResult(String(resolveNavigationTarget(target, {
            activeKey: 'missing',
            data: treegridData,
            parentByKey,
            visibleKeys,
          })))
        }}
      >
        Resolve missing page
      </button>
      <button
        type="button"
        onClick={() => {
          const dataWithoutColumns: PatternData = { ...treegridData, relations: { ...treegridData.relations, columnKeys: [] } }
          const target = treegridDefinition.navigation.targets.parentRow!
          setResult(String(resolveNavigationTarget(target, {
            activeKey: 'childName',
            data: dataWithoutColumns,
            parentByKey,
            visibleKeys,
          })))
        }}
      >
        Resolve missing column
      </button>
      <button
        type="button"
        onClick={() => {
          const ctx = { data: treegridData, options: { mode: 'x' }, activeKey: 'parent', key: 'parent', parentByKey }
	          const values = [
	            evaluatePredicate({ kind: 'isChecked', key: '$activeKey' }, ctx),
	            evaluatePredicate({ kind: 'isPressed', key: '$activeKey' }, ctx),
	            evaluatePredicate({ kind: 'isSwitchOn', key: '$activeKey' }, ctx),
	            evaluatePredicate({ kind: 'isPopupOpen' }, { ...ctx, data: { ...treegridData, state: { expandedKeys: [] } } }),
	            evaluatePredicate({ kind: 'isPopupOpen' }, { ...ctx, key: undefined, activeKey: null, data: { ...treegridData, state: { expandedKeys: ['parent'] } } }),
	            evaluatePredicate({ kind: 'optionEquals', option: 'mode', value: 'y' }, ctx),
	            evaluatePredicate({ kind: 'hasChildren', key: '$activeKey' }, ctx),
	            evaluatePredicate({ kind: 'hasChildren', key: '$key' }, { ...ctx, key: 'child' }),
	            evaluatePredicate({ kind: 'isExpanded', key: '$activeKey' }, ctx),
	            evaluatePredicate({ kind: 'isExpanded', key: '$key' }, { ...ctx, key: 'child' }),
	            evaluatePredicate({ kind: 'isDisabled', key: '$activeKey' }, ctx),
	          ]
          try {
            evaluatePredicate({ kind: 'unknown' } as Predicate, ctx)
          } catch {
            values.push(false)
          }
          setResult(values.join(','))
        }}
      >
        Evaluate predicates
      </button>
      <button
        type="button"
        onClick={() => {
          const ctx = {
            data: {
              ...treegridData,
              state: {
                activeKey: 'parent',
                checkedByKey: { parent: true },
                pressedByKey: { parent: true },
                expandedKeys: ['parent'],
                disabledKeys: [],
              },
            },
            options: { mode: 'x' },
            activeKey: 'parent',
            key: 'parent',
            parentByKey,
          }
          const wrong = { kind: 'wrong', key: '$activeKey', option: 'mode', value: 'x' } as Predicate
          setResult([
            predicateRegistry.get('isChecked')?.(wrong, ctx),
            predicateRegistry.get('isPressed')?.(wrong, ctx),
            predicateRegistry.get('isSwitchOn')?.(wrong, ctx),
            predicateRegistry.get('optionEquals')?.(wrong, ctx),
            predicateRegistry.get('hasChildren')?.(wrong, ctx),
            predicateRegistry.get('isExpanded')?.(wrong, ctx),
            predicateRegistry.get('isDisabled')?.(wrong, ctx),
            evaluatePredicate({ kind: 'isPopupOpen' }, ctx),
          ].join(','))
        }}
      >
        Evaluate predicate guards
      </button>
      <button
        type="button"
        onClick={() => {
          const data: PatternData = {
            ...treegridData,
            state: {
              activeKey: 'parent',
              currentByKey: { parent: 'page' },
              invalidByKey: { parent: true },
              requiredKeys: ['parent'],
              busyKeys: ['parent'],
              modalKeys: ['parent'],
              rangeValueByKey: { parent: { min: 1, max: 10, now: 5, text: 'Half' } },
            },
          }
          const ctx = {
            data,
            options: {},
            activeKey: 'parent',
            key: 'parent',
            parentByKey,
            keyToElementId: (key: string) => `id-${key}`,
          }
          setResult([
            resolveAriaSource('state.currentKey', ctx),
            resolveAriaSource('state.invalidByKey', ctx),
            resolveAriaSource('state.requiredKeys', ctx),
            resolveAriaSource('state.busyKeys', ctx),
            resolveAriaSource('state.modalKeys', ctx),
            resolveAriaSource('state.rangeValueByKey.min', ctx),
            resolveAriaSource('state.rangeValueByKey.max', ctx),
            resolveAriaSource('state.rangeValueByKey.now', ctx),
            resolveAriaSource('state.rangeValueByKey.text', ctx),
            resolveAriaSource('items.href', { ...ctx, key: undefined }),
            resolveAriaSource('items.labelledBy', { ...ctx, key: undefined }),
            resolveAriaSource('options.haspopup', ctx),
            resolveAriaSource('options.autocomplete', ctx),
            resolveAriaSource('relations.controlsByKey', { ...ctx, key: undefined }),
            resolveAriaSource('relations.ownerByKey', { ...ctx, key: undefined }),
          ].join('|'))
        }}
      >
        Resolve aria source edges
      </button>
      <button
        type="button"
        onClick={() => {
          const data: PatternData = {
            items: {
              parent: { label: 'Parent', href: '#parent', labelledBy: 'parent-label', valuemin: 1, valuemax: 9, valuetext: 'five' },
            },
            relations: {
              rootKeys: ['parent'],
              controlsByKey: { parent: ['child'] },
              ownerByKey: { parent: 'owner' },
              rowKeys: ['parent'],
              columnKeys: ['name'],
            },
            state: {
              activeKey: 'parent',
              selectedKeys: [],
              disabledKeys: [],
              expandedKeys: [],
              checkedByKey: {},
              pressedByKey: {},
              currentByKey: {},
              invalidByKey: {},
              requiredKeys: [],
              busyKeys: [],
              modalKeys: [],
              levelByKey: {},
              posInSetByKey: {},
              setSizeByKey: {},
              rowIndexByKey: {},
              columnIndexByKey: {},
              sortByKey: {},
              valueByKey: {},
              rangeValueByKey: {},
            },
          }
          const ctx = {
            data,
            options: { haspopup: 'menu', autocomplete: 'both' },
            activeKey: null,
            key: 'parent',
            parentByKey,
          }
          setResult([
            resolveAriaSource('state.activeKey.elementId', ctx),
            resolveAriaSource('state.inactiveKey', ctx),
            resolveAriaSource('items.href', ctx),
            resolveAriaSource('items.label', ctx),
            resolveAriaSource('items.labelledBy', ctx),
            resolveAriaSource('items.valuemin', ctx),
            resolveAriaSource('items.valuemax', ctx),
            resolveAriaSource('items.valuetext', ctx),
            resolveAriaSource('options.haspopup', ctx),
            resolveAriaSource('options.autocomplete', ctx),
            resolveAriaSource('state.rowCount', ctx),
            resolveAriaSource('state.colCount', ctx),
            resolveAriaSource('relations.controlsByKey', ctx),
            resolveAriaSource('relations.ownerByKey', ctx),
            resolveAriaSource('state.selectedKeys', ctx),
            resolveAriaSource('state.disabledKeys', ctx),
            resolveAriaSource('state.expandedKeys', ctx),
            resolveAriaSource('state.readonly', ctx),
            resolveAriaSource('state.checkedByKey', ctx),
            resolveAriaSource('state.pressedByKey', ctx),
            resolveAriaSource('state.currentByKey', ctx),
            resolveAriaSource('state.currentByKey', { ...ctx, key: undefined }),
            resolveAriaSource('state.invalidByKey', ctx),
            resolveAriaSource('state.requiredKeys', ctx),
            resolveAriaSource('state.busyKeys', ctx),
            resolveAriaSource('state.modalKeys', ctx),
            resolveAriaSource('state.levelByKey', ctx),
            resolveAriaSource('state.posInSetByKey', ctx),
            resolveAriaSource('state.setSizeByKey', ctx),
            resolveAriaSource('state.rowIndexByKey', ctx),
            resolveAriaSource('state.columnIndexByKey', ctx),
            resolveAriaSource('state.sortByKey', ctx),
            resolveAriaSource('state.valueByKey', ctx),
            resolveAriaSource('state.rangeValueByKey.min', ctx),
            resolveAriaSource('state.rangeValueByKey.max', ctx),
            resolveAriaSource('state.rangeValueByKey.now', ctx),
            resolveAriaSource('state.rangeValueByKey.text', ctx),
          ].map(String).join('|'))
        }}
      >
        Resolve aria source fallbacks
      </button>
      <button
        type="button"
        onClick={() => {
          const emptyRows: PatternData = { ...treegridData, relations: { ...treegridData.relations, rootKeys: [], rowKeys: [] } }
          const collapsedRows: PatternData = { ...treegridData, state: { activeKey: null, expandedKeys: [] } }
          const hiddenCellRows: PatternData = { ...treegridData, state: { activeKey: 'childName', expandedKeys: [] } }
          setResult([
            resolveNavigationTarget(rowTarget('rowGridStart'), { activeKey: 'childName', data: treegridData, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowGridEnd'), { activeKey: 'childName', data: treegridData, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowUp'), { activeKey: 'parentName', data: treegridData, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowDown'), { activeKey: 'parentName', data: treegridData, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowUp'), { activeKey: 'parentName', data: { ...treegridData, state: { activeKey: 'parentName', expandedKeys: [] } }, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowDown'), { activeKey: 'childName', data: hiddenCellRows, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowGridStart'), { activeKey: 'childName', data: emptyRows, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowPageDown'), { activeKey: 'parentName', data: collapsedRows, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowPageUp'), { activeKey: 'childName', data: hiddenCellRows, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowPageDown'), { activeKey: 'childName', data: emptyRows, parentByKey, visibleKeys }),
            resolveNavigationTarget(rowTarget('rowDown'), { activeKey: null as never, data: treegridData, parentByKey, visibleKeys }),
            resolveNavigationTarget({ kind: 'treegridRow', action: 'sideways' }, { activeKey: 'parentName', data: treegridData, parentByKey, visibleKeys }),
          ].map(String).join('|'))
        }}
      >
        Resolve treegrid row edges
      </button>
      <button
        type="button"
        onClick={() => {
          const emptyData: PatternData = { ...selectionData, relations: { rootKeys: ['ghost'], cells: [] } }
          const noActiveData: PatternData = { ...selectionData, state: { activeKey: null, selectedKeys: [] } }
          const missingActiveData: PatternData = { ...selectionData, state: { activeKey: 'ghost', selectedKeys: [] } }
          const anchoredData: PatternData = { ...selectionData, state: { activeKey: 'a2', selectedKeys: ['ghost'], anchorKey: 'ghost' } }
          const raggedData: PatternData = {
            ...selectionData,
            relations: { ...selectionData.relations, rootKeys: ['a1', 'a2', 'b1'], cells: selectionData.relations.cells.slice(0, 3) },
            state: { activeKey: 'b1', selectedKeys: ['a2'], anchorKey: 'a2' },
          }
          const values = [
            reducePatternData(selectionDefinition, emptyData, { type: 'selectAll' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, noActiveData, { type: 'selectColumn' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, missingActiveData, { type: 'selectRow' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, noActiveData, { type: 'extendSelection', direction: 'right' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, missingActiveData, { type: 'extendSelection', direction: 'right' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, selectionData, { type: 'extendSelection', direction: 'right' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, selectionData, { type: 'extendSelection', direction: 'down' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, selectionData, { type: 'extendSelection', direction: 'rowEnd' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, anchoredData, { type: 'extendSelection', direction: 'left' }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, selectionData, { type: 'extendSelection', direction: 'sideways' as never }).state?.selectedKeys?.join(',') ?? '',
            reducePatternData(selectionDefinition, raggedData, { type: 'extendSelection', direction: 'left' }).state?.selectedKeys?.join(',') ?? '',
          ]
          setResult(values.join('|'))
        }}
      >
        Reduce selection edges
      </button>
      <button
        type="button"
        onClick={() => {
          const data: PatternData = {
            ...treegridData,
            state: {
              activeKey: 'parent',
              selectedKeys: ['parent'],
              disabledKeys: ['parent'],
              expandedKeys: ['parent'],
              checkedByKey: { parent: true },
              pressedByKey: { parent: 'mixed' },
              currentByKey: { parent: 'page' },
              valueByKey: { parent: 3 },
            },
          }
          const ctx = { data, activeKey: 'parent', key: 'parent', parentByKey }
          const missingKeyCtx = { ...ctx, key: undefined }
          const values = [
            resolveStateProjection('state.activeKey', ctx),
            resolveStateProjection('state.activeKey', missingKeyCtx),
            resolveStateProjection('state.selectedKeys', missingKeyCtx),
            resolveStateProjection('state.disabledKeys', missingKeyCtx),
            resolveStateProjection('state.expandedKeys', missingKeyCtx),
            resolveStateProjection('state.checkedByKey', missingKeyCtx),
            resolveStateProjection('state.pressedByKey', missingKeyCtx),
            resolveStateProjection('state.currentByKey', missingKeyCtx),
            resolveStateProjection('state.valueByKey', missingKeyCtx),
            resolveStateProjection('state.checkedByKey', ctx),
            resolveStateProjection('state.pressedByKey', ctx),
            resolveStateProjection('state.currentByKey', ctx),
            resolveStateProjection('state.valueByKey', ctx),
          ]
          setResult(values.map(String).join('|'))
        }}
      >
        Resolve state projections
      </button>
      <button
        type="button"
        onClick={() => {
          const ctx = { data: { ...treegridData, state: { activeKey: 'parent', anchorKey: 'parent', extentKey: 'child' } }, activeKey: 'parent', key: 'child', parentByKey }
          const values = [
            String(hasKeyToken('$key')),
            String(hasKeyToken('$missing')),
            resolveKeyToken('$key', 'child', 'parent', ctx),
            resolveKeyToken('$activeKey', 'child', 'parent', ctx),
            resolveKeyToken('$anchorKey', 'child', 'parent', ctx),
            resolveKeyToken('$extentKey', 'child', 'parent', ctx),
          ]
          try {
            resolveKeyToken('$missing', 'child', 'parent', ctx)
          } catch (error) {
            values.push((error as Error).message)
          }
          try {
            resolveKeyToken('$key', null, null, ctx)
          } catch (error) {
            values.push((error as Error).message)
          }
          setResult(values.join('|'))
        }}
      >
        Resolve key tokens
      </button>
      <button
        type="button"
        onClick={() => {
          const parentByKey = createParentByKey(treegridData)
          const values: string[] = [
            String(resolveNavigationTarget({ kind: 'firstChild' }, { activeKey: 'parent', data: treegridData, parentByKey, visibleKeys: ['parent', 'child'] })),
            String(resolveNavigationTarget({ kind: 'parentKey' }, { activeKey: 'child', data: treegridData, parentByKey, visibleKeys: ['parent', 'child'] })),
            String(resolveNavigationTarget({ kind: 'parentKey' }, { activeKey: 'orphan', data: treegridData, parentByKey, visibleKeys: ['parent', 'child'] })),
            resolveVisibleOrder(treeviewDefinition.navigation.visibleOrder, { ...treegridData, relations: {}, state: {} }).join(','),
          ]
          for (const action of [
            () => resolveAriaSource('missing.source', { data: treegridData, activeKey: 'parent', key: 'parent' }),
            () => resolveStateProjection('missing.projection', { data: treegridData, activeKey: 'parent', key: 'parent' }),
            () => resolveVisibleOrder({ kind: 'missingVisible' }, treegridData),
            () => resolveNavigationTarget({ kind: 'missingTarget' }, { activeKey: 'parent', data: treegridData, parentByKey, visibleKeys: [] }),
          ]) {
            try {
              action()
            } catch (error) {
              values.push((error as Error).message)
            }
          }
          setResult(values.join('|'))
        }}
      >
        Resolve registry misses
      </button>
      <button
        type="button"
        onClick={() => {
          const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
          const first = () => 'first'
          const second = () => 'second'
          defineAriaSource('coverage.duplicate', first)
          defineAriaSource('coverage.duplicate', second)
          defineStateProjection('coverage.duplicate', first)
          defineStateProjection('coverage.duplicate', second)
          definePredicate('coverage.duplicate', () => true)
          definePredicate('coverage.duplicate', () => false)
          defineVisibleOrder('coverage.duplicate', () => [])
          defineVisibleOrder('coverage.duplicate', () => ['parent'])
          defineNavigationTarget('coverage.duplicate', () => null)
          defineNavigationTarget('coverage.duplicate', () => 'parent')
          setResult(String(warn.mock.calls.length))
          warn.mockRestore()
        }}
      >
        Define duplicate registries
      </button>
		      <output>{result}</output>
	    </div>
	  )
}

describe('kernel resolver coverage from pointer input', () => {
  it('resolves navigation targets and predicate branches from clicks', () => {
    render(<KernelResolverHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Resolve parent cell' }))
    expect(screen.getByText('parentName')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve missing page' }))
    expect(screen.getByText('null')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve missing column' }))
    expect(screen.getByText('null')).toBeTruthy()

	    fireEvent.click(screen.getByRole('button', { name: 'Evaluate predicates' }))
    expect(screen.getByText('false,false,false,false,true,false,true,false,true,false,false,false')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Evaluate predicate guards' }))
    expect(screen.getByText('false,false,false,false,false,false,false,true')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve aria source edges' }))
    expect(screen.getByText('page|true|true|true|true|1|10|5|Half|||listbox|list||')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve aria source fallbacks' }))
    expect(screen.getByText('undefined|true|#parent|Parent|parent-label|1|9|five|menu|both|1|1|child|owner|false|undefined|false|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined|undefined')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve treegrid row edges' }))
    expect(screen.getByText('parent|child|parent|child|parent|null|null|parent|null|null|parent|null')).toBeTruthy()

	    fireEvent.click(screen.getByRole('button', { name: 'Reduce selection edges' }))
	    expect(screen.getByText('a1||||ghost|a1,a2|a1,b1|a1,a2|a1|a1|a1,a2,b1')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve state projections' }))
    expect(screen.getByText('true|false|false|false|false|undefined|undefined|undefined|undefined|true|mixed|page|3')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve key tokens' }))
    expect(screen.getByText('true|false|child|parent|parent|child|[apg-pattern] unknown keyToken token: "$missing" — register via defineKeyToken()|Cannot resolve key token: $key')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve registry misses' }))
    expect(screen.getByText('child|parent|parent||[apg-pattern] unknown ariaSource token: "missing.source" — register via defineAriaSource()|[apg-pattern] unknown stateProjection token: "missing.projection" — register via defineStateProjection()|[apg-pattern] unknown visibleOrder token: "missingVisible" — register via defineVisibleOrder()|[apg-pattern] unknown navigationTarget token: "missingTarget" — register via defineNavigationTarget()')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Define duplicate registries' }))
    expect(screen.getByText('5')).toBeTruthy()
		  })
		})
