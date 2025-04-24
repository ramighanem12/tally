'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TallyLogo } from './TallyLogo'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentRequests } from '@/contexts/DocumentRequestsContext'
import { useBusinessDetails } from '@/contexts/BusinessDetailsContext'

type SelectedTab = 
  | 'library'
  // | 'workflows'
  | 'assistant'
  | 'tasks'
  | 'quality-review'
  // | 'integrations'
  | 'knowledge'
  | 'queue'
  | 'history'
  | 'settings'
  | 'home'
  | 'plan'
  | 'insights'
  | 'connections'
  | 'referrals'
  | 'filings'
  | 'advisor'
  | 'services'
  | 'onboarding'
  | 'documents'
  | 'admin-mode'
  | 'concierge';

export default function CopilotNavigation({ 
  selectedTab = 'home'
}: { 
  selectedTab?: SelectedTab 
}) {
  const router = useRouter()
  const [isNewChatDropdownOpen, setIsNewChatDropdownOpen] = useState(false);
  const [isCompanySwitcherOpen, setIsCompanySwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { incompleteRequestsCount } = useDocumentRequests();
  const { businessDetails } = useBusinessDetails()

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsCompanySwitcherOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update the companies array to use the business details
  const companies = [
    { 
      id: '1', 
      name: businessDetails?.legal_name || 'Not provided', 
      initial: businessDetails?.legal_name ? businessDetails.legal_name[0].toUpperCase() : 'N',
      logo_url: businessDetails?.logo_url || null
    }
    // You can keep other companies if needed
  ];

  // Get initials from user's email
  const getInitials = (email: string | undefined) => {
    if (!email) return '';
    return email
      .split('@')[0] // Get the part before @
      .match(/[A-Z]/gi) // Get all letters
      ?.slice(0, 2) // Take first two
      .join('') // Join them
      .toUpperCase() || '??'; // Fallback if no letters found
  };

  return (
    <nav className="w-[185px] bg-[#F0F0F0] flex flex-col h-screen overflow-hidden">
      <div className="px-1.5 flex flex-col h-full">
        {/* Fixed header section - Updated logo */}
        <div className="pt-5 pb-3 flex items-center px-2">
          <div className="flex items-center gap-2 translate-y-[2px]">
            <Image 
              src="/tally-logomark-black.svg"
              alt="Tally Logo"
              width={15}
              height={15}
              className="h-[15px] w-auto text-gray-700"
            />
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 flex flex-col gap-1 mt-[9px]">
          {/* Home Section */}
          <button 
            onClick={() => router.push('/')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium border ${
              selectedTab === 'home' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Home</span>
          </button>

          {/* Documents Section */}
          <button 
            onClick={() => router.push('/documents')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium border ${
              selectedTab === 'documents' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <div className="flex items-center gap-[4px]">
              <span className="font-semibold leading-[20px] font-['Inter']">Documents</span>
              {selectedTab === 'documents' && incompleteRequestsCount > 0 && (
                <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#F0F1EF] rounded-[4px] text-[11px] font-semibold font-['Inter'] text-[#1A1A1A]">
                  {incompleteRequestsCount}
                </span>
              )}
            </div>
          </button>

          {/* Plan Section */}
          <button 
            onClick={() => router.push('/plan')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium border ${
              selectedTab === 'plan' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Plan</span>
          </button>

          {/* Filings Section */}
          <button 
            onClick={() => router.push('/filings')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium border ${
              selectedTab === 'filings' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Filings</span>
          </button>

          {/* Connections Section */}
          <button 
            onClick={() => router.push('/connections')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium border ${
              selectedTab === 'connections' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Connections</span>
          </button>

          {/* Advisor Section */}
          {/* Commented out Advisor button
          <button 
            onClick={() => router.push('/advisor')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium border ${
              selectedTab === 'advisor' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Advisor</span>
          </button>
          */}

          {/* Services Section - Commented out for now
          <button 
            onClick={() => router.push('/services')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium border ${
              selectedTab === 'services' 
                ? 'text-[#1A1A1A] bg-white rounded-[10px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[10px] border-transparent'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Services</span>
          </button>
          */}
        </div>

        {/* Get set up Card - renamed to Onboarding */}
        <div className="mb-[9px]">
          <button 
            onClick={() => router.push('/admin-mode')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium w-full border mb-1 ${
              selectedTab === 'admin-mode' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="font-semibold leading-[20px] font-['Inter']">Advisor mode</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="17.6"
                height="17.6"
                viewBox="0 0 24 24"
                className="text-[#666666]"
              >
                <path 
                  fill="currentColor"
                  d="M 12.025391 2 A 1.250125 1.250125 0 0 0 11.378906 2.1660156 C 11.378906 2.1660156 8.2330138 3.9433594 4.25 3.9433594 A 1.250125 1.250125 0 0 0 3 5.1933594 L 3 12.470703 C 3 15.837822 5.3020163 18.232316 7.4023438 19.720703 C 9.5026711 21.20909 11.587891 21.929687 11.587891 21.929688 A 1.250125 1.250125 0 0 0 12.412109 21.929688 C 12.412109 21.929688 14.497343 21.208944 16.597656 19.720703 C 18.697969 18.232462 21 15.837426 21 12.470703 L 21 5.1953125 A 1.250125 1.250125 0 0 0 19.75 3.9453125 C 15.766837 3.9443979 12.621094 2.1660156 12.621094 2.1660156 A 1.250125 1.250125 0 0 0 12.025391 2 z M 12 4.6054688 C 12.695717 4.972949 15.005889 6.0389675 18.5 6.3203125 L 18.5 12.470703 C 18.5 13.845637 17.890543 15.04084 17.001953 16.050781 C 15.706686 14.791585 13.947836 14 12 14 C 10.052164 14 8.2933137 14.791585 6.9980469 16.050781 C 6.1094564 15.040969 5.5 13.846013 5.5 12.470703 L 5.5 6.3183594 C 8.9941886 6.0376814 11.304262 4.9729473 12 4.6054688 z M 12 7 C 10.895 7 10 7.895 10 9 L 10 10 C 10 11.105 10.895 12 12 12 C 13.105 12 14 11.105 14 10 L 14 9 C 14 7.895 13.105 7 12 7 z M 12 16.5 C 13.21226 16.5 14.296806 16.9526 15.125 17.699219 C 13.569361 18.796036 12.342582 19.223322 12 19.351562 C 11.657423 19.223323 10.430627 18.796125 8.875 17.699219 C 9.7031941 16.9526 10.78774 16.5 12 16.5 z"
                />
              </svg>
            </div>
          </button>

          <button 
            onClick={() => router.push('/concierge')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium w-full border mb-1 ${
              selectedTab === 'concierge' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Concierge</span>
          </button>

          <button 
            onClick={() => router.push('/onboarding')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium w-full border ${
              selectedTab === 'onboarding' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px] border-transparent'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Onboarding</span>
          </button>

          {/* Settings Section */}
          <button 
            onClick={() => router.push('/settings')}
            className={`group flex items-center px-2 h-[34px] text-[14px] font-medium w-full mt-1 ${
              selectedTab === 'settings' 
                ? 'text-[#1A1A1A] bg-white rounded-[8px] border-transparent'
                : 'text-[#1A1A1A] hover:bg-[#E4E4E4] rounded-[8px]'
            }`}
          >
            <span className="font-semibold leading-[20px] font-['Inter']">Settings</span>
          </button>
        </div>

        {/* Company Switcher */}
        <div ref={switcherRef} className="relative mb-[9px]">
          <button 
            onClick={() => setIsCompanySwitcherOpen(!isCompanySwitcherOpen)}
            className="group flex items-center justify-between w-full px-2 py-2 text-[14px] font-medium text-[#1A1A1A] border border-[#E4E5E1] hover:bg-[#E4E4E4] rounded-[8px] transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 bg-[#E4E5E1] rounded-[5px] overflow-hidden">
                {companies[0].logo_url ? (
                  <Image
                    src={companies[0].logo_url}
                    alt={companies[0].name}
                    width={24}
                    height={24}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-[13px] font-medium text-[#1A1A1A]">
                    {companies[0].initial}
                  </span>
                )}
              </div>
              <span className="text-[14px] leading-[20px] font-semibold font-['Inter']">
                {companies[0].name}
              </span>
            </div>
            <div className="flex flex-col -space-y-2">
              <svg className="w-4 h-4 text-[#646462] rotate-180" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <svg className="w-4 h-4 text-[#646462]" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isCompanySwitcherOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[#E4E5E1] rounded-[10px] shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] overflow-hidden">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    setIsCompanySwitcherOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-2 text-[14px] font-medium text-[#1A1A1A] hover:bg-[#F0F0F0]"
                >
                  <div className="flex items-center justify-center h-6 w-6 bg-[#E4E5E1] rounded-[5px] overflow-hidden">
                    {company.logo_url ? (
                      <Image
                        src={company.logo_url}
                        alt={company.name}
                        width={24}
                        height={24}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-[13px] font-medium text-[#1A1A1A]">
                        {company.initial}
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] leading-[20px] font-semibold font-['Inter']">
                    {company.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}