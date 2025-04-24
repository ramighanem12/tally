'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

// Simplify connection data
const connections = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    status: 'connected',
    icon: '/quickbooks.svg'
  },
  {
    id: 'xero',
    name: 'Xero',
    status: 'disconnected',
    icon: '/xero-svgrepo-com.svg'
  },
  {
    id: 'wave',
    name: 'Wave',
    status: 'disconnected',
    icon: '/ov2lgrxqttiauqhbpsqf (1).webp'
  },
  {
    id: 'rippling',
    name: 'Rippling', 
    status: 'disconnected',
    icon: '/ripplingcircle.svg'
  },
  {
    id: 'gusto',
    name: 'Gusto',
    status: 'disconnected',
    icon: '/gustocircle.svg'
  },
  {
    id: 'deel',
    name: 'Deel',
    status: 'disconnected',
    icon: '/deel.svg'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    status: 'disconnected',
    icon: '/stripe-v2-svgrepo-com.svg'
  },
  {
    id: 'billcom',
    name: 'Bill.com',
    status: 'disconnected',
    icon: '/billcircle.svg'
  }
]

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState('enabled');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Add state for connection status
  const [connectionStatus, setConnectionStatus] = useState<{ [key: string]: boolean }>({
    quickbooks: true,
    xero: false,
    wave: false,
    rippling: false,
    gusto: false,
    deel: false,
    stripe: false,
    billcom: false
  })

  // Add click outside handler for menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConnect = (id: string) => {
    setConnectionStatus(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="connections" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0] overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header row with Connections title and tabs */}
          <div className="flex items-center justify-between px-2 py-2 mb-[9px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                  Connections
                </h1>
                <div 
                  ref={menuRef}
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F7F7F6] transition-colors"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16"
                      className="text-[#646462]"
                    >
                      <path 
                        fill="currentColor"
                        d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM3 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM13 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
                      />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute left-full top-0 ml-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                      <div className="space-y-[2px]">
                        <button 
                          onClick={() => {
                            // Handle click
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-['Inter'] text-[#1A1A1A]"
                        >
                          Refresh all
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tab switcher */}
            <div className="flex gap-6 relative border-b border-[#E4E5E1]">
              {[
                { id: 'enabled', label: 'Enabled' },
                { id: 'other', label: 'Other' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`pb-2 relative ${
                    activeTab === id 
                      ? 'text-[#1A1A1A]' 
                      : 'text-[#646462] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="text-[14px] leading-[20px] font-medium font-['Inter']">
                    {label}
                  </span>
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main content card */}
          <main className="flex-1 rounded-[14px] bg-white overflow-hidden flex flex-col">
            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3">
                {activeTab === 'enabled' ? (
                  <div>
                    <div className="grid grid-cols-4 gap-3">
                      {connections.map((connection) => (
                        <div 
                          key={connection.id}
                          className="border border-[#E4E5E1] rounded-lg p-4 hover:border-[#BBBDB7] transition-colors cursor-pointer"
                        >
                          <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3">
                              <Image
                                src={connection.icon}
                                alt={connection.name}
                                width={32}
                                height={32}
                                className="rounded-lg"
                              />
                              <h3 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
                                {connection.name}
                              </h3>
                            </div>

                            {/* Status */}
                            <div className="mt-auto">
                              {connection.status === 'connected' ? (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                                  <span className="text-[13px] leading-[18px] font-['Inter'] text-[#646462]">
                                    Connected
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4E5E1]" />
                                  <span className="text-[13px] leading-[18px] font-['Inter'] text-[#646462]">
                                    Not connected
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[14px] leading-[20px] font-normal font-['Inter'] text-[#646462]">
                      Other connections content will go here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 