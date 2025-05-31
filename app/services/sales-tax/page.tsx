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

export default function SalesTaxPage() {
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
      question: 'What states do you support for sales tax filing?',
      answer: 'We support sales tax filing in all 50 U.S. states and territories. Our system automatically determines your nexus obligations and filing requirements for each jurisdiction.'
    },
    {
      id: '2',
      question: 'How does automatic sales tax calculation work?',
      answer: 'Our system integrates with your existing payment processors and e-commerce platforms to automatically calculate and collect the correct sales tax rates for each transaction based on location, product type, and applicable exemptions.'
    },
    {
      id: '3',
      question: 'What happens if I get audited?',
      answer: 'We provide comprehensive audit support including detailed transaction records, tax calculation documentation, and filing histories. Our team of tax experts will help guide you through the audit process.'
    },
    {
      id: '4',
      question: 'How much does it cost?',
      answer: 'We charge $75 per state registration and $50 per return filing. There are no additional or hidden fees.'
    },
    {
      id: '5',
      question: 'Do you guarantee on-time filing?',
      answer: 'Yes, we guarantee accurate and timely filing of your sales tax returns. In the rare event that we miss a deadline or make an error, we will cover any resulting penalties or fees.'
    }
  ]

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="sales-tax" />
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
                  Sales tax
                </span>
              </div>

              <div className="flex flex-col items-start gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#B6F2E3] text-[#181818] font-oracle font-[450] text-[13px] leading-[18px]">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24"
                    className="fill-[#181818]"
                  >
                    <path d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 15.980469 8.9902344 A 1.0001 1.0001 0 0 0 15.292969 9.2929688 L 11 13.585938 L 8.7070312 11.292969 A 1.0001 1.0001 0 1 0 7.2929688 12.707031 L 10.292969 15.707031 A 1.0001 1.0001 0 0 0 11.707031 15.707031 L 16.707031 10.707031 A 1.0001 1.0001 0 0 0 15.980469 8.9902344 z" />
                  </svg>
                  Enabled
                </span>
                <h2 className="text-[24px] leading-[32px] font-medium font-oracle text-[#1A1A1A]">
                  Sales tax, on autopilot
                </h2>
              </div>
              <p className="mt-2 text-[14px] leading-[20px] font-oracle text-[#1A1A1A] max-w-[600px]">
                We integrate with your financial tools to handle your sales tax registrations, returns, and filings across all states automatically.
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
                {/* Card 1 - Building/Bank Icon */}
                <div className="flex flex-col items-start gap-2">
                  <svg 
                    className="w-6 h-6 text-[#1A1A1A]" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      fill="currentColor" 
                      d="M11.498047 3.0039062L2 8.5039062C2 8.5039062 1.7982031 9.0019062 2.5332031 9.0019062L21.466797 9.0019062C22.201797 9.0019062 22 8.5039062 22 8.5039062L12.501953 3.0039062C12.501953 3.0039062 11.498047 3.0039062 11.498047 3.0039062zM4 11v9h4v-9H4zm6 0v9h4v-9h-4zm6 0v9h4v-9h-4zM3 21v2h18v-2H3z"
                    />
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] max-w-[180px]">
                    Sales and use tax filed across every state
                  </p>
                </div>

                {/* Card 2 - Checkmark/Verified Icon */}
                <div className="flex flex-col items-start gap-2">
                  <svg 
                    className="w-6 h-6 text-[#1A1A1A]" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      fill="currentColor" 
                      d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm4.293-11.707L11 13.586 8.707 11.293l-1.414 1.414L11 16.414l6.707-6.707z"
                    />
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] max-w-[180px]">
                    Guaranteed accuracy and on time filing
                  </p>
                </div>

                {/* Card 3 - Document/Certificate Icon */}
                <div className="flex flex-col items-start gap-2">
                  <svg 
                    className="w-6 h-6 text-[#1A1A1A]" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      fill="currentColor" 
                      d="M19 4H5c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H5V6h14v12zm-2-7H7v-2h10v2zm-4 4H7v-2h6v2z"
                    />
                  </svg>
                  <p className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A] max-w-[180px]">
                    Sales permit registrations in every state
                  </p>
                </div>

                {/* Card 4 - Audit Shield Icon */}
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
                    Audit-ready documentation and defense
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image - 25% */}
            {/* <div className="w-[25%] flex items-start justify-end">
              <img 
                src="/footer-blobs-desktop.png"
                alt="Sales tax illustration"
                className="h-[250px] w-auto object-contain"
              />
            </div> */}
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
            Sales tax compliance involves complex state and local regulations that vary by jurisdiction. 
            While we help facilitate sales tax compliance through our platform, we do not provide legal or professional services.
          </p>
        </div>
      </div>
    </div>
  )
} 