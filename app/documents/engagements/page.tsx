'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CopilotNavigation from '@/app/components/CopilotNavigation'

interface EngagementsPageProps {}

const EngagementsPage: React.FC<EngagementsPageProps> = () => {
  const router = useRouter()

  return (
    <div className="flex h-screen">
      <CopilotNavigation selectedTab="library" />
      <div className="flex-1 p-4 pl-0 bg-gray-100">
        <main className="h-full rounded-xl bg-white overflow-hidden">
          <div className="px-[48px] py-4 mt-6">
            <h1>Engagements</h1>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EngagementsPage
