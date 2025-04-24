'use client'

const UpcomingMeeting = () => {
  return (
    <div className="px-4 py-3 bg-white/60 shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]">
          You have an upcoming advisor meeting on July 15, 2025
        </p>
        <button className="px-3 py-1.5 rounded-lg bg-white border border-[#E4E4E4] text-[13px] leading-[18px] font-medium font-['Inter'] text-[#1A1A1A] hover:bg-[#F7F7F6] transition-colors">
          Join meeting
        </button>
      </div>
    </div>
  )
}

export default UpcomingMeeting 