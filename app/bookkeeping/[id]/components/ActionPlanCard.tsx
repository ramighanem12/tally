'use client'
import { useState, useEffect } from 'react'

type ProposedSteps = {
  reviewFinancials: boolean
  analyzeJournals: boolean
  identifyDiscrepancies: boolean
  proposeAdjustments: boolean
  createReport: boolean
}

type ActionPlanCardProps = {
  visible?: boolean
  onRequestAdjustments?: () => void
  isAdjustmentsPending?: boolean
}

const fadeInDescription = `
  @keyframes fadeInDescription {
    0% { opacity: 0; transform: translateY(-4px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`

export default function ActionPlanCard({ 
  visible = true, 
  onRequestAdjustments,
  isAdjustmentsPending = false 
}: ActionPlanCardProps) {
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [isPending, setIsPending] = useState(isAdjustmentsPending)
  const [steps, setSteps] = useState<ProposedSteps>({
    reviewFinancials: false,
    analyzeJournals: false,
    identifyDiscrepancies: false,
    proposeAdjustments: false,
    createReport: false
  })
  const [isExecuting, setIsExecuting] = useState(false)
  
  useEffect(() => {
    if (visible) {
      // Reset states
      setSteps({
        reviewFinancials: false,
        analyzeJournals: false,
        identifyDiscrepancies: false,
        proposeAdjustments: false,
        createReport: false
      })
      setIsExecuting(false)
      setIsApproved(null)

      // Start the step sequence
      const timers = [
        setTimeout(() => setIsExecuting(true), 2000),
        setTimeout(() => setSteps(s => ({ ...s, reviewFinancials: true })), 2500),
        setTimeout(() => setSteps(s => ({ ...s, analyzeJournals: true })), 3000),
        setTimeout(() => setSteps(s => ({ ...s, identifyDiscrepancies: true })), 3500),
        setTimeout(() => setSteps(s => ({ ...s, proposeAdjustments: true })), 4000),
        setTimeout(() => setSteps(s => ({ ...s, createReport: true })), 4500),
      ]

      return () => timers.forEach(timer => clearTimeout(timer))
    }
  }, [visible])

  const allStepsProposed = Object.values(steps).every(Boolean)

  const handleAdjustments = () => {
    setIsPending(true)
    onRequestAdjustments?.()
  }

  if (!visible) return null

  return (
    <>
      <style jsx>{fadeInDescription}</style>
      <div className="w-full bg-white rounded-lg border animate-pulse-border border-[#41629E]">
        <div className={`px-4 py-3 relative bg-[#F9FAFB] rounded-t-lg ${
          !Object.values(steps).some(v => v) ? 'rounded-b-lg' : ''
        }`}>
          <div className="flex items-center gap-2">
            {!isExecuting ? (
              <div className="w-4 h-4 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-[#E4E5E1] bg-white flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3L4.5 8.5L2 6" stroke="#41629E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <h3 className="text-[15px] leading-[20px] font-medium font-oracle text-[#41629E]">
              {isExecuting ? 'Proposing Action Plan' : 'Initializing Action Plan'}
              {!isExecuting && (
                <span className="ml-2 font-normal text-[#6B7280]">— Thinking...</span>
              )}
            </h3>
            {allStepsProposed && isApproved === null && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isPending ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-[#E4E5E1] border-t-[#6B7280] rounded-full animate-spin" />
                    <span className="text-[#6B7280] text-[13px] leading-[18px] font-medium font-oracle">
                      Adjustments pending
                    </span>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={handleAdjustments}
                      className="px-2 h-7 bg-white hover:bg-[#F3F6F6] text-[#1A1A1A] rounded-md text-[13px] leading-[18px] font-medium font-oracle transition-colors border border-[#E4E5E1]"
                    >
                      Make adjustment(s)
                    </button>
                    <button 
                      onClick={() => setIsApproved(true)}
                      className="px-2 h-7 bg-[#41629E] hover:bg-[#385389] text-white rounded-md text-[13px] leading-[18px] font-medium font-oracle transition-colors flex items-center gap-1.5"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                      </svg>
                      Approve plan
                    </button>
                  </>
                )}
              </div>
            )}
            {isApproved !== null && (
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[14px] leading-[20px] font-oracle flex items-center gap-1.5 ${
                isApproved ? 'text-[#41629E]' : 'text-red-600'
              }`}>
                {isApproved && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M 20.980469 6.0039062 A 1.0001 1.0001 0 0 0 20.292969 6.3066406 L 9.0136719 17.585938 L 3.7070312 12.292969 A 1.0001 1.0001 0 1 0 2.2929688 13.707031 L 8.3085938 19.707031 A 1.0001 1.0001 0 0 0 9.7207031 19.707031 L 21.707031 7.7207031 A 1.0001 1.0001 0 0 0 20.980469 6.0039062 z" />
                  </svg>
                )}
                {isApproved ? 'Plan Approved' : 'Plan Declined'}
              </span>
            )}
          </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${Object.values(steps).some(v => v) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-[#E4E5E1]" />
          <div className="px-4 py-3 flex flex-col gap-3">
            {steps.reviewFinancials && (
              <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-2 rounded-full border border-[#E4E5E1] bg-white flex-shrink-0" />
                  <div>
                    <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                      Review financial statements
                    </p>
                    <p className="mt-1 text-[13px] leading-[18px] font-oracle text-[#6B7280] opacity-0 animate-[fadeInDescription_0.3s_ease-out_0.4s_forwards]">
                      I will examine the balance sheet, income statement, and cash flow statement to understand the company's current financial health
                    </p>
                  </div>
                </div>
              </div>
            )}
            {steps.analyzeJournals && (
              <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-2 rounded-full border border-[#E4E5E1] bg-white flex-shrink-0" />
                  <div>
                    <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                      Analyze journal entries
                    </p>
                    <p className="mt-1 text-[13px] leading-[18px] font-oracle text-[#6B7280] opacity-0 animate-[fadeInDescription_0.3s_ease-out_0.4s_forwards]">
                      I will review all journal entries to ensure they follow proper accounting principles and match supporting documentation
                    </p>
                  </div>
                </div>
              </div>
            )}
            {steps.identifyDiscrepancies && (
              <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-2 rounded-full border border-[#E4E5E1] bg-white flex-shrink-0" />
                  <div>
                    <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                      Identify discrepancies
                    </p>
                    <p className="mt-1 text-[13px] leading-[18px] font-oracle text-[#6B7280] opacity-0 animate-[fadeInDescription_0.3s_ease-out_0.4s_forwards]">
                      I will systematically compare financial statements against journal entries, looking for any mismatches in timing, classification, or amounts that could indicate reporting inconsistencies
                    </p>
                  </div>
                </div>
              </div>
            )}
            {steps.proposeAdjustments && (
              <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-2 rounded-full border border-[#E4E5E1] bg-white flex-shrink-0" />
                  <div>
                    <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                      Propose adjustments
                    </p>
                    <p className="mt-1 text-[13px] leading-[18px] font-oracle text-[#6B7280] opacity-0 animate-[fadeInDescription_0.3s_ease-out_0.4s_forwards]">
                      I will prepare necessary adjusting entries to correct any identified issues and ensure alignment with accounting standards
                    </p>
                  </div>
                </div>
              </div>
            )}
            {steps.createReport && (
              <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 mt-2 rounded-full border border-[#E4E5E1] bg-white flex-shrink-0" />
                  <div>
                    <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                      Create summary report
                    </p>
                    <p className="mt-1 text-[13px] leading-[18px] font-oracle text-[#6B7280] opacity-0 animate-[fadeInDescription_0.3s_ease-out_0.4s_forwards]">
                      I will compile all findings and adjustments into a comprehensive report with clear recommendations for review
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 