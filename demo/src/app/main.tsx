import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../src/kernel/kernelBuiltins'
import { App } from './App'
import { ReproRecorderOverlay } from './ReproRecorderOverlay'
import '../style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ReproRecorderOverlay />
  </StrictMode>,
)
