'use client'
import { useState, useEffect, Dispatch, SetStateAction } from 'react'

interface TypeFilterProps {
  typeFilter: string[];
  setTypeFilter: Dispatch<SetStateAction<string[]>>;
  uniqueTypes: string[];
}

export default function TypeFilter({
  typeFilter,
  setTypeFilter,
  uniqueTypes
}: TypeFilterProps) {
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.type-filter')) {
        setIsTypeFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="type-filter relative flex items-center gap-1">
      <span>Type</span>
      <button 
        onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
        className={`w-5 h-5 flex items-center justify-center rounded transition-all ${
          typeFilter.length > 0 
            ? 'bg-[#E1EFFF] text-[#1A1A1A] hover:bg-[#CCE2FF]' 
            : 'bg-[#F0F0F0] hover:bg-[#E4E5E1]'
        }`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          className="text-[#4A4A49]"
        >
          <path 
            fill="currentColor"
            d="M3,3v3.561l6,6v6.091l6,4V12.561l6-6V3H3z"
          />
        </svg>
      </button>
      
      {isTypeFilterOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E4E4E4] w-[200px] p-2 z-50">
          <div className="space-y-[2px]">
            <button
              className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                typeFilter.length === 0 ? 'bg-[#F7F7F7]' : ''
              }`}
              onClick={() => {
                setTypeFilter([]);
                setIsTypeFilterOpen(false);
              }}
            >
              All
              {typeFilter.length === 0 && (
                <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                </svg>
              )}
            </button>
            {uniqueTypes.map(type => (
              <button
                key={type}
                onClick={(e) => {
                  e.stopPropagation();
                  setTypeFilter(prev => 
                    prev.includes(type)
                      ? prev.filter(f => f !== type)
                      : [...prev, type]
                  );
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                  typeFilter.includes(type) ? 'bg-[#F7F7F7]' : ''
                }`}
              >
                {type}
                {typeFilter.includes(type) && (
                  <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 