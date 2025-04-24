'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

type Meeting = {
  id: string;
  title: string;
  date_time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  discussion_points: string[];
  action_items: string[];
  notes: string | null;
}

const LoadingRow = () => (
  <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 h-[42px] items-center">
    <div className="h-5 bg-[#F0F1EF] rounded-lg animate-pulse" />
    <div className="h-5 bg-[#F0F1EF] rounded-lg animate-pulse" />
    <div className="h-5 bg-[#F0F1EF] rounded-lg animate-pulse" />
  </div>
);

const isToday = (date: string) => {
  // Get current date in user's timezone
  const today = new Date();
  
  // Parse the meeting date, keeping timezone info
  const meetingDate = new Date(date);
  
  // Convert both to local dates for comparison
  const todayStr = today.toLocaleDateString();
  const meetingStr = meetingDate.toLocaleDateString();
  
  console.log({
    today: todayStr,
    meeting: meetingStr,
    isMatch: todayStr === meetingStr,
    rawMeetingDate: date,
    parsedMeeting: meetingDate.toString()
  });

  return todayStr === meetingStr;
}

export default function AdvisorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      if (!user) return;

      try {
        // Add artificial delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const now = new Date().toISOString();

        // Fetch upcoming meetings
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)
          .gte('date_time', now)
          .order('date_time', { ascending: true });

        if (upcomingError) throw upcomingError;

        // Fetch past meetings
        const { data: pastData, error: pastError } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)
          .lt('date_time', now)
          .order('date_time', { ascending: false });

        if (pastError) throw pastError;

        setUpcomingMeetings(upcomingData || []);
        setPastMeetings(pastData || []);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setIsLoadingMeetings(false);
      }
    }

    fetchMeetings();
  }, [user]);

  // Add a function to refresh meetings
  const refreshMeetings = async () => {
    if (!user) return;
    
    try {
      const now = new Date().toISOString();

      // Fetch upcoming meetings
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .gte('date_time', now)
        .order('date_time', { ascending: true });

      if (upcomingError) throw upcomingError;

      // Fetch past meetings
      const { data: pastData, error: pastError } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .lt('date_time', now)
        .order('date_time', { ascending: false });

      if (pastError) throw pastError;

      setUpcomingMeetings(upcomingData || []);
      setPastMeetings(pastData || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="advisor" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="px-6 pr-[24px] py-5 border-b border-[#E4E5E1] flex-none">
            <div className="flex justify-between items-center h-6">
              <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                Advisor
              </h1>
              <div className="flex items-center gap-1.5">
                <button 
                  className="bg-[#F0F1EF] hover:bg-[#E4E5E1] text-[#1A1A1A] px-3.5 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors inline-flex items-center"
                >
                  Schedule meeting
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pr-[24px] py-4">
              {/* Advisor Card */}
              <div className="bg-[#F0F0F0] rounded-xl p-6 mb-6">
                <div className="flex gap-4">
                  <div className="relative w-[48px] h-[48px] flex-shrink-0">
                    <Image
                      src="/connor.jpeg"
                      alt="Connor"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>

                  <div>
                    <h2 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] mb-2 flex items-center gap-1">
                      Connor
                      <div className="h-[18px] px-[6px] bg-[#E4E5E1] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
                          <path d="M 12 1.6796875 C 11.314647 1.6796875 10.629095 1.8674277 10.025391 2.2421875 L 9.0292969 2.859375 L 7.8613281 2.9453125 C 6.4444497 3.0488536 5.2018004 3.9486577 4.6660156 5.265625 L 4.2246094 6.3515625 L 3.328125 7.1074219 C 2.2423675 8.0242535 1.7684578 9.4832489 2.109375 10.863281 L 2.3886719 12 L 2.109375 13.136719 C 1.7686605 14.517294 2.2423675 15.9777 3.328125 16.894531 A 1.0001 1.0001 0 0 0 3.3300781 16.894531 L 4.2246094 17.650391 L 4.6660156 18.734375 C 5.2018004 20.051342 6.4444497 20.9531 7.8613281 21.056641 L 9.0292969 21.140625 L 10.025391 21.759766 C 11.232798 22.509285 12.767202 22.509285 13.974609 21.759766 L 14.970703 21.140625 L 16.138672 21.056641 C 17.555334 20.953215 18.795886 20.051314 19.332031 18.736328 L 19.333984 18.734375 L 19.775391 17.650391 L 20.671875 16.894531 C 21.757633 15.9777 22.231836 14.518865 21.892578 13.138672 L 21.611328 12 L 21.892578 10.861328 C 22.232038 9.4816779 21.757633 8.0242535 20.671875 7.1074219 L 19.775391 6.3515625 L 19.332031 5.265625 L 19.333984 5.265625 C 18.798376 3.9492062 17.556281 3.0488075 16.138672 2.9453125 L 14.970703 2.859375 L 13.974609 2.2421875 C 13.370905 1.8674277 12.685353 1.6796875 12 1.6796875 z M 16 9 C 16.25575 9 16.511531 9.0974687 16.707031 9.2929688 C 17.098031 9.6839688 17.098031 10.316031 16.707031 10.707031 L 11.707031 15.707031 C 11.512031 15.902031 11.256 16 11 16 C 10.744 16 10.487969 15.902031 10.292969 15.707031 L 7.2929688 12.707031 C 6.9019687 12.316031 6.9019688 11.683969 7.2929688 11.292969 C 7.6839688 10.901969 8.3160313 10.901969 8.7070312 11.292969 L 11 13.585938 L 15.292969 9.2929688 C 15.488469 9.0974688 15.74425 9 16 9 z" />
                        </svg>
                        CPA
                        <div className="absolute left-0 top-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                          <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                            <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                              <p>Certified Public Accountant (CPA) - Licensed accounting professional qualified to provide tax, auditing, and other financial services.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-[18px] px-[6px] bg-[#E4E5E1] rounded-full text-[13px] font-medium font-['Inter'] text-[#1A1A1A] flex items-center gap-[3px] cursor-help relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
                          <path d="M 12 1.6796875 C 11.314647 1.6796875 10.629095 1.8674277 10.025391 2.2421875 L 9.0292969 2.859375 L 7.8613281 2.9453125 C 6.4444497 3.0488536 5.2018004 3.9486577 4.6660156 5.265625 L 4.2246094 6.3515625 L 3.328125 7.1074219 C 2.2423675 8.0242535 1.7684578 9.4832489 2.109375 10.863281 L 2.3886719 12 L 2.109375 13.136719 C 1.7686605 14.517294 2.2423675 15.9777 3.328125 16.894531 A 1.0001 1.0001 0 0 0 3.3300781 16.894531 L 4.2246094 17.650391 L 4.6660156 18.734375 C 5.2018004 20.051342 6.4444497 20.9531 7.8613281 21.056641 L 9.0292969 21.140625 L 10.025391 21.759766 C 11.232798 22.509285 12.767202 22.509285 13.974609 21.759766 L 14.970703 21.140625 L 16.138672 21.056641 C 17.555334 20.953215 18.795886 20.051314 19.332031 18.736328 L 19.333984 18.734375 L 19.775391 17.650391 L 20.671875 16.894531 C 21.757633 15.9777 22.231836 14.518865 21.892578 13.138672 L 21.611328 12 L 21.892578 10.861328 C 22.232038 9.4816779 21.757633 8.0242535 20.671875 7.1074219 L 19.775391 6.3515625 L 19.332031 5.265625 L 19.333984 5.265625 C 18.798376 3.9492062 17.556281 3.0488075 16.138672 2.9453125 L 14.970703 2.859375 L 13.974609 2.2421875 C 13.370905 1.8674277 12.685353 1.6796875 12 1.6796875 z M 16 9 C 16.25575 9 16.511531 9.0974687 16.707031 9.2929688 C 17.098031 9.6839688 17.098031 10.316031 16.707031 10.707031 L 11.707031 15.707031 C 11.512031 15.902031 11.256 16 11 16 C 10.744 16 10.487969 15.902031 10.292969 15.707031 L 7.2929688 12.707031 C 6.9019687 12.316031 6.9019688 11.683969 7.2929688 11.292969 C 7.6839688 10.901969 8.3160313 10.901969 8.7070312 11.292969 L 11 13.585938 L 15.292969 9.2929688 C 15.488469 9.0974688 15.74425 9 16 9 z" />
                        </svg>
                        CFP
                        <div className="absolute left-0 top-[calc(100%+4px)] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                          <div className="w-[280px] bg-white rounded-lg shadow-lg border border-[#E4E5E1] p-3">
                            <div className="text-[13px] leading-[18px] font-normal font-['Inter'] text-[#1A1A1A] space-y-2">
                              <p>Certified Financial Planner (CFP) - Professional certification for financial planning, including retirement, investments, and estate planning.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </h2>

                    <p className="mt-2 text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A] max-w-[720px]">
                      Connor specializes in tax strategy and compliance for startups and growing businesses. With over a decade of experience in tech and SaaS companies, he helps founders optimize their tax position and maintain compliance. He meets with you quarterly to review your strategy and provide proactive guidance.
                    </p>
                  </div>
                </div>
              </div>

              {/* After the advisor banner */}
              <div className="mt-8">
                <div className="flex items-center gap-1 mb-4">
                  <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                    Meetings
                  </h2>
                </div>

                {/* Stack Cards Vertically - Changed from grid to flex column */}
                <div className="flex flex-col gap-4">
                  {/* Upcoming Meetings Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                        Upcoming meetings
                        {isLoadingMeetings ? (
                          <div className="w-[18px] h-[18px] bg-[#F0F1EF] rounded-full animate-pulse" />
                        ) : (
                          <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#FFE4D2] rounded-full text-[11px] font-bold font-['Inter'] text-[#1A1A1A]">
                            {upcomingMeetings.length}
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Table */}
                    <div className="w-full">
                      <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 py-2 border-b border-[#E4E5E1]">
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Meeting
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Date
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Status
                        </div>
                      </div>

                      <div className="divide-y divide-[#E4E5E1]">
                        {isLoadingMeetings ? (
                          <>
                            <LoadingRow />
                            <LoadingRow />
                            <LoadingRow />
                          </>
                        ) : upcomingMeetings.length === 0 ? (
                          <div className="py-4 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                            No upcoming meetings yet.
                          </div>
                        ) : (
                          upcomingMeetings.map((meeting) => {
                            console.log('Meeting:', meeting);
                            console.log('Is today?', isToday(meeting.date_time));
                            console.log({
                              isToday: isToday(meeting.date_time),
                              status: meeting.status,
                              shouldShowJoin: meeting.status === 'scheduled' && isToday(meeting.date_time)
                            });
                            return (
                              <div 
                                key={meeting.id}
                                className="grid grid-cols-[2fr_2fr_1fr] gap-4 h-[42px] items-center relative group cursor-pointer"
                              >
                                {/* Hover background */}
                                <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                                
                                {/* Chevron that appears on hover */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                    <path 
                                      fillRule="evenodd" 
                                      clipRule="evenodd" 
                                      d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z"
                                      fill="#646462"
                                    />
                                  </svg>
                                </div>

                                <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                  <span className="block transition-transform group-hover:translate-x-2">
                                    {meeting.title}
                                  </span>
                                </div>
                                <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                  {format(new Date(meeting.date_time), "MMM d, yyyy, h:mm a 'PT'")}
                                </div>
                                <div className="text-[#1A1A1A] text-[14px] leading-[20px] font-normal font-['Inter'] relative">
                                  {meeting.status.toLowerCase() === 'scheduled' ? (
                                    isToday(meeting.date_time) ? (
                                      <button className="px-3 py-1 rounded-full bg-[#E4F3E2] text-[#1A1A1A] hover:bg-[#CFF0CA] font-medium transition-all relative overflow-hidden inline-flex items-center gap-1">
                                        <span className="relative z-10">Join</span>
                                        <svg width="14" height="14" viewBox="0 0 16 16" className="relative z-10">
                                          <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" fill="currentColor"/>
                                        </svg>
                                      </button>
                                    ) : (
                                      'Scheduled'
                                    )
                                  ) : (
                                    meeting.status
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Past Meetings Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A] flex items-center gap-1">
                        Past meetings and notes
                        {isLoadingMeetings ? (
                          <div className="w-[18px] h-[18px] bg-[#F0F1EF] rounded-full animate-pulse" />
                        ) : (
                          <span className="flex items-center justify-center w-[18px] h-[18px] bg-[#ECEEF2] rounded-full text-[11px] font-bold font-['Inter'] text-[#646462]">
                            {pastMeetings.length}
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Table */}
                    <div className="w-full">
                      <div className="grid grid-cols-[2fr_2fr_1fr] gap-4 py-2 border-b border-[#E4E5E1]">
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Meeting
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Date
                        </div>
                        <div className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#646462]">
                          Status
                        </div>
                      </div>

                      <div className="divide-y divide-[#E4E5E1]">
                        {isLoadingMeetings ? (
                          <>
                            <LoadingRow />
                            <LoadingRow />
                            <LoadingRow />
                          </>
                        ) : pastMeetings.length === 0 ? (
                          <div className="py-4 text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
                            No past meetings yet.
                          </div>
                        ) : (
                          pastMeetings.map(meeting => (
                            <div 
                              key={meeting.id}
                              className="grid grid-cols-[2fr_2fr_1fr] gap-4 h-[42px] items-center relative group cursor-pointer"
                              onClick={() => router.push(`/advisor/meeting/${meeting.id}`)}
                            >
                              <div className="absolute inset-x-0 h-[34px] top-1/2 -translate-y-1/2 rounded-md group-hover:bg-[#F0F0F0] transition-colors" />
                              
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="interface-icon transition-transform" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                  <path 
                                    fillRule="evenodd" 
                                    clipRule="evenodd" 
                                    d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z"
                                    fill="#646462"
                                  />
                                </svg>
                              </div>

                              <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                <span className="block transition-transform group-hover:translate-x-2">
                                  {meeting.title}
                                </span>
                              </div>
                              <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] relative">
                                {format(new Date(meeting.date_time), "MMM d, yyyy, h:mm a 'PT'")}
                              </div>
                              <div className="text-[#1A1A1A] text-[14px] leading-[20px] font-normal font-['Inter'] relative">
                                {meeting.status === 'completed' ? (
                                  <span className="text-[#1A1A1A]">
                                    Notes available
                                  </span>
                                ) : (
                                  meeting.status
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 