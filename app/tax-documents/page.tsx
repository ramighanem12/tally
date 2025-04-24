'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useRef } from 'react'

interface DocumentRequest {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'approved';
  completedDate?: string;
}

const documentRequests: DocumentRequest[] = [
  {
    id: '1',
    title: 'Bank Statements',
    description: 'Last quarter statements for all business accounts',
    dueDate: '2025-01-31',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Sales Tax Returns',
    description: 'Previous quarter returns for CA and WA',
    dueDate: '2025-01-31',
    status: 'submitted',
    completedDate: '2024-01-31'
  },
  {
    id: '3',
    title: 'Asset Purchase Records',
    description: 'Documentation for new equipment and vehicle purchases',
    dueDate: '2025-02-15',
    status: 'pending'
  },
  {
    id: '4',
    title: 'Payroll Records',
    description: 'Employee payroll records for Q4 2024',
    dueDate: '2025-02-28',
    status: 'pending'
  },
  {
    id: '6',
    title: 'Income Statement',
    description: 'Q4 2024 profit and loss statement',
    dueDate: '2025-01-15',
    status: 'submitted',
    completedDate: '2024-01-10'
  }
];

const filings = [
  {
    id: 'f1',
    title: 'Form 1120 - Q4 2023',
    description: 'Corporate income tax return',
    dueDate: '2024-01-15',
    status: 'approved'
  },
  {
    id: 'f2',
    title: 'CA Sales Tax - Q4 2023',
    description: 'Quarterly sales and use tax return',
    dueDate: '2024-01-31',
    status: 'approved'
  },
  {
    id: 'f3',
    title: 'WA Sales Tax - Q4 2023',
    description: 'Combined excise tax return',
    dueDate: '2024-01-31',
    status: 'approved'
  },
  {
    id: 'f4',
    title: 'Form 941 - Q4 2023',
    description: 'Quarterly federal tax return',
    dueDate: '2024-01-31',
    status: 'approved'
  },
  {
    id: 'f5',
    title: 'Form 1120 - Q3 2023',
    description: 'Corporate income tax return',
    dueDate: '2023-10-15',
    status: 'approved'
  }
];

