interface IconProps {
  className?: string;
}

export const ChevronRightIcon = ({ className = "" }: IconProps) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MatrixIcon = ({ className = "" }: IconProps) => (
  <svg className={className} width="24" height="24" viewBox="0 0 16 16" fill="none">
    <rect x="2.5" y="2.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2.5 9.5H13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6.5 2.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9.5 2.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const FilterIcon = ({ className = "" }: IconProps) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PlusIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const InfoIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 11V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 5.5H8.00667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
); 