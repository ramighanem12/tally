import { ClosePeriod } from '../../types'
import { format } from 'date-fns'

interface PeriodButtonProps {
  period: ClosePeriod
  isSelected: boolean
  onClick: () => void
}

function formatPeriod(period: ClosePeriod): string {
  switch (period.period_format) {
    case 'monthly':
      return format(new Date(period.period_year, period.period_month! - 1), 'MMMM yyyy')
    case 'quarterly':
      return `Q${period.period_quarter} ${period.period_year}`
    case 'yearly':
      return period.period_year.toString()
  }
}

export default function PeriodButton({ period, isSelected, onClick }: PeriodButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full mb-3 px-3 py-3 rounded-lg border transition-colors bg-white
        ${isSelected
          ? 'border-[#41629E] bg-[#F8FAFC]' 
          : 'border-[#E4E5E1] hover:border-[#41629E]'
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] leading-[20px] font-oracle text-[#1A1A1A]">
          {formatPeriod(period)}
        </span>
        {period.status === 'complete' ? (
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#228B22]"
          >
            <path 
              d="M16.6668 5L7.50016 14.1667L3.3335 10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#41629E]"
          >
            <circle
              cx="10"
              cy="10"
              r="7"
              stroke="#E4E5E1"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="10"
              cy="10"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="44"
              strokeDashoffset="11"
              className="rotate-[-90deg] origin-center"
            />
          </svg>
        )}
      </div>
    </button>
  )
} 