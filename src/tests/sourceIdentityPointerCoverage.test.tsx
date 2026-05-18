import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { sourceIdentityNeedles } from '../../scripts/demo-smoke/sourceIdentity.mjs'

function SourceIdentityHost() {
  const [result, setResult] = useState('')
  const resolve = (...pairs: Array<[string, string]>) => {
    setResult(pairs.map(([sourceName, patternKey]) => sourceIdentityNeedles(sourceName, patternKey).join('+')).join('|'))
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          resolve(
            ['menu/entry.tsx', 'menuAndMenubar'],
            ['accordion/entry.tsx', 'button'],
            ['Dialog.tsx', 'dialog'],
            ['sliderData.ts', 'slider'],
          )
        }
      >
        Resolve entry sources
      </button>
      <button
        type="button"
        onClick={() =>
          resolve(
            ['kernel/patternKernel.ts', 'accordion'],
            ['kernel/kernelNavigationTargets.ts', 'accordion'],
            ['kernel/kernelPredicates.ts', 'accordion'],
            ['kernel/kernelStateProjections.ts', 'accordion'],
            ['schema/index.ts', 'accordion'],
          )
        }
      >
        Resolve shared sources
      </button>
      <button
        type="button"
        onClick={() =>
          resolve(
            ['menu/definition.ts', 'menu'],
            ['accordion/definition.ts', 'accordion'],
            ['slider/sliderSources.ts', 'slider'],
            ['menu/menuAriaSources.ts', 'menu'],
            ['treeview/treeviewNavigation.ts', 'treeview'],
            ['tabs/useTabsPattern.ts', 'tabs'],
            ['dialog/runtime.ts', 'dialog'],
            ['grid/navigation.ts', 'grid'],
            ['treeContract.ts', 'tree'],
            ['treeVariants.ts', 'tree'],
            ['unknown/file.txt', 'fallback'],
          )
        }
      >
        Resolve pattern sources
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('source identity coverage from pointer input', () => {
  it('resolves source identity branches from clicks', () => {
    render(<SourceIdentityHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Resolve entry sources' }))
    expect(screen.getByText('export const entry|button|export function Dialog|')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve shared sources' }))
    expect(screen.getByText("defineAriaSource|defineNavigationTarget|definePredicate|defineStateProjection|export * from './patternDefinition'")).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve pattern sources' }))
    expect(screen.getByText('menuButtonDefinition+menubarDefinition|apgPattern: \'accordion\'|defineAriaSource|defineAriaSource|defineNavigationTarget|export function useTabsPattern|||initialData|treeVariants|fallback')).toBeTruthy()
  })
})
