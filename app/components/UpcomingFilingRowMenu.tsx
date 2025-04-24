import { useState, useRef, useEffect } from 'react';

interface UpcomingFilingRowMenuProps {
  isRowHovered: boolean;
  onViewDetails: () => void;
  onResolveIssues?: () => void;
  status: string;
}

export default function UpcomingFilingRowMenu({ 
  isRowHovered, 
  onViewDetails, 
  onResolveIssues,
  status 
}: UpcomingFilingRowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or when row is no longer hovered
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when row is no longer hovered
  useEffect(() => {
    if (!isRowHovered) {
      setIsOpen(false);
    }
  }, [isRowHovered]);

  return (
    <div 
      ref={menuRef}
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-[#F7F7F6] transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16"
          className="text-[#646462]"
        >
          <path 
            fill="currentColor"
            d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM3 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM13 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
          <div className="space-y-[2px]">
            <button 
              onClick={() => {
                onViewDetails();
                setIsOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]"
            >
              View details
            </button>
            {status === 'Action needed' && (
              <button 
                onClick={() => {
                  onResolveIssues?.();
                  setIsOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]"
              >
                Resolve issues
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 