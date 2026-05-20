import { existsSync, readFileSync } from 'node:fs'

const surface = [
  pattern('accordion', 'Accordion', 'useAccordionPattern', 'accordion'),
  pattern('alert', 'Alert', 'useAlertPattern', 'alert'),
  pattern('alertdialog', 'AlertDialog', 'useAlertDialogPattern', 'alertdialog'),
  pattern('breadcrumb', 'Breadcrumb', 'useBreadcrumbPattern', 'breadcrumb'),
  pattern('button', 'Button', 'useButtonPattern', 'button'),
  pattern('carousel', 'Carousel', 'useCarouselPattern', 'carousel'),
  pattern('checkbox', 'Checkbox', 'useCheckboxPattern', 'checkbox'),
  pattern('combobox', 'Combobox', 'useComboboxPattern', 'combobox'),
  pattern('dialog', 'Dialog', 'useDialogPattern', 'dialog'),
  pattern('disclosure', 'Disclosure', 'useDisclosurePattern', 'disclosure'),
  pattern('feed', 'Feed', 'useFeedPattern', 'feed'),
  pattern('grid', 'Grid', 'useGridPattern', 'grid'),
  pattern('landmarks', 'Landmarks', 'useLandmarksPattern', 'landmarks'),
  pattern('link', 'Link', 'useLinkPattern', 'link'),
  pattern('listbox', 'Listbox', 'useListboxPattern', 'listbox'),
  pattern('menu-button', 'MenuButton', 'useMenuButtonPattern', 'menu'),
  pattern('menubar', 'Menubar', 'useMenubarPattern', 'menu'),
  pattern('meter', 'Meter', 'useMeterPattern', 'meter'),
  pattern('radio', 'RadioGroup', 'useRadioGroupPattern', 'radio'),
  pattern('slider', 'Slider', 'useSliderPattern', 'slider'),
  pattern('spinbutton', 'Spinbutton', 'useSpinbuttonPattern', 'spinbutton'),
  pattern('switch', 'Switch', 'useSwitchPattern', 'switch'),
  pattern('table', 'Table', 'useTablePattern', 'table'),
  pattern('tabs', 'Tabs', 'useTabsPattern', 'tabs'),
  pattern('toolbar', 'Toolbar', 'useToolbarPattern', 'toolbar'),
  pattern('tooltip', 'Tooltip', 'useTooltipPattern', 'tooltip'),
  pattern('treeview', 'Tree', 'useTreeviewPattern', 'treeview'),
  pattern('treegrid', 'Treegrid', 'useTreegridPattern', 'treegrid'),
  pattern('windowsplitter', 'WindowSplitter', 'useWindowSplitterPattern', 'windowsplitter'),
]

const reactAdapter = readFileSync('src/adapters/react.ts', 'utf8')
const readme = readFileSync('README.md', 'utf8')
const coverageTest = readFileSync('src/tests/presetComponentCoverage.test.tsx', 'utf8')
const missing = []

for (const entry of surface) {
  expectFile(entry.componentPath, `${entry.apgPattern} component file`)
  expectFile(entry.hookPath, `${entry.apgPattern} hook file`)
  expectIncludes(reactAdapter, exportPath(entry.componentPath), `${entry.apgPattern} component export`)
  expectIncludes(reactAdapter, exportPath(entry.hookPath), `${entry.apgPattern} hook export`)
  expectIncludes(readme, `<${entry.component}`, `${entry.apgPattern} README component example`)
  expectIncludes(readme, entry.hook, `${entry.apgPattern} README hook`)
  expectRegex(coverageTest, new RegExp(`<${entry.component}\\b`), `${entry.apgPattern} preset coverage render`)
}

if (missing.length > 0) {
  console.error(`React preset surface is incomplete:\n${missing.join('\n')}`)
  process.exit(1)
}

console.log(`React preset surface covers ${surface.length} APG pattern renderers.`)

function pattern(apgPattern, component, hook, directory) {
  return {
    apgPattern,
    component,
    hook,
    componentPath: `src/patterns/${directory}/${component}.ts`,
    hookPath: `src/patterns/${directory}/${hook}.ts`,
  }
}

function exportPath(path) {
  return path.replace(/^src/, '..').replace(/\.ts$/, '')
}

function expectFile(path, label) {
  if (!existsSync(path)) missing.push(`- missing ${label}: ${path}`)
}

function expectIncludes(source, value, label) {
  if (!source.includes(value)) missing.push(`- missing ${label}: ${value}`)
}

function expectRegex(source, regex, label) {
  if (!regex.test(source)) missing.push(`- missing ${label}: ${regex}`)
}
