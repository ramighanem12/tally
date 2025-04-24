'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SalesTaxStudyPage() {
  const router = useRouter()

  return (
    <>
      {/* Fixed Header */}
      <div className="px-6 pr-[24px] py-4 border-b border-[#E4E5E1]">
        <div className="flex justify-between items-center">
          <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
            Sales tax study
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pr-[24px] py-4">
          {/* Promotional Banner */}
          <div className="bg-[#F0F0F0] rounded-xl p-8 relative mb-4 flex">
            {/* Left Content - 60% */}
            <div className="w-[60%] flex flex-col justify-center">
              <h2 className="text-[20px] leading-[32px] font-semibold font-['Inter'] text-[#1A1A1A]">
                Let Tally analyze your sales tax exposure
              </h2>
              <p className="mt-2 text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A]">
                Our experts review your business activities and transactions to determine where you have sales tax obligations.
              </p>
              <button 
                className="mt-4 bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors inline-flex items-center w-fit"
                onClick={() => {
                  toast.success('We will get back to you about sales tax study')
                }}
              >
                Request access
              </button>

              {/* Feature Cards */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                {/* Card 1 */}
                <div className="flex flex-col items-start gap-2">
                  <svg className="w-6 h-6 text-[#1A1A1A]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A] max-w-[180px]">
                    Lorem ipsum dolor sit amet consectetur adipiscing
                  </p>
                </div>

                {/* Card 2 */}
                <div className="flex flex-col items-start gap-2">
                  <svg className="w-6 h-6 text-[#1A1A1A]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-2-9h-3V7h-2v3H9v2h3v3h2v-3h3v-2z"/>
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A] max-w-[180px]">
                    Sed do eiusmod tempor incididunt ut labore
                  </p>
                </div>

                {/* Card 3 */}
                <div className="flex flex-col items-start gap-2">
                  <svg className="w-6 h-6 text-[#1A1A1A]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A] max-w-[180px]">
                    Ut enim ad minim veniam quis nostrud exercitation
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image - 40% */}
            <div className="w-[40%] flex items-start justify-end">
              <img 
                src="https://static.intercomassets.com/ember/assets/images/hero-banners/images/users-segments-all-users-94bbb7157bb799e4a8cc748bc54846ef.png"
                alt="Sales tax study illustration"
                className="h-[200px] w-auto object-contain"
              />
            </div>
          </div>

          {/* Toggle Card */}
          <div className="border border-[#E4E5E1] rounded-lg p-4">
            <div className="flex items-center">
              {/* Toggle Switch - Disabled */}
              <div
                className={`relative inline-flex h-[16px] w-[32px] flex-shrink-0 rounded-full border-2 border-transparent bg-[#E4E5E1] opacity-50 cursor-not-allowed`}
              >
                <span
                  className="pointer-events-none inline-block h-[12px] w-[12px] transform rounded-full bg-white shadow ring-0"
                />
              </div>
              
              <div className="flex items-center gap-[10px] ml-4">
                <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
                  Enable sales tax study service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 