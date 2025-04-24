import React, { useState, useRef, useEffect } from 'react';

interface DocumentTypeConfig {
  name: string;
  required: boolean;
}

interface DocumentCollectionStepProps {
  selectedDocTypes: DocumentTypeConfig[];
  setSelectedDocTypes: (docTypes: DocumentTypeConfig[]) => void;
}

type SourceType = 'user_upload' | 'webhook' | 'agent_checks';
type SoftwareSource = 'caseware' | 'quickbooks' | 'xero' | 'sage';
type CheckInterval = 'hourly' | 'daily' | 'weekly' | 'monthly';

interface DropdownPosition {
  top: number | null;
  bottom: number | null;
  left: number;
  right: number | null;
}

export default function DocumentCollectionStep({ selectedDocTypes, setSelectedDocTypes }: DocumentCollectionStepProps) {
  const [isAddingDocType, setIsAddingDocType] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [selectedSources, setSelectedSources] = useState<Set<SourceType>>(new Set(['user_upload']));
  const [isSoftwareSourceOpen, setIsSoftwareSourceOpen] = useState(false);
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);
  const [selectedSoftwareSource, setSelectedSoftwareSource] = useState<SoftwareSource>('caseware');
  const [selectedInterval, setSelectedInterval] = useState<CheckInterval>('daily');
  const [isAiSuggestLoading, setIsAiSuggestLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, bottom: null, left: 0, right: null });
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isAddingDocType && addButtonRef.current) {
      const rect = addButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 250; // Approximate height of dropdown

      if (spaceBelow < dropdownHeight) {
        // Position above if there's not enough space below
        setDropdownPosition({
          top: null,
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          right: window.innerWidth - rect.right
        });
      } else {
        // Position below by default
        setDropdownPosition({
          top: rect.bottom + 4,
          bottom: null,
          left: rect.left,
          right: null
        });
      }
    }
  }, [isAddingDocType]);

  const documentTypes = [
    'Financial statement',
    'Trial balance',
    'Bank statement',
    'Invoices',
    'General ledger',
    'Journal entries',
    'Bank reconciliation',
    'Accounts payable aging',
    'Accounts receivable aging',
    'Balance sheet',
    'Income statement',
    'Cash flow statement',
    'Tax returns',
    'Expense reports',
    'Payroll records',
    'Fixed asset register',
    'Inventory list',
    'Purchase orders',
    'Sales receipts',
    'Credit notes'
  ];

  const softwareSources: { id: SoftwareSource; label: string }[] = [
    { id: 'caseware', label: 'Caseware' },
    { id: 'quickbooks', label: 'QuickBooks' },
    { id: 'xero', label: 'Xero' },
    { id: 'sage', label: 'Sage' }
  ];

  const checkIntervals: { id: CheckInterval; label: string }[] = [
    { id: 'hourly', label: 'Every hour' },
    { id: 'daily', label: 'Every day' },
    { id: 'weekly', label: 'Every week' },
    { id: 'monthly', label: 'Every month' }
  ];

  const sources: { id: SourceType; label: string; description: string }[] = [
    {
      id: 'user_upload',
      label: 'User upload',
      description: 'Allow users to manually upload documents'
    },
    {
      id: 'webhook',
      label: 'Webhook (API)',
      description: 'Receive documents via API integration'
    },
    {
      id: 'agent_checks',
      label: 'Agent autonomy',
      description: 'Agent automatically checks for new documents'
    }
  ];

  const handleAddDocType = () => {
    if (newDocType && !selectedDocTypes.some(dt => dt.name === newDocType)) {
      setSelectedDocTypes([...selectedDocTypes, { name: newDocType, required: false }]);
    }
    setNewDocType('');
    setIsAddingDocType(false);
  };

  const toggleRequired = (docTypeName: string) => {
    setSelectedDocTypes(selectedDocTypes.map(dt => 
      dt.name === docTypeName ? { ...dt, required: !dt.required } : dt
    ));
  };

  const filteredDocTypes = documentTypes.filter(type => 
    type.toLowerCase().includes(newDocType.toLowerCase()) &&
    !selectedDocTypes.some(dt => dt.name === type)
  );

  const toggleSource = (sourceId: SourceType) => {
    const newSources = new Set(selectedSources);
    if (newSources.has(sourceId)) {
      newSources.delete(sourceId);
    } else {
      newSources.add(sourceId);
    }
    setSelectedSources(newSources);
  };

  const handleAiSuggest = () => {
    setIsAiSuggestLoading(true);
    setTimeout(() => {
      const suggestedDocTypes = [
        { name: 'Financial statements', required: true },
        { name: 'Trial balance', required: true },
        { name: 'Bank statements', required: false },
        { name: 'Invoices', required: true },
        { name: 'General ledger', required: true },
        { name: 'Journal entries', required: false },
        { name: 'Supporting schedules', required: false },
        { name: 'Tax returns', required: true }
      ];
      
      const existingDocNames = new Set(selectedDocTypes.map(d => d.name));
      const newDocTypes = suggestedDocTypes.filter(d => !existingDocNames.has(d.name));
      
      setSelectedDocTypes([...selectedDocTypes, ...newDocTypes]);
      setIsAiSuggestLoading(false);
    }, 1500);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="relative inline-flex items-center gap-1">
          <label className="text-[13px] font-medium text-gray-900">Document types</label>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedDocTypes.map((docType, index) => (
            <div 
              key={index}
              className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-[10px] border border-gray-200"
            >
              <div
                onClick={() => toggleRequired(docType.name)}
                className="flex items-center gap-1 cursor-pointer"
              >
                <div
                  className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                    docType.required 
                      ? 'bg-blue-600 text-white border-transparent' 
                      : 'bg-white border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {docType.required ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : null}
                </div>
                <span className={`text-[13px] font-medium ml-[1px] ${docType.required ? 'text-gray-900' : 'text-gray-600'}`}>{docType.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDocTypes(selectedDocTypes.filter((_, i) => i !== index));
                }}
                className="text-gray-400 hover:text-gray-600 ml-1"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}
          <div className="relative">
            <button
              ref={addButtonRef}
              onClick={() => setIsAddingDocType(true)}
              className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-[10px] border border-gray-200 text-[13px] font-medium text-gray-900 hover:bg-gray-50"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add document type
            </button>
            
            {isAddingDocType && (
              <>
                <div 
                  className="fixed inset-0" 
                  onClick={() => setIsAddingDocType(false)}
                />
                <div 
                  className="absolute w-[240px] bg-white rounded-[10px] border border-gray-200 shadow-lg overflow-hidden z-[100]"
                  style={{
                    bottom: '100%',
                    marginBottom: '4px',
                    left: '0'
                  }}
                >
                  <div className="p-2 pb-0">
                    <div>
                      <input
                        type="text"
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        placeholder="Enter document type"
                        className="w-full text-[13px] px-2 py-1 border border-gray-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-gray-200"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddDocType();
                          } else if (e.key === 'Escape') {
                            setIsAddingDocType(false);
                          }
                        }}
                      />
                    </div>
                    <div className="mt-1.5">
                      <div className="max-h-[200px] overflow-y-auto pb-2">
                        <div className="text-[12px] font-medium text-gray-400 mb-1 px-2">Suggested types</div>
                        {filteredDocTypes.map((type) => (
                          <div
                            key={type}
                            onClick={() => {
                              if (!selectedDocTypes.some(dt => dt.name === type)) {
                                setSelectedDocTypes([...selectedDocTypes, { name: type, required: false }]);
                              }
                              setIsAddingDocType(false);
                            }}
                            className="px-2 py-1 text-[13px] font-medium text-gray-900 hover:bg-gray-50 cursor-pointer rounded-[10px]"
                          >
                            {type}
                          </div>
                        ))}
                        {filteredDocTypes.length === 0 && newDocType && (
                          <div className="px-2 py-1 text-[13px] text-gray-500">
                            Press Enter to add "{newDocType}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleAiSuggest}
          disabled={isAiSuggestLoading}
          className="inline-flex items-center gap-1.5 bg-white px-2 py-1 rounded-[10px] border border-purple-200 text-[13px] font-medium text-gray-900 hover:bg-gray-50 w-fit disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAiSuggestLoading ? (
            <svg className="animate-spin h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-purple-500">
              <path d="M13 1L6 14H12L12 23L19 10H13L13 1Z" fill="currentColor"/>
            </svg>
          )}
          AI suggest
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative inline-flex items-center gap-1">
          <label className="text-[13px] font-medium text-gray-900">Ingestion sources</label>
        </div>
        <div className="flex flex-col gap-2">
          {sources.map((source) => (
            <div
              key={source.id}
              onClick={() => toggleSource(source.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedSources.has(source.id)
                  ? 'bg-white border-gray-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div 
                className="flex items-center justify-center w-4 h-4 mt-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSource(source.id);
                }}
              >
                <div
                  className={`flex items-center justify-center w-4 h-4 rounded transition-colors ${
                    selectedSources.has(source.id)
                      ? 'bg-blue-600 text-white border-transparent'
                      : 'bg-white border border-gray-300'
                  }`}
                >
                  {selectedSources.has(source.id) && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-gray-900 flex items-center gap-1.5">
                  {source.label}
                  {source.id === 'agent_checks' && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-full">Beta</span>
                  )}
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5">{source.description}</div>
                {source.id === 'agent_checks' && (
                  <div className="mt-2 flex gap-2">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSoftwareSourceOpen(!isSoftwareSourceOpen);
                        }}
                        className="w-[140px] appearance-none bg-white border border-gray-200 rounded-[10px] px-3 py-1.5 text-[13px] text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 text-left flex items-center justify-between"
                      >
                        <span>{softwareSources.find(s => s.id === selectedSoftwareSource)?.label}</span>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3.5 6.5L8 11L12.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      {isSoftwareSourceOpen && (
                        <>
                          <div 
                            className="fixed inset-0" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsSoftwareSourceOpen(false);
                            }}
                          />
                          <div className="absolute top-full left-0 mt-1 w-[140px] bg-white rounded-[10px] border border-gray-200 shadow-lg overflow-hidden z-[100]">
                            <div className="p-2 pb-0">
                              <div className="max-h-[200px] overflow-y-auto pb-2">
                                {softwareSources.map((software) => (
                                  <div
                                    key={software.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSoftwareSource(software.id);
                                      setIsSoftwareSourceOpen(false);
                                    }}
                                    className="px-2 py-1 text-[13px] font-medium text-gray-900 hover:bg-gray-50 cursor-pointer rounded-[10px]"
                                  >
                                    {software.label}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsIntervalOpen(!isIntervalOpen);
                        }}
                        className="w-[140px] appearance-none bg-white border border-gray-200 rounded-[10px] px-3 py-1.5 text-[13px] text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200 text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                            <path d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" fill="currentColor"/>
                            <path d="M13 7H11V13H17V11H13V7Z" fill="currentColor"/>
                          </svg>
                          <span>{checkIntervals.find(i => i.id === selectedInterval)?.label}</span>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3.5 6.5L8 11L12.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      {isIntervalOpen && (
                        <>
                          <div 
                            className="fixed inset-0" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsIntervalOpen(false);
                            }}
                          />
                          <div className="absolute top-full left-0 mt-1 w-[140px] bg-white rounded-[10px] border border-gray-200 shadow-lg overflow-hidden z-[100]">
                            <div className="p-2 pb-0">
                              <div className="max-h-[200px] overflow-y-auto pb-2">
                                {checkIntervals.map((interval) => (
                                  <div
                                    key={interval.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedInterval(interval.id);
                                      setIsIntervalOpen(false);
                                    }}
                                    className="px-2 py-1 text-[13px] font-medium text-gray-900 hover:bg-gray-50 cursor-pointer rounded-[10px]"
                                  >
                                    {interval.label}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 