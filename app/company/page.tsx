'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useAuth } from '@/contexts/AuthContext'

export default function CompanyPage() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      <CopilotNavigation selectedTab="company" />
      <div className="flex-1 p-4 pl-0 bg-[#F5F6F8]">
        <main className="h-full rounded-xl bg-white overflow-hidden">
          <div className="px-[48px] py-4 mt-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <h1 className="text-[18px] font-semibold text-gray-900">
                  Company
                </h1>
              </div>
            </div>
          </div>

          <div className="px-[48px] pb-8">
            {/* Company Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-medium text-gray-600">Company</h2>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 