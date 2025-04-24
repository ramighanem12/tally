'use client'
import { useState, useRef, useEffect } from 'react'
import { TallyLogo } from './TallyLogo'
import TemplatesModal from './TemplatesModal'
import DocumentsModal from './DocumentsModal'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const CommandModal = dynamic(() => import('./CommandModal'), {
  ssr: false
})

const CollapseIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 2V14" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const ChevronIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LibraryIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3.5 4.5H5.5C6.05228 4.5 6.5 4.94772 6.5 5.5V13.5H2.5V5.5C2.5 4.94772 2.94772 4.5 3.5 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 13.5H10.5V3.5C10.5 2.94772 10.0523 2.5 9.5 2.5H7.5C6.94772 2.5 6.5 2.94772 6.5 3.5V13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 13.5H13.5V6.5C13.5 5.94772 13.0523 5.5 12.5 5.5H10.5V13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocumentIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8.5 10H4.5M11.5 7H4.5M11.5 4H4.5M13.5 3.5V12.5C13.5 13.6046 12.6046 14.5 11.5 14.5H4.5C3.39543 14.5 2.5 13.6046 2.5 12.5V3.5C2.5 2.39543 3.39543 1.5 4.5 1.5H11.5C12.6046 1.5 13.5 2.39543 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TemplateIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2.5" y="2.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2.5 5.5H13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 13.5L5.5 2.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const MatrixIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2.5" y="2.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2.5 9.5H13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6.5 2.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9.5 2.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const ClipsIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4.5 3.5H11.5C12.0523 3.5 12.5 3.94772 12.5 4.5V13.5L8 10.5L3.5 13.5V4.5C3.5 3.94772 3.94772 3.5 4.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ControlsIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 4H6M10 4H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2.5 8H10M13.5 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2.5 12H4M8 12H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="8" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="11.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="6" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const AuditIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M5.5 7.5L7.5 9.5L10.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.5 3.5V12.5C13.5 13.6046 12.6046 14.5 11.5 14.5H4.5C3.39543 14.5 2.5 13.6046 2.5 12.5V3.5C2.5 2.39543 3.39543 1.5 4.5 1.5H11.5C12.6046 1.5 13.5 2.39543 13.5 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 12H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TasksIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2.5" y="2.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 5L7 7L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 8L7 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InsightsIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 13.5C10.7614 13.5 13 11.2614 13 8.5C13 5.73858 10.7614 3.5 8 3.5C5.23858 3.5 3 5.73858 3 8.5C3 11.2614 5.23858 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 7.5L8 9.5L10 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SalesTaxIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 13.5C11.0376 13.5 13.5 11.0376 13.5 8C13.5 4.96243 11.0376 2.5 8 2.5C4.96243 2.5 2.5 4.96243 2.5 8C2.5 11.0376 4.96243 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 6C3 6 5 8 8 8C11 8 13 6 13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 10C3 10 5 12 8 12C11 12 13 10 13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 2.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TaxFilingsIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M11.5 2.5H4.5C3.39543 2.5 2.5 3.39543 2.5 4.5V11.5C2.5 12.6046 3.39543 13.5 4.5 13.5H11.5C12.6046 13.5 13.5 12.6046 13.5 11.5V4.5C13.5 3.39543 12.6046 2.5 11.5 2.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 2.5V4.5H10.5V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 7.5H10M6 10.5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SettingsIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2.5 8.5V7.5L3.5 6.5H4.5L5 5.5L4.5 4.5L5.5 3.5L6.5 4L7.5 3.5H8.5L9.5 4L10.5 3.5L11.5 4.5L11 5.5L11.5 6.5H12.5L13.5 7.5V8.5L12.5 9.5V10.5L11.5 11.5L10.5 12.5L9.5 12L8.5 12.5H7.5L6.5 12L5.5 12.5L4.5 11.5L3.5 10.5V9.5L2.5 8.5Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const NewChatIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PersonalIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 7.5C9.38071 7.5 10.5 6.38071 10.5 5C10.5 3.61929 9.38071 2.5 8 2.5C6.61929 2.5 5.5 3.61929 5.5 5C5.5 6.38071 6.61929 7.5 8 7.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3.5 13.5C3.5 11.2909 5.29086 9.5 7.5 9.5H8.5C10.7091 9.5 12.5 11.2909 12.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TeamIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M11 6.5C12.1046 6.5 13 5.60457 13 4.5C13 3.39543 12.1046 2.5 11 2.5C9.89543 2.5 9 3.39543 9 4.5C9 5.60457 9.89543 6.5 11 6.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 6.5C6.10457 6.5 7 5.60457 7 4.5C7 3.39543 6.10457 2.5 5 2.5C3.89543 2.5 3 3.39543 3 4.5C3 5.60457 3.89543 6.5 5 6.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 13.5C14 11.2909 12.6569 9.5 11 9.5C9.34315 9.5 8 11.2909 8 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 13.5C8 11.2909 6.65685 9.5 5 9.5C3.34315 9.5 2 11.2909 2 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CompanyIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 13.5V6C3 4.89543 3.89543 4 5 4H11C12.1046 4 13 4.89543 13 6V13.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 13.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 7H7M9 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 10H7M9 10H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6.5 2H9.5L11 4H5L6.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const ShareIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="4.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="11.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="11.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6.5 7L9.5 5.5M6.5 9L9.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const EngagementIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2.5 4.5C2.5 3.39543 3.39543 2.5 4.5 2.5H11.5C12.6046 2.5 13.5 3.39543 13.5 4.5V11.5C13.5 12.6046 12.6046 13.5 11.5 13.5H4.5C3.39543 13.5 2.5 12.6046 2.5 11.5V4.5Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 6.5H10.5M5.5 9.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ChatBubbleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 7.5C13.5 10.2909 10.8137 12.5 7.5 12.5C6.71326 12.5 5.96809 12.3562 5.29772 12.0957C4.91542 11.9422 4.48197 11.9786 4.1351 12.1919L2.5 13.1667V11C2.5 10.7448 2.39571 10.5019 2.21131 10.3278C2.07638 10.2005 2.5 8.5 2.5 7.5C2.5 4.70914 5.18629 2.5 8.5 2.5C11.8137 2.5 13.5 4.70914 13.5 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type SelectedTab = 
  | 'documents-personal' 
  | 'documents-engagements' 
  | 'library' 
  | 'library-templates'
  | 'library-matrices'
  | 'library-clips'
  | 'engagements'
  | 'engagements-audits'
  | 'engagements-controls'
  | 'settings'
  | 'settings-account'
  | 'settings-integrations'
  | 'settings-billing';

