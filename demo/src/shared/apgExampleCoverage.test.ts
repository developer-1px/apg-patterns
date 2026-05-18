import { describe, expect, it } from 'vitest'
import { apgExampleCoverage, exampleId, officialApgExamples } from './apgExampleCoverage'
import { patternEntries } from './demoPatterns'
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
import { spinbuttonVariantItems } from '../patterns/spinbutton/entry'
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
  menuAndMenubar: menuVariantItems.map((item) => item.key),
  radio: radioVariantItems.map((item) => item.key),
  slider: sliderVariantItems.map((item) => item.key),
  spinbutton: spinbuttonVariantItems.map((item) => item.key),
  switch: switchVariantItems.map((item) => item.key),
  table: Object.keys(tableVariants),
  tabs: tabsVariantItems.map((item) => item.key),
  toolbar: toolbarVariantItems.map((item) => item.key),
  treeview: treeVariantItems.map((item) => item.key),
}

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
})
