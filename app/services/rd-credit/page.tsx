'use client'
import CopilotNavigation from "../../components/CopilotNavigation"
import { toast } from 'sonner'
import { useState } from 'react'

// Add FAQ Question component
const FAQQuestion = ({ 
  question, 
  answer,
  isExpanded,
  onToggle
}: { 
  question: string
  answer: string
  isExpanded: boolean
  onToggle: () => void
}) => (
  <div className="border-t first:border-t-0 border-[#E4E5E1]">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-3 text-left"
    >
      <div className="flex items-center gap-2">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          className={`transition-transform ${isExpanded ? 'text-[#1A1A1A]' : 'text-[#A3A3A3]'} ${
            isExpanded ? 'rotate-90' : ''
          }`}
        >
          <path 
            fill="currentColor" 
            d="M6.5 12L10.5 8L6.5 4V12Z"
          />
        </svg>
        <span className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
          {question}
        </span>
      </div>
    </button>
    <div className={`grid transition-[grid-template-rows] duration-200 ${
      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
    }`}>
      <div className="overflow-hidden">
        <div className="px-8 pb-3">
          <p className="text-[14px] leading-[20px] font-oracle text-[#646462]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  </div>
)

export default function RDCreditPage() {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // FAQ data
  const faqs = [
    {
      id: '1',
      question: 'What qualifies as R&D activity?',
      answer: 'R&D activities typically include developing new products, processes, or software, improving existing technologies, and conducting technical research. Activities must meet the IRS four-part test: technological in nature, eliminate technical uncertainty, follow a process of experimentation, and aim to develop new or improved products/processes.'
    },
    {
      id: '2',
      question: 'How much can I save with the R&D tax credit?',
      answer: 'The R&D tax credit can be worth up to 10% of your qualified research expenses. This includes wages for R&D staff, supplies used in R&D, and certain contractor costs. Startups may qualify to apply up to $250,000 against payroll taxes.'
    },
    {
      id: '3',
      question: 'What documentation is needed?',
      answer: 'You will need to document your research activities, including project records, payroll records, general ledger entries, project lists, and contemporaneous documentation of your research activities. We help you gather and organize all required documentation.'
    },
    {
      id: '4',
      question: 'How far back can I claim?',
      answer: 'You can typically claim the R&D tax credit for the current tax year and up to three previous tax years. We can help you analyze your historical R&D activities to maximize your credit potential.'
    },
    {
      id: '5',
      question: 'How much does it cost?',
      answer: 'Our fee is 15% of the tax savings we help you claim. This means we only get paid when you successfully receive your R&D tax credits. There are no upfront costs or fees.'
    },
    {
      id: '6',
      question: 'What systems do you integrate with?',
      answer: 'We seamlessly integrate with popular financial and payroll platforms like Stripe, Rippling, QuickBooks, and Gusto to automatically collect the required wage and expense data. This minimizes manual work and ensures accurate documentation of your R&D expenses.'
    }
  ]

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="rd-credit" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F3F6F6] overflow-auto">
        {/* Promotional Banner Card */}
        <div className="bg-white rounded-[14px] mb-3">
          <div className="pt-6 pb-8 px-6 pr-0 relative flex">
            {/* Left Content - 75% */}
            <div className="w-[75%] flex flex-col justify-center">
              {/* Breadcrumb */}
              <div className="mb-8 flex items-center gap-2">
                <span className="text-[14px] leading-[20px] font-oracle text-[#646462]">
                  Services
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  className="text-[#646462]"
                >
                  <path 
                    fill="currentColor" 
                    d="M11.109,3L11.109,3C9.78,3,8.988,4.481,9.725,5.587L14,12l-4.275,6.413C8.988,19.519,9.78,21,11.109,21h0 c0.556,0,1.076-0.278,1.385-0.741l4.766-7.15c0.448-0.672,0.448-1.547,0-2.219l-4.766-7.15C12.185,3.278,11.666,3,11.109,3z"
                  />
                </svg>
                <span className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A] font-[500]">
                  R&D tax credit
                </span>
              </div>

              <div className="flex flex-col items-start gap-2">
                <span className="inline-block px-2 py-0.5 rounded-[6px] bg-[#F2B8B6] text-[#181818] font-oracle font-[450] text-[13px] leading-[18px]">
                  Not enabled
                </span>
                <h2 className="text-[24px] leading-[32px] font-medium font-oracle text-[#1A1A1A]">
                  Maximize your R&D tax credits
                </h2>
              </div>
              <p className="mt-2 text-[14px] leading-[20px] font-oracle text-[#1A1A1A] max-w-[600px]">
                Turn your innovation into tax savings. We help identify, document, and claim R&D tax credits for your qualified research activities.
              </p>
              <button 
                className="mt-4 bg-[#1A1A1A] hover:bg-[#333333] text-white px-3 h-[28px] rounded-full font-oracle font-medium text-[13px] leading-[18px] transition-colors inline-flex items-center gap-1.5 w-fit"
                onClick={() => {
                  toast.success('Our team will get back to you soon!')
                }}
              >
                Request access
              </button>

              {/* Feature Cards */}
              <div className="mt-12 grid grid-cols-4 gap-6">
                <div className="flex flex-col items-start gap-2">
                  <svg 
                    className="w-6 h-6 text-[#1A1A1A]" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      fill="currentColor" 
                      d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"
                    />
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] max-w-[180px]">
                    Complete documentation support
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2">
                  <svg 
                    className="w-6 h-6 text-[#1A1A1A]" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      fill="currentColor" 
                      d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
                    />
                    <path 
                      fill="currentColor" 
                      d="M7 12h2v5H7zm8-5h2v10h-2zm-4 7h2v3h-2zm0-4h2v2h-2z"
                    />
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] max-w-[180px]">
                    Maximize qualified expenses
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2">
                  <svg 
                    className="w-6 h-6 text-[#1A1A1A]" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      fill="currentColor" 
                      d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zm-9-4h2v2h-2v-2zm0-6h2v4h-2V6z"
                    />
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] max-w-[180px]">
                    Expert guidance and support
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2">
                  <svg 
                    className="w-6 h-6 text-[#1A1A1A]" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      fill="currentColor" 
                      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
                    />
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] max-w-[180px]">
                    Audit defense included
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Card */}
        <div className="rounded-[14px] bg-white">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-[#E4E5E1]">
            <h2 className="text-[16px] leading-[20px] font-[500] font-oracle text-[#1A1A1A]">
              Frequently asked questions
            </h2>
          </div>

          {/* FAQ Questions */}
          <div>
            {faqs.map((faq) => (
              <FAQQuestion
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isExpanded={expandedQuestions.has(faq.id)}
                onToggle={() => toggleQuestion(faq.id)}
              />
            ))}
          </div>
        </div>

        {/* Add disclaimer text - without hyperlink */}
        <div className="mt-3">
          <p className="text-[12px] leading-[18px] font-oracle font-[450] text-[#858585]">
            R&D tax credit qualification involves complex federal and state regulations. 
            While we help facilitate R&D tax credit claims through our platform, we do not provide legal or professional services.
          </p>
        </div>
      </div>
    </div>
  )
} 