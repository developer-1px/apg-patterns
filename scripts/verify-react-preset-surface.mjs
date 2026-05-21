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
  pattern('treeview', 'Treeview', 'useTreeviewPattern', 'treeview'),
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
  expectRegex(coverageTest, new RegExp(`<${entry.component}\\b`), `${entry.apgPattern} preset coverage render`)
}
expectReadmeReactApiSurface(readme, surface)

if (missing.length > 0) {
  console.error(`React preset surface is incomplete:\n${missing.join('\n')}`)
  process.exit(1)
}

console.log(`React preset surface and README React API cover ${surface.length} APG pattern renderers.`)

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

function expectReadmeReactApiSurface(readme, expectedSurface) {
  const section = readSection(readme, 'React API')
  if (!section) {
    missing.push('- missing README React API section')
    return
  }

  const [componentPart, hookAndLaterPart] = splitRequired(section, /^Implemented hooks:\s*$/m, 'README Implemented hooks marker')
  if (!hookAndLaterPart) return

  const hookPart = hookAndLaterPart.split(/^`useTreeviewPattern` and/m)[0]
  const actualComponents = [...componentPart.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1])
  const actualHooks = [...hookPart.matchAll(/^(use[A-Za-z0-9]+Pattern)\(/gm)].map((match) => match[1])

  expectExactList(actualComponents, expectedSurface.map((entry) => entry.component), 'README React component list')
  expectExactList(actualHooks, expectedSurface.map((entry) => entry.hook), 'README React hook list')
}

function readSection(source, heading) {
  const match = new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, 'm').exec(source)
  if (!match) return ''
  const afterHeading = source.slice(match.index + match[0].length)
  const nextHeadingOffset = afterHeading.search(/\n## /)
  return nextHeadingOffset === -1 ? afterHeading : afterHeading.slice(0, nextHeadingOffset)
}

function splitRequired(source, separator, label) {
  const match = separator.exec(source)
  if (!match) {
    missing.push(`- missing ${label}`)
    return [source, '']
  }
  return [source.slice(0, match.index), source.slice(match.index + match[0].length)]
}

function expectExactList(actual, expected, label) {
  const missingValues = expected.filter((value) => !actual.includes(value))
  const extraValues = actual.filter((value) => !expected.includes(value))
  if (missingValues.length > 0) missing.push(`- ${label} missing: ${missingValues.join(', ')}`)
  if (extraValues.length > 0) missing.push(`- ${label} has unexpected entries: ${extraValues.join(', ')}`)
  if (missingValues.length === 0 && extraValues.length === 0 && actual.join('\n') !== expected.join('\n')) {
    missing.push(`- ${label} order must match the React preset surface`)
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