interface Chat {
  id: string
  title: string
  timestamp: Date
}

interface ChatGroup {
  label: string;
  chats: Chat[];
}

interface Matrix {
  id: string;
  name: string;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  created_at: string;
}

interface RecentItem {
  id: string;
  name: string;
  created_at: string;
  type: 'matrix' | 'template';
}

const getUrlPath = (type: 'matrix' | 'template', id: string) => {
  if (type === 'matrix') {
    return `/matrices/${id}`;
  }
  return `/${type}s/${id}`;
};

const styles = `
  @keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateY(-8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes typewriter {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out forwards;
  }

  .animate-typewriter {
    display: inline-block;
    position: relative;
    width: fit-content;
    overflow: hidden;
    white-space: nowrap;
    animation: typewriter 0.8s steps(30, end);
  }

  .animate-typewriter::after {
    content: '';
    position: absolute;
    right: -2px;
    top: 50%;
    transform: translateY(-50%);
    height: 14px;
    width: 2px;
    background: #666;
    animation: blink 0.8s steps(2) infinite;
  }

  @keyframes blink {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default function AppNav({ 
  selectedTab = 'documents-personal'
}: { 
  selectedTab?: SelectedTab 
}) {
  const { user } = useAuth()
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false)
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false)
  const [isWorkflowsModalOpen, setIsWorkflowsModalOpen] = useState(false)
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false)
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !isCommandModalOpen) {
        e.preventDefault()
        setIsCommandModalOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isCommandModalOpen])

  useEffect(() => {
    if (selectedTab.startsWith('library-') || selectedTab.startsWith('documents-')) {
      setExpandedSections(prev => 
        prev.includes('library') ? prev : [...prev, 'library']
      );
    }
  }, [selectedTab]);

  return (
    <>
      <nav className="w-64 bg-gray-50 flex flex-col h-screen overflow-hidden">
        <div className="p-4">
          {/* Header with logo */}
          <div className="flex items-center justify-between mb-4">
            <TallyLogo className="w-6 h-auto text-gray-900" />
            <button
              onClick={() => {/* handle collapse */}}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CollapseIcon />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
              <path d="M7.5 13C10.5376 13 13 10.5376 13 7.5C13 4.46243 10.5376 2 7.5 2C4.46243 2 2 4.46243 2 7.5C2 10.5376 4.46243 13 7.5 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 14L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-12 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
              <kbd className="min-w-[20px] h-5 flex items-center justify-center px-1 text-[11px] font-medium text-gray-400 bg-white border border-gray-200 rounded-[4px]">/</kbd>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {/* Library Section */}
            <div>
              <button 
                onClick={() => {
                  setExpandedSections(prev => 
                    prev.includes('library') 
                      ? prev.filter(p => p !== 'library')
                      : [...prev, 'library']
                  )
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LibraryIcon className="text-gray-500" />
                  <span>Library</span>
                </div>
                <ChevronIcon className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.includes('library') ? '' : '-rotate-90'}`} />
              </button>

              {expandedSections.includes('library') && (
                <div className="mt-1 ml-3 pl-3 border-l border-gray-200">
                  <button 
                    onClick={() => router.push('/documents/personal')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'documents-personal' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <DocumentIcon className={selectedTab === 'documents-personal' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Documents</span>
                  </button>

                  <button 
                    onClick={() => router.push('/templates')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'library-templates' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <TemplateIcon className={selectedTab === 'library-templates' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Templates</span>
                  </button>

                  <button 
                    onClick={() => router.push('/matrices')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'library-matrices' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <MatrixIcon className={selectedTab === 'library-matrices' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Matrices</span>
                  </button>

                  <button 
                    onClick={() => router.push('/clips')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'library-clips' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <ClipsIcon className={selectedTab === 'library-clips' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Clips</span>
                  </button>
                </div>
              )}
            </div>

            {/* Workpapers Section */}
            <div>
              <button 
                onClick={() => {
                  setExpandedSections(prev => 
                    prev.includes('workpapers') 
                      ? prev.filter(p => p !== 'workpapers')
                      : [...prev, 'workpapers']
                  )
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <DocumentIcon className="text-gray-500" />
                  <span>Workpapers</span>
                </div>
                <ChevronIcon className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.includes('workpapers') ? '' : '-rotate-90'}`} />
              </button>

              {expandedSections.includes('workpapers') && (
                <div className="mt-1 ml-3 pl-3 border-l border-gray-200">
                  <button
                    onClick={() => router.push('/audits')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'engagements-audits' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <AuditIcon className={selectedTab === 'engagements-audits' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Audits</span>
                  </button>

                  <button
                    onClick={() => router.push('/controls')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'engagements-controls' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <ControlsIcon className={selectedTab === 'engagements-controls' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Controls</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div>
              <button 
                onClick={() => router.push('/tasks')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TasksIcon className="text-gray-500" />
                  <span>Tasks</span>
                </div>
              </button>
            </div>

            {/* Insights Section */}
            <div>
              <button 
                onClick={() => router.push('/insights')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <InsightsIcon className="text-gray-500" />
                  <span>Insights</span>
                </div>
              </button>
            </div>

            {/* Sales tax Section */}
            <div>
              <button 
                onClick={() => router.push('/sales-tax')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SalesTaxIcon className="text-gray-500" />
                  <span>Sales tax</span>
                </div>
              </button>
            </div>

            {/* Tax filings Section */}
            <div>
              <button 
                onClick={() => router.push('/tax-filings')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TaxFilingsIcon className="text-gray-500" />
                  <span>Tax filings</span>
                </div>
              </button>
            </div>

            {/* Settings Section */}
            <div>
              <button 
                onClick={() => {
                  setExpandedSections(prev => 
                    prev.includes('settings') 
                      ? prev.filter(p => p !== 'settings')
                      : [...prev, 'settings']
                  )
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SettingsIcon className="text-gray-500" />
                  <span>Settings</span>
                </div>
                <ChevronIcon className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.includes('settings') ? '' : '-rotate-90'}`} />
              </button>

              {expandedSections.includes('settings') && (
                <div className="mt-1 ml-3 pl-3 border-l border-gray-200">
                  <button
                    onClick={() => router.push('/settings/account')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'settings-account' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <DocumentIcon className={selectedTab === 'settings-account' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Account</span>
                  </button>

                  <button
                    onClick={() => router.push('/settings/integrations')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'settings-integrations' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <DocumentIcon className={selectedTab === 'settings-integrations' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Integrations</span>
                  </button>

                  <button
                    onClick={() => router.push('/settings/billing')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                      selectedTab === 'settings-billing' 
                        ? 'text-gray-900 bg-gray-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } rounded-lg transition-colors text-left`}
                  >
                    <DocumentIcon className={selectedTab === 'settings-billing' ? 'text-gray-900' : 'text-gray-500'} />
                    <span>Billing</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <TemplatesModal 
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
      />

      <DocumentsModal 
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
      />

      <CommandModal 
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
      />
    </>
  )
} 