'use client'
import React, { useRef } from 'react'
import CopilotNavigation from "../components/CopilotNavigation"
import { useState, useEffect } from 'react'
import BusinessDetails from './business-details/page'
import BusinessDocuments from './business-documents/page'
import { toast } from 'sonner'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Billing from './billing/page'
import NotificationsPage from './notifications/page'

// Add interface for section types
interface SettingsSection {
  title: string;
  path: string;
}

// Add this interface near the top of the file
interface SettingsCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

// Update the settingsSections array to include all three tabs
const settingsSections: SettingsSection[] = [
  {
    title: "Business details",
    path: "/settings/business-details"
  },
  {
    title: "Billing",
    path: "/settings/billing"
  },
  {
    title: "Notifications",
    path: "/settings/notifications"
  }
];

export default function SettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedTab, setSelectedTab] = useState('Business details');
  const contentRef = useRef<HTMLDivElement>(null);

  // Simplified click handler
  const handleTabClick = (section: SettingsSection) => {
    setSelectedTab(section.title);
    router.push(section.path);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Update the navigation JSX
  return (
    <div className="flex h-screen">
      <CopilotNavigation selectedTab="settings" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F3F6F6]">
        <div className="flex h-full">
          {/* Left Settings Nav */}
          <div className="w-[17%] bg-white rounded-l-xl">
            <div className="submenu flex-none flex flex-col">
              <div className="submenu__header flex-none flex items-center px-5 py-4 mt-[4px]">
                <div className="flex-auto min-w-0 text-[20px] leading-[24px] font-[500] font-oracle text-[#1A1A1A]">
                  Settings
                </div>
              </div>

              <div className="submenu__sections flex-auto flex flex-col overflow-y-auto overflow-x-hidden">
                {settingsSections.map((section, index) => (
                  <div key={index} className="min-h-0 flex-none px-[10px] py-[2px]">
                    <a 
                      onClick={() => handleTabClick(section)}
                      className={`flex items-center h-[34px] px-3 rounded-lg transition-colors cursor-pointer ${
                        selectedTab === section.title
                          ? 'bg-[#F7F7F6] text-[#1A1A1A]'
                          : 'text-[#1A1A1A] hover:bg-[#F2F2F2]'
                      }`}
                    >
                      <span className="flex-auto text-[13px] leading-[18px] font-normal font-oracle">
                        {section.title}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-[1px] bg-[#E4E5E1]" />

          {/* Right Content Area */}
          <div className="w-[83%] bg-white rounded-r-xl flex flex-col">
            {/* Scrollable Content */}
            <div ref={contentRef} className="flex-1 overflow-y-auto">
              {selectedTab === 'Business details' && <BusinessDetails />}
              {selectedTab === 'Business documents' && <BusinessDocuments />}
              {selectedTab === 'Billing' && <Billing />}
              {selectedTab === 'Notifications' && <NotificationsPage />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 