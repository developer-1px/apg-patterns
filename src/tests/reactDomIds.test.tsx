import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { RadioGroup, type PatternData } from '../react'

afterEach(() => {
  cleanup()
})

const radioData = {
  items: {
    one: { label: 'One' },
    two: { label: 'Two' },
  },
  relations: { rootKeys: ['one', 'two'] },
  state: { activeKey: 'one', selectedKeys: ['one'] },
} satisfies PatternData

const noop = () => undefined

describe('React DOM ids', () => {
  it('scopes default element ids per pattern instance', () => {
    render(
      <>
        <RadioGroup data={radioData} onEvent={noop} />
        <RadioGroup data={radioData} onEvent={noop} />
      </>,
    )

    const radios = screen.getAllByRole('radio', { name: 'One' })
    expect(radios).toHaveLength(2)
    expect(radios[0]?.id).toMatch(/^radio-/)
    expect(radios[1]?.id).toMatch(/^radio-/)
    expect(radios[0]?.id).not.toBe(radios[1]?.id)
  })

  it('preserves explicit element id prefixes', () => {
    render(<RadioGroup data={radioData} onEvent={noop} options={{ elementIdPrefix: 'choice-' }} />)

    expect(screen.getByRole('radio', { name: 'One' }).id).toBe('choice-one')
  })
})
