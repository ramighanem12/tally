import React from 'react'

interface Step {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  reasoning?: string;
  output?: any;
  startTime?: string;
  endTime?: string;
}

interface StepsCardProps {
  steps: Step[];
  runStatus: 'initializing' | 'running' | 'completed' | 'failed';
}

export default function StepsCard({ steps, runStatus }: StepsCardProps) {
  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-4 h-4 bg-[#059669] rounded-full flex items-center justify-center">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case 'running':
        return (
          <div className="w-4 h-4 border-2 border-[#E4E5E1] border-t-[#1A1A1A] rounded-full animate-spin" />
        );
      case 'failed':
        return (
          <div className="w-4 h-4 bg-[#DC2626] rounded-full flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L7 7M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="w-4 h-4 border-2 border-[#E4E5E1] rounded-full" />
        );
    }
  };

  const getStepTextColor = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'text-[#1A1A1A]';
      case 'running':
        return 'text-[#1A1A1A]';
      case 'failed':
        return 'text-[#DC2626]';
      case 'pending':
      default:
        return 'text-[#9A9A99]';
    }
  };

  return (
    <div className="bg-white border border-[#E4E5E1] rounded-lg">
      <div className="px-4 py-3 border-b border-[#E4E5E1]">
        <h3 className="text-[14px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
          Steps
        </h3>
      </div>
      
      <div className="p-4">
        {steps.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 mx-auto mb-3 text-[#9A9A99]">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A1.5,1.5 0 0,1 10.5,15.5A1.5,1.5 0 0,1 12,14A1.5,1.5 0 0,1 13.5,15.5A1.5,1.5 0 0,1 12,17M12,10.5A1.5,1.5 0 0,1 10.5,9A1.5,1.5 0 0,1 12,7.5A1.5,1.5 0 0,1 13.5,9A1.5,1.5 0 0,1 12,10.5Z" />
              </svg>
            </div>
            <p className="text-[14px] leading-[20px] text-[#646462] font-oracle">
              {runStatus === 'initializing' ? 'Generating workflow steps...' : 'No steps available'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[14px] leading-[20px] font-medium font-oracle ${getStepTextColor(step.status)}`}>
                    {step.name}
                  </div>
                  <div className="text-[12px] leading-[16px] font-oracle text-[#646462] mt-1">
                    {step.description}
                  </div>
                  {step.reasoning && step.status === 'completed' && (
                    <div className="mt-2 p-2 bg-[#F7F7F6] rounded text-[11px] leading-[16px] font-oracle text-[#646462]">
                      <strong>Reasoning:</strong> {step.reasoning.slice(0, 150)}...
                    </div>
                  )}
                  {step.status === 'running' && (
                    <div className="mt-1 text-[11px] leading-[16px] font-oracle text-[#646462]">
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 