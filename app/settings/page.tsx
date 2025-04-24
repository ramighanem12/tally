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
import Connections from './connections/page'
import TaxSettings from './tax-settings/page'
import NotificationsPage from './notifications/page'

// Add interface for section types
interface SettingsSection {
  title: string;
  hasChildren: boolean;
  subTabs?: { title: string, path: string }[];
  path?: string;
}

// Add this interface near the top of the file
interface SettingsCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

// Update the cards data to only include parent sections with subtabs
const settingsCards = {
  Company: [
    {
      title: "Business details",
      description: "Your company's legal information for tax and compliance purposes.",
      path: "/settings/business-details",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M 5 3 A 2 2 0 0 0 5 7 A 2 2 0 0 0 5 3 z M 10 4 A 1.0001 1.0001 0 1 0 10 6 L 20 6 A 1.0001 1.0001 0 1 0 20 4 L 10 4 z"/>
        </svg>
      )
    },
    {
      title: "Tax settings",
      description: "Configure tax rates and settings for your business.",
      path: "/settings/tax-settings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M 12 3.0019531 C 11.45475 3.0019531 10.909688 3.1535781 10.429688 3.4550781 L 2.3847656 8.5039062 C 1.6957656 8.9359063 2.0014531 10 2.8144531 10 L 4.0097656 10 L 4 17 C 3.448 17 3 17.448 3 18 L 3 19 C 2.448 19 2 19.448 2 20 L 2 21 C 2 21.552 2.448 22 3 22 L 21 22 C 21.552 22 22 21.552 22 21 L 22 20 C 22 19.448 21.552 19 21 19 L 21 18 C 21 17.448 20.552 17 20 17 L 19.998047 17 L 20.007812 10 L 21.185547 10 C 21.998547 10 22.305188 8.9359063 21.617188 8.5039062 L 13.570312 3.4550781 C 13.090312 3.1535781 12.54525 3.0019531 12 3.0019531 z M 5.5097656 10 L 9.0097656 10 L 9.0019531 17 L 5.5 17 L 5.5097656 10 z M 10.509766 10 L 13.515625 10 L 13.507812 16.908203 A 0.750075 0.750075 0 0 0 13.511719 17 L 10.501953 17 L 10.509766 10 z M 15.015625 10 L 18.507812 10 L 18.498047 17 L 15.001953 17 A 0.750075 0.750075 0 0 0 15.007812 16.910156 L 15.015625 10 z" />
        </svg>
      )
    }
  ],
  Subscription: [
    {
      title: "Billing",
      description: "Manage your subscription and payment details.",
      path: "/settings/billing",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
      )
    }
  ]
};

