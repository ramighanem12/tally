'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ActivityRowPopoverProps {
  children: React.ReactNode
  conversationTopic: string
  isVisible: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function ActivityRowPopover({ 
  children, 
  conversationTopic, 
  isVisible, 
  onMouseEnter, 
  onMouseLeave 
}: ActivityRowPopoverProps) {
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const rowRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isVisible && rowRef.current) {
      const rowRect = rowRef.current.getBoundingClientRect()
      const firstCell = rowRef.current.querySelector('td:first-child')
      const firstCellRect = firstCell?.getBoundingClientRect()
      
      if (firstCellRect) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
        
        setPopoverPosition({
          top: firstCellRect.top + scrollTop - 10, // 10px above the cell
          left: firstCellRect.left + scrollLeft + (firstCellRect.width / 2) // Center horizontally on the activity cell
        })
      }
    }
  }, [isVisible])

  const popover = isVisible && mounted ? createPortal(
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-w-xs transition-opacity duration-200"
      style={{
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`,
        transform: 'translate(-50%, -100%)' // Center horizontally and position above
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="text-xs text-gray-500 mb-0.5 font-medium">Topic</div>
      <div className="text-[13px] text-[#1A1A1A] font-medium leading-snug">
        {conversationTopic}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <tr
        ref={rowRef}
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </tr>
      {popover}
    </>
  )
} 