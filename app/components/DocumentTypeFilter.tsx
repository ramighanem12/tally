'use client'
import { useState, useRef, useEffect } from 'react'

interface DocumentTypeFilterProps {
  selectedTypes: string[]
  onTypeChange: (types: string[]) => void
}

const DOCUMENT_TYPES = [
  'PDF',
  'Excel',
  'Word',
  'CSV',
  'PowerPoint',
  'Text',
  'Image'
];

const checkboxStyle = `
  appearance-none
  w-[18px] h-[18px]
  border-2 border-gray-300 dark:border-gray-600
  rounded
  bg-white dark:bg-gray-800
  checked:bg-blue-600 checked:border-blue-600
  dark:checked:bg-blue-500 dark:checked:border-blue-500
  hover:border-blue-500 dark:hover:border-blue-400
  focus:outline-none focus:ring-2 focus:ring-blue-500/20
  transition-colors
  relative
  cursor-pointer
  after:content-[''] after:absolute
  after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2
  after:w-[10px] after:h-[10px]
  after:bg-no-repeat after:bg-center
  checked:after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')]
`;

export default function DocumentTypeFilter({ selectedTypes, onTypeChange }: DocumentTypeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredTypes = DOCUMENT_TYPES.filter(type =>
    type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type))
    } else {
      onTypeChange([...selectedTypes, type])
    }
  }

  const getButtonLabel = () => {
    if (selectedTypes.length === 0) return 'Document Type'
    if (selectedTypes.length === 1) return selectedTypes[0]
    return `${selectedTypes.length} types selected`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-2.5 py-1 text-sm font-medium text-gray-600 
          border border-dashed border-gray-300 hover:border-gray-400 
          rounded-lg inline-flex items-center gap-1
          ${selectedTypes.length > 0 ? 'bg-gray-50 border-gray-400' : ''}
        `}
      >
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="none">
          <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>{getButtonLabel()}</span>
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg 
                className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
                viewBox="0 0 16 16" 
                fill="none"
              >
                <path d="M7.5 13C10.5376 13 13 10.5376 13 7.5C13 4.46243 10.5376 2 7.5 2C4.46243 2 2 4.46243 2 7.5C2 10.5376 4.46243 13 7.5 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type options */}
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filteredTypes.map((type) => (
              <label
                key={type}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className={checkboxStyle}
                />
                <span className="ml-2 text-sm text-gray-900">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 