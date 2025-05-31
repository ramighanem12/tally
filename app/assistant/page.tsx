'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import ImportFromVaultModal from '../components/ImportFromVaultModal'
import UploadDocumentModal from '../components/UploadDocumentModal'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export default function AssistantPage() {
  const [inputValue, setInputValue] = useState('');
  const [isFilesDropdownOpen, setIsFilesDropdownOpen] = useState(false);
  const [isImportFromVaultOpen, setIsImportFromVaultOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const filesDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSourcesDropdownOpen, setIsSourcesDropdownOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const sourcesDropdownRef = useRef<HTMLDivElement>(null);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter()

  // Generate proper UUID (version 4)
  const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create new chat record first
      const { data: chat, error } = await supabase
        .from('assistant_chats')
        .insert({
          user_id: user.id,
          query: inputValue.trim(),
          status: 'active',
          sources: Array.from(selectedSources)
        })
        .select()
        .single()

      if (error) throw error

      // Navigate to the chat page
      router.push(`/assistant/${chat.id}`)

    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error('Failed to create chat')
    }
  };

  // Add this useEffect to handle programmatic value changes
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 104)}px`;
    }
  }, [inputValue]);

  // Keep the existing handleTextareaInput function
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 104)}px`;
    setInputValue(textarea.value);
  };

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filesDropdownRef.current && !filesDropdownRef.current.contains(event.target as Node)) {
        setIsFilesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update the source options
  const sourceOptions = [
    { 
      id: 'internet', 
      label: 'Internet',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24"
          className="fill-current"
        >
          <path d="M 12 2 C 6.5648778 2 2.1329905 6.3686781 2.0117188 11.775391 A 1.0001 1.0001 0 0 0 2.0117188 12.21875 C 2.1298947 17.628182 6.5629035 22 12 22 C 17.435122 22 21.86701 17.631322 21.988281 12.224609 A 1.0001 1.0001 0 0 0 21.988281 11.78125 C 21.870105 6.3718178 17.437097 2 12 2 z M 12 4 C 12.385416 4 12.69021 4.1333133 13.048828 4.4863281 C 13.407446 4.8393429 13.771857 5.4242219 14.070312 6.1796875 C 14.572488 7.4508196 14.836336 9.2022565 14.923828 11 L 9.0761719 11 C 9.1636643 9.2022565 9.4275121 7.4508196 9.9296875 6.1796875 C 10.228143 5.4242219 10.592554 4.8393429 10.951172 4.4863281 C 11.30979 4.1333133 11.614584 4 12 4 z M 8.3085938 4.9023438 C 8.2261615 5.0795527 8.1440827 5.2585815 8.0703125 5.4453125 C 7.4403342 7.0399458 7.157939 9.0008031 7.0742188 11 L 4.0683594 11 C 4.3988684 8.3354853 6.0274685 6.0873296 8.3085938 4.9023438 z M 15.691406 4.9023438 C 17.972531 6.0873296 19.601132 8.3354853 19.931641 11 L 16.925781 11 C 16.842061 9.0008031 16.559666 7.0399458 15.929688 5.4453125 C 15.855917 5.2585815 15.773839 5.0795527 15.691406 4.9023438 z M 4.0683594 13 L 7.0742188 13 C 7.1579387 14.999197 7.4403342 16.960053 8.0703125 18.554688 C 8.1440827 18.741418 8.2261615 18.920447 8.3085938 19.097656 C 6.0274685 17.91267 4.3988684 15.664514 4.0683594 13 z M 9.0761719 13 L 14.923828 13 C 14.836338 14.797744 14.572488 16.549181 14.070312 17.820312 C 13.771857 18.575778 13.407446 19.160657 13.048828 19.513672 C 12.69021 19.866687 12.385416 20 12 20 C 11.614584 20 11.30979 19.866687 10.951172 19.513672 C 10.592554 19.160657 10.228143 18.575778 9.9296875 17.820312 C 9.4275121 16.54918 9.1636643 14.797744 9.0761719 13 z M 16.925781 13 L 19.931641 13 C 19.601132 15.664514 17.972531 17.91267 15.691406 19.097656 C 15.773839 18.920447 15.855917 18.741418 15.929688 18.554688 C 16.559666 16.960054 16.842061 14.999197 16.925781 13 z" />
        </svg>
      )
    },
    { 
      id: 'irs', 
      label: 'IRS',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24"
          className="fill-current"
        >
          <path d="M 12 2.59375 C 11.861625 2.59375 11.72325 2.6221875 11.59375 2.6796875 L 3.9003906 6.0996094 C 3.3533906 6.3426094 3 6.885375 3 7.484375 C 3 8.321375 3.678625 9 4.515625 9 L 5 9 L 5 16 C 5 16.552 5.448 17 6 17 C 6.552 17 7 16.552 7 16 L 7 9 L 9 9 L 9 16 C 9 16.552 9.448 17 10 17 C 10.552 17 11 16.552 11 16 L 11 9 L 13 9 L 13 16 C 13 16.552 13.448 17 14 17 C 14.552 17 15 16.552 15 16 L 15 9 L 17 9 L 17 16 C 17 16.552 17.448 17 18 17 C 18.552 17 19 16.552 19 16 L 19 9 L 19.484375 9 C 20.321375 9 21 8.321375 21 7.484375 C 21 6.885375 20.646609 6.3426094 20.099609 6.0996094 L 12.40625 2.6796875 C 12.27725 2.6221875 12.138375 2.59375 12 2.59375 z M 4 19 C 3.448 19 3 19.448 3 20 C 3 20.552 3.448 21 4 21 L 20 21 C 20.552 21 21 20.552 21 20 C 21 19.448 20.552 19 20 19 L 4 19 z" />
        </svg>
      )
    },
    { 
      id: 'cra', 
      label: 'CRA',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24"
          className="fill-current"
        >
          <path d="M 12 2.59375 C 11.861625 2.59375 11.72325 2.6221875 11.59375 2.6796875 L 3.9003906 6.0996094 C 3.3533906 6.3426094 3 6.885375 3 7.484375 C 3 8.321375 3.678625 9 4.515625 9 L 5 9 L 5 16 C 5 16.552 5.448 17 6 17 C 6.552 17 7 16.552 7 16 L 7 9 L 9 9 L 9 16 C 9 16.552 9.448 17 10 17 C 10.552 17 11 16.552 11 16 L 11 9 L 13 9 L 13 16 C 13 16.552 13.448 17 14 17 C 14.552 17 15 16.552 15 16 L 15 9 L 17 9 L 17 16 C 17 16.552 17.448 17 18 17 C 18.552 17 19 16.552 19 16 L 19 9 L 19.484375 9 C 20.321375 9 21 8.321375 21 7.484375 C 21 6.885375 20.646609 6.3426094 20.099609 6.0996094 L 12.40625 2.6796875 C 12.27725 2.6221875 12.138375 2.59375 12 2.59375 z M 4 19 C 3.448 19 3 19.448 3 20 C 3 20.552 3.448 21 4 21 L 20 21 C 20.552 21 21 20.552 21 20 C 21 19.448 20.552 19 20 19 L 4 19 z" />
        </svg>
      )
    },
    { 
      id: 'files', 
      label: 'Internal Files',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24"
          className="fill-current"
        >
          <path d="M 4.25 3 C 3.019 3 2 4.019 2 5.25 L 2 17.75 C 2 18.981 3.019 20 4.25 20 L 4.6308594 20 L 5.0371094 20 L 19.863281 20 C 20.787051 20 21.599864 19.355416 21.810547 18.457031 L 23.966797 10.253906 A 1.0001 1.0001 0 0 0 23 9 L 21.919922 9 L 22 7.25 C 22 6.019 20.981 5 19.75 5 L 10.621094 5 C 10.488094 5 10.361578 4.9465156 10.267578 4.8535156 L 9.1464844 3.7324219 C 8.6784844 3.2644219 8.0419062 3 7.3789062 3 L 4.25 3 z M 4.25 5 L 7.3789062 5 C 7.5119063 5 7.6384219 5.0534844 7.7324219 5.1464844 L 8.8535156 6.2675781 C 9.3215156 6.7365781 9.9580938 7 10.621094 7 L 19.75 7 C 19.899 7 20 7.101 20 7.25 L 20 9 L 7 9 A 1.0001 1.0001 0 0 0 6.0332031 9.7480469 L 4 17.548828 L 4 5.25 C 4 5.101 4.101 5 4.25 5 z M 7.7734375 11 L 21.703125 11 L 19.869141 17.974609 A 1.0001 1.0001 0 0 0 19.863281 18 L 5.9492188 18 L 7.7734375 11 z" />
        </svg>
      )
    },
    { 
      id: 'ifrs', 
      label: 'IFRS',
      icon: <Image src="/ifrsicon.png" alt="IFRS" width={14} height={14} className="object-contain" />
    }
  ];

  // Add click outside handler for sources dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourcesDropdownRef.current && !sourcesDropdownRef.current.contains(event.target as Node)) {
        setIsSourcesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImportFromVault = (selectedDocs: string[]) => {
    console.log('Selected docs:', selectedDocs);
    setIsImportFromVaultOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Handle the files here
      console.log('Selected files:', files);
    }
    // Reset the input
    e.target.value = '';
  };

  // Add scroll handler
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isAtEnd = container.scrollWidth - container.scrollLeft <= container.clientWidth + 1; // +1 for rounding
      setIsScrolledToEnd(isAtEnd);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="assistant" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6]">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col">
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="w-full space-y-6">
              <div className="flex flex-col items-center">
                <div className="mb-6 translate-y-[2px] relative">
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 117 81" 
                    className="relative"
                  >
                    <path 
                      d="M82.7695 0H116.529L78.7585 81H44.9986L82.7695 0Z" 
                      className="fill-[#1A1A1A]"
                    />
                    <path 
                      d="M21.918 34H55.6779L33.7614 81H0.00150897L21.918 34Z" 
                      className="fill-[#1A1A1A]"
                    />
                  </svg>
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" 
                    style={{
                      width: '150%',
                      backgroundSize: '200% 100%',
                    }}
                  />
                </div>
                <h1 className="text-[28px] leading-[32px] font-medium font-oracle text-[#1A1A1A] mb-4">
                  Begin your research...
                </h1>
              </div>

              <div className="rounded-[8px]">
                <form onSubmit={handleSubmit} className="relative">
                  <div className="bg-[#F7F7F6] rounded-[8px]">
                    <textarea
                      value={inputValue}
                      onChange={handleTextareaInput}
                      placeholder="Ask Modus anything..."
                      rows={5}
                      className="w-full px-4 pt-[18px] pb-[14px] min-h-[52px] max-h-[160px] border-0 text-[16px] leading-[22px] font-oracle text-[#1A1A1A] placeholder-[#646462] focus:outline-none focus:ring-0 resize-none overflow-y-auto bg-transparent"
                    />
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="relative" ref={sourcesDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsSourcesDropdownOpen(!isSourcesDropdownOpen)}
                            className="bg-white text-[#1A1A1A] px-3 h-[28px] rounded-lg font-oracle font-[500] text-[14px] leading-[20px] transition-colors border border-[#E4E5E1] flex items-center gap-1.5"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              className="text-current"
                            >
                              <path 
                                fill="currentColor" 
                                d="M 14 4 A 1.0001 1.0001 0 0 0 13 5 L 13 20 A 1.0001 1.0001 0 0 0 14 21 L 20 21 A 1.0001 1.0001 0 0 0 21 20 L 21 16.167969 A 1.0001 1.0001 0 0 0 21 15.841797 L 21 9.1679688 A 1.0001 1.0001 0 0 0 21 8.8417969 L 21 5 A 1.0001 1.0001 0 0 0 20 4 L 14 4 z M 15 6 L 19 6 L 19 8 L 17 8 A 1.0001 1.0001 0 1 0 17 10 L 19 10 L 19 15 L 17 15 A 1.0001 1.0001 0 1 0 17 17 L 19 17 L 19 19 L 15 19 L 15 6 z M 4 8 A 1.0001 1.0001 0 0 0 3 9 L 3 20 A 1.0001 1.0001 0 0 0 4 21 L 10 21 A 1.0001 1.0001 0 0 0 11 20 L 11 9 A 1.0001 1.0001 0 0 0 10 8 L 4 8 z M 5 10 L 9 10 L 9 15 L 7 15 A 1.0001 1.0001 0 1 0 7 17 L 9 17 L 9 19 L 5 19 L 5 10 z"
                              />
                            </svg>
                            <span>
                              {selectedSources.size === 0 && 'Sources'}
                              {selectedSources.size > 0 && selectedSources.size < sourceOptions.length && `Sources (${selectedSources.size})`}
                              {selectedSources.size === sourceOptions.length && 'Sources (All)'}
                            </span>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="24" 
                              height="24" 
                              viewBox="0 0 24 24"
                              className={`w-4 h-4 transition-transform ${isSourcesDropdownOpen ? 'rotate-180' : ''}`}
                            >
                              <path 
                                d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>

                          {isSourcesDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[180px] z-50">
                              <div className="space-y-[2px]">
                                {sourceOptions.map((source) => (
                                  <label
                                    key={source.id}
                                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                                  >
                                    <div className="relative w-4 h-4">
                                      <input
                                        type="checkbox"
                                        checked={selectedSources.has(source.id)}
                                        onChange={(e) => {
                                          const newSelected = new Set(selectedSources);
                                          if (e.target.checked) {
                                            newSelected.add(source.id);
                                          } else {
                                            newSelected.delete(source.id);
                                          }
                                          setSelectedSources(newSelected);
                                        }}
                                        className="peer absolute opacity-0 w-4 h-4 cursor-pointer z-10"
                                      />
                                      <div className="absolute inset-0 border border-[#E4E5E1] rounded-[4px] bg-white peer-hover:border-[#1A1A1A] peer-checked:bg-[#1A1A1A] peer-checked:border-[#1A1A1A] transition-all" />
                                      <svg 
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path 
                                          d="M2.5 6L5 8.5L9.5 4"
                                          stroke="white"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {source.icon}
                                      <span className="text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]">
                                        {source.label}
                                      </span>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="relative" ref={filesDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsFilesDropdownOpen(!isFilesDropdownOpen)}
                            className="bg-white text-[#1A1A1A] px-3 h-[28px] rounded-lg font-oracle font-[500] text-[14px] leading-[20px] transition-colors border border-[#E4E5E1] flex items-center gap-1.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-current">
                              <path fill="currentColor" d="M 10 2 C 7.2504839 2 5 4.2504839 5 7 L 5 15.003906 C 5 18.855963 8.1429989 22 11.996094 22 C 15.726037 22 18.292457 19.483594 18.878906 16.255859 L 19.984375 10.179688 A 1.0006407 1.0006407 0 1 0 18.015625 9.8203125 L 16.910156 15.898438 C 16.460605 18.372703 14.89215 20 11.996094 20 C 9.2231881 20 7 17.77585 7 15.003906 L 7 7 C 7 5.3315161 8.3315161 4 10 4 C 11.668484 4 13 5.3315161 13 7 L 13 15 C 13 15.56503 12.56503 16 12 16 C 11.43497 16 11 15.56503 11 15 L 11 8 A 1.0001 1.0001 0 1 0 9 8 L 9 15 C 9 16.64497 10.35503 18 12 18 C 13.64497 18 15 16.64497 15 15 L 15 7 C 15 4.2504839 12.749516 2 10 2 z" />
                            </svg>
                            Files
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="24" 
                              height="24" 
                              viewBox="0 0 24 24"
                              className={`w-4 h-4 transition-transform ${isFilesDropdownOpen ? 'rotate-180' : ''}`}
                            >
                              <path 
                                d="M5.707,10.707l5.586,5.586c0.391,0.391,1.024,0.391,1.414,0l5.586-5.586C18.923,10.077,18.477,9,17.586,9H6.414 C5.523,9,5.077,10.077,5.707,10.707z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>

                          {isFilesDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1 bg-white border border-[#E4E4E4] rounded-lg shadow-lg p-2 min-w-[160px] z-50">
                              <div className="space-y-[2px]">
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleFileSelect}
                                  multiple
                                  className="hidden"
                                />
                                <button 
                                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                                  onClick={() => {
                                    setIsFilesDropdownOpen(false);
                                    fileInputRef.current?.click();
                                  }}
                                >
                                  Upload files manually
                                </button>
                                <button 
                                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-[#F7F7F7] transition-colors text-[14px] leading-[20px] font-normal font-oracle text-[#1A1A1A]"
                                  onClick={() => {
                                    setIsFilesDropdownOpen(false);
                                    setIsImportFromVaultOpen(true);
                                  }}
                                >
                                  Import from Vault
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="px-3 h-[28px] bg-black text-white rounded-[6px] text-[14px] font-medium hover:bg-[#1A1A1A] flex items-center gap-1.5 transition-colors"
                      >
                        <span className="relative">Ask Modus</span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24"
                          className="text-current"
                        >
                          <path 
                            fill="currentColor" 
                            d="M 13.986328 3.9882812 A 1.250125 1.250125 0 0 0 13.115234 6.1347656 L 17.730469 10.75 L 3.25 10.75 A 1.250125 1.250125 0 1 0 3.25 13.25 L 17.730469 13.25 L 13.115234 17.865234 A 1.2512481 1.2512481 0 1 0 14.884766 19.634766 L 21.634766 12.884766 A 1.250125 1.250125 0 0 0 21.634766 11.115234 L 14.884766 4.3652344 A 1.250125 1.250125 0 0 0 13.986328 3.9882812 z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Selected sources display - only show if sources are selected */}
                  <AnimatePresence>
                    {selectedSources.size > 0 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <motion.div 
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          exit={{ y: -10 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="px-4 py-2.5 flex items-center gap-2 bg-white rounded-b-[8px]"
                        >
                          {Array.from(selectedSources).map((sourceId) => {
                            const source = sourceOptions.find(s => s.id === sourceId);
                            if (!source) return null;
                            
                            return (
                              <motion.div 
                                key={sourceId}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-oracle font-[500] text-[13px] leading-[20px] bg-[#EBEAE8] text-[#1A1A1A] group"
                              >
                                {source.icon}
                                {source.label}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSelected = new Set(selectedSources);
                                    newSelected.delete(sourceId);
                                    setSelectedSources(newSelected);
                                  }}
                                  className="ml-[1px] p-0.5 rounded-full hover:bg-[#E4E5E1] transition-colors"
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="12" 
                                    height="12" 
                                    viewBox="0 0 24 24"
                                    className="fill-current opacity-60 group-hover:opacity-100 transition-opacity"
                                  >
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                  </svg>
                                </button>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              <div className="text-center">
                <h2 className="text-[15px] leading-[22px] font-oracle text-[#646462]">
                  Try asking Modus to...
                </h2>
                
                <div className="relative">
                  <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="mt-4 flex overflow-x-auto pb-4 scrollbar-hide"
                  >
                    <div className="flex gap-4">
                      {[
                        {
                          title: "Find PCAOB guidance",
                          description: "Search for and summarize PCAOB's latest guidance on cryptocurrency asset auditing procedures from their website",
                          sources: ["Internet", "IFRS"]
                        },
                        {
                          title: "Research tax updates",
                          description: "Find recent IRS notices about R&D credit qualification criteria for software development companies",
                          sources: ["IRS", "Internet"]
                        },
                        {
                          title: "Get accounting standards",
                          description: "Find recent IFRS interpretations on revenue recognition for software companies",
                          sources: ["IFRS", "Internet"]
                        },
                        {
                          title: "Analyze industry trends",
                          description: "Find recent articles about automation adoption in accounting firms and summarize key statistics",
                          sources: ["Internet"]
                        },
                        {
                          title: "Track tax changes",
                          description: "Find and summarize recent changes to GST/HST requirements for digital services in Canada",
                          sources: ["CRA", "Internet"]
                        }
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setInputValue(suggestion.description);
                            
                            // Convert source labels to source IDs
                            const newSources = new Set(
                              suggestion.sources
                                .map(sourceLabel => sourceOptions.find(option => option.label === sourceLabel)?.id)
                                .filter((id): id is string => id !== undefined)
                            );
                            setSelectedSources(newSources);
                          }}
                          className="p-4 rounded-lg bg-[#FCFCFC] border border-[#E4E5E1] shadow-sm hover:border-[#BBBDB7] hover:bg-white transition-all cursor-pointer group flex flex-col w-[280px] h-[160px] flex-shrink-0"
                        >
                          <div className="flex flex-col gap-2">
                            <h3 className="text-[17px] leading-[24px] font-medium font-oracle text-[#1A1A1A] group-hover:text-[#000000] text-left line-clamp-1">
                              {suggestion.title}
                            </h3>
                            <p className="text-[14px] leading-[20px] font-oracle text-[#646462] line-clamp-3 text-left">
                              {suggestion.description}
                            </p>
                          </div>
                          <div className="flex-1" />
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {suggestion.sources.map((source, i) => (
                              <span 
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] font-oracle font-[500] text-[13px] leading-[20px] bg-[#EBEAE8] text-[#1A1A1A]"
                              >
                                {source === "Internet" && (
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24"
                                    className="fill-current"
                                  >
                                    <path d="M 12 2 C 6.5648778 2 2.1329905 6.3686781 2.0117188 11.775391 A 1.0001 1.0001 0 0 0 2.0117188 12.21875 C 2.1298947 17.628182 6.5629035 22 12 22 C 17.435122 22 21.86701 17.631322 21.988281 12.224609 A 1.0001 1.0001 0 0 0 21.988281 11.78125 C 21.870105 6.3718178 17.437097 2 12 2 z M 12 4 C 12.385416 4 12.69021 4.1333133 13.048828 4.4863281 C 13.407446 4.8393429 13.771857 5.4242219 14.070312 6.1796875 C 14.572488 7.4508196 14.836336 9.2022565 14.923828 11 L 9.0761719 11 C 9.1636643 9.2022565 9.4275121 7.4508196 9.9296875 6.1796875 C 10.228143 5.4242219 10.592554 4.8393429 10.951172 4.4863281 C 11.30979 4.1333133 11.614584 4 12 4 z M 8.3085938 4.9023438 C 8.2261615 5.0795527 8.1440827 5.2585815 8.0703125 5.4453125 C 7.4403342 7.0399458 7.157939 9.0008031 7.0742188 11 L 4.0683594 11 C 4.3988684 8.3354853 6.0274685 6.0873296 8.3085938 4.9023438 z M 15.691406 4.9023438 C 17.972531 6.0873296 19.601132 8.3354853 19.931641 11 L 16.925781 11 C 16.842061 9.0008031 16.559666 7.0399458 15.929688 5.4453125 C 15.855917 5.2585815 15.773839 5.0795527 15.691406 4.9023438 z M 4.0683594 13 L 7.0742188 13 C 7.1579387 14.999197 7.4403342 16.960053 8.0703125 18.554688 C 8.1440827 18.741418 8.2261615 18.920447 8.3085938 19.097656 C 6.0274685 17.91267 4.3988684 15.664514 4.0683594 13 z M 9.0761719 13 L 14.923828 13 C 14.836338 14.797744 14.572488 16.549181 14.070312 17.820312 C 13.771857 18.575778 13.407446 19.160657 13.048828 19.513672 C 12.69021 19.866687 12.385416 20 12 20 C 11.614584 20 11.30979 19.866687 10.951172 19.513672 C 10.592554 19.160657 10.228143 18.575778 9.9296875 17.820312 C 9.4275121 16.54918 9.1636643 14.797744 9.0761719 13 z M 16.925781 13 L 19.931641 13 C 19.601132 15.664514 17.972531 17.91267 15.691406 19.097656 C 15.773839 18.920447 15.855917 18.741418 15.929688 18.554688 C 16.559666 16.960054 16.842061 14.999197 16.925781 13 z" />
                                  </svg>
                                )}
                                {source === "IRS" && (
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24"
                                    className="fill-current"
                                  >
                                    <path d="M 12 2.59375 C 11.861625 2.59375 11.72325 2.6221875 11.59375 2.6796875 L 3.9003906 6.0996094 C 3.3533906 6.3426094 3 6.885375 3 7.484375 C 3 8.321375 3.678625 9 4.515625 9 L 5 9 L 5 16 C 5 16.552 5.448 17 6 17 C 6.552 17 7 16.552 7 16 L 7 9 L 9 9 L 9 16 C 9 16.552 9.448 17 10 17 C 10.552 17 11 16.552 11 16 L 11 9 L 13 9 L 13 16 C 13 16.552 13.448 17 14 17 C 14.552 17 15 16.552 15 16 L 15 9 L 17 9 L 17 16 C 17 16.552 17.448 17 18 17 C 18.552 17 19 16.552 19 16 L 19 9 L 19.484375 9 C 20.321375 9 21 8.321375 21 7.484375 C 21 6.885375 20.646609 6.3426094 20.099609 6.0996094 L 12.40625 2.6796875 C 12.27725 2.6221875 12.138375 2.59375 12 2.59375 z M 4 19 C 3.448 19 3 19.448 3 20 C 3 20.552 3.448 21 4 21 L 20 21 C 20.552 21 21 20.552 21 20 C 21 19.448 20.552 19 20 19 L 4 19 z" />
                                  </svg>
                                )}
                                {source === "CRA" && (
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24"
                                    className="fill-current"
                                  >
                                    <path d="M 12 2.59375 C 11.861625 2.59375 11.72325 2.6221875 11.59375 2.6796875 L 3.9003906 6.0996094 C 3.3533906 6.3426094 3 6.885375 3 7.484375 C 3 8.321375 3.678625 9 4.515625 9 L 5 9 L 5 16 C 5 16.552 5.448 17 6 17 C 6.552 17 7 16.552 7 16 L 7 9 L 9 9 L 9 16 C 9 16.552 9.448 17 10 17 C 10.552 17 11 16.552 11 16 L 11 9 L 13 9 L 13 16 C 13 16.552 13.448 17 14 17 C 14.552 17 15 16.552 15 16 L 15 9 L 17 9 L 17 16 C 17 16.552 17.448 17 18 17 C 18.552 17 19 16.552 19 16 L 19 9 L 19.484375 9 C 20.321375 9 21 8.321375 21 7.484375 C 21 6.885375 20.646609 6.3426094 20.099609 6.0996094 L 12.40625 2.6796875 C 12.27725 2.6221875 12.138375 2.59375 12 2.59375 z M 4 19 C 3.448 19 3 19.448 3 20 C 3 20.552 3.448 21 4 21 L 20 21 C 20.552 21 21 20.552 21 20 C 21 19.448 20.552 19 20 19 L 4 19 z" />
                                  </svg>
                                )}
                                {source === "IFRS" && (
                                  <Image src="/ifrsicon.png" alt="IFRS" width={14} height={14} className="object-contain" />
                                )}
                                {source}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {!isScrolledToEnd && (
                    <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ImportFromVaultModal
        isOpen={isImportFromVaultOpen}
        onClose={() => setIsImportFromVaultOpen(false)}
        onImport={handleImportFromVault}
      />

      <UploadDocumentModal
        isOpen={isUploadDocumentOpen}
        onClose={() => setIsUploadDocumentOpen(false)}
        onUploadComplete={() => {
          // Handle upload complete
          setIsUploadDocumentOpen(false);
        }}
      />
    </div>
  )
} 