'use client'
import { useState, useRef, useEffect } from 'react'
import CopilotNavigation from "../components/CopilotNavigation"
import { useAuth } from '@/contexts/AuthContext'

export default function ReferralsPage() {
  const [copySuccess, setCopySuccess] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showOtherOptions, setShowOtherOptions] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const { user } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOtherOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Generate a custom referral link using the user's ID
  const referralLink = user ? `https://dialogue.audio/ref?user=${user.id}` : "https://dialogue.audio/ref"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const shareToWhatsApp = () => {
    const message = `Check out Dialogue Audio! ${referralLink}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const shareToTelegram = () => {
    const message = `Check out Dialogue Audio! ${referralLink}`
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Check out Dialogue Audio!')}`
    window.open(telegramUrl, '_blank')
  }

  // Sample referral data - in real app this would come from API
  const allReferrals = [
    { id: 1, name: "John Doe", status: "Completed", statusType: "completed" },
    { id: 2, name: "Jane Smith", status: "Pending completion", statusType: "pending" },
    { id: 3, name: "Mike Wilson", status: "Pending completion", statusType: "pending" },
    { id: 4, name: "Sarah Johnson", status: "Completed", statusType: "completed" },
    { id: 5, name: "David Brown", status: "Pending completion", statusType: "pending" },
    { id: 6, name: "Emily Davis", status: "Completed", statusType: "completed" },
    { id: 7, name: "Chris Miller", status: "Pending completion", statusType: "pending" },
    { id: 8, name: "Lisa Anderson", status: "Pending completion", statusType: "pending" },
  ]

  // Filter referrals based on active tab
  const pendingReferrals = allReferrals.filter(referral => referral.statusType === 'pending')
  const completedReferrals = allReferrals.filter(referral => referral.statusType === 'completed')
  const currentReferrals = activeTab === 'pending' ? pendingReferrals : completedReferrals

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="referrals" />
      <div className="flex-1 bg-[#F3F6F6] pt-4 pr-4 pb-4 overflow-hidden">
        <main className="h-full w-full bg-white rounded-lg overflow-y-auto">
          {/* Header section */}
          <div className="pl-8 pr-4 pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[28px] leading-[36px] font-semibold text-[#1A1A1A]">
                  Referrals
                </h1>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="pl-8 pr-6">
            {/* Referral card */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 24 24">
                    <path d="M 11.984375 -0.013671875 A 1.0001 1.0001 0 0 0 11 1 L 11 2.5859375 L 9.7070312 1.2929688 A 1.0001 1.0001 0 0 0 8.9902344 0.99023438 A 1.0001 1.0001 0 0 0 8.2929688 2.7070312 L 9.5859375 4 L 3 4 A 1.0001 1.0001 0 0 0 2 5 L 2 9 A 1.0001 1.0001 0 0 0 3 10 L 3 20 A 1.0001 1.0001 0 0 0 4 21 L 11.832031 21 A 1.0001 1.0001 0 0 0 12.158203 21 L 20 21 A 1.0001 1.0001 0 0 0 21 20 L 21 10 A 1.0001 1.0001 0 0 0 22 9 L 22 5 A 1.0001 1.0001 0 0 0 21 4 L 14.414062 4 L 15.707031 2.7070312 A 1.0001 1.0001 0 1 0 14.292969 1.2929688 L 13 2.5859375 L 13 1 A 1.0001 1.0001 0 0 0 11.984375 -0.013671875 z M 4 6 L 11 6 L 11 8 L 4.1679688 8 A 1.0001 1.0001 0 0 0 4 7.9863281 L 4 6 z M 13 6 L 20 6 L 20 7.9863281 A 1.0001 1.0001 0 0 0 19.841797 8 L 13 8 L 13 6 z M 5 10 L 11 10 L 11 19 L 5 19 L 5 10 z M 13 10 L 19 10 L 19 19 L 13 19 L 13 10 z"></path>
                  </svg>
                  <h2 className="text-xl font-semibold text-[#1A1A1A]">
                    Refer a friend and earn $20
                  </h2>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <button 
                  onClick={copyToClipboard}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                  </svg>
                  {copySuccess ? 'Copied!' : 'Copy link'}
                </button>
                
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowOtherOptions(!showOtherOptions)}
                    className="text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors flex items-center gap-1"
                  >
                    Other options
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-transform duration-200 ${showOtherOptions ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {showOtherOptions && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm py-2 px-2 z-10 min-w-max animate-in fade-in-0 zoom-in-95 duration-200 slide-in-from-top-2">
                      <button
                        onClick={() => {
                          shareToWhatsApp()
                          setShowOtherOptions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-black font-medium hover:bg-gray-100 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        Share on WhatsApp
                      </button>
                      
                      <button
                        onClick={() => {
                          shareToTelegram()
                          setShowOtherOptions(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-black font-medium hover:bg-gray-100 rounded-md flex items-center gap-2 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Share on Telegram
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Disclaimer toggle */}
              <button
                onClick={() => setShowDisclaimer(!showDisclaimer)}
                className="flex items-center gap-2 text-[#646462] text-[12.5px] font-medium hover:text-gray-800 transition-colors"
              >
                Disclaimer
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-200 ${showDisclaimer ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Collapsible disclaimer content */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDisclaimer ? 'max-h-40 mt-2' : 'max-h-0'}`}>
                <p className="text-[#646462] text-[12.5px] leading-tight w-[90%]">
                  To earn the referral, you must be active (completed work in prior 7 days) when your referral completes their first hour of conversations on Dialogue Audio. Monthly limit: $200 from referrals. Referrals are credited in the month your referral completes one hour of conversations. We reserve the right to withhold payment for abuse or fraud. <a href="#" className="text-black underline hover:no-underline">Read about the referral program</a>.
                </p>
              </div>
            </div>
          </div>

          {/* Referrals section with tab switcher */}
          <div className="px-4 sm:pl-8 sm:pr-6">
            {/* Table header */}
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Your referrals</h2>

            {/* Tab switcher */}
            <div className="mb-4">
              <div className="flex space-x-6 border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`pb-3 text-[14px] font-medium transition-colors relative ${
                    activeTab === 'pending'
                      ? 'text-[#1A1A1A]'
                      : 'text-gray-500 hover:text-[#1A1A1A]'
                  }`}
                >
                  Pending ({pendingReferrals.length})
                  {activeTab === 'pending' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`pb-3 text-[14px] font-medium transition-colors relative ${
                    activeTab === 'completed'
                      ? 'text-[#1A1A1A]'
                      : 'text-gray-500 hover:text-[#1A1A1A]'
                  }`}
                >
                  Completed ({completedReferrals.length})
                  {activeTab === 'completed' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                  )}
                </button>
              </div>
            </div>

            {/* Cards content area */}
            <div className="grid grid-cols-4 gap-4">
              {currentReferrals.map((referral) => (
                <div 
                  key={referral.id} 
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer group relative"
                  onClick={() => {/* TODO: Navigate to referral details */}}
                >
                  <div className="flex items-center gap-1.5">
                    {referral.statusType === 'pending' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" className="text-black">
                        <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 12.46875 4.9863281 A 1.0001 1.0001 0 0 0 11.503906 5.9160156 L 11.003906 11.916016 A 1.0001 1.0001 0 0 0 11.417969 12.814453 L 14.917969 15.314453 A 1.0010463 1.0010463 0 0 0 16.082031 13.685547 L 13.042969 11.517578 L 13.496094 6.0839844 A 1.0001 1.0001 0 0 0 12.46875 4.9863281 z"></path>
                      </svg>
                    )}
                    {referral.statusType === 'completed' && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" className="text-black">
                        <path fill="currentColor" d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z"></path>
                      </svg>
                    )}
                    <h4 className="text-[#1A1A1A] font-medium text-[15px]">{referral.name}</h4>
                  </div>
                  
                  {/* Remind text with arrow - only show for pending referrals */}
                  {referral.statusType === 'pending' && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                      <span className="text-[#646462] text-sm font-medium">Remind</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#646462] transform translate-x-0 group-hover:translate-x-1 transition-transform duration-200"
                      >
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 