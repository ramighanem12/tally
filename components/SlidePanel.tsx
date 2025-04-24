'use client'

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlidePanel({ isOpen, onClose, title, children }: SlidePanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/30 transition-opacity duration-300 z-40
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`
          fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col">
          <div className="px-4 pt-5 pb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-medium text-gray-900">
                {title}
              </h2>
              <button
                type="button"
                className="rounded-lg text-gray-400 hover:bg-gray-100 p-1 transition-colors focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="relative px-4 pt-1 pb-4">
            {children}
          </div>
        </div>
      </div>
    </>
  )
} 