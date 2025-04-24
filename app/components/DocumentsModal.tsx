'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type Tab = 'My documents' | 'Organization';

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function DocumentsModal({ isOpen, onClose }: Props) {
  const [isShowing, setIsShowing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const mountedRef = useRef(false)
  const [activeTab, setActiveTab] = useState<Tab>('My documents')

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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('My documents')
    }
  }, [isOpen])

  if (!isShowing) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop - Make this clickable */}
      <div 
        className={`absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] transition-all duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative h-full pointer-events-none">
        <div 
          className={`fixed inset-x-[5%] inset-y-[5%] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out transform overflow-hidden flex flex-col pointer-events-auto ${
            isAnimating 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-8 opacity-0 scale-95'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Documents
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="px-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4">
              {(['My documents', 'Organization'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-1 inline-flex items-center border-b-2 text-sm font-medium
                    ${tab === activeTab
                      ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'My documents' && (
              <div>
                {/* My documents content */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No documents yet
                </div>
              </div>
            )}

            {activeTab === 'Organization' && (
              <div>
                {/* Organization content */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Organization documents coming soon
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
} 