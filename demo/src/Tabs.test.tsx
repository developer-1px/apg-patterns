import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { reduceTabsData, type PatternData, type PatternEvent } from '../../src'
import { Tabs } from './Tabs'
import { closeTabInData, tabsVariants, type TabsVariantKey } from './tabsData'

function TabsDemo({ variant, onEvent: onEventOuter }: { variant: TabsVariantKey; onEvent?: (e: PatternEvent) => void }) {
  const spec = tabsVariants[variant]
  const [data, setData] = useState<PatternData>(spec.data)
  const handleDataChange = (nextData: PatternData, event: PatternEvent) => {
    if (event.type === 'extension') return
    const activeKey = nextData.state?.activeKey
    if (event.type === 'navigate' && activeKey && spec.options.activationMode === 'automatic') {
      setData(reduceTabsData(nextData, { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey }))
      return
    }
    setData(nextData)
  }
  const handleEvent = (event: PatternEvent) => {
    onEventOuter?.(event)
    if (event.type === 'extension' && event.name === 'closeTab' && event.key) {
      setData((current) => closeTabInData(current, event.key as string))
    }
  }
  return <Tabs data={data} options={spec.options} onEvent={handleEvent} onDataChange={handleDataChange} />
}

describe('Tabs demo — automatic activation', () => {
  it('ArrowRight moves focus and immediately activates next tab', () => {
    render(<TabsDemo variant="automatic" />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight', code: 'ArrowRight' })
    const tabsAfter = screen.getAllByRole('tab')
    expect(tabsAfter[1].getAttribute('aria-selected')).toBe('true')
    expect(tabsAfter[0].getAttribute('aria-selected')).toBe('false')
    const panel = screen.getByRole('tabpanel')
    const controls = tabsAfter[1].getAttribute('aria-controls')
    expect(panel.id).toBe(controls)
    expect(panel.getAttribute('aria-labelledby')).toBe(tabsAfter[1].id)
  })

  it('click on a tab activates it', () => {
    render(<TabsDemo variant="automatic" />)
    const tabs = screen.getAllByRole('tab')
    fireEvent.click(tabs[2])
    const tabsAfter = screen.getAllByRole('tab')
    expect(tabsAfter[2].getAttribute('aria-selected')).toBe('true')
  })

  it('Home/End jump to first/last tab', () => {
    render(<TabsDemo variant="automatic" />)
    let tabs = screen.getAllByRole('tab')
    fireEvent.keyDown(tabs[0], { key: 'End', code: 'End' })
    tabs = screen.getAllByRole('tab')
    expect(tabs[tabs.length - 1].getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(tabs[tabs.length - 1], { key: 'Home', code: 'Home' })
    tabs = screen.getAllByRole('tab')
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
  })

  it('tablist has horizontal orientation', () => {
    render(<TabsDemo variant="automatic" />)
    const tablist = screen.getByRole('tablist')
    expect(tablist.getAttribute('aria-orientation')).toBe('horizontal')
  })
})

describe('Tabs demo — manual activation', () => {
  it('ArrowRight moves focus only; aria-selected does not change until Enter', () => {
    render(<TabsDemo variant="manual" />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight', code: 'ArrowRight' })
    const after = screen.getAllByRole('tab')
    expect(after[0].getAttribute('aria-selected')).toBe('true')
    expect(after[1].getAttribute('aria-selected')).toBe('false')
    fireEvent.keyDown(document.activeElement ?? after[1], { key: 'Enter', code: 'Enter' })
    const activated = screen.getAllByRole('tab')
    expect(activated[1].getAttribute('aria-selected')).toBe('true')
  })

  it('Space activates the focused tab', () => {
    render(<TabsDemo variant="manual" />)
    const tabs = screen.getAllByRole('tab')
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight', code: 'ArrowRight' })
    fireEvent.keyDown(document.activeElement ?? tabs[1], { key: ' ', code: 'Space' })
    const after = screen.getAllByRole('tab')
    expect(after[1].getAttribute('aria-selected')).toBe('true')
  })
})

describe('Tabs demo — vertical', () => {
  it('emits aria-orientation=vertical and ArrowDown/ArrowUp navigate', () => {
    render(<TabsDemo variant="vertical" />)
    const tablist = screen.getByRole('tablist')
    expect(tablist.getAttribute('aria-orientation')).toBe('vertical')
    const tabs = screen.getAllByRole('tab')
    // earth is initially active (index 2)
    const earthIdx = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')
    expect(earthIdx).toBeGreaterThanOrEqual(0)
    fireEvent.keyDown(tabs[earthIdx], { key: 'ArrowDown', code: 'ArrowDown' })
    const afterDown = screen.getAllByRole('tab')
    expect(afterDown[earthIdx + 1].getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(document.activeElement ?? afterDown[earthIdx + 1], { key: 'ArrowUp', code: 'ArrowUp' })
    const afterUp = screen.getAllByRole('tab')
    expect(afterUp[earthIdx].getAttribute('aria-selected')).toBe('true')
  })
})

describe('Tabs demo — scrollable', () => {
  it('tabpanel is keyboard-focusable (tabIndex=0) and has overflow-auto class', () => {
    render(<TabsDemo variant="scrollable" />)
    const panel = screen.getByRole('tabpanel')
    expect(panel.getAttribute('tabindex')).toBe('0')
    expect(panel.className).toContain('overflow-auto')
  })
})

describe('Tabs demo — closeable', () => {
  it('Delete removes the focused tab and activates an adjacent tab', () => {
    render(<TabsDemo variant="closeable" />)
    const tabsBefore = screen.getAllByRole('tab')
    const initialCount = tabsBefore.length
    const firstLabel = tabsBefore[0].textContent
    const tablist = screen.getByRole('tablist')
    fireEvent.keyDown(tablist, { key: 'Delete', code: 'Delete' })
    const tabsAfter = screen.getAllByRole('tab')
    expect(tabsAfter).toHaveLength(initialCount - 1)
    expect(tabsAfter[0].textContent).not.toBe(firstLabel)
    // one tab is selected (adjacent neighbor activated)
    const selected = tabsAfter.filter((t) => t.getAttribute('aria-selected') === 'true')
    expect(selected).toHaveLength(1)
  })

  it('close button (×) click removes the tab', () => {
    render(<TabsDemo variant="closeable" />)
    const initialCount = screen.getAllByRole('tab').length
    const closeBtn = screen.getByRole('button', { name: /Close Drafts/i })
    fireEvent.click(closeBtn)
    expect(screen.getAllByRole('tab')).toHaveLength(initialCount - 1)
    expect(screen.queryByRole('tab', { name: 'Drafts' })).toBeNull()
  })
})
