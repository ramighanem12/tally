'use client'
import { useState, useMemo } from 'react'
import CopilotNavigation from "../components/CopilotNavigation"

export default function ReferralsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [copySuccess, setCopySuccess] = useState(false)
  const rowsPerPage = 10

  // Generate a custom referral link (in real app this would come from API)
  const referralLink = "https://platform.example.com/signup?ref=user123"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
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
    { id: 8, name: "Lisa Anderson", status: "Completed", statusType: "completed" },
    { id: 9, name: "Tom Garcia", status: "Pending completion", statusType: "pending" },
    { id: 10, name: "Amy Martinez", status: "Completed", statusType: "completed" },
    { id: 11, name: "Kevin Lee", status: "Pending completion", statusType: "pending" },
    { id: 12, name: "Rachel White", status: "Completed", statusType: "completed" },
  ]

  const totalPages = Math.ceil(allReferrals.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentReferrals = allReferrals.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

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
          <div className="pl-8 pr-6 pb-6">
            {/* Referral card */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                Refer a friend to get $20!
              </h2>
              
              <div className="flex gap-3 mb-4">
                <button 
                  onClick={copyToClipboard}
                  className="bg-[#E5E9E9] text-[#1A1A1A] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#D5D9D9] transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                  </svg>
                  {copySuccess ? 'Copied!' : 'Copy invite link'}
                </button>
                
                <button className="bg-[#1FAD54] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#1C9B4A] transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" fill="currentColor"/>
                  </svg>
                  Invite through WhatsApp
                </button>
              </div>
              
              <p className="text-[#646462] text-[12.5px] leading-tight">
                To earn the referral you must be active (completed work in prior 7 days) at the time the person you refer first completes 1 hour of conversations on Clarity Audio. There is a limit of $200 that can be earned in a given calendar month from referrals, although there is no limit on how many referrals you can submit. The referral is credited in the month in which the person you referred first completes one hour of conversations. In the event that we find abuse or fraud of the referral program, we reserve the right to withhold payment.
              </p>
            </div>

            {/* Referrals table */}
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Your Referrals</h3>
              
              <div className="bg-white rounded-lg">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-gray-50 border-0">
                      <th className="text-left py-2.5 px-6 text-[13px] font-medium text-gray-700 w-[50%] border-0">Name</th>
                      <th className="text-left py-2.5 px-6 text-[13px] font-medium text-gray-700 w-[50%] border-0">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => {/* TODO: Navigate to referral details */}}>
                        <td className="py-2.5 px-6 text-[#1A1A1A] font-medium text-[13px]">{referral.name}</td>
                        <td className="py-2.5 px-6">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[12px] font-medium ${
                            referral.statusType === 'completed' 
                              ? 'bg-[#D1FAE5] text-[#065F46]' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {referral.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-[13px] text-gray-500">
                  Showing {allReferrals.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, allReferrals.length)} of {allReferrals.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`px-2 py-1.5 text-[13px] rounded-lg font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                        : 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-[13px] text-gray-500 px-3">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-2 py-1.5 text-[13px] rounded-lg font-medium transition-all duration-200 ${
                      currentPage === totalPages || totalPages === 0
                        ? 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                        : 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 