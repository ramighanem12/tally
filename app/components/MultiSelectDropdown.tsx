'use client'
import { useState, useEffect, useRef } from 'react'

interface Option {
  id: string
  label: string
}

interface MultiSelectDropdownProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
}

export default function MultiSelectDropdown({ 
  options, 
  selected, 
  onChange, 
  placeholder 
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get labels in selection order
  const getSelectedLabels = () => {
    return selected
      .map(id => options.find(opt => opt.id === id)?.label)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 h-[36px] bg-white border border-[#E4E5E1] rounded
          text-left text-[14px] leading-[20px] font-oracle
          hover:border-[#1A1A1A] transition-colors flex items-center justify-between"
      >
        <span className={`${selected.length === 0 ? 'text-[#646462]' : 'text-[#1A1A1A]'} truncate`}>
          {selected.length === 0 
            ? placeholder
            : getSelectedLabels()}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} flex-shrink-0 ml-2`}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[#E4E5E1] rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-[240px] overflow-y-auto">
            {options.map((option) => (
              <label 
                key={option.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#F7F7F6] cursor-pointer"
              >
                <div className="relative w-4 h-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.id)}
                    onChange={(e) => {
                      const newSelected = e.target.checked
                        ? [...selected, option.id]
                        : selected.filter(id => id !== option.id)
                      onChange(newSelected)
                    }}
                    className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                  />
                  <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white 
                    peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] 
                    transition-all" 
                  />
                  <svg 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 
                      text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M2.5 6L5 8.5L9.5 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 