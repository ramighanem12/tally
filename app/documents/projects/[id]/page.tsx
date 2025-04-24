'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import CopilotNavigation from '../../../components/CopilotNavigation'

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  return (
    <div className="flex h-screen">
      <CopilotNavigation selectedTab="library" />
      <div className="flex-1 p-4 pl-0 bg-gray-100">
        <main className="h-full rounded-xl bg-white overflow-hidden">
          <div className="px-[48px] py-4 mt-6">
            <h1>Project Details</h1>
            <p>Project ID: {params.id}</p>
          </div>
        </main>
      </div>
    </div>
  );
} 
