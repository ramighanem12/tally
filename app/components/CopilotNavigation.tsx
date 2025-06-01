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
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors flex items-center gap-2 ${
              selectedTab === 'projects' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="none" stroke="#000" strokeMiterlimit="10" strokeWidth="2" d="M9 10H5c-.552 0-1-.448-1-1V5c0-.552.448-1 1-1h4c.552 0 1 .448 1 1v4C10 9.552 9.552 10 9 10zM19 10h-4c-.552 0-1-.448-1-1V5c0-.552.448-1 1-1h4c.552 0 1 .448 1 1v4C20 9.552 19.552 10 19 10zM9 20H5c-.552 0-1-.448-1-1v-4c0-.552.448-1 1-1h4c.552 0 1 .448 1 1v4C10 19.552 9.552 20 9 20zM19 20h-4c-.552 0-1-.448-1-1v-4c0-.552.448-1 1-1h4c.552 0 1 .448 1 1v4C20 19.552 19.552 20 19 20z"></path>
            </svg> */}
            Projects
          </button>

          <button 
            onClick={() => router.push('/activity')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors flex items-center gap-2 ${
              selectedTab === 'activity' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path d="M 4.0019531 3 C 2.9088903 3 2.0019531 3.9069372 2.0019531 5 L 2.0019531 17 C 2.0019531 18.093063 2.9088903 19 4.0019531 19 L 18.001953 19 L 22.001953 23 L 21.990234 4.9980469 C 21.990235 3.9049841 21.082089 3 19.990234 3 L 4.0019531 3 z M 4.0019531 5 L 19.990234 5 L 19.998047 18.167969 L 18.830078 17 L 4.0019531 17 L 4.0019531 5 z M 7 8 L 7 10 L 17 10 L 17 8 L 7 8 z M 7 12 L 7 14 L 14 14 L 14 12 L 7 12 z" fill="black"></path>
            </svg> */}
            Activity
          </button>

          <button 
            onClick={() => router.push('/referrals')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors flex items-center gap-2 ${
              selectedTab === 'referrals' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path d="M 4 4 C 2.897 4 2 4.897 2 6 L 2 18 C 2 19.103 2.897 20 4 20 L 20 20 C 21.103 20 22 19.103 22 18 L 22 6 C 22 4.897 21.103 4 20 4 L 4 4 z M 4 6 L 20 6 L 20 6.0058594 L 12 11 L 4 6.0039062 L 4 6 z M 4 8.0039062 L 12 13 L 20 8.0058594 L 20.001953 18 L 4 18 L 4 8.0039062 z" fill="black"></path>
            </svg> */}
            Referrals
          </button>

          <button 
            onClick={() => router.push('/account')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors flex items-center gap-2 ${
              selectedTab === 'account' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path d="M 12 2 C 6.477 2 2 6.477 2 12 C 2 17.523 6.477 22 12 22 C 17.523 22 22 17.523 22 12 C 22 6.477 17.523 2 12 2 z M 12 4 C 16.418 4 20 7.582 20 12 C 20 13.597292 19.525404 15.081108 18.71875 16.330078 L 17.949219 15.734375 C 16.397219 14.537375 13.537 14 12 14 C 10.463 14 7.6017813 14.537375 6.0507812 15.734375 L 5.28125 16.332031 C 4.4740429 15.082774 4 13.597888 4 12 C 4 7.582 7.582 4 12 4 z M 12 5.75 C 10.208 5.75 8.75 7.208 8.75 9 C 8.75 10.792 10.208 12.25 12 12.25 C 13.792 12.25 15.25 10.792 15.25 9 C 15.25 7.208 13.792 5.75 12 5.75 z M 12 7.75 C 12.689 7.75 13.25 8.311 13.25 9 C 13.25 9.689 12.689 10.25 12 10.25 C 11.311 10.25 10.75 9.689 10.75 9 C 10.75 8.311 11.311 7.75 12 7.75 z M 12 16 C 15.100714 16 16.768095 17.168477 17.548828 17.753906 C 16.109984 19.141834 14.156852 20 12 20 C 9.843148 20 7.8900164 19.141834 6.4511719 17.753906 C 7.231905 17.168477 8.899286 16 12 16 z M 6.0546875 17.339844 C 6.1756559 17.473131 6.297271 17.605851 6.4257812 17.730469 C 6.2971141 17.605286 6.1747276 17.473381 6.0546875 17.339844 z M 17.912109 17.375 C 17.802435 17.495543 17.692936 17.616825 17.576172 17.730469 C 17.692621 17.617521 17.801457 17.494978 17.912109 17.375 z" fill="black"></path>
            </svg> */}
            Account
          </button>

          {/* <button 
            onClick={() => router.push('/payouts')}
            className={`w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
              selectedTab === 'payouts' 
                ? 'text-[#1A1A1A] bg-[#E5E9E9]'
                : 'text-[#1A1A1A] hover:bg-[#E5E9E9]'
            }`}
          >
            Payouts
          </button> */}
        </div>

        {/* Logout button at bottom */}
        <div className="pb-4">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-[14px] font-medium rounded-md transition-colors text-[#1A1A1A] hover:bg-[#E5E9E9]"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}