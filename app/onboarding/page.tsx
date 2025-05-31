'use client'
import './onboarding.css'
import CopilotNavigation from "../components/CopilotNavigation"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useMemo } from 'react'

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Initialize steps with completion status
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: '1',
      title: 'Provide your business information',
      description: 'Tell us about your company structure, industry, and key contacts so we can tailor our services to your needs.',
      completed: true
    },
    {
      id: '2',
      title: 'Provide your business documents',
      description: 'Share your financial statements, tax returns, and other essential documents to help us understand your business better.',
      completed: false
    },
    {
      id: '3',
      title: 'Select the services you need',
      description: 'Choose from our range of accounting, tax, and advisory services that best match your business requirements.',
      completed: false
    },
    {
      id: '4',
      title: 'Set up your connections',
      description: 'Link your bank accounts, payment processors, and accounting software to streamline your financial data flow.',
      completed: false
    },
    {
      id: '5',
      title: 'Sign engagement letter',
      description: 'Review and sign your engagement letter to formalize our partnership and begin working together.',
      completed: false
    },
    {
      id: '6',
      title: 'Set up your advisor kickoff call',
      description: 'Schedule your first meeting with your dedicated advisor to discuss your goals and create a tailored action plan.',
      completed: false
    }
  ]);

  const [expandedStep, setExpandedStep] = useState<string>('1');
  const [isImageFading, setIsImageFading] = useState(false);
  const [currentImage, setCurrentImage] = useState(
    'https://static.intercomassets.com/ember/assets/images/onboarding/getting-started/great_guidance_setup_omnichannel-c41274441b21a8e5d16a733bf04f72dc.png'
  );

  const completedSteps = useMemo(() => {
    return steps.filter(step => step.completed).length;
  }, [steps]);

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="onboarding" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F3F6F6] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          <div className="px-[155px] py-4 mt-6">
            <div className="flex items-center justify-between">
              <h1 className="text-[26px] leading-[32px] text-[#1A1A1A] mt-[11px] mb-4 font-oracle font-[500]">
                Get set up with Clarity
              </h1>
              <button 
                className="px-4 py-2 bg-[#F0F0F0] hover:bg-[#E4E4E4] text-[#1A1A1A] text-[14px] leading-[16px] font-[500] font-oracle rounded-full transition-colors"
                onClick={() => {/* TODO: Add help functionality */}}
              >
                I need help
              </button>
            </div>

            <div className="bg-[#FEFBED] border border-[#E9A23B] rounded-lg px-3 h-[36px] flex items-center mb-5">
              <div className="flex items-center gap-1.5">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24"
                  className="text-[#222222]"
                >
                  <path 
                    fill="currentColor" 
                    d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 12 4 C 16.430126 4 20 7.5698765 20 12 C 20 16.430123 16.430126 20 12 20 C 7.5698737 20 4 16.430123 4 12 C 4 7.5698765 7.5698737 4 12 4 z M 11.984375 5.9863281 A 1.0001 1.0001 0 0 0 11 7 L 11 13 A 1.0001 1.0001 0 1 0 13 13 L 13 7 A 1.0001 1.0001 0 0 0 11.984375 5.9863281 z M 12 16 A 1 1 0 0 0 12 18 A 1 1 0 0 0 12 16 z"
                  />
                </svg>
                <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#222222]">
                  Complete onboarding to activate your account
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[18px] leading-[24px] font-[500] text-[#1A1A1A] font-oracle">Get set up</h2>
            </div>
            
            <div className="flex-1 space-y-3">
              {steps.slice(0, 2).map((step, index) => (
                <div 
                  key={step.id} 
                  className={`border border-[#E4E5E1] rounded-xl px-4 py-4 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:shadow-[0_1px_4px_rgba(0,0,0,0.12)] bg-white ${
                    expandedStep === step.id ? 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : ''
                  }`}
                >
                  <div 
                    className={`flex ${expandedStep !== step.id ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (expandedStep !== step.id) {
                        setExpandedStep(step.id);
                      }
                    }}
                  >
                    <div className="relative w-5 h-5 mt-[2px]">
                      {step.completed ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24"
                          className="text-[#66B937]"
                        >
                          <path 
                            fill="currentColor"
                            d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 16 9 C 16.25575 9 16.511531 9.0974687 16.707031 9.2929688 C 17.098031 9.6839688 17.098031 10.316031 16.707031 10.707031 L 11.707031 15.707031 C 11.512031 15.902031 11.256 16 11 16 C 10.744 16 10.487969 15.902031 10.292969 15.707031 L 7.2929688 12.707031 C 6.9019687 12.316031 6.9019688 11.683969 7.2929688 11.292969 C 7.6839688 10.901969 8.3160313 10.901969 8.7070312 11.292969 L 11 13.585938 L 15.292969 9.2929688 C 15.488469 9.0974688 15.74425 9 16 9 z"
                          />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <circle 
                            cx="12" 
                            cy="12" 
                            r="9" 
                            fill="none" 
                            stroke="#E5E7EB" 
                            strokeWidth="3"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 ml-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[16px] leading-[24px] font-[500] text-[#1A1A1A] font-oracle">
                          {step.title}
                        </h3>
                        {expandedStep !== step.id && (
                          <div className="accordion-new__header-action-icon">
                            <svg className="interface-icon o__standard o__standard__large-right-arrow" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.1499 11.9998C5.1499 11.7798 5.2299 11.5598 5.3999 11.3998L8.7999 7.99984L5.3999 4.59984C5.0699 4.26984 5.0699 3.72984 5.3999 3.39984C5.7299 3.06984 6.2699 3.06984 6.5999 3.39984L11.1999 7.99984L6.5999 12.5998C6.2699 12.9298 5.7299 12.9298 5.3999 12.5998C5.2299 12.4298 5.1499 12.2198 5.1499 11.9998Z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedStep === step.id ? 'mt-2 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="text-[14px] leading-[20px] text-[#1A1A1A] font-oracle font-normal mb-4">
                          {step.description}
                        </p>
                        <button 
                          className={`px-4 py-2 rounded-full text-[14px] leading-[16px] font-[500] font-oracle ${
                            step.completed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-[#FAFAF7] hover:bg-[#333333]'
                          }`}
                          disabled={step.completed}
                          onClick={() => {
                            if (step.id === '1') {
                              router.push('/settings/business-details')
                            } else if (step.id === '2') {
                              router.push('/settings/business-documents')
                            } else if (step.id === '3') {
                              router.push('/onboarding/services')
                            } else if (step.id === '4') {
                              router.push('/connections')
                            }
                          }}
                        >
                          {step.id === '1' ? 'Add business details' : 
                           step.id === '2' ? 'Upload documents' : 
                           step.id === '3' ? 'Choose services' :
                           step.id === '4' ? 'Set up connections' :
                           'Schedule call'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-8 mb-4">
              <h2 className="text-[18px] leading-[24px] font-[500] text-[#1A1A1A] font-oracle">Additional setup</h2>
            </div>

            <div className="flex-1 space-y-3">
              {steps.slice(2).map((step, index) => (
                <div 
                  key={step.id} 
                  className={`border border-[#E4E5E1] rounded-xl px-4 py-4 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:shadow-[0_1px_4px_rgba(0,0,0,0.12)] bg-white ${
                    expandedStep === step.id ? 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : ''
                  }`}
                >
                  <div 
                    className={`flex ${expandedStep !== step.id ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (expandedStep !== step.id) {
                        setExpandedStep(step.id);
                      }
                    }}
                  >
                    <div className="relative w-5 h-5 mt-[2px]">
                      {step.completed ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24"
                          className="text-[#66B937]"
                        >
                          <path 
                            fill="currentColor"
                            d="M 12 2 C 6.4889941 2 2 6.4889982 2 12 C 2 17.511002 6.4889941 22 12 22 C 17.511006 22 22 17.511002 22 12 C 22 6.4889982 17.511006 2 12 2 z M 16 9 C 16.25575 9 16.511531 9.0974687 16.707031 9.2929688 C 17.098031 9.6839688 17.098031 10.316031 16.707031 10.707031 L 11.707031 15.707031 C 11.512031 15.902031 11.256 16 11 16 C 10.744 16 10.487969 15.902031 10.292969 15.707031 L 7.2929688 12.707031 C 6.9019687 12.316031 6.9019688 11.683969 7.2929688 11.292969 C 7.6839688 10.901969 8.3160313 10.901969 8.7070312 11.292969 L 11 13.585938 L 15.292969 9.2929688 C 15.488469 9.0974688 15.74425 9 16 9 z"
                          />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24">
                          <circle 
                            cx="12" 
                            cy="12" 
                            r="9" 
                            fill="none" 
                            stroke="#E5E7EB" 
                            strokeWidth="3"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 ml-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[16px] leading-[24px] font-[500] text-[#1A1A1A] font-oracle">
                          {step.title}
                        </h3>
                        {expandedStep !== step.id && (
                          <div className="accordion-new__header-action-icon">
                            <svg className="interface-icon o__standard o__standard__large-right-arrow" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.1499 11.9998C5.1499 11.7798 5.2299 11.5598 5.3999 11.3998L8.7999 7.99984L5.3999 4.59984C5.0699 4.26984 5.0699 3.72984 5.3999 3.39984C5.7299 3.06984 6.2699 3.06984 6.5999 3.39984L11.1999 7.99984L6.5999 12.5998C6.2699 12.9298 5.7299 12.9298 5.3999 12.5998C5.2299 12.4298 5.1499 12.2198 5.1499 11.9998Z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedStep === step.id ? 'mt-2 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="text-[14px] leading-[20px] text-[#1A1A1A] font-oracle font-normal mb-4">
                          {step.description}
                        </p>
                        <button 
                          className={`px-4 py-2 rounded-full text-[14px] leading-[16px] font-[500] font-oracle ${
                            step.completed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-[#FAFAF7] hover:bg-[#333333]'
                          }`}
                          disabled={step.completed}
                          onClick={() => {
                            if (step.id === '1') {
                              router.push('/settings/business-details')
                            } else if (step.id === '2') {
                              router.push('/settings/business-documents')
                            } else if (step.id === '3') {
                              router.push('/onboarding/services')
                            } else if (step.id === '4') {
                              router.push('/connections')
                            }
                          }}
                        >
                          {step.id === '1' ? 'Add business details' : 
                           step.id === '2' ? 'Upload documents' : 
                           step.id === '3' ? 'Choose services' :
                           step.id === '4' ? 'Set up connections' :
                           step.id === '5' ? 'Sign letter' :
                           'Schedule call'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 