export default function TaxDocumentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpenExpanded, setIsOpenExpanded] = useState(true);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  const openRequests = documentRequests.filter(req => req.status === 'pending');
  const completedRequests = documentRequests.filter(req => req.status === 'submitted');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      e.target.value = '';
      console.log('Selected files:', Array.from(files));
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="documents" />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileSelect}
      />
      <div className="flex-1 p-4 pl-0 bg-[#F5F6F8] overflow-hidden">
        <main className="h-full rounded-xl bg-white overflow-y-auto">
          <div className="px-[48px] py-4 mt-6">
            <h1 className="text-[18px] font-semibold text-gray-900 mb-4">
              Documents
            </h1>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'active'
                    ? 'text-gray-900 bg-[#F8F8F8]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Requests
                <span className="text-gray-500">{documentRequests.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('filings')}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === 'filings'
                    ? 'text-gray-900 bg-[#F8F8F8]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Filings
                <span className="text-gray-500">{filings.length}</span>
              </button>
              <div className="flex-1" />
              <button
                className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors flex items-center gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M 8.984375 2.9863281 A 1.0001 1.0001 0 0 0 8 4 L 8 4.8320312 A 1.0001 1.0001 0 0 0 8 5.1582031 L 8 6 A 1.0001 1.0001 0 1 0 10 6 L 20 6 A 1.0001 1.0001 0 1 0 20 4 L 10 4 A 1.0001 1.0001 0 0 0 8.984375 2.9863281 z M 4 4 A 1.0001 1.0001 0 1 0 4 6 L 5.0429688 6 A 1.0001 1.0001 0 1 0 5.0429688 4 L 4 4 z M 16.984375 9.9863281 A 1.0001 1.0001 0 0 0 16 11 L 16 11.832031 A 1.0001 1.0001 0 0 0 16 12.158203 L 16 13 A 1.0001 1.0001 0 1 0 18 13 L 20 13 A 1.0001 1.0001 0 1 0 20 11 L 18 11 A 1.0001 1.0001 0 0 0 16.984375 9.9863281 z M 4 11 A 1.0001 1.0001 0 1 0 4 13 L 13 13 A 1.0001 1.0001 0 1 0 13 11 L 4 11 z M 12.984375 16.986328 A 1.0001 1.0001 0 0 0 12 18 L 12 18.832031 A 1.0001 1.0001 0 0 0 12 19.158203 L 12 20 A 1.0001 1.0001 0 1 0 14 20 L 20 20 A 1.0001 1.0001 0 1 0 20 18 L 14 18 A 1.0001 1.0001 0 0 0 12.984375 16.986328 z M 4 18 A 1.0001 1.0001 0 1 0 4 20 L 9 20 A 1.0001 1.0001 0 1 0 9 18 L 4 18 z" />
                </svg>
                Filter
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'active' && (
                <div className="space-y-8">
                  {/* Open Requests Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-medium text-gray-600">Open requests</h2>
                        <div className="flex items-center justify-center min-w-[20px] h-[20px] bg-[#ECEEF2] rounded-md">
                          <span className="text-[12px] font-medium text-gray-600 px-[6px]">{openRequests.length}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsOpenExpanded(!isOpenExpanded)}
                        className="flex items-center gap-2 group hover:opacity-70 transition-opacity"
                      >
                        <div className="text-[13px] font-medium text-gray-500">
                          {isOpenExpanded ? 'Show less' : 'View all'}
                        </div>
                        <svg 
                          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpenExpanded ? 'rotate-180' : ''}`}
                          viewBox="0 0 16 16" 
                          fill="none"
                        >
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>

                    <div 
                      className={`relative transition-all duration-300 ease-in-out overflow-hidden ${isOpenExpanded ? 'opacity-100' : 'opacity-0'}`}
                      style={{
                        maxHeight: isOpenExpanded ? '1000px' : '0px',
                        marginBottom: isOpenExpanded ? '0px' : '-16px',
                        transform: isOpenExpanded ? 'translateY(0)' : 'translateY(-8px)',
                      }}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        {openRequests.map((request) => (
                          <div
                            key={request.id}
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-gray-500 mt-[2px]">
                                  <path fill="currentColor" d="M 7.0390625 4 C 5.999857 4 5.0643921 4.6500644 4.6992188 5.6210938 L 2.0644531 12.648438 A 1.0001 1.0001 0 0 0 2 13 L 2 18.75 C 2 19.981063 3.0189372 21 4.25 21 L 19.75 21 C 20.981063 21 22 19.981063 22 18.75 L 22 13 A 1.0001 1.0001 0 0 0 21.935547 12.648438 L 19.300781 5.6230469 L 19.300781 5.6210938 C 18.936037 4.6486902 17.999267 4 16.960938 4 L 7.0390625 4 z M 7.0390625 6 L 16.960938 6 C 17.172071 6 17.354075 6.1274566 17.427734 6.3242188 L 19.556641 12 L 15.869141 12 A 1.0001 1.0001 0 0 0 14.900391 12.753906 C 14.571641 14.04649 13.404803 15 12 15 C 10.595197 15 9.4283591 14.04649 9.0996094 12.753906 A 1.0001 1.0001 0 0 0 8.1308594 12 L 4.4433594 12 L 6.5722656 6.3242188 C 6.6474796 6.1262193 6.8268678 6 7.0390625 6 z M 4 14 L 7.4941406 14 C 8.2733934 15.753875 9.9754253 17 12 17 C 14.024575 17 15.726607 15.753875 16.505859 14 L 20 14 L 20 18.75 C 20 18.898937 19.898937 19 19.75 19 L 4.25 19 C 4.1010628 19 4 18.898937 4 18.75 L 4 14 z"></path>
                                </svg>
                                <div>
                                  <h3 className="text-[15px] font-medium text-gray-900">
                                    <div className="flex items-center gap-1.5">
                                      {request.title}
                                      <span className="text-[12px] font-medium text-[#1D4ED8] bg-[#EBF3FE] px-1.5 py-[1px] rounded flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-[#1D4ED8]">
                                          <path fill="currentColor" d="M 7.984375 1.9863281 A 1.0001 1.0001 0 0 0 7 3 L 4 3 A 1.0001 1.0001 0 0 0 3 4 L 3 8 C 3 12.733333 1.1679688 15.445313 1.1679688 15.445312 A 1.0001 1.0001 0 0 0 2 17 L 3 17 L 3 20 A 1.0001 1.0001 0 0 0 4 21 L 20 21 A 1.0001 1.0001 0 0 0 21 20 L 21 8 L 21 4 A 1.0001 1.0001 0 0 0 20 3 L 17 3 A 1.0001 1.0001 0 0 0 15.984375 1.9863281 A 1.0001 1.0001 0 0 0 15 3 L 9 3 A 1.0001 1.0001 0 0 0 7.984375 1.9863281 z M 5 5 L 7 5 A 1.0001 1.0001 0 1 0 9 5 L 15 5 A 1.0001 1.0001 0 1 0 17 5 L 19 5 L 19 7 L 5 7 L 5 5 z M 4.9726562 9 A 1.0001 1.0001 0 0 0 5 9 L 18.960938 9 C 18.775746 12.54274 17.677776 14.504547 17.376953 15 L 4.1679688 15 A 1.0001 1.0001 0 0 0 3.8417969 15 L 3.5644531 15 C 4.1423019 13.765839 4.8380213 11.900388 4.9726562 9 z M 19 16.257812 L 19 19 L 5 19 L 5 17 L 18 17 A 1.0001 1.0001 0 0 0 18.832031 16.554688 C 18.832031 16.554688 18.941147 16.357238 19 16.257812 z"/>
                                        </svg>
                                        Due {new Date(request.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                  </h3>
                                  <p className="text-[13px] text-gray-500 mt-0.5">{request.description}</p>
                                </div>
                              </div>
                              <button 
                                className="bg-white text-black px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-medium leading-[13px] hover:bg-gray-50 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRef.current?.click();
                                }}
                              >
                                Upload
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Completed Requests Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-medium text-gray-600">Completed requests</h2>
                        <div className="flex items-center justify-center min-w-[20px] h-[20px] bg-[#ECEEF2] rounded-md">
                          <span className="text-[12px] font-medium text-gray-600 px-[6px]">{completedRequests.length}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                        className="flex items-center gap-2 group hover:opacity-70 transition-opacity"
                      >
                        <div className="text-[13px] font-medium text-gray-500">
                          {isCompletedExpanded ? 'Show less' : 'View all'}
                        </div>
                        <svg 
                          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isCompletedExpanded ? 'rotate-180' : ''}`}
                          viewBox="0 0 16 16" 
                          fill="none"
                        >
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>

                    <div 
                      className={`relative transition-all duration-300 ease-in-out overflow-hidden ${isCompletedExpanded ? 'opacity-100' : 'opacity-0'}`}
                      style={{
                        maxHeight: isCompletedExpanded ? '1000px' : '0px',
                        marginBottom: isCompletedExpanded ? '0px' : '-16px',
                        transform: isCompletedExpanded ? 'translateY(0)' : 'translateY(-8px)',
                      }}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        {completedRequests.map((request) => (
                          <div
                            key={request.id}
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-gray-500 mt-[2px]">
                                  <path fill="currentColor" d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 9.7070312 12.292969 A 1.0001 1.0001 0 1 0 8.2929688 13.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z"></path>
                                </svg>
                                <div>
                                  <h3 className="text-[15px] font-medium text-gray-900">
                                    <div className="flex items-center gap-1.5">
                                      {request.title}
                                      <span className="text-[12px] font-medium text-[#33513B] bg-[#E8FBEE] px-1.5 py-[1px] rounded flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-[#33513B]">
                                          <path fill="currentColor" d="M 7.984375 1.9863281 A 1.0001 1.0001 0 0 0 7 3 L 4 3 A 1.0001 1.0001 0 0 0 3 4 L 3 8 C 3 12.733333 1.1679688 15.445313 1.1679688 15.445312 A 1.0001 1.0001 0 0 0 2 17 L 3 17 L 3 20 A 1.0001 1.0001 0 0 0 4 21 L 20 21 A 1.0001 1.0001 0 0 0 21 20 L 21 8 L 21 4 A 1.0001 1.0001 0 0 0 20 3 L 17 3 A 1.0001 1.0001 0 0 0 15.984375 1.9863281 A 1.0001 1.0001 0 0 0 15 3 L 9 3 A 1.0001 1.0001 0 0 0 7.984375 1.9863281 z M 5 5 L 7 5 A 1.0001 1.0001 0 1 0 9 5 L 15 5 A 1.0001 1.0001 0 1 0 17 5 L 19 5 L 19 7 L 5 7 L 5 5 z M 4.9726562 9 A 1.0001 1.0001 0 0 0 5 9 L 18.960938 9 C 18.775746 12.54274 17.677776 14.504547 17.376953 15 L 4.1679688 15 A 1.0001 1.0001 0 0 0 3.8417969 15 L 3.5644531 15 C 4.1423019 13.765839 4.8380213 11.900388 4.9726562 9 z M 19 16.257812 L 19 19 L 5 19 L 5 17 L 18 17 A 1.0001 1.0001 0 0 0 18.832031 16.554688 C 18.832031 16.554688 18.941147 16.357238 19 16.257812 z"/>
                                        </svg>
                                        Completed {new Date(request.completedDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                      {request.title === 'Income Statement' && (
                                        <span className="text-[12px] font-medium text-[#080A0D] bg-[#E5E7EB] px-1.5 py-[1px] rounded flex items-center gap-1 ml-0.5">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-[#080A0D]">
                                            <path fill="currentColor" d="M 10 2 C 7.2504839 2 5 4.2504839 5 7 L 5 15.003906 C 5 18.855963 8.1429989 22 11.996094 22 C 15.726037 22 18.292457 19.483594 18.878906 16.255859 L 19.984375 10.179688 A 1.0006407 1.0006407 0 1 0 18.015625 9.8203125 L 16.910156 15.898438 C 16.460605 18.372703 14.89215 20 11.996094 20 C 9.2231881 20 7 17.77585 7 15.003906 L 7 7 C 7 5.3315161 8.3315161 4 10 4 C 11.668484 4 13 5.3315161 13 7 L 13 15 C 13 15.56503 12.56503 16 12 16 C 11.43497 16 11 15.56503 11 15 L 11 8 A 1.0001 1.0001 0 1 0 9 8 L 9 15 C 9 16.64497 10.35503 18 12 18 C 13.64497 18 15 16.64497 15 15 L 15 7 C 15 4.2504839 12.749516 2 10 2 z"/>
                                          </svg>
                                          Imported from QuickBooks
                                        </span>
                                      )}
                                    </div>
                                  </h3>
                                  <p className="text-[13px] text-gray-500 mt-0.5">{request.description}</p>
                                </div>
                              </div>
                              <button 
                                className="bg-white text-black px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-medium leading-[13px] hover:bg-gray-50 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRef.current?.click();
                                }}
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'filings' && (
                <div className="grid grid-cols-1 gap-4">
                  {filings.map((filing) => (
                    <a
                      key={filing.id}
                      href="/sample.pdf"
                      download
                      className="bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-gray-500 mt-[2px]">
                            <path fill="currentColor" d="M 11.498047 3.0039062 C 10.926047 3.0039062 10.353609 3.1540781 9.8496094 3.4550781 L 1.4003906 8.5039062 C 0.67739063 8.9359063 0.9975625 10 1.8515625 10 L 3 10 L 3 16.019531 C 2.4692861 16.069694 2.0507813 16.481704 2.0507812 17 L 2.0507812 19 C 1.4707813 19 1 19.448 1 20 L 1 21 C 1 21.552 1.4707813 22 2.0507812 22 L 20.949219 22 C 21.529219 22 22 21.552 22 21 L 22 20 C 22 19.448 21.529219 19 20.949219 19 L 20.949219 17 C 20.949219 16.481704 20.530714 16.069694 20 16.019531 L 20 10 L 21.144531 10 C 21.998531 10 22.320656 8.9359063 21.597656 8.5039062 L 13.146484 3.4550781 C 12.643484 3.1530781 12.070047 3.0039063 11.498047 3.0039062 z M 11.498047 5.0039062 C 11.721047 5.0039062 11.936094 5.060875 12.121094 5.171875 L 16.855469 8 L 14.154297 8 A 1.0001 1.0001 0 0 0 13.984375 7.9863281 A 1.0001 1.0001 0 0 0 13.839844 8 L 9.1542969 8 A 1.0001 1.0001 0 0 0 8.984375 7.9863281 A 1.0001 1.0001 0 0 0 8.8398438 8 L 6.1425781 8 L 10.875 5.171875 C 11.06 5.060875 11.275047 5.0039062 11.498047 5.0039062 z M 5 10 L 8 10 L 8 16 L 5 16 L 5 10 z M 10 10 L 13 10 L 13 16 L 10 16 L 10 10 z M 15 10 L 18 10 L 18 16 L 15 16 L 15 10 z M 4.1582031 18 L 8.8320312 18 A 1.0001 1.0001 0 0 0 9.1582031 18 L 13.832031 18 A 1.0001 1.0001 0 0 0 14.158203 18 L 18.832031 18 A 1.0001 1.0001 0 0 0 18.949219 18.011719 L 18.949219 19 C 18.949219 19.364 19.04775 19.706 19.21875 20 L 3.78125 20 C 3.95125 19.706 4.0507813 19.364 4.0507812 19 L 4.0507812 18.011719 A 1.0001 1.0001 0 0 0 4.1582031 18 z"></path>
                          </svg>
                          <div>
                            <h3 className="text-[15px] font-medium text-gray-900">
                              <div className="flex items-center gap-1.5">
                                {(() => {
                                  const parts = filing.title.split(' - ');
                                  return parts[0];
                                })()}
                                <span className="text-[12px] font-medium text-[#33513B] bg-[#E8FBEE] px-1.5 py-[1px] rounded flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" className="text-[#33513B]">
                                    <path fill="currentColor" d="M 7.984375 1.9863281 A 1.0001 1.0001 0 0 0 7 3 L 4 3 A 1.0001 1.0001 0 0 0 3 4 L 3 8 C 3 12.733333 1.1679688 15.445313 1.1679688 15.445312 A 1.0001 1.0001 0 0 0 2 17 L 3 17 L 3 20 A 1.0001 1.0001 0 0 0 4 21 L 20 21 A 1.0001 1.0001 0 0 0 21 20 L 21 8 L 21 4 A 1.0001 1.0001 0 0 0 20 3 L 17 3 A 1.0001 1.0001 0 0 0 15.984375 1.9863281 A 1.0001 1.0001 0 0 0 15 3 L 9 3 A 1.0001 1.0001 0 0 0 7.984375 1.9863281 z M 5 5 L 7 5 A 1.0001 1.0001 0 1 0 9 5 L 15 5 A 1.0001 1.0001 0 1 0 17 5 L 19 5 L 19 7 L 5 7 L 5 5 z M 4.9726562 9 A 1.0001 1.0001 0 0 0 5 9 L 18.960938 9 C 18.775746 12.54274 17.677776 14.504547 17.376953 15 L 4.1679688 15 A 1.0001 1.0001 0 0 0 3.8417969 15 L 3.5644531 15 C 4.1423019 13.765839 4.8380213 11.900388 4.9726562 9 z M 19 16.257812 L 19 19 L 5 19 L 5 17 L 18 17 A 1.0001 1.0001 0 0 0 18.832031 16.554688 C 18.832031 16.554688 18.941147 16.357238 19 16.257812 z"/>
                                  </svg>
                                  Filed {new Date(filing.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </h3>
                            <p className="text-[13px] text-gray-500 mt-0.5">{filing.description}</p>
                          </div>
                        </div>
                        <button className="bg-white text-black px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-medium leading-[13px] hover:bg-gray-50 transition-colors">
                          Download
                        </button>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  )
} 