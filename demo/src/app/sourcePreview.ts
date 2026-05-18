import { sourceLoaders, type SourceName } from '../shared/sources'

type SourceLoaderMap = Readonly<Record<string, (() => Promise<string>) | undefined>>

export async function loadSourcePreview(sourceName: SourceName, loaders: SourceLoaderMap = sourceLoaders): Promise<string> {
  const loadSource = loaders[sourceName]
  if (!loadSource) return `missing source: ${sourceName}`

  try {
    return await loadSource()
  } catch {
    return `failed source: ${sourceName}`
  }
}

export function isCopyableSource(source: string): boolean {
  return source.length > 0 && !isSourceLoadFailure(source)
}

export function isSourceLoadFailure(source: string): boolean {
  return source.startsWith('missing source:') || source.startsWith('failed source:')
}
