'use client'
import CopilotNavigation from "@/app/components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

interface PageParams {
  id: string;
}

interface Meeting {
  id: string;
  user_id: string;
  title: string;
  date_time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  discussion_points: string[];
  action_items: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const fetchMeeting = async (id: string, userId: string) => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export default function MeetingPage({ params }: { params: Promise<PageParams> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeeting() {
      if (!user) return;
      
      try {
        // Add artificial delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const meetingData = await fetchMeeting(resolvedParams.id, user.id);
        if (!meetingData) {
          throw new Error('Meeting not found');
        }
        setMeeting(meetingData);
      } catch (error) {
        console.error('Error loading meeting:', error);
        setError(error instanceof Error ? error.message : 'Failed to load meeting');
        router.push('/advisor');
      } finally {
        setIsLoading(false);
      }
    }

    loadMeeting();
  }, [resolvedParams.id, user, router]);

  // Add this near other state declarations
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null);

  // Update autoSave function
  const autoSave = useCallback(async (value: string) => {
    if (!user || !meeting) return;
    
    setSaveStatus('saving');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('meetings')
          .update({ notes: value })
          .eq('id', meeting.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setSaveStatus('saved');
        timeoutRef.current = null;
        
        setTimeout(() => {
          setSaveStatus(null);
        }, 2000);
      } catch (error) {
        console.error('Error saving notes:', error);
        setSaveStatus(null);
      }
    }, 2000);
  }, [meeting, user]);

  // Add shimmer loading UI
  const LoadingShimmer = () => (
    <div className="px-6 pr-[24px] py-4">
      {/* Meeting title and date */}
      <div className="mb-4">
        <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-2">
          <div className="h-[24px] w-64 bg-[#F0F1EF] rounded-lg animate-pulse" />
        </h2>
        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#646462] mt-1">
          <div className="h-[20px] w-48 bg-[#F0F1EF] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Discussion Points Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
            Discussion points
            <div className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help relative group">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                <path d="M16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z" />
              </svg>
              AI

              {/* Popover */}
              <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                  <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                    <p>These discussion points were automatically extracted and summarized from the meeting transcript using AI.</p>
                  </div>
                </div>
              </div>
            </div>
          </h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-[14px] leading-[16px] font-normal font-['Inter'] text-[#1A1A1A]">
              <div className="h-[16px] w-full bg-[#F0F1EF] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Action Items Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
            Action items
            <div className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help relative group">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                <path d="M16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z" />
              </svg>
              AI

              {/* Popover */}
              <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                  <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                    <p>These action items were automatically identified from the meeting transcript using AI.</p>
                  </div>
                </div>
              </div>
            </div>
          </h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-[14px] leading-[16px] font-normal font-['Inter'] text-[#1A1A1A]">
              <div className="h-[16px] w-full bg-[#F0F1EF] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Notes Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
              Notes
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[13px] font-medium font-['Inter'] bg-[#F0F1EF] text-[#646462] flex items-center gap-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M23.895,11.553C23.72,11.204,19.531,3,12,3S0.28,11.204,0.105,11.553c-0.141,0.282-0.141,0.613,0,0.895	C0.28,12.796,4.469,21,12,21s11.72-8.204,11.895-8.553C24.035,12.166,24.035,11.834,23.895,11.553z M12,16c-2.209,0-4-1.791-4-4	c0-2.209,1.791-4,4-4s4,1.791,4,4C16,14.209,14.209,16,12,16z" />
              </svg>
              Visible to you and Tally
            </span>
          </div>
        </div>
        <div className="w-full min-h-[120px] bg-[#F0F1EF] rounded-lg animate-pulse" />
      </div>
    </div>
  );

  // Add this useEffect to initialize notes when meeting data loads
  useEffect(() => {
    if (meeting?.notes) {
      setNotes(meeting.notes);
    }
  }, [meeting]);

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="advisor" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="px-6 pr-[24px] py-5 border-b border-[#E4E5E1] flex-none">
            <div className="flex items-center gap-2">
              <Link 
                href="/advisor"
                className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] hover:text-[#646462] transition-colors"
              >
                Advisor
              </Link>
              <svg className="w-5 h-5 text-[#646462]" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isLoading ? (
                <div className="h-[24px] w-[180px] bg-[#F0F1EF] rounded-lg animate-pulse" />
              ) : (
                <span className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#646462]">
                  {meeting?.title}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <LoadingShimmer />
            ) : (
              <div className="px-6 pr-[24px] py-4">
                {/* Meeting title and date */}
                <div className="mb-4">
                  <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-2">
                    Meeting notes
                  </h2>
                  <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#646462] mt-1">
                    {meeting ? format(new Date(meeting.date_time), "MMMM d, yyyy 'at' h:mm a 'PT'") : ''}
                  </p>
                </div>

                {/* Discussion Points Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                      Discussion points
                      <div className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                          <path d="M16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z" />
                        </svg>
                        AI

                        {/* Popover */}
                        <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                          <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                            <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                              <p>These discussion points were automatically extracted and summarized from the meeting transcript using AI.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {!meeting?.discussion_points?.length ? (
                      <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                        No discussion points yet.
                      </div>
                    ) : (
                      meeting.discussion_points.map((point, index) => (
                        <p key={index} className="text-[14px] leading-[16px] font-normal font-['Inter'] text-[#1A1A1A]">
                          {index + 1}. {point}
                        </p>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Items Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                      Action items
                      <div className="h-[18px] px-[6px] bg-[#EDEAFF] border border-[#C5B7FF] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="11" height="11" viewBox="0 0 24 24" className="fill-current">
                          <path d="M16.652 6.464l1.62 4.264 4.264 1.62c.6.228.6 1.076 0 1.304l-4.264 1.62-1.62 4.264c-.228.6-1.076.6-1.304 0l-1.62-4.264-4.264-1.62c-.6-.228-.6-1.076 0-1.304l4.264-1.62 1.62-4.264C15.576 5.864 16.424 5.864 16.652 6.464zM6.666 2.478l1.061 2.794 2.794 1.061c.613.233.613 1.1 0 1.332L7.728 8.728l-1.061 2.794c-.233.613-1.1.613-1.332 0L4.272 8.728 1.478 7.666c-.613-.233-.613-1.1 0-1.332l2.794-1.061 1.061-2.794C5.567 1.865 6.433 1.865 6.666 2.478zM7.683 16.485l.505 1.328 1.328.505c.628.238.628 1.127 0 1.365l-1.328.505-.505 1.328c-.238.628-1.127.628-1.365 0l-.505-1.328-1.328-.505c-.628-.238-.628-1.127 0-1.365l1.328-.505.505-1.328C6.556 15.857 7.444 15.857 7.683 16.485z" />
                        </svg>
                        AI

                        {/* Popover */}
                        <div className="absolute left-0 bottom-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
                          <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                            <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                              <p>These action items were automatically identified from the meeting transcript using AI.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </h2>
                  </div>

                  <div className="space-y-2">
                    {!meeting?.action_items?.length ? (
                      <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                        No action items yet.
                      </div>
                    ) : (
                      meeting.action_items.map((item, index) => (
                        <p key={index} className="text-[14px] leading-[16px] font-normal font-['Inter'] text-[#1A1A1A]">
                          {index + 1}. {item}
                        </p>
                      ))
                    )}
                  </div>
                </div>

                {/* Notes Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                        Notes
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[13px] font-medium font-['Inter'] bg-[#F0F1EF] text-[#646462] flex items-center gap-1">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="12" 
                          height="12" 
                          viewBox="0 0 24 24"
                          className="fill-current"
                        >
                          <path d="M23.895,11.553C23.72,11.204,19.531,3,12,3S0.28,11.204,0.105,11.553c-0.141,0.282-0.141,0.613,0,0.895	C0.28,12.796,4.469,21,12,21s11.72-8.204,11.895-8.553C24.035,12.166,24.035,11.834,23.895,11.553z M12,16c-2.209,0-4-1.791-4-4	c0-2.209,1.791-4,4-4s4,1.791,4,4C16,14.209,14.209,16,12,16z" />
                        </svg>
                        Visible to you and Tally
                      </span>
                    </div>
                    {saveStatus && (
                      <span className="text-[14px] leading-[16px] font-normal font-['Inter'] text-[#646462] flex items-center gap-1">
                        {saveStatus === 'saving' ? 'Saving...' : (
                          <>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="14" 
                              height="14" 
                              viewBox="0 0 24 24"
                              className="fill-current"
                            >
                              <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                            </svg>
                            Auto-saved
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <div>
                    <textarea
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        autoSave(e.target.value);
                      }}
                      className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-[#E4E5E1] text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] placeholder-[#646462] resize-none focus:border-[#BBBDB7] focus:ring-1 focus:ring-[#BBBDB7] focus:outline-none"
                      placeholder="Add your notes here..."
                    />
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 