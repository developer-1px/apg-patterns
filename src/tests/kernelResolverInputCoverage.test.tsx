import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  createParentByKey,
  evaluatePredicate,
  resolveNavigationTarget,
  type PatternData,
  type Predicate,
} from '../index'
import { treegridDefinition } from '../patterns/treegrid/definition'

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

function KernelResolverHost() {
  const [result, setResult] = useState('')
  const parentByKey = createParentByKey(treegridData)
  const visibleKeys = ['parentName', 'childName']

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
            evaluatePredicate({ kind: 'optionEquals', option: 'mode', value: 'y' }, ctx),
            evaluatePredicate({ kind: 'hasChildren', key: '$activeKey' }, ctx),
            evaluatePredicate({ kind: 'isExpanded', key: '$activeKey' }, ctx),
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
    expect(screen.getByText('false,false,false,false,false,true,true,false,false')).toBeTruthy()
  })
})
