interface IconProps {
  className?: string;
}

export const LightningIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M8.5 1.5L4 9.5H8L7.5 14.5L12 6.5H8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DocumentIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M4 1.5H8.58579C8.851 1.5 9.10536 1.60536 9.29289 1.79289L13.2071 5.70711C13.3946 5.89464 13.5 6.149 13.5 6.41421V13C13.5 13.8284 12.8284 14.5 12 14.5H4C3.17157 14.5 2.5 13.8284 2.5 13V3C2.5 2.17157 3.17157 1.5 4 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 1.5V4.5C8.5 5.32843 9.17157 6 10 6H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SparkleIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-4 h-4 mr-2 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L9.5 5.5L13.5 7L9.5 8.5L8 12.5L6.5 8.5L2.5 7L6.5 5.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 2L13 3L13.5 2L14.5 1.5L13.5 1L13 0L12.5 1L11.5 1.5L12.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 13.5L3.5 14.5L4 13.5L5 13L4 12.5L3.5 11.5L3 12.5L2 13L3 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PencilIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-4 h-4 mr-2 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M10.5 2.5L13.5 5.5L5.5 13.5H2.5V10.5L10.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ExcelIcon = ({ className = "" }: IconProps) => (
  <img src="/excel.svg" alt="Excel file" className={`w-4 h-4 mr-2 ${className}`} />
);

export const RegenerateIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-3.5 h-3.5 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C9.98174 2.5 11.7296 3.61536 12.6248 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 5.5H12.75V2.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AddColumnIcon = ({ className = "" }: IconProps) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <path d="M8 3.5V12.5M12.5 8H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LoadingSpinner = ({ className = "" }: IconProps) => (
  <svg className={`animate-spin h-4 w-4 text-gray-500 ${className}`} viewBox="0 0 24 24">
    <circle 
      className="opacity-50" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
      fill="none"
    />
    <path 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const TrashIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M13.5 3.5L2.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 3.5V2.5C5.5 1.94772 5.94772 1.5 6.5 1.5H9.5C10.0523 1.5 10.5 1.94772 10.5 2.5V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3.5V13.5C12 14.0523 11.5523 14.5 11 14.5H5C4.44772 14.5 4 14.0523 4 13.5V3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AlertIcon = ({ className = "" }: IconProps) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 16 16" fill="none">
    <path d="M8 5.5V8.5M8 11.5H8.01M14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 4.41015 4.41015 1.5 8 1.5C11.5899 1.5 14.5 4.41015 14.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
