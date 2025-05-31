'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type SelectedTab = 
  | 'projects'
  | 'activity'
  | 'referrals'
  | 'account'
  | 'payouts';

export default function CopilotNavigation({ 
  selectedTab = 'projects'
}: { 
  selectedTab?: SelectedTab 
}) {
  const router = useRouter()
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <nav className="w-[216px] bg-[#F3F6F6] flex flex-col h-screen overflow-hidden">
      <div className="px-4 flex flex-col h-full">
        {/* Logo section */}
        <div className="pt-6 pb-3 flex items-center">
          <svg 
            width="30" 
            height="30" 
            viewBox="0 0 500 500" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="h-[30px] w-auto text-gray-700"
          >
            <rect width="500" height="500" rx="100" fill="#93D0E5"/>
            <path d="M250 422L165.148 379.574C145.795 369.897 130.103 354.205 120.426 334.852L78 250L162.852 292.426C182.205 302.103 197.897 317.795 207.574 337.148L250 422Z" fill="#00285A"/>
            <path d="M422 250L379.574 334.852C369.897 354.205 354.205 369.897 334.852 379.574L250 422L292.426 337.148C302.103 317.795 317.795 302.103 337.148 292.426L422 250Z" fill="#00285A"/>
            <path d="M250 78L165.148 120.426C145.795 130.103 130.103 145.795 120.426 165.148L78 250L135.333 221.333L162.852 207.574C182.205 197.897 197.897 182.205 207.574 162.852L250 78Z" fill="#00285A"/>
            <path d="M250 78L292.426 162.852C302.103 182.205 317.795 197.897 337.148 207.574L422 250L379.574 165.148C369.897 145.795 354.205 130.103 334.852 120.426L250 78Z" fill="#00285A"/>
          </svg>
          <span className="ml-2 text-lg font-semibold text-[#1A1A1A]">Dialogue</span>
        </div>

        {/* Navigation items */}
        <div className="space-y-1 flex-1">
          <button 
            onClick={() => router.push('/projects')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
              selectedTab === 'projects' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            Projects
          </button>

          <button 
            onClick={() => router.push('/activity')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
              selectedTab === 'activity' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            Activity
          </button>

          <button 
            onClick={() => router.push('/referrals')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
              selectedTab === 'referrals' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            Referrals
          </button>

          <button 
            onClick={() => router.push('/account')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
              selectedTab === 'account' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            Account
          </button>

          <button 
            onClick={() => router.push('/payouts')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
              selectedTab === 'payouts' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            Payouts
          </button>
        </div>

        {/* Logout button at bottom */}
        <div className="pb-4 pt-2 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}