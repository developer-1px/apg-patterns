import { useState } from 'react'
import type { ReactNode } from 'react'
import { reduceDisclosureData, reduceTabsData, type PatternData, type PatternEvent } from '../../src'
import { Checkbox } from './Checkbox'
import { checkboxVariantItems, checkboxVariants, type CheckboxVariantKey } from './checkboxData'
import { Disclosure } from './Disclosure'
import {
  initialDisclosureData,
  initialFaqDisclosureData,
  initialImageDisclosureData,
  initialNavMenuDisclosureData,
  initialNavMenuTopLinksDisclosureData,
  type DisclosureVariantKey,
} from './disclosureData'
import { renderCheckboxInspect, renderDisclosureInspect, renderRadioInspect, renderSliderInspect, renderTabsInspect } from './inspect'
import { RadioGroup } from './RadioGroup'
import { initialRadioData, reduceRadioData } from './radioData'
import { Slider } from './Slider'
import { reduceSliderData, sliderVariantItems, sliderVariants, type SliderVariantKey } from './sliderData'
import { Tabs } from './Tabs'
import { closeTabInData, initialTabsVariant, tabsVariantItems, tabsVariants, type TabsVariantKey } from './tabsData'
import { type DemoPattern, type EmitPatternEvent } from './demoPatternTypes'
import { VariantListbox } from './VariantListbox'

export function useWidgetDemoPatterns(onEvent: EmitPatternEvent): readonly DemoPattern[] {
  return [
    useTabsDemoPattern(onEvent),
    useSliderDemoPattern(onEvent),
    useDisclosureDemoPattern(onEvent),
    useCheckboxDemoPattern(onEvent),
    useRadioDemoPattern(onEvent),
  ]
}

function useTabsDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const [variant, setVariant] = useState<TabsVariantKey>(initialTabsVariant)
  const [data, setData] = useState<PatternData>(tabsVariants[initialTabsVariant].data)
  const active = tabsVariants[variant]
  const handleDataChange = (nextData: PatternData, event: PatternEvent) => {
    const activeKey = nextData.state?.activeKey
    if (event.type === 'navigate' && activeKey && active.options.activationMode === 'automatic') {
      setData(reduceTabsData(nextData, { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey }))
      return
    }
    setData(nextData)
  }
  const handleEvent = (event: PatternEvent) => {
    onEvent(event)
    if (event.type === 'extension' && event.name === 'closeTab' && event.key) {
      setData((current) => closeTabInData(current, event.key as string))
    }
  }
  return {
    key: 'tabs',
    label: 'Tabs',
    keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Delete'],
    sourceNames: ['Tabs.tsx', 'tabsData.ts', 'react.ts', 'tabs/runtime.ts', 'tabs/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderTabsInspect(data),
    variants: (
      <VariantControl label="variant">
        <VariantListbox value={variant} items={tabsVariantItems} label="tabs variants" idPrefix="tabs-variant" onChange={(next) => {
          setVariant(next)
          setData(tabsVariants[next].data)
        }} />
      </VariantControl>
    ),
    preview: <Tabs data={data} options={active.options} variantLabel={active.label} hint={active.hint} onEvent={handleEvent} onDataChange={handleDataChange} />,
    reset: () => setData(active.data),
  }
}

function useSliderDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const [variant, setVariant] = useState<SliderVariantKey>('color')
  const [data, setData] = useState(sliderVariants.color.data)
  const options = sliderVariants[variant].options
  return {
    key: 'slider',
    label: 'Slider',
    keyboardShortcuts: ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowLeft', 'Shift+ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
    sourceNames: ['Slider.tsx', 'sliderData.ts', 'slider/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderSliderInspect(data),
    variants: <VariantListbox value={variant} items={sliderVariantItems} label="slider variants" idPrefix="slider-variant" onChange={(next) => {
      setVariant(next)
      setData(sliderVariants[next].data)
    }} />,
    preview: <Slider data={data} options={options} onEvent={(event) => {
      onEvent(event)
      setData((current) => reduceSliderData(current, event, options))
    }} />,
    reset: () => setData(sliderVariants[variant].data),
  }
}

function useDisclosureDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const variants: Record<DisclosureVariantKey, PatternData> = {
    simple: initialDisclosureData,
    image: initialImageDisclosureData,
    faq: initialFaqDisclosureData,
    navMenu: initialNavMenuDisclosureData,
    navMenuTopLinks: initialNavMenuTopLinksDisclosureData,
  }
  const [variant, setVariant] = useState<DisclosureVariantKey>('simple')
  const [data, setData] = useState<PatternData>(initialDisclosureData)
  const items: readonly { key: DisclosureVariantKey; label: string }[] = [
    { key: 'simple', label: 'simple' },
    { key: 'image', label: 'image description' },
    { key: 'faq', label: 'FAQ' },
    { key: 'navMenu', label: 'navigation menu' },
    { key: 'navMenuTopLinks', label: 'navigation menu (top-level links)' },
  ]
  return {
    key: 'disclosure',
    label: 'Disclosure',
    keyboardShortcuts: ['Enter', 'Space'],
    sourceNames: ['Disclosure.tsx', 'disclosureData.ts', 'disclosure/runtime.ts', 'disclosure/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderDisclosureInspect(data),
    variants: (
      <VariantControl label="variant">
        <VariantListbox value={variant} items={items} label="disclosure variants" idPrefix="disclosure-variant" onChange={(next) => {
          setVariant(next)
          setData(variants[next])
        }} />
      </VariantControl>
    ),
    preview: <Disclosure data={data} variant={variant} onEvent={(event) => {
      onEvent(event)
      setData((current) => reduceDisclosureData(current, event))
    }} />,
    reset: () => setData(variants[variant]),
  }
}

function useCheckboxDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const [variant, setVariant] = useState<CheckboxVariantKey>('twoState')
  const [data, setData] = useState(checkboxVariants.twoState.data)
  return {
    key: 'checkbox',
    label: 'Checkbox',
    keyboardShortcuts: ['Space'],
    sourceNames: ['Checkbox.tsx', 'checkboxData.ts', 'checkbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderCheckboxInspect(data),
    variants: <VariantListbox value={variant} items={checkboxVariantItems} label="checkbox variants" idPrefix="checkbox-variant" onChange={(next) => {
      setVariant(next)
      setData(checkboxVariants[next].data)
    }} />,
    preview: <Checkbox data={data} groupLabel={checkboxVariants[variant].groupLabel} onEvent={(event) => {
      onEvent(event)
      setData((current) => checkboxVariants[variant].reduce(current, event))
    }} />,
    reset: () => setData(checkboxVariants[variant].data),
  }
}

function useRadioDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const [data, setData] = useState(initialRadioData)
  return {
    key: 'radio',
    label: 'Radio Group',
    keyboardShortcuts: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Space'],
    sourceNames: ['RadioGroup.tsx', 'radioData.ts', 'radio/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderRadioInspect(data),
    preview: <RadioGroup data={data} onEvent={(event) => {
      onEvent(event)
      setData((current) => reduceRadioData(current, event))
    }} />,
    reset: () => setData(initialRadioData),
  }
}

function VariantControl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
      <span>{label}</span>
      {children}
    </div>
  )
}
