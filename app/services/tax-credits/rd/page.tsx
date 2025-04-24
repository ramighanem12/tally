'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RDTaxCreditPage() {
  const router = useRouter()

  return (
    <>
      {/* Fixed Header */}
      <div className="px-6 pr-[24px] py-4 border-b border-[#E4E5E1]">
        <div className="flex justify-between items-center">
          <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
            R&D tax credit
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
                Let Tally maximize your R&D tax credits
              </h2>
              <p className="mt-2 text-[14px] leading-[20px] font-['Inter'] text-[#1A1A1A]">
                Our experts identify qualifying activities and expenses to help you claim the maximum credit for your research and development work.
              </p>
              <button 
                className="mt-4 bg-[#1A1A1A] hover:bg-[#333333] text-white px-4 h-[32px] rounded-full font-['Inter'] font-semibold text-[14px] leading-[16px] transition-colors inline-flex items-center w-fit"
                onClick={() => {
                  toast.success('We will get back to you about R&D tax credits')
                }}
              >
                Request access
              </button>

              {/* Feature Cards */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                {/* Card 1 */}
                <div className="flex flex-col items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-[#1A1A1A]">
                    <path fill="currentColor" d="M 4.25 4 C 3.013 4 2 5.012 2 6.25 L 2 18.75 C 2 19.987 3.013 21 4.25 21 L 13 21 C 13.552 21 14 20.552 14 20 C 14 19.447 13.552 19 13 19 L 4.25 19 C 4.112 19 4 18.888 4 18.75 L 4 6.25 C 4 6.112 4.112 6 4.25 6 L 7.3789062 6 C 7.5119063 6 7.6384219 6.0534844 7.7324219 6.1464844 L 8.8535156 7.2675781 C 9.3215156 7.7365781 9.9580937 8 10.621094 8 L 19.75 8 C 19.888 8 20 8.112 20 8.25 L 20 10 C 20 10.552 20.448 11 21 11 C 21.552 11 22 10.552 22 10 L 22 8.25 C 22 7.012 20.987 6 19.75 6 L 10.621094 6 C 10.488094 6 10.360578 5.9465156 10.267578 5.8535156 L 9.1464844 4.7324219 C 8.6784844 4.2634219 8.0419063 4 7.3789062 4 L 4.25 4 z M 20 13 C 17.794 13 16 14.794 16 17 C 16 17.955 16.350156 18.821766 16.910156 19.509766 L 14.339844 22.230469 C 14.309844 22.260469 14.279766 22.300078 14.259766 22.330078 C 13.929766 22.780078 14.030703 23.400469 14.470703 23.730469 C 14.920703 24.060469 15.549141 23.959766 15.869141 23.509766 L 18.091797 20.492188 C 18.661797 20.805188 19.305 21 20 21 C 22.206 21 24 19.206 24 17 C 24 14.794 22.206 13 20 13 z M 20 15 C 21.103 15 22 15.897 22 17 C 22 18.103 21.103 19 20 19 C 18.897 19 18 18.103 18 17 C 18 15.897 18.897 15 20 15 z"></path>
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A] max-w-[180px]">
                    Identify qualifying R&D activities across departments
                  </p>
                </div>

                {/* Card 2 */}
                <div className="flex flex-col items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-[#1A1A1A]">
                    <path fill="currentColor" d="M 12 2 C 9.8026661 2 8 3.8026661 8 6 L 8 7 C 8 9.1973339 9.8026661 11 12 11 C 14.197334 11 16 9.1973339 16 7 L 16 6 C 16 3.8026661 14.197334 2 12 2 z M 12 4 C 13.116666 4 14 4.8833339 14 6 L 14 7 C 14 8.1166661 13.116666 9 12 9 C 10.883334 9 10 8.1166661 10 7 L 10 6 C 10 4.8833339 10.883334 4 12 4 z M 10 13 A 1.0001 1.0001 0 0 0 9.7578125 13.029297 C 5.3773645 14.124409 3.1679688 17.445312 3.1679688 17.445312 A 1.0001 1.0001 0 0 0 3 18 L 3 20 A 1.0001 1.0001 0 0 0 4 21 L 12 21 A 1.0001 1.0001 0 1 0 12 19 L 5 19 L 5 18.373047 C 5.2080008 18.078166 6.8292234 15.866885 10.167969 15 L 13.851562 15 C 14.202792 15.0919 14.54051 15.19564 14.853516 15.316406 A 1.0003735 1.0003735 0 1 0 15.572266 13.449219 C 15.15253 13.287274 14.708392 13.146121 14.242188 13.029297 A 1.0001 1.0001 0 0 0 14 13 L 10 13 z M 18.998047 14.453125 C 18.808047 14.453125 18.634781 14.561422 18.550781 14.732422 L 17.285156 17.294922 L 14.457031 17.705078 C 14.269031 17.732078 14.113687 17.863922 14.054688 18.044922 C 13.995688 18.225922 14.044641 18.425594 14.181641 18.558594 L 16.226562 20.552734 L 15.744141 23.367188 C 15.712141 23.555187 15.789359 23.745422 15.943359 23.857422 C 16.030359 23.920422 16.132328 23.953125 16.236328 23.953125 C 16.316328 23.953125 16.396703 23.934484 16.470703 23.896484 L 19 22.566406 L 21.529297 23.896484 C 21.602297 23.934484 21.681719 23.953125 21.761719 23.953125 C 21.865719 23.953125 21.969641 23.921422 22.056641 23.857422 C 22.210641 23.745422 22.287859 23.555187 22.255859 23.367188 L 21.771484 20.552734 L 23.818359 18.558594 C 23.954359 18.425594 24.002359 18.225922 23.943359 18.044922 C 23.884359 17.863922 23.728062 17.732078 23.539062 17.705078 L 20.712891 17.294922 L 19.447266 14.732422 C 19.363266 14.561422 19.188047 14.453125 18.998047 14.453125 z"></path>
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A] max-w-[180px]">
                    Maximize your credit with expert documentation
                  </p>
                </div>

                {/* Card 3 */}
                <div className="flex flex-col items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-[#1A1A1A]">
                    <path fill="currentColor" d="M 14 1 C 12.75 1 11.685226 1.5047556 11.001953 2.2734375 C 10.318681 3.0421194 10 4.0277779 10 5 C 10 5.9722221 10.318681 6.9578806 11.001953 7.7265625 C 11.685226 8.4952444 12.75 9 14 9 C 15.25 9 16.314774 8.4952444 16.998047 7.7265625 C 17.681319 6.9578806 18 5.9722221 18 5 C 18 4.0277779 17.681319 3.0421194 16.998047 2.2734375 C 16.314774 1.5047556 15.25 1 14 1 z M 14 3 C 14.749999 3 15.185226 3.2452444 15.501953 3.6015625 C 15.81868 3.9578806 16 4.4722221 16 5 C 16 5.5277779 15.81868 6.0421194 15.501953 6.3984375 C 15.185226 6.7547556 14.749999 7 14 7 C 13.250001 7 12.814774 6.7547556 12.498047 6.3984375 C 12.18132 6.0421194 12 5.5277779 12 5 C 12 4.4722221 12.18132 3.9578806 12.498047 3.6015625 C 12.814774 3.2452444 13.250001 3 14 3 z M 9.0566406 11 C 7.5182755 11 6.014514 11.455168 4.734375 12.308594 L 3.6972656 13 L 2 13 A 1.0001 1.0001 0 1 0 2 15 L 4 15 A 1.0001 1.0001 0 0 0 4.5546875 14.832031 L 5.84375 13.972656 C 6.795611 13.338082 7.9130058 13 9.0566406 13 L 13 13 C 13.56503 13 14 13.43497 14 14 C 14 14.56503 13.56503 15 13 15 L 9 15 A 1.0001 1.0001 0 1 0 9 17 L 13 17 C 13.657843 17 14.262783 16.775454 14.759766 16.410156 L 14.763672 16.408203 L 19.808594 14.076172 C 20.188125 13.902181 20.620398 14.022352 20.855469 14.369141 C 21.140349 14.790575 21.012052 15.329885 20.568359 15.576172 L 13.638672 19.421875 C 12.938056 19.810184 12.150873 20.015625 11.349609 20.015625 L 2 20.015625 A 1.0001 1.0001 0 1 0 2 22.015625 L 11.349609 22.015625 C 12.491705 22.015625 13.612412 21.723007 14.609375 21.169922 A 1.0001 1.0001 0 0 0 14.611328 21.169922 L 21.539062 17.324219 C 22.98337 16.522506 23.436838 14.616612 22.511719 13.248047 C 22.124254 12.67644 21.554024 12.284005 20.923828 12.107422 C 20.293632 11.930838 19.602844 11.969808 18.974609 12.257812 A 1.0001 1.0001 0 0 0 18.972656 12.259766 L 15.964844 13.650391 C 15.787485 12.169198 14.52547 11 13 11 L 9.0566406 11 z"></path>
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A] max-w-[180px]">
                    Secure credit with IRS-ready documentation
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image - 40% */}
            <div className="w-[40%] flex items-start justify-end">
              <img 
                src="https://static.intercomassets.com/ember/assets/images/hero-banners/images/users-segments-all-users-94bbb7157bb799e4a8cc748bc54846ef.png"
                alt="R&D tax credit illustration"
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
                  Enable R&D tax credit service
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 