import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, it } from 'vitest'
import { menuButtonDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../src'
import { Menu } from './Menu'
import { menuVariants } from './menuData'

function D() {
  const v = menuVariants.actionMenuButton
  const [data, setData] = useState<PatternData>(v.data)
  return <Menu data={data} apgPattern="menu-button" focusStrategy="rovingTabIndex" onEvent={(e: PatternEvent) => {
    console.log('EVT', JSON.stringify(e))
    setData((c) => reducePatternData(menuButtonDefinition, c, e))
  }} />
}
describe('d', () => {
  it('a', () => {
    render(<D />)
    const trigger = screen.getByRole('button')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    console.log('AFTER OPEN ad=', screen.getByRole('menu').getAttribute('aria-activedescendant'))
    const items = screen.getAllByRole('menuitem')
    console.log('items', items.map((i) => i.id + ':' + i.getAttribute('tabindex')))
    fireEvent.keyDown(items[0]!, { key: 'ArrowDown' })
    const items2 = screen.getAllByRole('menuitem')
    console.log('AFTER AD ad=', screen.getByRole('menu').getAttribute('aria-activedescendant'))
    console.log('items2', items2.map((i) => i.id + ':' + i.getAttribute('tabindex')))
  })
})
