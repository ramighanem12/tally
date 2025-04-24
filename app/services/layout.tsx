'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import CopilotNavigation from "../components/CopilotNavigation"

// Add type definition
type ServiceSection = {
  title: string;
  hasChildren: boolean;
  path?: string;
  subTabs?: { title: string; path: string; }[];
}

// Define the services sections
const servicesSections: ServiceSection[] = [
  {
    title: 'Tax compliance', 
    hasChildren: true,
    subTabs: [
      { title: 'Sales tax', path: '/services/sales-tax' },
      { title: 'Sales tax study', path: '/services/sales-tax-study' },
      { title: 'Voluntary disclosure', path: '/services/voluntary-disclosure' }
    ]
  },
  {
    title: 'Tax credits',
    hasChildren: true,
    subTabs: [
      { title: 'R&D tax credit', path: '/services/tax-credits/rd' }
    ]
  }
];

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubTab, setSelectedSubTab] = useState('Sales tax');
  const [expandedSections, setExpandedSections] = useState<string[]>(['Tax compliance']);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update selected section based on current path
  useEffect(() => {
    const currentPath = pathname;
    
    // Find matching section or subtab
    for (const section of servicesSections) {
      if (section.path === currentPath) {
        setSelectedSection(section.title);
        setSelectedSubTab('');
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
  }, [pathname]);

  // Toggle section expansion
  const toggleSection = (title: string) => {
    const section = servicesSections.find(s => s.title === title);
    
    if (section?.hasChildren) {
      if (expandedSections.includes(title)) {
        setExpandedSections([]);
      } else {
        const firstSubTab = section.subTabs?.[0];
        setExpandedSections([title]);
        setSelectedSection('');
        if (firstSubTab) {
          setSelectedSubTab(firstSubTab.title);
          router.push(firstSubTab.path);
        }
      }
    } else if (section?.path) { // Check for path existence
      setExpandedSections([]);
      setSelectedSubTab('');
      setSelectedSection(title);
      router.push(section.path);
    }
    
    // Reset scroll position
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Handle subtab click
  const handleSubTabClick = (subTab: { title: string, path: string }, parentTitle: string) => {
    setExpandedSections([parentTitle]);
    setSelectedSection('');
    setSelectedSubTab(subTab.title);
    router.push(subTab.path);
    
    // Reset scroll position
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="flex h-screen">
      <CopilotNavigation selectedTab="services" />
      <div className="flex-1 p-[9px] pl-0 bg-[#F0F0F0]">
        <div className="flex h-full">
          {/* Left Services Nav */}
          <div className="w-[17%] bg-white/70 rounded-l-xl">
            <div className="submenu flex-none flex flex-col">
              <div className="submenu__header flex-none flex items-center px-5 py-4 mt-[4px]">
                <div className="flex-auto min-w-0 text-[20px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                  Services
                </div>
              </div>

              <div className="submenu__sections flex-auto flex flex-col overflow-y-auto overflow-x-hidden">
                {servicesSections.map((section, index) => (
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
                        )}
                      </a>
                    </div>

                    {/* Subtabs */}
                    {section.hasChildren && (
                      <div 
                        className={`transform-gpu transition-all duration-200 ease-in-out overflow-hidden pl-4 relative ${
                          expandedSections.includes(section.title) 
                            ? 'max-h-40 opacity-100 translate-y-0' 
                            : 'max-h-0 opacity-0 -translate-y-2'
                        }`}
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-[1px] bg-[#E4E5E1]" />

          {/* Right Content Area */}
          <div ref={contentRef} className="w-[83%] bg-white rounded-r-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 