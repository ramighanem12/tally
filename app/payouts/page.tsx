'use client'
import { useState, useMemo } from 'react'
import CopilotNavigation from "../components/CopilotNavigation"
import { payouts, metricsData } from '../data/sampleData'

export default function PayoutsPage() {
  const [payoutCurrentPage, setPayoutCurrentPage] = useState(1)
  const [payoutsSubTab, setPayoutsSubTab] = useState<'pending' | 'paid'>('pending')
  const rowsPerPage = 10

  // Calculate metrics from all activities (not filtered)
  const allActivitiesMetrics = useMemo(() => {
    return {
      totalEarnings: metricsData.totalEarnings.toFixed(2),
      pendingEarnings: metricsData.pendingEarnings.toFixed(2)
    }
  }, [])

  // Filter payouts based on sub-tab
  const filteredPayouts = useMemo(() => {
    return payouts.filter(payout => {
      if (payoutsSubTab === 'pending') {
        return payout.status === 'pending'
      } else {
        return payout.status === 'paid'
      }
    })
  }, [payoutsSubTab])

  // Payout pagination logic - use filtered payouts
  const payoutTotalPages = Math.ceil(filteredPayouts.length / rowsPerPage)
  const payoutStartIndex = (payoutCurrentPage - 1) * rowsPerPage
  const payoutEndIndex = payoutStartIndex + rowsPerPage
  const payoutRows = filteredPayouts.slice(payoutStartIndex, payoutEndIndex)

  const goToPayoutNextPage = () => {
    if (payoutCurrentPage < payoutTotalPages) {
      setPayoutCurrentPage(payoutCurrentPage + 1)
    }
  }

  const goToPayoutPrevPage = () => {
    if (payoutCurrentPage > 1) {
      setPayoutCurrentPage(payoutCurrentPage - 1)
    }
  }

  // Reset to first page when switching payout sub-tabs
  const handlePayoutsSubTabChange = (subTab: 'pending' | 'paid') => {
    setPayoutsSubTab(subTab)
    setPayoutCurrentPage(1)
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="payouts" />
      <div className="flex-1 bg-[#F3F6F6] pt-4 pr-4 pb-4 overflow-hidden">
        <main className="h-full w-full bg-white rounded-lg overflow-y-auto">
          {/* Header section */}
          <div className="pl-8 pr-4 pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[28px] leading-[36px] font-semibold text-[#1A1A1A]">
                  Payouts
                </h1>
              </div>
            </div>
          </div>

          {/* Metrics cards */}
          <div className="px-4 pb-4 sm:pl-8 sm:pr-6 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xl font-semibold text-[#1A1A1A]">Earned pending payout</div>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Pending payout amount</div>
                <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">${allActivitiesMetrics.pendingEarnings}</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xl font-semibold text-[#1A1A1A]">Lifetime earnings</div>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Total earnings to date</div>
                <div className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">${allActivitiesMetrics.totalEarnings}</div>
              </div>
            </div>
          </div>

          {/* Payouts table */}
          <div className="px-4 pb-4 sm:pl-8 sm:pr-6 sm:pb-6">
            {/* Table header */}
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Your payouts</h2>

            {/* Payouts sub-tab switcher */}
            <div className="mb-4">
              <div className="flex space-x-6 border-b border-gray-100">
                <button
                  onClick={() => handlePayoutsSubTabChange('pending')}
                  className={`pb-3 text-[14px] font-medium transition-colors relative ${
                    payoutsSubTab === 'pending'
                      ? 'text-[#1A1A1A]'
                      : 'text-gray-500 hover:text-[#1A1A1A]'
                  }`}
                >
                  Pending
                  {payoutsSubTab === 'pending' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                  )}
                </button>
                <button
                  onClick={() => handlePayoutsSubTabChange('paid')}
                  className={`pb-3 text-[14px] font-medium transition-colors relative ${
                    payoutsSubTab === 'paid'
                      ? 'text-[#1A1A1A]'
                      : 'text-gray-500 hover:text-[#1A1A1A]'
                  }`}
                >
                  Paid
                  {payoutsSubTab === 'paid' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 border-0">
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[25%] border-0 first:rounded-l-lg last:rounded-r-lg">Pay period</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[20%] border-0 first:rounded-l-lg last:rounded-r-lg">Payout date</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[15%] border-0 first:rounded-l-lg last:rounded-r-lg">Status</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[20%] border-0 first:rounded-l-lg last:rounded-r-lg">Amount</th>
                    <th className="text-left py-2.5 px-3 sm:px-6 text-[11px] sm:text-[13px] font-medium text-gray-700 w-[20%] border-0 first:rounded-l-lg last:rounded-r-lg">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutRows.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                        <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{payout.payPeriod}</div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                        <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">{payout.payoutDate}</div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                        {payout.status === "pending" ? (
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] flex items-center gap-1.5">
                            <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Pending
                          </div>
                        ) : (
                          <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] flex items-center gap-1.5">
                            <svg className="h-3 w-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z"></path>
                            </svg>
                            Paid
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                        <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px]">${payout.amount.toFixed(2)}</div>
                      </td>
                      <td className="py-2.5 px-3 sm:px-6 first:rounded-l-lg last:rounded-r-lg">
                        <div className="text-[#1A1A1A] font-medium text-[11px] sm:text-[13px] flex items-center gap-1">
                          {payout.method === 'PayPal' && (
                            <img src="/paypal.svg" alt="PayPal" className="w-4 h-4" />
                          )}
                          {payout.method}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for payouts */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
              <div className="text-[11px] sm:text-[13px] text-gray-500">
                Showing {filteredPayouts.length > 0 ? payoutStartIndex + 1 : 0}-{Math.min(payoutEndIndex, filteredPayouts.length)} of {filteredPayouts.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPayoutPrevPage}
                  disabled={payoutCurrentPage === 1}
                  className={`px-2 py-1.5 text-[11px] sm:text-[13px] rounded-lg font-medium transition-all duration-200 ${
                    payoutCurrentPage === 1
                      ? 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Previous
                </button>
                <span className="text-[11px] sm:text-[13px] text-gray-500 px-3">
                  Page {payoutCurrentPage} of {payoutTotalPages || 1}
                </span>
                <button
                  onClick={goToPayoutNextPage}
                  disabled={payoutCurrentPage === payoutTotalPages || payoutTotalPages === 0}
                  className={`px-2 py-1.5 text-[11px] sm:text-[13px] rounded-lg font-medium transition-all duration-200 ${
                    payoutCurrentPage === payoutTotalPages || payoutTotalPages === 0
                      ? 'text-gray-400 border border-gray-100 bg-white cursor-not-allowed'
                      : 'text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 