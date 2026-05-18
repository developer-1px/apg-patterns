import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { isJsonValue, validateJsonExtensionFields } from '../schema/jsonValue'
import { validatePatternDefinition } from '../schema/patternDefinitionValidation'

function SchemaHelperHost() {
  const [result, setResult] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const issues: unknown[] = []
          const ctx = { addIssue: (issue: unknown) => issues.push(issue) }
          validatePatternDefinition({
            rootRole: 'tree',
            parts: {
              root: { role: 'tree' },
              otherRoot: { role: 'tree' },
            },
            react: {
              root: { part: 'missingRoot' },
              renderItems: {
                variants: [{
                  fields: { expanded: { kind: 'partState', part: 'missingFieldPart' } },
                  props: { item: { part: 'missingPropPart' } },
                }],
              },
            },
          }, ctx as never)
          setResult(String(issues.length))
        }}
      >
        Validate pattern definition
      </button>
      <button
        type="button"
        onClick={() => {
          const issues: unknown[] = []
          const ctx = { addIssue: (issue: unknown) => issues.push(issue) }
          validateJsonExtensionFields(
            {
              known: () => undefined,
              badArray: [1, Number.POSITIVE_INFINITY],
              badRecord: Object.assign(Object.create(null), { ok: true }),
              date: new Date(),
            },
            ['known'],
            ctx as never,
          )
          setResult([
            isJsonValue('x'),
            isJsonValue(1),
            isJsonValue(Number.NaN),
            isJsonValue([true, null]),
            isJsonValue({ nested: ['ok'] }),
            issues.length,
          ].join('|'))
        }}
      >
        Validate json values
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('schema helper coverage from pointer input', () => {
  it('covers validation helper branches through clicks', () => {
    render(<SchemaHelperHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Validate pattern definition' }))
    expect(screen.getByText('4')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Validate json values' }))
    expect(screen.getByText('true|true|false|true|true|2')).toBeTruthy()
  })
})
