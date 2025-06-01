'use client'
import { useState } from 'react'
import CopilotNavigation from "../components/CopilotNavigation"

interface Assessment {
  id: number
  name: string
  description: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'available' | 'completed' | 'in-progress' | 'locked'
  gradient: string
  icon: React.ReactNode
  unlocks: string[]
  completedDate?: string
  score?: number
}

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available')
  
  // Mock assessments data - only English, Spanish, and French
  const assessments: Assessment[] = [
    {
      id: 1,
      name: "English 🇺🇸",
      description: "",
      duration: "est. 20-30 mins",
      difficulty: 'Beginner',
      status: 'completed',
      gradient: "bg-gradient-to-br from-teal-500 to-teal-700",
      completedDate: "Jun 15, 2024",
      score: 92,
      unlocks: [],
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 2,
      name: "Spanish 🇪🇸",
      description: "",
      duration: "est. 25-35 mins",
      difficulty: 'Intermediate',
      status: 'completed',
      gradient: "bg-gradient-to-br from-teal-500 to-teal-700",
      completedDate: "Jan 20, 2024",
      score: 88,
      unlocks: [],
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      name: "French 🇫🇷",
      description: "",
      duration: "est. 25-35 mins",
      difficulty: 'Intermediate',
      status: 'available',
      gradient: "bg-gradient-to-br from-teal-500 to-teal-700",
      unlocks: [],
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  const availableAssessments = assessments.filter(a => a.status === 'available' || a.status === 'locked')
  const completedAssessments = assessments.filter(a => a.status === 'completed')

  const getStatusBadge = (assessment: Assessment) => {
    if (assessment.status === 'locked') {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-[12px] font-medium bg-gray-100 text-gray-600">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10 C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1 s3.1,1.39,3.1,3.1V8z"/>
          </svg>
          Locked
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="assessments" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-2 pr-2 pb-2 sm:pt-4 sm:pr-4 sm:pb-4">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg">
          {/* Header section */}
          <div className="px-4 pt-4 pb-3 sm:pl-8 sm:pr-4 sm:pt-8 sm:pb-6 flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] leading-[28px] sm:text-[28px] sm:leading-[36px] font-semibold text-[#1A1A1A]">
                  Assessments
                </h1>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="px-4 sm:pl-8 sm:pr-6 flex-none">
            <div className="flex space-x-4 sm:space-x-6 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('available')}
                className={`pb-3 text-[12px] sm:text-[14px] font-medium transition-colors relative ${
                  activeTab === 'available'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Available ({availableAssessments.length})
                {activeTab === 'available' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-3 text-[12px] sm:text-[14px] font-medium transition-colors relative ${
                  activeTab === 'completed'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Completed ({completedAssessments.length})
                {activeTab === 'completed' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                )}
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:pl-8 sm:pr-6 sm:pt-4 sm:pb-6">
            {activeTab === 'available' && (
              <>
                {availableAssessments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {availableAssessments.map((assessment) => (
                      <div key={assessment.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:bg-gray-50 cursor-pointer">
                        {/* Gradient top section with icon */}
                        <div className={`${assessment.gradient} h-32 sm:h-44 flex items-center justify-center`}>
                          <div className="scale-75 sm:scale-100">
                            {assessment.icon}
                          </div>
                        </div>
                        
                        {/* Bottom section with assessment details */}
                        <div className="p-3 sm:p-4 space-y-3">
                          {/* Assessment name and status */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#1A1A1A] leading-tight">
                                {assessment.name}
                              </h3>
                              {getStatusBadge(assessment)}
                            </div>
                          </div>
                          
                          {/* Duration only */}
                          <div className="flex items-center gap-1 text-[13px] text-gray-600">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.585938 4.9199219 L 11.503906 5.9160156 L 10.957031 12.482422 L 14.917969 15.314453 L 15.732422 15.894531 L 16.894531 14.267578 L 16.082031 13.685547 L 13.042969 11.517578 L 13.496094 6.0839844 L 13.580078 5.0859375 L 11.585938 4.9199219 z"/>
                            </svg>
                            <span>{assessment.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No available assessments</h3>
                    <p className="text-gray-500 text-sm max-w-sm px-4">You've completed all available assessments. Check back later for new opportunities.</p>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'completed' && (
              <>
                {completedAssessments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {completedAssessments.map((assessment) => (
                      <div key={assessment.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {/* Gradient top section with icon and overlay */}
                        <div className={`${assessment.gradient} h-32 sm:h-44 flex items-center justify-center relative opacity-30`}>
                          <div className="scale-75 sm:scale-100">
                            {assessment.icon}
                          </div>
                          {/* Completed overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white rounded-lg px-3 py-2 text-center">
                              <div className="text-[12px] sm:text-[14px] font-semibold text-gray-900">Completed</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom section with assessment details */}
                        <div className="p-3 sm:p-4 space-y-3">
                          {/* Assessment name only */}
                          <div className="flex flex-col gap-2">
                            <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#1A1A1A] leading-tight">
                              {assessment.name}
                            </h3>
                          </div>
                          
                          {/* Completion date only */}
                          <div className="flex items-center gap-1 text-[13px] text-gray-600">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Completed {assessment.completedDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No completed assessments</h3>
                    <p className="text-gray-500 text-sm max-w-sm px-4">Complete assessments to unlock new projects and opportunities.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 