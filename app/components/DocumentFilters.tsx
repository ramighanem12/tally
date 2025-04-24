import React, { useState, Dispatch, SetStateAction } from 'react';

interface VaultFile {
  id: string;
  name: string;
  document_type: string;
  kind: string;
  industry: string;
}

interface DocumentFiltersProps {
  activeDropdown: string | null;
  setActiveDropdown: (dropdown: string | null) => void;
  selectedDocTypes: string[];
  setSelectedDocTypes: Dispatch<SetStateAction<string[]>>;
  selectedKinds: string[];
  setSelectedKinds: Dispatch<SetStateAction<string[]>>;
  selectedIndustries: string[];
  setSelectedIndustries: Dispatch<SetStateAction<string[]>>;
  sortedFiles: VaultFile[];
}

const checkboxStyle = `
  appearance-none
  w-[18px] h-[18px]
  border border-gray-300 dark:border-gray-600
  rounded-[4px]
  bg-white dark:bg-gray-800
  checked:bg-gray-900 checked:border-gray-900
  dark:checked:bg-gray-900 dark:checked:border-gray-900
  hover:border-gray-400 dark:hover:border-gray-500
  focus:outline-none focus:ring-2 focus:ring-gray-900/10
  transition-all duration-200
  relative
  cursor-pointer
  after:content-[''] after:absolute
  after:left-1/2 after:top-1/2 
  after:w-[10px] after:h-[10px]
  after:opacity-0 after:scale-50
  checked:after:opacity-100 checked:after:scale-100
  after:transition-all after:duration-200
  after:-translate-x-1/2 after:-translate-y-1/2
  after:bg-no-repeat after:bg-center
  checked:after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')]
`;

