'use client'

import { useState, useEffect } from 'react';

// Add CustomCheckbox component from engagements page
function CustomCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      className={`w-4 h-4 rounded-[4px] cursor-pointer border flex items-center justify-center transition-all ${
        checked 
          ? 'bg-[#41629E] border-[#41629E]' 
          : 'bg-white border-[#D1D5DB] hover:border-[#41629E]'
      }`}
    >
      {checked && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          className="w-3 h-3 fill-white"
        >
          <path d="M9.55 18.2L3.65 12.3a.996.996 0 0 1 0-1.41l.07-.07a.996.996 0 0 1 1.41 0l4.42 4.42L19.17 5.62a.996.996 0 0 1 1.41 0l.07.07a.996.996 0 0 1 0 1.41L9.55 18.2z"/>
        </svg>
      )}
    </div>
  );
}

// Add type for file metadata
type FileType = 'Chart of Accounts' | 'Bank Statement' | 'Tax Return' | 'Invoice' | 'Contract' | 'Meeting Notes';

// Add interface for file data
interface FileData {
  id: string;
  name: string;
  type: FileType;
}

// Add this function to get the document type color
const getDocumentTypeColor = (type: FileType) => {
  const colors = {
    'Chart of Accounts': '#FF6B6B',    // Red
    'Bank Statement': '#4ECDC4',       // Teal
    'Tax Return': '#45B7D1',          // Blue
    'Invoice': '#96CEB4',             // Green
    'Contract': '#FFEEAD',            // Yellow
    'Meeting Notes': '#D4A5A5',       // Pink
  };
  return colors[type] || '#9CA3AF';
};

export default function FilesPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Updated sample data with document types
  const files: FileData[] = [
    { id: '1', name: 'Q4 Financial Statement.pdf', type: 'Chart of Accounts' },
    { id: '2', name: 'Annual Report 2023.xlsx', type: 'Bank Statement' },
    { id: '3', name: 'Tax Documents.zip', type: 'Tax Return' },
    { id: '4', name: 'Meeting Notes.docx', type: 'Meeting Notes' },
    { id: '5', name: 'Contract Draft v2.pdf', type: 'Contract' },
  ];

  // Trigger loading state when panel opens
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen) {
      setLoading(true);
      timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]); // isOpen in dependency array from the start

  // Handle master checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(files.map(file => file.id)));
      setIsAllSelected(true);
    } else {
      setSelectedRows(new Set());
      setIsAllSelected(false);
    }
  };

  // Handle individual row selection
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
    setIsAllSelected(newSelected.size === files.length);
  };

  return (
    <div 
      className={`border-l border-[#E4E5E1] flex flex-col overflow-hidden
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'w-[325px] translate-x-0' : 'w-0 translate-x-[325px]'}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E4E5E1] flex items-center justify-between">
        <h2 className="text-[18px] leading-[22px] font-medium font-oracle text-[#1A1A1A]">Files</h2>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-[88px] h-8 bg-[#F3F6F6] rounded-lg animate-pulse" />
          ) : (
            <button 
              className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-1.5 border border-[#344D7A]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Upload
            </button>
          )}
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F6F6] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E4E5E1]">
              <th className="pl-4 py-3 w-[48px]">
                <CustomCheckbox 
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="text-left"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading shimmer rows
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#E4E5E1]">
                  <td className="pl-4 py-3 w-[48px]">
                    <div className="flex items-center h-[20px]">
                      <div className="w-4 h-4 rounded-[4px] bg-[#F3F6F6] animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col gap-1">
                      <div className="h-5 w-[180px] bg-[#F3F6F6] rounded animate-pulse" />
                      <div className="h-[22px] w-[120px] bg-[#F3F6F6] rounded-md animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Actual file rows
              files.map(file => (
                <tr 
                  key={file.id}
                  className="hover:bg-[#F9FAFB] border-b border-[#E4E5E1] cursor-pointer group"
                >
                  <td 
                    className="pl-4 py-3 w-[48px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center h-[20px]">
                      <CustomCheckbox 
                        checked={selectedRows.has(file.id)}
                        onChange={(checked) => handleSelectRow(file.id, checked)}
                      />
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[14.5px] leading-[20px] font-oracle text-[#1A1A1A] group-hover:text-[#41629E]">
                        {file.name}
                      </span>
                      <div className="inline-flex items-center px-1.5 py-0.5 rounded-md border border-[#E4E5E1] bg-white w-fit">
                        <div 
                          className="w-1.5 h-1.5 rounded-full mr-1"
                          style={{ backgroundColor: getDocumentTypeColor(file.type) }}
                        />
                        <span className="text-[12px] leading-[16px] font-oracle text-[#1A1A1A]">
                          {file.type}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 