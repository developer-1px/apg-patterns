import { apgExampleCoverage, officialApgExamples } from '../demo/src/shared/apgExampleCoverage.ts'

const patterns = [
  'accordion',
  'alert',
  'alertdialog',
  'breadcrumb',
  'button',
  'carousel',
  'checkbox',
  'combobox',
  'dialog-modal',
  'disclosure',
  'feed',
  'grid',
  'landmarks',
  'link',
  'listbox',
  'menu-button',
  'menubar',
  'meter',
  'radio',
  'slider-multithumb',
  'slider',
  'spinbutton',
  'switch',
  'table',
  'tabs',
  'toolbar',
  'tooltip',
  'treegrid',
  'treeview',
  'windowsplitter',
]

const covered = new Set(apgExampleCoverage.map(({ apgPattern, example }) => `${apgPattern}/${example}`))
let linked = []

try {
  linked = await fetchLinkedExamples()
} catch (error) {
  linked = localOfficialExamples()
  console.warn(`APG live coverage fetch failed; using local official example snapshot. ${formatError(error)}`)
}

const missing = linked.filter((id) => !covered.has(id))
if (missing.length > 0) {
  console.error(`Missing APG examples:\\n${missing.join('\\n')}`)
  process.exit(1)
}

console.log(`Covered ${linked.length} linked APG examples from ${patterns.length} pattern pages.`)

async function fetchLinkedExamples() {
  const linkedExamples = []
  for (const pattern of patterns) {
    const response = await fetch(`https://www.w3.org/WAI/ARIA/apg/patterns/${pattern}/`, {
      headers: { 'User-Agent': 'aria coverage verifier' },
    })
    if (!response.ok) throw new Error(`Failed to fetch ${pattern}: ${response.status}`)

    const html = await response.text()
    const examples = new Set()
    for (const match of html.matchAll(/href="examples\/([^"#?]+?)(?:\/|\.html)["#?]/g)) {
      examples.add(decodeURIComponent(match[1]))
    }
    for (const match of html.matchAll(new RegExp(`href="/WAI/ARIA/apg/patterns/${pattern}/examples/([^/"#?]+?)(?:/|\\\\.html)["#?]`, 'g'))) {
      examples.add(decodeURIComponent(match[1]))
    }
    for (const example of [...examples].sort((a, b) => a.localeCompare(b))) {
      linkedExamples.push(`${pattern}/${example}`)
    }
  }
  return linkedExamples
}

function localOfficialExamples() {
  return Object.entries(officialApgExamples).flatMap(([apgPattern, examples]) =>
    examples.map((example) => `${apgPattern}/${example}`),
  )
}

function formatError(error) {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return String(error)
}
