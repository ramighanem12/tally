'use client'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from "next/image";
import { TallyLogo } from './TallyLogo';

// SVG Icons
const InboxIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.33333 8H4L5.33333 10H10.6667L12 8H14.6667M1.33333 8V12.6667C1.33333 13.403 1.93067 14 2.66667 14H13.3333C14.0693 14 14.6667 13.403 14.6667 12.6667V8M1.33333 8L3.33333 3.33333C3.33333 2.59733 3.93067 2 4.66667 2H11.3333C12.0693 2 12.6667 2.59733 12.6667 3.33333L14.6667 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EngagementIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.33333 7.33333C6.80609 7.33333 8 6.13943 8 4.66667C8 3.19391 6.80609 2 5.33333 2C3.86057 2 2.66667 3.19391 2.66667 4.66667C2.66667 6.13943 3.86057 7.33333 5.33333 7.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 14V12.6667C2 11.1939 3.19391 10 4.66667 10H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.3333 14L13.3333 12L11.3333 10M8.66667 10L6.66667 12L8.66667 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ControlsIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 11.3333C8 12.8 6.8 14 5.33333 14C3.86667 14 2.66667 12.8 2.66667 11.3333C2.66667 9.86667 3.86667 8.66667 5.33333 8.66667C6.8 8.66667 8 9.86667 8 11.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 4.66667C13.3333 6.13333 12.1333 7.33333 10.6667 7.33333C9.2 7.33333 8 6.13333 8 4.66667C8 3.2 9.2 2 10.6667 2C12.1333 2 13.3333 3.2 13.3333 4.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 11.3333H13.3333M2.66667 4.66667H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClientIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 7.33333C7.47276 7.33333 8.66667 6.13943 8.66667 4.66667C8.66667 3.19391 7.47276 2 6 2C4.52724 2 3.33333 3.19391 3.33333 4.66667C3.33333 6.13943 4.52724 7.33333 6 7.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 14V12.6667C2 11.1939 3.19391 10 4.66667 10H7.33333C8.80609 10 10 11.1939 10 12.6667V14M10 4.66667C10 6.13943 11.194 7.33333 12.6667 7.33333C14.1393 7.33333 15.3333 6.13943 15.3333 4.66667C15.3333 3.19391 14.1393 2 12.6667 2C11.194 2 10 3.19391 10 4.66667ZM14 14V12.6667C14 11.1939 12.8061 10 11.3333 10H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TemplatesIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 5.5H14" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5.5 14L5.5 2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const LogoutIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IntegrationsIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M11.3333 4.66667V7.33333C11.3333 8.8 10.1333 10 8.66667 10H7.33333C5.86667 10 4.66667 8.8 4.66667 7.33333V4.66667M6.66667 2H9.33333C10.0667 2 10.6667 2.6 10.6667 3.33333V4.66667H5.33333V3.33333C5.33333 2.6 5.93333 2 6.66667 2ZM8 10V14" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const CopilotIcon = ({ className = "" }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 5.5V8L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 3.5C5.5 3.5 6.5 2.5 8 2.5C9.5 2.5 10.5 3.5 10.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const navItems = [
  { name: 'Inbox', icon: InboxIcon },
  { name: 'Engagements', icon: EngagementIcon },
  { name: 'Clients', icon: ClientIcon },
  { name: 'Templates', icon: TemplatesIcon },
  { name: 'Copilot', icon: CopilotIcon },
];

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    
    switch(tabName) {
      case 'Inbox':
        router.push('/');
        break;
      case 'Engagements':
        router.push('/engagements');
        break;
      case 'Clients':
        router.push('/clients');
        break;
      case 'Templates':
        router.push('/templates');
        break;
      case 'Copilot':
        router.push('/copilot');
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Force a page refresh to clear all auth states
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="w-52 bg-black border-r border-gray-800 flex flex-col h-screen">
      <div className="px-2 py-6 flex-grow">
        <div className="px-4 mb-6">
          <TallyLogo className="w-8 h-auto text-white" />
        </div>
        
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleTabClick(item.name)}
                className={`w-full flex items-center px-4 py-2 text-sm rounded-md transition-colors 
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700
                  ${activeTab === item.name 
                    ? 'bg-[#1C1C1C] text-white font-medium' 
                    : 'text-gray-400 hover:bg-[#1C1C1C]'
                  }`}
              >
                <item.icon className={`mr-2 ${
                  activeTab === item.name 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`} />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User section at bottom */}
      {user && (
        <div className="px-2 py-4 border-t border-gray-800">
          <div className="px-4 mb-2 text-sm text-gray-400">
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm rounded-md text-gray-400 hover:bg-[#1C1C1C] transition-colors"
          >
            <LogoutIcon className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
} 