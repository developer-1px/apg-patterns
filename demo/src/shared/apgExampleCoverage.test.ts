import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, within } from '@testing-library/react'
import { createElement } from 'react'
import { apgExampleCoverage, officialApgExamples } from './apgExampleCoverage'
import { patternEntries, useDemoPattern } from './demoPatterns'
import { buttonVariantItems } from '../patterns/button/buttonData'
import { carouselVariantItems } from '../patterns/carousel/carouselData'
import { checkboxVariantItems } from '../patterns/checkbox/checkboxData'
import { comboboxVariants } from '../patterns/combobox/comboboxData'
import { dialogVariantItems } from '../patterns/dialog/dialogData'
import { disclosureVariantItems } from '../patterns/disclosure/entry'
import { gridVariantItems } from '../patterns/grid/gridData'
import { landmarkVariantItems } from '../patterns/landmarks/landmarksData'
import { linkVariantItems } from '../patterns/link/linkData'
import { listboxVariantItems } from '../patterns/listbox/listboxDemoRuntime'
import { menuVariantItems } from '../patterns/menu/menuData'
import { radioVariantItems } from '../patterns/radio/radioData'
import { sliderVariantItems } from '../patterns/slider/sliderData'
import { spinbuttonVariantItems } from '../patterns/spinbutton/spinbuttonData'
import { switchVariantItems } from '../patterns/switch/switchData'
import { tableVariants } from '../patterns/table/tableData'
import { tabsVariantItems } from '../patterns/tabs/tabsData'
import { toolbarVariantItems } from '../patterns/toolbar/toolbarData'
import { treeVariantItems } from '../patterns/treeview/treeVariants'

const implementedVariants: Record<string, readonly string[]> = {
  button: buttonVariantItems.map((item) => item.key),
  carousel: carouselVariantItems.map((item) => item.key),
  checkbox: checkboxVariantItems.map((item) => item.key),
  combobox: Object.keys(comboboxVariants),
  dialog: dialogVariantItems.map((item) => item.key),
  disclosure: disclosureVariantItems.map((item) => item.key),
  grid: gridVariantItems.map((item) => item.key),
  landmarks: landmarkVariantItems.map((item) => item.key),
  link: linkVariantItems.map((item) => item.key),
  listbox: listboxVariantItems.map((item) => item.key),
  menu: menuVariantItems.map((item) => item.key),
  radio: radioVariantItems.map((item) => item.key),
  slider: sliderVariantItems.map((item) => item.key),
  spinbutton: spinbuttonVariantItems.map((item) => item.key),
  switch: switchVariantItems.map((item) => item.key),
  table: Object.keys(tableVariants),
  tabs: tabsVariantItems.map((item) => item.key),
  toolbar: toolbarVariantItems.map((item) => item.key),
  treeview: treeVariantItems.map((item) => item.key),
}

const implementedVariantLabels: Record<string, Readonly<Record<string, string>>> = {
  button: labelsByKey(buttonVariantItems),
  carousel: labelsByKey(carouselVariantItems),
  checkbox: labelsByKey(checkboxVariantItems),
  combobox: Object.fromEntries(Object.entries(comboboxVariants).map(([key, value]) => [key, value.label])),
  dialog: labelsByKey(dialogVariantItems),
  disclosure: labelsByKey(disclosureVariantItems),
  grid: labelsByKey(gridVariantItems),
  landmarks: labelsByKey(landmarkVariantItems),
  link: labelsByKey(linkVariantItems),
  listbox: labelsByKey(listboxVariantItems),
  menu: labelsByKey(menuVariantItems),
  radio: labelsByKey(radioVariantItems),
  slider: labelsByKey(sliderVariantItems),
  spinbutton: labelsByKey(spinbuttonVariantItems),
  switch: labelsByKey(switchVariantItems),
  table: Object.fromEntries(Object.entries(tableVariants).map(([key, value]) => [key, value.label])),
  tabs: labelsByKey(tabsVariantItems),
  toolbar: labelsByKey(toolbarVariantItems),
  treeview: labelsByKey(treeVariantItems),
}

afterEach(() => {
  cleanup()
})

describe('APG example coverage', () => {
  it('tracks every official APG example slug', () => {
    const official = Object.entries(officialApgExamples).flatMap(([apgPattern, examples]) =>
      examples.map((example) => exampleId(apgPattern, example)),
    )
    const covered = apgExampleCoverage.map((item) => exampleId(item.apgPattern, item.example))

    expect(new Set(covered)).toEqual(new Set(official))
    expect(covered).toHaveLength(official.length)
  })

  it('references registered demo patterns', () => {
    const registered = new Set(patternEntries.map((entry) => entry.key))
    const missing = apgExampleCoverage.filter((item) => !registered.has(item.demoPattern))

    expect(missing).toEqual([])
  })

  it('references implemented demo variants', () => {
    const missing = apgExampleCoverage.filter((item) => {
      if (!item.variant) return false
      return !(implementedVariants[item.demoPattern] ?? []).includes(item.variant)
    })

    expect(missing).toEqual([])
  })

  it('renders each covered variant in its demo controls', () => {
    const coveredVariants = uniqueBy(
      apgExampleCoverage.filter((item) => item.variant),
      (item) => `${item.demoPattern}:${item.variant}`,
    )

    const variantsByPattern = groupBy(coveredVariants, (item) => item.demoPattern)

    for (const [patternKey, items] of Object.entries(variantsByPattern)) {
      cleanup()
      const { container } = render(createElement(DemoControlsProbe, { patternKey }))
      const controls = within(container)

      for (const item of items) {
        const label = implementedVariantLabels[item.demoPattern]?.[item.variant!]
        expect(label, `${item.demoPattern}:${item.variant}`).toBeTruthy()
        expect(controls.getByRole('option', { name: label })).toBeTruthy()
      }
    }
  }, 15000)
})

function DemoControlsProbe({ patternKey }: { patternKey: string }) {
  return useDemoPattern(patternKey, () => undefined).variants
}

function exampleId(apgPattern: string, example: string) {
  return `${apgPattern}/${example}`
}

function labelsByKey<T extends string>(items: readonly { key: T; label: string }[]) {
  return Object.fromEntries(items.map((item) => [item.key, item.label]))
}

function uniqueBy<T>(items: readonly T[], keyOf: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyOf(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function groupBy<T>(items: readonly T[], keyOf: (item: T) => string) {
  const groups: Record<string, T[]> = {}
  for (const item of items) {
    const key = keyOf(item)
    groups[key] = [...(groups[key] ?? []), item]
  }
  return groups
}
