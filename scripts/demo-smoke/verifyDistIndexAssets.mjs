import { access, readFile } from 'node:fs/promises'

export async function verifyDistIndexAssets({ distDir, entryFile }) {
  const indexHtml = await readFile(new URL('index.html', distDir), 'utf8')
  const assetRefs = Array.from(indexHtml.matchAll(/(?:src|href)="([^"]+)"/g), ([, assetRef]) => assetRef)
    .filter((assetRef) => assetRef?.replace(/^\.\//, '').startsWith('assets/'))

  if (!indexHtml.includes('<div id="root"></div>')) {
    throw new Error('demo build smoke failed: index.html does not include the app root')
  }
  if (indexHtml.includes('/src/app/main.tsx')) {
    throw new Error('demo build smoke failed: index.html still references the dev entry')
  }
  if (assetRefs.length === 0) {
    throw new Error('demo build smoke failed: index.html has no built asset references')
  }
  if (!assetRefs.includes(`./assets/${entryFile}`)) {
    throw new Error(`demo build smoke failed: index.html does not reference ${entryFile}`)
  }

  const missingAssets = []
  for (const assetRef of assetRefs) {
    if (!assetRef.startsWith('./assets/')) {
      missingAssets.push(`${assetRef} (not relative)`)
      continue
    }
    try {
      await access(new URL(assetRef.replace(/^\.\//, ''), distDir))
    } catch {
      missingAssets.push(assetRef)
    }
  }

  if (missingAssets.length > 0) {
    throw new Error(`demo build smoke failed: index.html references missing assets: ${missingAssets.join(', ')}`)
  }
}