export default function SettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedSection, setSelectedSection] = useState('');
  const [isSaving, setIsSaving] = useState(false)
  const [selectedSubTab, setSelectedSubTab] = useState('Business details');
  const [expandedSections, setExpandedSections] = useState<string[]>(['Company']);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update settingsSections array to move Preferences to the end
  const settingsSections: SettingsSection[] = [
    { 
      title: 'Company', 
      hasChildren: true,
      subTabs: [
        { title: 'Business details', path: '/settings/business-details' },
        { title: 'Tax settings', path: '/settings/tax-settings' }
      ]
    },
    { 
      title: 'Subscription', 
      hasChildren: true,
      subTabs: [
        { title: 'Billing', path: '/settings/billing' }
      ]
    },
    { title: 'Connections', hasChildren: false, path: '/settings/connections' },
    { 
      title: 'Preferences', 
      hasChildren: true,
      subTabs: [
        { title: 'Notifications', path: '/settings/notifications' }
      ]
    }
  ];

  // Add this section grouping data
  const workspaceCards: SettingsCard[] = [
    {
      title: "General",
      description: "Set your workspace name, time zone, languages, and more.",
      path: "/settings/general",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
        </svg>
      )
    },
    {
      title: "Teammates",
      description: "Manage or invite teammates and see all activity logs.",
      path: "/settings/teammates",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    },
    {
      title: "Office hours",
      description: "Choose your office hours to manage customer expectations.",
      path: "/settings/office-hours",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
      )
    },
    {
      title: "Brands",
      description: "Set up and manage your brands.",
      path: "/settings/brands",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      )
    },
    {
      title: "Security",
      description: "Configure all security settings for your workspace and data.",
      path: "/settings/security",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      )
    }
  ];

  const subscriptionCards: SettingsCard[] = [
    {
      title: "Usage",
      description: "View your billed usage and set usage alerts and limits.",
      path: "/settings/usage",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1A1A1A]">
          <path fill="currentColor" d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
        </svg>
      )
    }
  ];

  // Update useEffect to handle default route
  useEffect(() => {
    const currentPath = pathname;
    
    // If we're at the root settings path, redirect to business details
    if (currentPath === '/settings') {
      router.push('/settings/business-details');
      return;
    }
    
    // Find matching section or subtab
    for (const section of settingsSections) {
      if (section.path === currentPath) {
        setSelectedSection(section.title);
        setSelectedSubTab('');
        setExpandedSections([]);
        return;
      }
      
      if (section.subTabs) {
        const matchingSubTab = section.subTabs.find(sub => sub.path === currentPath);
        if (matchingSubTab) {
          setSelectedSection('');
          setSelectedSubTab(matchingSubTab.title);
          setExpandedSections([section.title]);
          return;
        }
      }
    }
  }, [pathname, router]);

  // Update toggle function
  const toggleSection = (title: string) => {
    const section = settingsSections.find(s => s.title === title);
    
    // Only handle sections with subtabs
    if (section?.subTabs) {
      if (expandedSections.includes(title)) {
        setExpandedSections([]);
      } else {
        const currentSubTab = section.subTabs.find(sub => sub.title === selectedSubTab);
        if (currentSubTab) {
          setExpandedSections([title]);
        } else {
          const firstSubTab = section.subTabs[0];
          setExpandedSections([title]);
          setSelectedSection('');
          setSelectedSubTab(firstSubTab.title);
          router.push(firstSubTab.path);
          // Reset scroll position
          if (contentRef.current) {
            contentRef.current.scrollTop = 0;
          }
        }
      }
    } else {
      // For sections without subtabs (like Connections)
      setExpandedSections([]);
      setSelectedSubTab('');
      setSelectedSection(title);
      router.push(section?.path || '/settings');
      // Reset scroll position
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  };

  // Update subtab click handler
  const handleSubTabClick = (subTab: { title: string, path: string }, parentTitle: string) => {
    // Update all states at once before navigation
    setExpandedSections([parentTitle]);
    setSelectedSection('');
    setSelectedSubTab(subTab.title);
    router.push(subTab.path);
    // Reset scroll position
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Changes saved successfully')
    } catch (error) {
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-screen">
      <CopilotNavigation selectedTab="settings" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0]">
        <div className="flex h-full">
          {/* Left Settings Nav */}
          <div className="w-[17%] bg-white/70 rounded-l-xl">
            <div className="submenu flex-none flex flex-col">
              <div className="submenu__header flex-none flex items-center px-5 py-4 mt-[4px]">
                <div className="flex-auto min-w-0 text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                  Settings
                </div>
              </div>

              <div className="submenu__sections flex-auto flex flex-col overflow-y-auto overflow-x-hidden">
                {settingsSections.map((section, index) => (
                  <div key={index} className="submenu__sections__section min-h-0 flex-none">
                    <div className="submenu__sections__section__title flex-none px-[10px] py-[2px]">
                      <a 
                        onClick={() => toggleSection(section.title)}
                        className={`submenu__sections__section__title__link flex items-center justify-between h-[34px] px-3 rounded-lg transition-colors cursor-pointer border ${
                          selectedSection === section.title
                            ? 'bg-white text-[#1A1A1A] shadow-sm border-[#E4E5E1]' 
                            : 'text-[#1A1A1A] hover:bg-[#F2F2F2] border-transparent'
                        }`}
                      >
                        <span className="flex-auto text-[13px] leading-[18px] font-medium text-[#1A1A1A]">
                          {section.title}
                        </span>
                        {section.hasChildren && (
                          <span>
                            <span className="section__title__arrow flex-none">
                              <svg 
                                className={`interface-icon transition-transform ${
                                  expandedSections.includes(section.title) ? 'rotate-90' : ''
                                }`} 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.64906 3.89886C5.31711 4.23081 5.31711 4.769 5.64906 5.10094L8.54802 7.9999L5.64906 10.8989C5.31711 11.2308 5.31711 11.769 5.64906 12.1009C5.981 12.4329 6.51919 12.4329 6.85114 12.1009L10.3511 8.60094C10.6831 8.269 10.6831 7.73081 10.3511 7.39886L6.85114 3.89886C6.51919 3.56692 5.981 3.56692 5.64906 3.89886Z" />
                              </svg>
                            </span>
                          </span>
                        )}
                      </a>
                    </div>
                    {/* Subtabs container with vertical line */}
                    <div 
                      className={`transform-gpu transition-all duration-200 ease-in-out overflow-hidden pl-4 relative ${
                        expandedSections.includes(section.title) 
                          ? 'max-h-40 opacity-100 translate-y-0' 
                          : 'max-h-0 opacity-0 -translate-y-2'
                      }`}
                      style={{
                        transitionProperty: 'max-height, opacity, transform'
                      }}
                    >
                      {/* Vertical line */}
                      <div className="absolute left-[18px] top-0 bottom-0 w-[1px] bg-[#E4E5E1]" />
                      
                      {section.subTabs?.map((subTab, subIndex) => (
                        <div key={subIndex} className="submenu__sections__section__title flex-none px-[10px] py-[2px]">
                          <a 
                            onClick={() => handleSubTabClick(subTab, section.title)}
                            className={`submenu__sections__section__title__link flex items-center justify-between h-[34px] px-3 rounded-lg transition-colors cursor-pointer border ${
                              selectedSubTab === subTab.title
                                ? 'bg-white text-[#1A1A1A] shadow-sm border-[#E4E5E1]' 
                                : 'text-[#1A1A1A] hover:bg-[#F2F2F2] border-transparent'
                            }`}
                          >
                            <span className={`flex-auto text-[13px] leading-[18px] ${
                              selectedSubTab === subTab.title ? 'font-semibold' : 'font-medium'
                            } text-[#1A1A1A]`}>
                              {subTab.title}
                            </span>
                          </a>
                        </div>
                      ))}
                    </div>
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
              {selectedSubTab === 'Business details' && <BusinessDetails />}
              {selectedSubTab === 'Business documents' && <BusinessDocuments />}
              {selectedSubTab === 'Tax settings' && <TaxSettings />}
              {selectedSubTab === 'Billing' && <Billing />}
              {selectedSubTab === 'Notifications' && <NotificationsPage />}
              {selectedSection === 'Connections' && <Connections />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 