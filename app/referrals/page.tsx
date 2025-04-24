'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const SortIcon = ({ 
  className = "", 
  active = false, 
  direction 
}: { 
  className?: string;
  active?: boolean;
  direction?: 'asc' | 'desc';
}) => (
  <svg 
    className={`w-3.5 h-3.5 ${className} ${active ? 'text-gray-900' : ''} ${direction === 'desc' ? 'rotate-180' : ''} transition-transform`}
    viewBox="0 0 16 16" 
    fill="none"
  >
    <path d="M4.5 4.5L4.5 11.5M4.5 11.5L2.5 9.5M4.5 11.5L6.5 9.5M11.5 11.5L11.5 4.5M11.5 4.5L9.5 6.5M11.5 4.5L13.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ReferralsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'company' | 'status' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // This would come from your backend in a real implementation
  const referralCode = user?.email ? `TALLY-${user.email.split('@')[0].toUpperCase()}` : '';
  const referralLink = `https://tally.com/signup?ref=${referralCode}`;

  // Mock data for referrals - would come from your backend
  const referrals = [
    { 
      id: 1, 
      name: 'John Smith',
      company: 'Acme Corp',
      status: 'pending',
      date: '2024-03-15'
    },
    { 
      id: 2, 
      name: 'Sarah Johnson',
      company: 'Tech Solutions',
      status: 'completed',
      date: '2024-03-10'
    }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSort = (field: 'name' | 'company' | 'status' | 'date') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort referrals
  const sortedReferrals = [...referrals].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="referrals" />
      <div className="flex-1 p-4 pl-0 bg-[#F5F6F8] overflow-hidden">
        <main className="h-full rounded-xl bg-white overflow-y-auto">
          <div className="px-[48px] py-4 mt-6">
            <h1 className="text-[18px] font-semibold text-gray-900 mb-4">
              Referrals
            </h1>

            {/* Hero Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 mb-8">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Earn $500 for each successful referral
                </h2>
                <p className="text-gray-600 mb-6">
                  Know someone who could benefit from Tally? Refer them and earn $500 when they become a customer.
                </p>
                <div className="flex flex-col gap-4">
                  {/* Referral Link */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center h-9 bg-white border border-gray-200 rounded-lg overflow-hidden w-[400px]">
                      <div className="flex-1 px-3">
                        <div className="text-[13px] text-gray-600 truncate">
                          {referralLink}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(referralLink)}
                        className="h-full px-3 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l border-gray-200 transition-colors flex items-center gap-1.5 flex-shrink-0"
                      >
                        {copied ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24">
                              <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" fill="currentColor"/>
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M 10 1 C 8.9069372 1 8 1.9069372 8 3 L 8 5 L 5 5 C 3.9069372 5 3 5.9069372 3 7 L 3 20 C 3 21.093063 3.9069372 22 5 22 L 15 22 C 16.093063 22 17 21.093063 17 20 L 17 18 L 20 18 C 21.093063 18 22 17.093063 22 16 L 22 6 A 1.0001 1.0001 0 0 0 21.707031 5.2929688 L 17.707031 1.2929688 A 1.0001 1.0001 0 0 0 17 1 L 10 1 z M 10 3 L 16 3 L 16 6 C 16 6.552 16.447 7 17 7 L 20 7 L 20 16 L 10 16 L 10 3 z M 5 7 L 8 7 L 8 16 C 8 17.093063 8.9069372 18 10 18 L 15 18 L 15 20 L 5 20 L 5 7 z"/>
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Status */}
            <div>
              <h3 className="text-[15px] font-medium text-gray-600 mb-4">
                Your referrals
              </h3>
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="min-w-[990px] w-full">
                    <table className="w-full table-fixed border-collapse relative">
                      <colgroup>
                        <col style={{ width: '280px' }} />
                        <col style={{ width: '200px' }} />
                        <col style={{ width: '150px' }} />
                        <col style={{ width: '146px' }} />
                      </colgroup>
                      <thead className="sticky top-0 bg-white z-10">
                        <tr>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200 rounded-tl-xl">
                            <button 
                              onClick={() => handleSort('name')}
                              className="inline-flex items-center gap-2 hover:text-gray-700"
                            >
                              Name
                              <SortIcon 
                                active={sortField === 'name'} 
                                direction={sortField === 'name' ? sortDirection : undefined}
                              />
                            </button>
                          </th>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                            <button 
                              onClick={() => handleSort('company')}
                              className="inline-flex items-center gap-2 hover:text-gray-700"
                            >
                              Company
                              <SortIcon 
                                active={sortField === 'company'} 
                                direction={sortField === 'company' ? sortDirection : undefined}
                              />
                            </button>
                          </th>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 border-r border-gray-200 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200">
                            <button 
                              onClick={() => handleSort('status')}
                              className="inline-flex items-center gap-2 hover:text-gray-700"
                            >
                              Status
                              <SortIcon 
                                active={sortField === 'status'} 
                                direction={sortField === 'status' ? sortDirection : undefined}
                              />
                            </button>
                          </th>
                          <th className="sticky top-0 bg-white pl-[18px] pr-6 py-1.5 text-left text-[13px] font-medium text-gray-500 before:absolute before:bottom-0 before:left-0 before:right-0 before:border-b before:border-gray-200 rounded-tr-xl">
                            <button 
                              onClick={() => handleSort('date')}
                              className="inline-flex items-center gap-2 hover:text-gray-700"
                            >
                              Date
                              <SortIcon 
                                active={sortField === 'date'} 
                                direction={sortField === 'date' ? sortDirection : undefined}
                              />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sortedReferrals.map((referral) => (
                          <tr key={referral.id} className="hover:bg-gray-50 last:hover:rounded-b-xl [&:last-child>td:first-child]:rounded-bl-xl [&:last-child>td:last-child]:rounded-br-xl">
                            <td className="pl-[18px] pr-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                              {referral.name}
                            </td>
                            <td className="pl-[18px] pr-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                              {referral.company}
                            </td>
                            <td className="pl-[18px] pr-6 py-2 whitespace-nowrap border-r border-gray-200">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-2 px-2 py-1 text-[13px] font-medium rounded ${
                                  referral.status === 'completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {referral.status === 'completed' ? (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                      <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" fill="currentColor"/>
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                      <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 12.46875 4.9863281 A 1.0001 1.0001 0 0 0 11.503906 5.9160156 L 11.003906 11.916016 A 1.0001 1.0001 0 0 0 11.417969 12.814453 L 14.917969 15.314453 A 1.0010463 1.0010463 0 0 0 16.082031 13.685547 L 13.042969 11.517578 L 13.496094 6.0839844 A 1.0001 1.0001 0 0 0 12.46875 4.9863281 z" fill="currentColor"/>
                                    </svg>
                                  )}
                                  {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                                </span>
                              </div>
                            </td>
                            <td className="pl-[18px] pr-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(referral.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 