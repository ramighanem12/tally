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
      <div className="flex-1 p-[9px] pl-0 bg-[#F3F6F6] overflow-hidden">
        <main className="h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
          <div className="pl-4 pr-6 py-4 border-b border-[#E4E5E1] flex-none">
            <div className="flex justify-between items-center">
              <h1 className="text-[20px] leading-[24px] font-medium font-oracle text-[#1A1A1A]">
                Connections
              </h1>

              <div className="flex gap-2">
                {[
                  { id: 'enabled', label: 'Enabled' },
                  { id: 'other', label: 'Other' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-2.5 py-1 rounded-md text-[14px] leading-[20px] font-medium font-oracle transition-colors ${
                      activeTab === id 
                        ? 'bg-[#F7F7F6] text-[#1A1A1A]'
                        : 'text-[#646462] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                          <div className="flex items-center gap-2">
                            <Image
                              src={connection.icon}
                              alt={connection.name}
                              width={32}
                              height={32}
                              className="rounded-lg"
                            />
                            <h3 className="text-[15px] leading-[20px] font-medium font-oracle text-[#1A1A1A]">
                              {connection.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[14px] leading-[20px] font-normal font-oracle text-[#646462]">
                    Other connections content will go here
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 