'use client'
import { useMemo, useState } from 'react'
import CopilotNavigation from "../components/CopilotNavigation"

export default function PayoutsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // Sample data - in real app this would come from API
  const payoutData = {
    earnedNotPaidOut: 45.67, // Amount earned but not yet paid out
    totalEarnings: 234.89    // Total lifetime earnings
  }

  // Sample payout history and upcoming payouts
  const payouts = [
    {
      id: 1,
      payPeriod: "Dec 9 - Dec 15, 2024",
      payoutDate: "Dec 17, 2024",
      status: "pending",
      amount: 45.67,
      method: "Bank Transfer"
    },
    {
      id: 2,
      payPeriod: "Dec 2 - Dec 8, 2024", 
      payoutDate: "Dec 10, 2024",
      status: "paid",
      amount: 38.92,
      method: "PayPal"
    },
    {
      id: 3,
      payPeriod: "Nov 25 - Dec 1, 2024",
      payoutDate: "Dec 3, 2024", 
      status: "paid",
      amount: 52.14,
      method: "Bank Transfer"
    },
    {
      id: 4,
      payPeriod: "Nov 18 - Nov 24, 2024",
      payoutDate: "Nov 26, 2024",
      status: "paid", 
      amount: 41.83,
      method: "Bank Transfer"
    },
    {
      id: 5,
      payPeriod: "Nov 11 - Nov 17, 2024",
      payoutDate: "Nov 19, 2024",
      status: "paid",
      amount: 56.33,
      method: "Bank Transfer"
    },
    {
      id: 6,
      payPeriod: "Nov 4 - Nov 10, 2024",
      payoutDate: "Nov 12, 2024",
      status: "paid",
      amount: 43.21,
      method: "Bank Transfer"
    },
    {
      id: 7,
      payPeriod: "Oct 28 - Nov 3, 2024",
      payoutDate: "Nov 5, 2024",
      status: "paid",
      amount: 39.87,
      method: "PayPal"
    },
    {
      id: 8,
      payPeriod: "Oct 21 - Oct 27, 2024",
      payoutDate: "Oct 29, 2024",
      status: "paid",
      amount: 47.65,
      method: "Bank Transfer"
    },
    {
      id: 9,
      payPeriod: "Oct 14 - Oct 20, 2024",
      payoutDate: "Oct 22, 2024",
      status: "paid",
      amount: 51.23,
      method: "Bank Transfer"
    },
    {
      id: 10,
      payPeriod: "Oct 7 - Oct 13, 2024",
      payoutDate: "Oct 15, 2024",
      status: "paid",
      amount: 44.78,
      method: "PayPal"
    },
    {
      id: 11,
      payPeriod: "Sep 30 - Oct 6, 2024",
      payoutDate: "Oct 8, 2024",
      status: "paid",
      amount: 48.92,
      method: "Bank Transfer"
    },
    {
      id: 12,
      payPeriod: "Sep 23 - Sep 29, 2024",
      payoutDate: "Oct 1, 2024",
      status: "paid",
      amount: 42.15,
      method: "Bank Transfer"
    },
    {
      id: 13,
      payPeriod: "Sep 16 - Sep 22, 2024",
      payoutDate: "Sep 24, 2024",
      status: "paid",
      amount: 53.67,
      method: "PayPal"
    },
    {
      id: 14,
      payPeriod: "Sep 9 - Sep 15, 2024",
      payoutDate: "Sep 17, 2024",
      status: "paid",
      amount: 46.34,
      method: "Bank Transfer"
    },
    {
      id: 15,
      payPeriod: "Sep 2 - Sep 8, 2024",
      payoutDate: "Sep 10, 2024",
      status: "paid",
      amount: 41.89,
      method: "Bank Transfer"
    },
    {
      id: 16,
      payPeriod: "Aug 26 - Sep 1, 2024",
      payoutDate: "Sep 3, 2024",
      status: "paid",
      amount: 49.56,
      method: "PayPal"
    },
    {
      id: 17,
      payPeriod: "Aug 19 - Aug 25, 2024",
      payoutDate: "Aug 27, 2024",
      status: "paid",
      amount: 45.12,
      method: "Bank Transfer"
    },
    {
      id: 18,
      payPeriod: "Aug 12 - Aug 18, 2024",
      payoutDate: "Aug 20, 2024",
      status: "paid",
      amount: 52.78,
      method: "Bank Transfer"
    }
  ]

  const totalPages = Math.ceil(payouts.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentRows = payouts.slice(startIndex, endIndex)

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
      <CopilotNavigation selectedTab="payouts" />
      <div className="flex-1 bg-[#F3F6F6] pt-4 pr-4 pb-4 overflow-hidden">
        <main className="h-full w-full bg-white rounded-lg overflow-y-auto">
          {/* Header section */}
          <div className="pl-8 pr-4 pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-[28px] leading-[36px] font-semibold text-[#1A1A1A]">
                    Payouts
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Payments happen weekly on Tuesdays.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics cards */}
          <div className="pl-8 pr-6 pb-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 relative">
                <div className="absolute top-3 right-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-lg font-semibold text-[#1A1A1A] mb-0">Earned pending payout</div>
                <div className="text-sm text-gray-500 mb-1">Pending payout amount</div>
                <div className="text-2xl font-semibold text-[#1A1A1A]">${payoutData.earnedNotPaidOut.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 relative">
                <div className="absolute top-3 right-3">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-lg font-semibold text-[#1A1A1A] mb-0">Lifetime earnings</div>
                <div className="text-sm text-gray-500 mb-1">Total earnings to date</div>
                <div className="text-2xl font-semibold text-[#1A1A1A]">${payoutData.totalEarnings.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Payouts table */}
          <div className="pl-8 pr-6 pb-6">
            <div className="bg-white rounded-lg">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Your Payouts</h2>
              </div>
              
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50 border-0">
                    <th className="text-left py-2.5 px-6 text-[13px] font-medium text-gray-700 w-[30%] border-0">Pay Period</th>
                    <th className="text-left py-2.5 px-6 text-[13px] font-medium text-gray-700 w-[20%] border-0">Payout Date</th>
                    <th className="text-left py-2.5 px-6 text-[13px] font-medium text-gray-700 w-[15%] border-0">Status</th>
                    <th className="text-left py-2.5 px-6 text-[13px] font-medium text-gray-700 w-[15%] border-0">Amount</th>
                    <th className="text-left py-2.5 px-6 text-[13px] font-medium text-gray-700 w-[20%] border-0">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="py-2.5 px-6">
                        <div className="text-[#1A1A1A] font-medium text-[13px]">{payout.payPeriod}</div>
                      </td>
                      <td className="py-2.5 px-6">
                        <div className="text-[#1A1A1A] font-medium text-[13px]">{payout.payoutDate}</div>
                      </td>
                      <td className="py-2.5 px-6">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[12px] font-medium ${
                          payout.status === 'pending'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-[#D1FAE5] text-[#065F46]'
                        }`}>
                          {payout.status === 'pending' ? 'Pending' : 'Paid'}
                        </span>
                      </td>
                      <td className="py-2.5 px-6">
                        <div className="text-[#1A1A1A] font-medium text-[13px]">${payout.amount.toFixed(2)}</div>
                      </td>
                      <td className="py-2.5 px-6">
                        <div className="text-[#1A1A1A] font-medium text-[13px] flex items-center gap-1">
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-[13px] text-gray-500">
                Showing {payouts.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, payouts.length)} of {payouts.length} results
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
        </main>
      </div>
    </div>
  )
} 