export default function DocumentFilters({
  activeDropdown,
  setActiveDropdown,
  selectedDocTypes,
  setSelectedDocTypes,
  selectedKinds,
  setSelectedKinds,
  selectedIndustries,
  setSelectedIndustries,
  sortedFiles
}: DocumentFiltersProps) {
  const [documentTypeSearch, setDocumentTypeSearch] = useState('');
  const [kindSearch, setKindSearch] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');

  return (
    <div className="flex items-center gap-2">
      <div className="relative filter-dropdown">
        <button 
          onClick={() => setActiveDropdown(activeDropdown === 'document_type' ? null : 'document_type')}
          className={`
            px-2 py-1 text-[13px] font-medium inline-flex items-center gap-1.5 border border-dashed bg-white
            ${activeDropdown === 'document_type' 
              ? 'text-gray-900 border-gray-300' 
              : 'text-gray-600 hover:text-gray-900 border-gray-200'
            }
            ${selectedDocTypes.length > 0 ? 'text-gray-900' : ''}
            rounded-[9px] transition-colors
          `}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Document Type
          {selectedDocTypes.length > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-medium text-white bg-gray-900 rounded-full">
              {selectedDocTypes.length}
            </span>
          )}
        </button>
        {activeDropdown === 'document_type' && (
          <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-[9px] shadow-lg z-50">
            <div className="p-2">
              <div className="relative mb-2">
                <input
                  type="text"
                  value={documentTypeSearch}
                  onChange={(e) => setDocumentTypeSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 pl-8 text-[13px] font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-[9px] focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white placeholder-gray-400 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none">
                    <path d="M7.5 12.5C10.2614 12.5 12.5 10.2614 12.5 7.5C12.5 4.73858 10.2614 2.5 7.5 2.5C4.73858 2.5 2.5 4.73858 2.5 7.5C2.5 10.2614 4.73858 12.5 7.5 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M11.5 11.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {Array.from(new Set(sortedFiles.map(file => file.document_type)))
                  .filter(type => type.toLowerCase().includes(documentTypeSearch.toLowerCase()))
                  .map(type => (
                    <label 
                      key={type}
                      className="flex items-center px-2 py-1.5 hover:bg-gray-50 rounded-[9px] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className={checkboxStyle}
                        checked={selectedDocTypes.includes(type)}
                        onChange={() => {
                          setSelectedDocTypes((prev: string[]) => 
                            prev.includes(type) 
                              ? prev.filter((t: string) => t !== type)
                              : [...prev, type]
                          );
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-900">{type}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative filter-dropdown">
        <button 
          onClick={() => setActiveDropdown(activeDropdown === 'kind' ? null : 'kind')}
          className={`
            px-2 py-1 text-[13px] font-medium inline-flex items-center gap-1.5 border border-dashed bg-white
            ${activeDropdown === 'kind' 
              ? 'text-gray-900 border-gray-300' 
              : 'text-gray-600 hover:text-gray-900 border-gray-200'
            }
            ${selectedKinds.length > 0 ? 'text-gray-900' : ''}
            rounded-[9px] transition-colors
          `}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          File Type
          {selectedKinds.length > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-medium text-white bg-gray-900 rounded-full">
              {selectedKinds.length}
            </span>
          )}
        </button>
        {activeDropdown === 'kind' && (
          <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-[9px] shadow-lg z-50">
            <div className="p-2">
              <div className="relative mb-2">
                <input
                  type="text"
                  value={kindSearch}
                  onChange={(e) => setKindSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 pl-8 text-[13px] font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-[9px] focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white placeholder-gray-400 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none">
                    <path d="M7.5 12.5C10.2614 12.5 12.5 10.2614 12.5 7.5C12.5 4.73858 10.2614 2.5 7.5 2.5C4.73858 2.5 2.5 4.73858 2.5 7.5C2.5 10.2614 4.73858 12.5 7.5 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M11.5 11.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {Array.from(new Set(sortedFiles.map(file => file.kind)))
                  .filter(kind => kind.toLowerCase().includes(kindSearch.toLowerCase()))
                  .map(kind => (
                    <label 
                      key={kind}
                      className="flex items-center px-2 py-1.5 hover:bg-gray-50 rounded-[9px] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className={checkboxStyle}
                        checked={selectedKinds.includes(kind)}
                        onChange={() => {
                          setSelectedKinds((prev: string[]) => 
                            prev.includes(kind) 
                              ? prev.filter((k: string) => k !== kind)
                              : [...prev, kind]
                          );
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-900">{kind}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative filter-dropdown">
        <button 
          onClick={() => setActiveDropdown(activeDropdown === 'industry' ? null : 'industry')}
          className={`
            px-2 py-1 text-[13px] font-medium inline-flex items-center gap-1.5 border border-dashed bg-white
            ${activeDropdown === 'industry' 
              ? 'text-gray-900 border-gray-300' 
              : 'text-gray-600 hover:text-gray-900 border-gray-200'
            }
            ${selectedIndustries.length > 0 ? 'text-gray-900' : ''}
            rounded-[9px] transition-colors
          `}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Industry
          {selectedIndustries.length > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-medium text-white bg-gray-900 rounded-full">
              {selectedIndustries.length}
            </span>
          )}
        </button>
        {activeDropdown === 'industry' && (
          <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-[9px] shadow-lg z-50">
            <div className="p-2">
              <div className="relative mb-2">
                <input
                  type="text"
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 pl-8 text-[13px] font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-[9px] focus:outline-none focus:ring-1 focus:ring-gray-200 focus:bg-white placeholder-gray-400 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none">
                    <path d="M7.5 12.5C10.2614 12.5 12.5 10.2614 12.5 7.5C12.5 4.73858 10.2614 2.5 7.5 2.5C4.73858 2.5 2.5 4.73858 2.5 7.5C2.5 10.2614 4.73858 12.5 7.5 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M11.5 11.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {Array.from(new Set(sortedFiles.map(file => file.industry || '-')))
                  .filter(industry => industry?.toLowerCase().includes(industrySearch.toLowerCase()))
                  .map(industry => (
                    <label 
                      key={industry}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-[13px] text-gray-900"
                    >
                      <input
                        type="checkbox"
                        className={checkboxStyle}
                        checked={selectedIndustries.includes(industry)}
                        onChange={() => {
                          if (selectedIndustries.includes(industry)) {
                            setSelectedIndustries(prev => prev.filter(i => i !== industry));
                          } else {
                            setSelectedIndustries(prev => [...prev, industry]);
                          }
                        }}
                      />
                      <span className="truncate">{industry}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
