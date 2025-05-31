'use client'
import { useState, useEffect } from 'react'

type StepStates = {
  reviewing: boolean
  organizing: boolean
  checkingInconsistencies: boolean
  checkingJournals: boolean
  adjustingJournals: boolean
}

type StepIconProps = {
  isComplete: boolean
}

const StepIcon = ({ isComplete }: StepIconProps) => isComplete ? (
  <div className="w-4 h-4 rounded-full border border-[#E4E5E1] bg-white flex items-center justify-center">
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L4.5 8.5L2 6" stroke="#41629E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
) : (
  <div className="w-4 h-4 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
)

type SOPWorkflowCardProps = {
  visible?: boolean
}

export default function SOPWorkflowCard({ visible = true }: SOPWorkflowCardProps) {
  const [steps, setSteps] = useState<StepStates>({
    reviewing: false,
    organizing: false,
    checkingInconsistencies: false,
    checkingJournals: false,
    adjustingJournals: false
  })
  const [completedSteps, setCompletedSteps] = useState<StepStates>({
    reviewing: false,
    organizing: false,
    checkingInconsistencies: false,
    checkingJournals: false,
    adjustingJournals: false
  })
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    console.log('SOPWorkflowCard visible:', visible);
    if (visible) {
      setSteps({
        reviewing: false,
        organizing: false,
        checkingInconsistencies: false,
        checkingJournals: false,
        adjustingJournals: false
      })
      setCompletedSteps({
        reviewing: false,
        organizing: false,
        checkingInconsistencies: false,
        checkingJournals: false,
        adjustingJournals: false
      })
      setIsExecuting(false)

      // Start the step sequence
      const timers = [
        setTimeout(() => setIsExecuting(true), 2000),
        setTimeout(() => setSteps(s => ({ ...s, reviewing: true })), 2000),
        setTimeout(() => {
          setSteps(s => ({ ...s, organizing: true }))
          setCompletedSteps(s => ({ ...s, reviewing: true }))
        }, 4000),
        setTimeout(() => {
          setSteps(s => ({ ...s, checkingInconsistencies: true }))
          setCompletedSteps(s => ({ ...s, organizing: true }))
        }, 6000),
        setTimeout(() => {
          setSteps(s => ({ ...s, checkingJournals: true }))
          setCompletedSteps(s => ({ ...s, checkingInconsistencies: true }))
        }, 8000),
        setTimeout(() => {
          setSteps(s => ({ ...s, adjustingJournals: true }))
          setCompletedSteps(s => ({ ...s, checkingJournals: true }))
        }, 10000),
        // Add final completion
        setTimeout(() => {
          setCompletedSteps(s => ({ ...s, adjustingJournals: true }))
        }, 12000),
      ]

      return () => timers.forEach(timer => clearTimeout(timer))
    }
  }, [visible])

  const isComplete = Object.values(completedSteps).every(Boolean)

  if (!visible) return null;

  return (
    <div className="w-full bg-white rounded-lg border animate-pulse-border border-[#41629E]">
      <div className={`px-4 py-3 relative bg-[#F9FAFB] rounded-t-lg ${
        !Object.values(steps).some(v => v) ? 'rounded-b-lg' : ''
      }`}>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <div className="w-4 h-4 rounded-full border border-[#E4E5E1] bg-white flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="#41629E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ) : (
            <div className="w-4 h-4 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
          )}
          <h3 className="text-[15px] leading-[20px] font-medium font-oracle text-[#41629E] flex items-center gap-2">
            {isExecuting ? 'Executing SOP' : 'Initializing SOP'}
            <span className="font-normal text-[#6B7280]">
              — Step {Object.values(steps).filter(Boolean).length || 1} of {Object.keys(steps).length}
            </span>
          </h3>
        </div>
        {!isComplete && (
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#F1F2F3] hover:bg-[#EBEEED] transition-colors flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3H4V13H6V3ZM12 3H10V13H12V3Z" fill="#1A1A1A"/>
            </svg>
          </button>
        )}
      </div>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${Object.values(steps).some(v => v) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-[#E4E5E1]" />
        <div className="px-4 py-3 flex flex-col gap-3">
          {steps.reviewing && (
            <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
              <div className="flex items-center gap-2">
                <StepIcon isComplete={completedSteps.reviewing} />
                <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                  Reviewing documents
                </p>
              </div>
            </div>
          )}

          {steps.organizing && (
            <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
              <div className="flex items-center gap-2">
                <StepIcon isComplete={completedSteps.organizing} />
                <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                  Organizing documents
                </p>
              </div>
            </div>
          )}

          {steps.checkingInconsistencies && (
            <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
              <div className="flex items-center gap-2">
                <StepIcon isComplete={completedSteps.checkingInconsistencies} />
                <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                  Checking for inconsistencies
                </p>
              </div>
            </div>
          )}

          {steps.checkingJournals && (
            <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
              <div className="flex items-center gap-2">
                <StepIcon isComplete={completedSteps.checkingJournals} />
                <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                  Checking Journal Entries
                </p>
              </div>
            </div>
          )}

          {steps.adjustingJournals && (
            <div className="transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-8px] animate-[fadeSlideIn_0.3s_ease-out_forwards]">
              <div className="flex items-center gap-2">
                <StepIcon isComplete={completedSteps.adjustingJournals} />
                <p className="text-[15px] leading-[20px] font-oracle text-[#6B7280]">
                  Adjusting Journal Entries
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 