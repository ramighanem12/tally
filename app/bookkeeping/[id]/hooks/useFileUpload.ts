import { useState, useCallback } from 'react'

export type UploadState = 'idle' | 'dragging' | 'uploading'

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>('idle')

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging state if we're not already dragging
    if (uploadState === 'idle') {
      setUploadState('dragging')
    }
  }, [uploadState])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only reset if we're leaving the container (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setUploadState('idle')
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setUploadState('uploading')
    
    const files = Array.from(e.dataTransfer.files)
    console.log('Files dropped:', files)
    
    setTimeout(() => setUploadState('idle'), 1000)
  }, [])

  return {
    uploadState,
    handlers: {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop
    }
  }
} 