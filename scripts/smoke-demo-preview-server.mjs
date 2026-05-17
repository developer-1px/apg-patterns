import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const host = '127.0.0.1'
const port = 4177
const origin = `http://${host}:${port}`
const viteBin = new URL('../node_modules/.bin/vite', import.meta.url)
const configPath = new URL('../vite.config.ts', import.meta.url)
const distIndex = new URL('../demo/dist/index.html', import.meta.url)
const server = spawn(viteBin.pathname, [
  'preview',
  '--config',
  configPath.pathname,
  '--host',
  host,
  '--port',
  String(port),
  '--strictPort',
], {
  cwd: new URL('..', import.meta.url),
  stdio: ['ignore', 'pipe', 'pipe'],
})

let serverOutput = ''
server.stdout.on('data', (chunk) => {
  serverOutput += String(chunk)
})
server.stderr.on('data', (chunk) => {
  serverOutput += String(chunk)
})

try {
  await waitForServer()
  await verifyServedIndex()
  await verifyServedAssets()
  console.log('demo preview server smoke passed')
} finally {
  server.kill()
}

async function verifyServedIndex() {
  const response = await fetch(origin)
  const html = await response.text()

  if (!response.ok) {
    throw new Error(`demo preview server smoke failed: index returned ${response.status}`)
  }
  if (!response.headers.get('content-type')?.includes('text/html')) {
    throw new Error(`demo preview server smoke failed: index content-type is ${response.headers.get('content-type')}`)
  }
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('demo preview server smoke failed: index did not include the app root')
  }
}

async function verifyServedAssets() {
  const indexHtml = await readFile(distIndex, 'utf8')
  const assetRefs = Array.from(indexHtml.matchAll(/(?:src|href)="([^"]+)"/g), ([, assetRef]) => assetRef)
    .filter((assetRef) => assetRef?.startsWith('./assets/'))

  if (assetRefs.length === 0) {
    throw new Error('demo preview server smoke failed: index has no relative assets')
  }

  const failures = []
  await Promise.all(assetRefs.map(async (assetRef) => {
    const response = await fetch(`${origin}/${assetRef.replace(/^\.\//, '')}`)
    if (!response.ok) {
      failures.push(`${assetRef}: ${response.status}`)
      return
    }
    if (assetRef.endsWith('.js') && !response.headers.get('content-type')?.includes('javascript')) {
      failures.push(`${assetRef}: ${response.headers.get('content-type')}`)
    }
    if (assetRef.endsWith('.css') && !response.headers.get('content-type')?.includes('text/css')) {
      failures.push(`${assetRef}: ${response.headers.get('content-type')}`)
    }
  }))

  if (failures.length > 0) {
    throw new Error(`demo preview server smoke failed: ${failures.join(', ')}`)
  }
}

async function waitForServer() {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`demo preview server smoke failed: server exited early\n${serverOutput}`)
    }

    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  throw new Error(`demo preview server smoke failed: server did not start\n${serverOutput}`)
}
