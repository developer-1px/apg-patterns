import { access } from 'node:fs/promises'
import { performance } from 'node:perf_hooks'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

const repoRoot = new URL('../', import.meta.url)
const distReactUrl = new URL('dist/react.js', repoRoot)
const iterationCount = readPositiveIntegerEnv('APG_PERF_ITERATIONS', 9, 5)
const warmupCount = readPositiveIntegerEnv('APG_PERF_WARMUPS', 2, 1)
const matrixColumns = 20
const matrixRows = [100, 200, 400]
const treeSizes = [500, 1000, 2000]
const maxFullGrowthRatio = 8
const maxAdjacentGrowthRatio = 5

await assertDistBuilt()

const { Grid, Table, Treegrid, Treeview } = await import(distReactUrl.href)

const groups = [
  {
    label: 'table matrix SSR',
    sizes: matrixRows,
    createElementForSize: (rows) => createElement(Table, { data: createMatrixData(rows, matrixColumns) }),
  },
  {
    label: 'grid matrix SSR',
    sizes: matrixRows,
    createElementForSize: (rows) => createElement(Grid, { data: createMatrixData(rows, matrixColumns), onEvent: noop }),
  },
  {
    label: 'treegrid matrix SSR',
    sizes: matrixRows,
    createElementForSize: (rows) => createElement(Treegrid, { data: createMatrixData(rows, matrixColumns, { tree: true }), onEvent: noop }),
  },
  {
    label: 'treeview flat SSR',
    sizes: treeSizes,
    createElementForSize: (size) => createElement(Treeview, { data: createFlatTreeData(size), onEvent: noop }),
  },
]

const failures = []
const results = []

for (const group of groups) {
  const measurements = group.sizes.map((size) => {
    const durationMs = measureMedian(() => group.createElementForSize(size))
    return { size, durationMs }
  })
  results.push({ label: group.label, measurements })
  assertGrowthShape(group.label, measurements)
}

printResults(results)

if (failures.length > 0) {
  throw new Error(`Performance baseline failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
}

console.log('performance baseline verified')

async function assertDistBuilt() {
  try {
    await access(distReactUrl)
  } catch {
    throw new Error('dist/react.js is missing. Run `npm run build` before `node scripts/verify-performance-baseline.mjs`.')
  }
}

function measureMedian(createElementForRun) {
  for (let i = 0; i < warmupCount; i += 1) {
    renderToString(createElementForRun())
  }

  const durations = []
  for (let i = 0; i < iterationCount; i += 1) {
    const element = createElementForRun()
    const start = performance.now()
    renderToString(element)
    durations.push(performance.now() - start)
  }
  durations.sort((a, b) => a - b)
  return durations[Math.floor(durations.length / 2)]
}

function assertGrowthShape(label, measurements) {
  for (let index = 1; index < measurements.length; index += 1) {
    const previous = measurements[index - 1]
    const current = measurements[index]
    const ratio = current.durationMs / Math.max(previous.durationMs, 0.001)
    if (ratio > maxAdjacentGrowthRatio) {
      failures.push(`${label}: ${current.size}/${previous.size} grew ${formatRatio(ratio)}, expected <= ${maxAdjacentGrowthRatio}x`)
    }
  }

  const first = measurements[0]
  const last = measurements[measurements.length - 1]
  const fullRatio = last.durationMs / Math.max(first.durationMs, 0.001)
  if (fullRatio > maxFullGrowthRatio) {
    failures.push(`${label}: ${last.size}/${first.size} grew ${formatRatio(fullRatio)}, expected <= ${maxFullGrowthRatio}x`)
  }
}

function printResults(groups) {
  for (const group of groups) {
    const summary = group.measurements.map((measurement) => `${measurement.size}: ${formatMs(measurement.durationMs)}`).join(', ')
    const first = group.measurements[0]
    const last = group.measurements[group.measurements.length - 1]
    const ratio = last.durationMs / Math.max(first.durationMs, 0.001)
    console.log(`${group.label}: ${summary} (${last.size}/${first.size} ${formatRatio(ratio)})`)
  }
}

function createMatrixData(rows, columns, options = {}) {
  const items = {}
  const rowKeys = []
  const columnKeys = []
  const cells = []
  const rootKeys = []

  for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
    const columnKey = `col-${columnIndex}`
    columnKeys.push(columnKey)
    items[columnKey] = { label: `Column ${columnIndex}`, textValue: `Column ${columnIndex}`, kind: 'column' }
  }

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const rowKey = `row-${rowIndex}`
    rowKeys.push(rowKey)
    rootKeys.push(rowKey)
    items[rowKey] = { label: `Row ${rowIndex}`, textValue: `Row ${rowIndex}`, kind: 'row' }

    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const cellKey = `r${rowIndex}-c${columnIndex}`
      const label = `R${rowIndex} C${columnIndex}`
      items[cellKey] = { label, textValue: label, itemValue: label, kind: rowIndex === 0 ? 'columnheader' : 'cell' }
      cells.push({ rowKey, columnKey: columnKeys[columnIndex], cellKey })
    }
  }

  return {
    items,
    relations: options.tree ? { rootKeys, rowKeys, columnKeys, cells, childrenByKey: {} } : { rowKeys, columnKeys, cells },
    state: { activeKey: 'r0-c0', expandedKeys: options.tree ? rootKeys : [] },
  }
}

function createFlatTreeData(size) {
  const items = {}
  const rootKeys = []
  for (let index = 0; index < size; index += 1) {
    const key = `item-${index}`
    items[key] = { label: `Item ${index}`, textValue: `Item ${index}` }
    rootKeys.push(key)
  }
  return {
    items,
    relations: { rootKeys, childrenByKey: {} },
    state: { activeKey: rootKeys[0] ?? null, selectedKeys: rootKeys.length > 0 ? [rootKeys[rootKeys.length - 1]] : [] },
  }
}

function formatMs(value) {
  return `${value.toFixed(1)}ms`
}

function formatRatio(value) {
  return `${value.toFixed(2)}x`
}

function readPositiveIntegerEnv(name, fallback, minimum) {
  const value = Number.parseInt(process.env[name] ?? '', 10)
  if (!Number.isFinite(value)) return fallback
  return Math.max(minimum, value)
}

function noop() {}
