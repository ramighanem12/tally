import { useState } from 'react';

interface NoteIconProps {
  description: string;
}

export default function NoteIcon({ description }: NoteIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24"
        className="text-[#8A8A89] hover:text-[#1A1A1A] transition-colors"
      >
        <path 
          fill="currentColor"
          d="M 5 3 C 3.895 3 3 3.895 3 5 L 3 19 C 3 20.105 3.895 21 5 21 L 15 21 L 21 15 L 21 5 C 21 3.895 20.105 3 19 3 L 5 3 z M 5 5 L 19 5 L 19 14 L 14 14 L 14 19 L 5 19 L 5 5 z M 7 7 L 7 9 L 17 9 L 17 7 L 7 7 z M 7 11 L 7 13 L 12 13 L 12 11 L 7 11 z"
        />
      </svg>
      
      {isHovered && (
        <div 
          className="absolute bottom-full left-0 mb-2 z-50 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-3 min-w-[240px]"
        >
          <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] whitespace-normal">
            {description}
          </p>
        </div>
      )}
    </div>
  );
} 