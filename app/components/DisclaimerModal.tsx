'use client'
import { useEffect } from 'react'

interface DisclaimerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Add scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Force the modal to position from viewport top
      document.body.style.position = 'relative'
      document.body.style.top = '0'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ top: 0 }}>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-[#1A1A1A] bg-opacity-25 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[640px] bg-white rounded-xl py-4 px-6 shadow-xl animate-modalSlideIn">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[18px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
            Disclaimer
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F0F0F0] transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24"
              className="text-[#1A1A1A]"
            >
              <path 
                fill="currentColor"
                d="M 4.2382812 2.9882812 A 1.250125 1.250125 0 0 0 3.3671875 5.1347656 L 10.232422 12 L 3.3613281 18.869141 A 1.2512475 1.2512475 0 1 0 5.1308594 20.638672 L 12 13.767578 L 18.865234 20.632812 A 1.250125 1.250125 0 1 0 20.632812 18.865234 L 13.767578 12 L 20.625 5.1425781 A 1.250125 1.250125 0 1 0 18.857422 3.375 L 12 10.232422 L 5.1347656 3.3671875 A 1.250125 1.250125 0 0 0 4.2382812 2.9882812 z"
              />
            </svg>
          </button>
        </div>

        <div className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A] space-y-4">
          <p>
            All tax planning, strategies, advice and recommendations in this plan are based on the taxpayer's available tax return data, information disclosed to us, and current tax law. Tax laws can and do change frequently. Federal, state, local, payroll, property and other taxes often overlap and involve complexities that rarely yield a single best strategy. Effective tax planning is a lifelong process. It requires regular updates to review the taxpayer's goals, life changes, investments, businesses, changes in income, pre-tax opportunities, retirement planning, state and local taxation, and more.
          </p>
          
          <p>
            Tax projections and recommendations include assumptions and should not be viewed as guarantees. The actual results will vary from projections. The actual tax savings will vary from the estimated tax savings. These plans and projections are only a guide, not a promise. These plans are generated using services provided by Ascend and provided without warranty of any kind, express or implied. While effort has been made to ensure accuracy, Ascend won't accept responsibility for any errors or omissions, or for any consequences arising from use of the services.
          </p>
          
          <p>
            Tax planning is a team exercise. Many of the tax savings estimated in this plan are dependent upon taxpayers completing certain action items. If taxpayers fail to take necessary actions, the tax strategies may not yield the estimated benefit. Success is also dependent upon regular communication about changes in the taxpayers' circumstances to our firm, so we can evaluate the impact of changes on the taxpayer's tax plan.
          </p>
          
          <p>
            In addition to the taxpayers and our firm, planning often includes financial planners, insurance agents, and attorneys. We do not assume responsibility for the advice of any additional professionals.
          </p>
          
          <p>
            Third-party links provided in the report serve as a convenience and for informational purposes only, we accept no responsibility for the accuracy, legality, or content on these sites.
          </p>
          
          <p>
            We have no obligation to update this tax plan.
          </p>
        </div>
      </div>
    </div>
  )
} 