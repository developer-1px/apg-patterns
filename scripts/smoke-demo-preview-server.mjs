import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:net'

const host = '127.0.0.1'
const port = await getAvailablePort()
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
let serverError
server.once('error', (error) => {
  serverError = error
  serverOutput += `${error.stack ?? error.message}\n`
})
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
  await stopServer()
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
    if (serverError) {
      throw new Error(`demo preview server smoke failed: server could not start\n${serverOutput}`)
    }
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

async function stopServer() {
  if (server.exitCode !== null || server.signalCode !== null) return

  server.kill('SIGTERM')
  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (server.exitCode === null && server.signalCode === null) server.kill('SIGKILL')
      resolve()
    }, 2_000)
    server.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

async function getAvailablePort() {
  return await new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', reject)
    probe.listen(0, host, () => {
      const address = probe.address()
      probe.close(() => {
        if (address && typeof address === 'object') resolve(address.port)
        else reject(new Error('demo preview server smoke failed: could not allocate a port'))
      })
    })
  })
}
