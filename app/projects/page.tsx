'use client'
import { useState } from 'react'
import CopilotNavigation from "../components/CopilotNavigation"

interface Project {
  id: number
  name: string
  timePerTask: string
  hourlyRate: string
  originalRate?: string
  hasIncentive?: boolean
  gradient: string
  icon: React.ReactNode
  dailyCompleted: number
  dailyLimit: number
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'available'>('current')
  
  // Mock current projects data
  const currentProjects: Project[] = [
    {
      id: 2,
      name: "Podcast (English)",
      timePerTask: "15m",
      hourlyRate: "$25.00",
      originalRate: "$17.50",
      hasIncentive: true,
      gradient: "bg-blue-600",
      dailyCompleted: 3,
      dailyLimit: 5,
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      id: 3,
      name: "Spanish 🇪🇸",
      timePerTask: "15m",
      hourlyRate: "$17.50",
      gradient: "bg-emerald-600",
      dailyCompleted: 7,
      dailyLimit: 10,
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 1,
      name: "Assistant (English)",
      timePerTask: "15m",
      hourlyRate: "$22.50",
      originalRate: "$17.50",
      hasIncentive: true,
      gradient: "bg-slate-600",
      dailyCompleted: 15,
      dailyLimit: 15,
      icon: (
        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ]

  // Mock available projects data
  const availableProjects: Project[] = []

  // Calculate accurate counts
  const currentProjectsCount = currentProjects.length
  const availableProjectsCount = availableProjects.length

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="projects" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-2 pr-2 pb-2 sm:pt-4 sm:pr-4 sm:pb-4">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg">
          {/* Header section */}
          <div className="px-4 pt-4 pb-3 sm:pl-8 sm:pr-4 sm:pt-8 sm:pb-6 flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] leading-[28px] sm:text-[28px] sm:leading-[36px] font-semibold text-[#1A1A1A]">
                  Projects
                </h1>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="px-4 sm:pl-8 sm:pr-6 flex-none">
            <div className="flex space-x-4 sm:space-x-6 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('current')}
                className={`pb-3 text-[12px] sm:text-[14px] font-medium transition-colors relative ${
                  activeTab === 'current'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Current projects ({currentProjectsCount})
                {activeTab === 'current' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`pb-3 text-[12px] sm:text-[14px] font-medium transition-colors relative ${
                  activeTab === 'available'
                    ? 'text-[#1A1A1A]'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                }`}
              >
                Available projects ({availableProjectsCount})
                {activeTab === 'available' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]" />
                )}
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:pl-8 sm:pr-6 sm:pt-4 sm:pb-6">
            {activeTab === 'current' && (
              <>
                {currentProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {currentProjects.map((project) => (
                      <div key={project.id} className={`bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 ${
                        project.dailyCompleted >= project.dailyLimit 
                          ? 'cursor-not-allowed' 
                          : 'hover:shadow-md hover:bg-gray-50 cursor-pointer'
                      }`}>
                        {/* Solid color top section with icon */}
                        <div className={`${project.gradient} h-32 sm:h-44 flex items-center justify-center relative ${
                          project.dailyCompleted >= project.dailyLimit ? 'opacity-30' : ''
                        }`}>
                          <div className="scale-75 sm:scale-100">
                            {project.icon}
                          </div>
                          {project.dailyCompleted >= project.dailyLimit && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                              <div className="bg-white rounded-lg px-3 py-2 text-center">
                                <div className="text-[12px] sm:text-[14px] font-semibold text-gray-900">Call limit reached</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Bottom section with project details */}
                        <div className="p-3 sm:p-4 space-y-2">
                          {/* Project name and daily limit */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                            <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#1A1A1A] truncate">
                              {project.name}
                            </h3>
                            <div className={`flex items-center gap-1 text-[11px] sm:text-[13px] whitespace-nowrap ${
                              project.dailyCompleted >= project.dailyLimit 
                                ? 'text-gray-400 opacity-60' 
                                : 'text-gray-600'
                            }`}>
                              <span>Daily limit: {project.dailyCompleted}/{project.dailyLimit}</span>
                              {project.dailyCompleted >= project.dailyLimit && (
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          
                          {/* Time and rate details */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] sm:text-[13px] text-gray-600">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.585938 4.9199219 L 11.503906 5.9160156 L 10.957031 12.482422 L 14.917969 15.314453 L 15.732422 15.894531 L 16.894531 14.267578 L 16.082031 13.685547 L 13.042969 11.517578 L 13.496094 6.0839844 L 13.580078 5.0859375 L 11.585938 4.9199219 z"/>
                              </svg>
                              <span>est. {project.timePerTask} per activity</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {project.hasIncentive ? (
                                <>
                                  <span className="font-medium line-through text-gray-400 text-[10px] sm:text-[12px]">{project.originalRate}/hr</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[12px] font-medium bg-yellow-100 text-yellow-800">
                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M 9 1 A 1.0001 1.0001 0 0 0 8.0722656 1.6289062 L 4.0722656 11.628906 A 1.0001 1.0001 0 0 0 5 13 L 7.65625 13 L 5.0429688 21.712891 A 1.0001 1.0001 0 0 0 6.6503906 22.759766 L 20.650391 10.759766 A 1.0001 1.0001 0 0 0 20 9 L 16.617188 9 L 19.894531 2.4472656 A 1.0001 1.0001 0 0 0 19 1 L 9 1 z"/>
                                    </svg>
                                    {project.hourlyRate}/hr
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium text-[11px] sm:text-[13px]">{project.hourlyRate}/hr</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No current projects</h3>
                    <p className="text-gray-500 text-sm max-w-sm px-4">You don't have any active projects at the moment. Check the available projects tab to find new opportunities.</p>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'available' && (
              <>
                {availableProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {availableProjects.map((project) => (
                      <div key={project.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                        {/* Solid color top section with icon */}
                        <div className={`${project.gradient} h-32 sm:h-44 flex items-center justify-center relative`}>
                          <div className="scale-75 sm:scale-100">
                            {project.icon}
                          </div>
                        </div>
                        
                        {/* Bottom section with project details */}
                        <div className="p-3 sm:p-4 space-y-2">
                          {/* Project name and daily limit */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                            <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#1A1A1A] truncate">
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-1 text-[11px] sm:text-[13px] whitespace-nowrap text-gray-600">
                              <span>Daily limit: {project.dailyCompleted}/{project.dailyLimit}</span>
                            </div>
                          </div>
                          
                          {/* Time and rate details */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] sm:text-[13px] text-gray-600">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.585938 4.9199219 L 11.503906 5.9160156 L 10.957031 12.482422 L 14.917969 15.314453 L 15.732422 15.894531 L 16.894531 14.267578 L 16.082031 13.685547 L 13.042969 11.517578 L 13.496094 6.0839844 L 13.580078 5.0859375 L 11.585938 4.9199219 z"/>
                              </svg>
                              <span>est. {project.timePerTask} per activity</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {project.hasIncentive ? (
                                <>
                                  <span className="font-medium line-through text-gray-400 text-[10px] sm:text-[12px]">{project.originalRate}/hr</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[12px] font-medium bg-yellow-100 text-yellow-800">
                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M 9 1 A 1.0001 1.0001 0 0 0 8.0722656 1.6289062 L 4.0722656 11.628906 A 1.0001 1.0001 0 0 0 5 13 L 7.65625 13 L 5.0429688 21.712891 A 1.0001 1.0001 0 0 0 6.6503906 22.759766 L 20.650391 10.759766 A 1.0001 1.0001 0 0 0 20 9 L 16.617188 9 L 19.894531 2.4472656 A 1.0001 1.0001 0 0 0 19 1 L 9 1 z"/>
                                    </svg>
                                    {project.hourlyRate}/hr
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium text-[11px] sm:text-[13px]">{project.hourlyRate}/hr</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No available projects</h3>
                    <p className="text-gray-500 text-sm max-w-sm px-4">There are no new projects available at the moment. Check back later for new opportunities.</p>
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