export default function MasterEmptyState() {
  return (
    <div className="text-center px-4">
      <svg 
        width="64" 
        height="64" 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto mb-4 text-[#6B7280]"
      >
        <path 
          d="M56 16H48V12C48 9.79086 46.2091 8 44 8H20C17.7909 8 16 9.79086 16 12V16H8C5.79086 16 4 17.7909 4 20V52C4 54.2091 5.79086 56 8 56H56C58.2091 56 60 54.2091 60 52V20C60 17.7909 58.2091 16 56 16Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M16 16V12C16 9.79086 17.7909 8 20 8H44C46.2091 8 48 9.79086 48 12V16" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M32 28V44" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M24 36H40" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="text-[15px] leading-[20px] font-medium font-oracle text-[#1A1A1A] mb-1">
        No close periods
      </h3>
      <p className="text-[14px] leading-[20px] text-[#6B7280]">
        Create your first close period to get started
      </p>
    </div>
  )
} 