'use client'
import { useState, useEffect, Dispatch, SetStateAction } from 'react'

interface PeriodFilterProps {
  periodFilter: string[];
  setPeriodFilter: Dispatch<SetStateAction<string[]>>;
  uniquePeriods: string[];
}

export default function PeriodFilter({
  periodFilter,
  setPeriodFilter,
  uniquePeriods
}: PeriodFilterProps) {
  const [isPeriodFilterOpen, setIsPeriodFilterOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.period-filter')) {
        setIsPeriodFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="period-filter relative flex items-center gap-1">
      <span>Period</span>
      <button 
        onClick={() => setIsPeriodFilterOpen(!isPeriodFilterOpen)}
        className={`w-5 h-5 flex items-center justify-center rounded transition-all ${
          periodFilter.length > 0 
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
      
      {isPeriodFilterOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E4E4E4] w-[200px] p-2 z-50">
          <div className="space-y-[2px]">
            <button
              className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                periodFilter.length === 0 ? 'bg-[#F7F7F7]' : ''
              }`}
              onClick={() => {
                setPeriodFilter([]);
                setIsPeriodFilterOpen(false);
              }}
            >
              All periods
              {periodFilter.length === 0 && (
                <svg className="fill-current absolute right-2" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                </svg>
              )}
            </button>
            {uniquePeriods.map(period => (
              <button
                key={period}
                onClick={(e) => {
                  e.stopPropagation();
                  setPeriodFilter(prev => 
                    prev.includes(period)
                      ? prev.filter(f => f !== period)
                      : [...prev, period]
                  );
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors flex items-center gap-2 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative ${
                  periodFilter.includes(period) ? 'bg-[#F7F7F7]' : ''
                }`}
              >
                {period}
                {periodFilter.includes(period) && (
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