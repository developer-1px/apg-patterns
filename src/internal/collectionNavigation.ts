export type LinearNavigationAction = 'previous' | 'next' | 'first' | 'last'

export interface LinearNavigationOptions<T> {
  wrap?: boolean
  isAvailable?: (item: T) => boolean
}

export type GridNavigationAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'rowStart'
  | 'rowEnd'
  | 'gridStart'
  | 'gridEnd'

export interface GridLocation {
  rowIndex: number
  columnIndex: number
}

export interface GridNavigationOptions<T> {
  wrapColumns?: boolean
  wrapRows?: boolean
  isAvailable?: (item: T) => boolean
}

export interface VisibleTreeOptions<T> {
  roots: readonly T[]
  children: (item: T) => readonly T[]
  isExpanded: (item: T) => boolean
}

export interface TypeaheadItem<T> {
  item: T
  label: string
}

export interface TypeaheadMatchOptions<T> {
  current?: T
  locale?: string | string[]
  matches?: (label: string, query: string) => boolean
}

export function moveLinear<T>(
  items: readonly T[],
  current: T,
  action: LinearNavigationAction,
  options: LinearNavigationOptions<T> = {},
): T | null {
  if (items.length === 0) return null
  if (action === 'first') return firstAvailable(items, options)
  if (action === 'last') return lastAvailable(items, options)

  const index = items.indexOf(current)
  if (index < 0) return null

  const delta = action === 'next' ? 1 : -1
  const maxSteps = options.wrap ? items.length - 1 : items.length

  for (let step = 1; step <= maxSteps; step += 1) {
    const next = index + delta * step
    if (!options.wrap && (next < 0 || next >= items.length)) return null
    const item = items[modulo(next, items.length)]
    if (item !== undefined && isLinearAvailable(item, options)) return item
  }

  return null
}

export function moveGrid<T>(
  rows: readonly (readonly T[])[],
  current: T,
  action: GridNavigationAction,
  options: GridNavigationOptions<T> = {},
): T | null {
  const location = findGridLocation(rows, current)
  if (!location) return null

  const row = rows[location.rowIndex] ?? []
  if (action === 'left') return moveInRow(row, location.columnIndex, -1, options)
  if (action === 'right') return moveInRow(row, location.columnIndex, 1, options)
  if (action === 'rowStart') return firstAvailableCell(row, options)
  if (action === 'rowEnd') return lastAvailableCell(row, options)

  if (action === 'gridStart') {
    for (const candidateRow of rows) {
      const item = firstAvailableCell(candidateRow, options)
      if (item !== null) return item
    }
    return null
  }
  if (action === 'gridEnd') {
    for (let rowIndex = rows.length - 1; rowIndex >= 0; rowIndex -= 1) {
      const item = lastAvailableCell(rows[rowIndex] ?? [], options)
      if (item !== null) return item
    }
    return null
  }

  return moveAcrossRows(rows, location, action === 'down' ? 1 : -1, options)
}

export function visibleTreeItems<T>(options: VisibleTreeOptions<T>): T[] {
  const out: T[] = []
  const visit = (items: readonly T[]): void => {
    for (const item of items) {
      out.push(item)
      if (options.isExpanded(item)) visit(options.children(item))
    }
  }
  visit(options.roots)
  return out
}

export function findTypeaheadMatch<T>(
  items: readonly TypeaheadItem<T>[],
  query: string,
  options: TypeaheadMatchOptions<T> = {},
): T | null {
  const normalized = query.toLocaleLowerCase(options.locale)
  if (!normalized) return null

  const matches = options.matches
    ?? ((label: string, candidate: string) => label.toLocaleLowerCase(options.locale).startsWith(candidate))
  const startIndex = options.current === undefined
    ? 0
    : items.findIndex(({ item }) => item === options.current) + 1

  for (let offset = 0; offset < items.length; offset += 1) {
    const candidate = items[(startIndex + offset) % items.length]
    if (candidate && matches(candidate.label, normalized)) return candidate.item
  }

  return null
}

const modulo = (n: number, m: number): number => ((n % m) + m) % m

function isLinearAvailable<T>(item: T, options: LinearNavigationOptions<T>): boolean {
  return options.isAvailable?.(item) ?? true
}

function firstAvailable<T>(items: readonly T[], options: LinearNavigationOptions<T>): T | null {
  return items.find((item) => isLinearAvailable(item, options)) ?? null
}

function lastAvailable<T>(items: readonly T[], options: LinearNavigationOptions<T>): T | null {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]
    if (item !== undefined && isLinearAvailable(item, options)) return item
  }
  return null
}

function isGridAvailable<T>(item: T, options: GridNavigationOptions<T>): boolean {
  return options.isAvailable?.(item) ?? true
}

function findGridLocation<T>(
  rows: readonly (readonly T[])[],
  current: T,
): GridLocation | null {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const columnIndex = rows[rowIndex]!.indexOf(current)
    if (columnIndex >= 0) return { rowIndex, columnIndex }
  }
  return null
}

function firstAvailableCell<T>(
  row: readonly T[],
  options: GridNavigationOptions<T>,
): T | null {
  return row.find((item) => isGridAvailable(item, options)) ?? null
}

function lastAvailableCell<T>(
  row: readonly T[],
  options: GridNavigationOptions<T>,
): T | null {
  for (let columnIndex = row.length - 1; columnIndex >= 0; columnIndex -= 1) {
    const item = row[columnIndex]
    if (item !== undefined && isGridAvailable(item, options)) return item
  }
  return null
}

function moveInRow<T>(
  row: readonly T[],
  columnIndex: number,
  delta: 1 | -1,
  options: GridNavigationOptions<T>,
): T | null {
  const maxSteps = options.wrapColumns ? row.length - 1 : row.length

  for (let step = 1; step <= maxSteps; step += 1) {
    const nextColumnIndex = columnIndex + delta * step
    if (!options.wrapColumns && (nextColumnIndex < 0 || nextColumnIndex >= row.length)) return null

    const item = row[modulo(nextColumnIndex, row.length)]
    if (item !== undefined && isGridAvailable(item, options)) return item
  }

  return null
}

function findAvailableInRow<T>(
  row: readonly T[],
  columnIndex: number,
  options: GridNavigationOptions<T>,
): T | null {
  if (row.length === 0) return null
  const clampedColumnIndex = Math.min(columnIndex, row.length - 1)

  for (let offset = 0; offset < row.length; offset += 1) {
    const before = row[clampedColumnIndex - offset]
    if (before !== undefined && isGridAvailable(before, options)) return before

    const after = row[clampedColumnIndex + offset + 1]
    if (after !== undefined && isGridAvailable(after, options)) return after
  }

  return null
}

function moveAcrossRows<T>(
  rows: readonly (readonly T[])[],
  location: GridLocation,
  delta: 1 | -1,
  options: GridNavigationOptions<T>,
): T | null {
  const maxSteps = options.wrapRows ? rows.length - 1 : rows.length

  for (let step = 1; step <= maxSteps; step += 1) {
    const nextRowIndex = location.rowIndex + delta * step
    if (!options.wrapRows && (nextRowIndex < 0 || nextRowIndex >= rows.length)) return null

    const row = rows[modulo(nextRowIndex, rows.length)] ?? []
    const item = findAvailableInRow(row, location.columnIndex, options)
    if (item !== null) return item
  }

  return null
}
