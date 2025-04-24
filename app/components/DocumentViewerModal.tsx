'use client'
import { useState, useEffect, useRef } from 'react'
import { Viewer } from '@react-pdf-viewer/core'
import { toolbarPlugin } from '@react-pdf-viewer/toolbar'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/toolbar/lib/styles/index.css'
import AIChatPanel from './AIChatPanel'

const SparkleIcon = () => (
  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L9.5 5.5L13.5 7L9.5 8.5L8 12.5L6.5 8.5L2.5 7L6.5 5.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 2L13 3L13.5 2L14.5 1.5L13.5 1L13 0L12.5 1L11.5 1.5L12.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 13.5L3.5 14.5L4 13.5L5 13L4 12.5L3.5 11.5L3 12.5L2 13L3 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface Props {
  isOpen: boolean
  onClose: () => void
  document: {
    id: string
    name: string
    url: string
  } | null
}

export default function DocumentViewerModal({ isOpen, onClose, document }: Props) {
  const [isShowing, setIsShowing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const mountedRef = useRef(false)
  const toolbarPluginInstance = toolbarPlugin()
  const { Toolbar } = toolbarPluginInstance

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      if (isOpen) {
        setIsShowing(true)
        setIsAnimating(true)
      }
      return
    }

    if (isOpen) {
      setIsShowing(true)
      const timer = setTimeout(() => {
        setIsAnimating(true)
      }, 10)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setIsShowing(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    setIsAIPanelOpen(false);
  }, [document?.id]);

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsShowing(false)
      onClose()
    }, 300)
  }

  if (!isShowing || !document) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-gray-900/50 backdrop-blur-[2px]
          transition-opacity duration-300
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`
            w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
            transform transition-all duration-300 ease-out flex flex-col overflow-hidden
            ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {document?.name}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAIPanelOpen(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-md transition-colors"
              >
                <SparkleIcon />
                Ask AI
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 relative">
            <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
              <div className="flex-shrink-0 p-1 border-b border-gray-200 dark:border-gray-700">
                <Toolbar />
              </div>
              <div className="flex-1 overflow-auto">
                <Viewer 
                  fileUrl={document?.url}
                  plugins={[toolbarPluginInstance]} 
                />
              </div>
            </div>

            {/* AI Panel */}
            <AIChatPanel 
              isOpen={isAIPanelOpen}
              onClose={() => setIsAIPanelOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 