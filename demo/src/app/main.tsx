import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReproRecorderOverlay } from '@interactive-os/devtools/rec'
import '../../../src/kernel/kernelBuiltins'
import { App } from './App'
import '../style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ReproRecorderOverlay />
  </StrictMode>,
)
