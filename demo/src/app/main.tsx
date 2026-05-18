import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../src/kernel/kernelBuiltins'
import { App } from './App'
import { ReproRecorderOverlay } from './repro-recorder'
import '../style.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('[demo] missing #root element')

createRoot(rootElement).render(
  <StrictMode>
    <App />
    <ReproRecorderOverlay />
  </StrictMode>,
)
