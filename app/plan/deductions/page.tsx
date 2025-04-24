'use client'
import CopilotNavigation from "../../components/CopilotNavigation"
import { useRouter } from 'next/navigation'

export default function DeductionsPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="plan" />
      <div className="flex-1 p-4 pl-0 bg-gray-100 overflow-hidden">
        <main className="h-full rounded-xl bg-white overflow-y-auto">
          <div className="px-[48px] py-4 mt-6">
            {/* Breadcrumb Header */}
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => router.push('/plan')}
                className="text-[18px] font-semibold text-gray-500 hover:text-gray-700"
              >
                Plan
              </button>
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h1 className="text-[18px] font-semibold text-gray-900">
                Deductions
              </h1>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 