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

export const FolderIcon = ({ className }: IconProps) => (
  <svg 
    className={`h-5 w-5 text-[#646462] ${className || ''}`}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M 4.25 3 C 3.019 3 2 4.019 2 5.25 L 2 17.75 C 2 18.981 3.019 20 4.25 20 L 4.6308594 20 L 5.0371094 20 L 19.863281 20 C 20.787051 20 21.599864 19.355416 21.810547 18.457031 L 23.966797 10.253906 A 1.0001 1.0001 0 0 0 23 9 L 21.919922 9 L 22 7.25 C 22 6.019 20.981 5 19.75 5 L 10.621094 5 C 10.488094 5 10.361578 4.9465156 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784844 3.2644219 8.0419062 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5119063 5 7.6384219 5.0534844 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215156 6.7365781 9.9580938 7 10.621094 7 L 19.75 7 C 19.899 7 20 7.101 20 7.25 L 20 9 L 7 9 A 1.0001 1.0001 0 0 0 6.0332031 9.7480469 L 4 17.548828 L 4 5.25 C 4 5.101 4.101 5 4.25 5 z M 7.7734375 11 L 21.703125 11 L 19.869141 17.974609 A 1.0001 1.0001 0 0 0 19.863281 18 L 5.9492188 18 L 7.7734375 11 z" />
  </svg>
);

export const FileIcon = ({ className }: IconProps) => (
  <svg 
    className={`h-5 w-5 text-[#646462] ${className || ''}`}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M 13.984375 1.9863281 A 1.0001 1.0001 0 0 0 13.839844 2 L 6.5 2 C 5.1309372 2 4 3.1309372 4 4.5 L 4 19.5 C 4 20.869063 5.1309372 22 6.5 22 L 17.5 22 C 18.869063 22 20 20.869063 20 19.5 L 20 8.1679688 A 1.0001 1.0001 0 0 0 19.623047 7.2070312 A 1.0001 1.0001 0 0 0 19.617188 7.203125 L 14.791016 2.3769531 A 1.0001 1.0001 0 0 0 13.984375 1.9863281 z M 6.5 4 L 13 4 L 13 8 A 1.0001 1.0001 0 0 0 14 9 L 18 9 L 18 19.5 C 18 19.786937 17.786937 20 17.5 20 L 6.5 20 C 6.2130628 20 6 19.786937 6 19.5 L 6 4.5 C 6 4.2130628 6.2130628 4 6.5 4 z M 15 5.4140625 L 16.585938 7 L 15 7 L 15 5.4140625 z" />
  </svg>
);

export const DeleteIcon = ({ className }: IconProps) => (
  <svg 
    className={`w-4 h-4 ${className || ''}`}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
  >
    <path fill="currentColor" d="M 12 2 C 6.4919555 2 2 6.4919596 2 12 C 2 17.50804 6.4919555 22 12 22 C 17.508045 22 22 17.50804 22 12 C 22 6.4919596 17.508045 2 12 2 z M 12 4.5 C 16.156945 4.5 19.5 7.8430575 19.5 12 C 19.5 16.156943 16.156945 19.5 12 19.5 C 7.8430549 19.5 4.5 16.156943 4.5 12 C 4.5 7.8430575 7.8430549 4.5 12 4.5 z M 8 10.75 A 1.250125 1.250125 0 1 0 8 13.25 L 16 13.25 A 1.250125 1.250125 0 1 0 16 10.75 L 8 10.75 z" />
  </svg>
); 