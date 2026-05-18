import { useEffect, useRef, useState } from 'react'
import type { SourceName } from '../shared/sources'
import { isCopyableSource, loadSourcePreview } from './sourcePreview'

type SourcePreviewState = {
  name: SourceName
  text: string
}

const sourcePreviewCache = new Map<SourceName, string>()

export function useSourcePreviewState(activeSourceName: SourceName) {
  const [sourcePreview, setSourcePreview] = useState<SourcePreviewState>(() => ({
    name: activeSourceName,
    text: sourcePreviewCache.get(activeSourceName) ?? 'loading',
  }))
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const copyRequestId = useRef(0)
  const source = sourcePreview.text
  const sourceLoadedForActiveTab = sourcePreview.name === activeSourceName
  const displayedSource = sourceLoadedForActiveTab ? source : 'loading'
  const canCopySource = isCopyableSource(displayedSource)

  useEffect(() => {
    let cancelled = false
    copyRequestId.current += 1
    setCopyState('idle')
    const cachedSource = sourcePreviewCache.get(activeSourceName)
    if (cachedSource) setSourcePreview({ name: activeSourceName, text: cachedSource })
    loadSourcePreview(activeSourceName).then((nextSource) => {
      if (cancelled) return
      sourcePreviewCache.set(activeSourceName, nextSource)
      setSourcePreview({ name: activeSourceName, text: nextSource })
    })
    return () => {
      copyRequestId.current += 1
      cancelled = true
    }
  }, [activeSourceName])

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 1200)
    return () => window.clearTimeout(timer)
  }, [copyState])

  const copySource = () => {
    if (!canCopySource) return
    const requestId = copyRequestId.current + 1
    copyRequestId.current = requestId
    void copyText(displayedSource).then((copied) => {
      if (copied && copyRequestId.current === requestId) setCopyState('copied')
    })
  }

  return { canCopySource, copySource, copyState, displayedSource }
}

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard?.writeText(value)
    return Boolean(navigator.clipboard)
  } catch {
    return false
  }
}
