'use client'
import { useState, useEffect } from 'react'

type ChatInputAreaProps = {
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onSendMessage: (message: string) => void
}

export default function ChatInputArea({ 
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onSendMessage
}: ChatInputAreaProps) {
  const [isAttachDropdownOpen, setIsAttachDropdownOpen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest('.attach-dropdown')) {
        setIsAttachDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  return (
    <div className="px-4 pb-2">
      {/* Button container */}
      <div className="flex justify-between mb-2">
        <div className="flex gap-2">
          <div className="relative attach-dropdown">
            <button 
              onClick={() => setIsAttachDropdownOpen(!isAttachDropdownOpen)}
              className="px-3 h-8 bg-white hover:bg-[#F3F6F6] text-[#1A1A1A] rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#E4E5E1]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Attach
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform duration-200 ${isAttachDropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div 
              className={`absolute bottom-full mb-2 left-0 w-[200px] bg-white rounded-lg border border-[#E4E5E1] p-1 z-10
                transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] origin-bottom-left
                ${isAttachDropdownOpen 
                  ? 'opacity-100 scale-100 shadow-lg' 
                  : 'opacity-0 scale-95 shadow-none pointer-events-none'
                }`}
            >
              <button 
                onClick={() => {
                  // Handle upload from computer
                  setIsAttachDropdownOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-left text-[14px] leading-[20px] font-oracle text-[#1A1A1A] hover:bg-[#F3F6F6] rounded-md transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11.3333 5.33333L8 2L4.66667 5.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 2V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upload from computer
              </button>
              <button 
                onClick={() => {
                  // Handle import from vault
                  setIsAttachDropdownOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-left text-[14px] leading-[20px] font-oracle text-[#1A1A1A] hover:bg-[#F3F6F6] rounded-md transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M 4.25 4 C 3.013 4 2 5.012 2 6.25 L 2 18.75 C 2 19.987 3.013 21 4.25 21 L 11 21 C 11.552 21 12 20.552 12 20 C 12 19.447 11.552 19 11 19 L 4.25 19 C 4.112 19 4 18.888 4 18.75 L 4 6.25 C 4 6.112 4.112 6 4.25 6 L 7.3789062 6 C 7.5119063 6 7.6394219 6.0534844 7.7324219 6.1464844 L 8.8535156 7.2675781 C 9.3225156 7.7355781 9.9580938 8 10.621094 8 L 19.75 8 C 19.888 8 20 8.112 20 8.25 L 20 11 C 20 11.552 20.448 12 21 12 C 21.552 12 22 11.552 22 11 L 22 8.25 C 22 7.012 20.987 6 19.75 6 L 10.621094 6 C 10.488094 6 10.360578 5.9465156 10.267578 5.8535156 L 9.1464844 4.7324219 C 8.6774844 4.2634219 8.0419062 4 7.3789062 4 L 4.25 4 z M 19 14 C 16.239 14 14 16.239 14 19 C 14 21.761 16.239 24 19 24 C 21.761 24 24 21.761 24 19 C 24 16.239 21.761 14 19 14 z M 19 16 C 19.414 16 19.75 16.336 19.75 16.75 L 19.75 18.25 L 21.25 18.25 C 21.664 18.25 22 18.586 22 19 C 22 19.414 21.664 19.75 21.25 19.75 L 19.75 19.75 L 19.75 21.25 C 19.75 21.664 19.414 22 19 22 C 18.586 22 18.25 21.664 18.25 21.25 L 18.25 19.75 L 16.75 19.75 C 16.336 19.75 16 19.414 16 19 C 16 18.586 16.336 18.25 16.75 18.25 L 18.25 18.25 L 18.25 16.75 C 18.25 16.336 18.586 16 19 16 z"></path>
                </svg>
                Import from Vault
              </button>
            </div>
          </div>
          <button 
            className="px-3 h-8 bg-white hover:bg-[#F3F6F6] text-[#1A1A1A] rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#E4E5E1]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M 9 1 A 1.0001 1.0001 0 0 0 8.0722656 1.6289062 L 4.0722656 11.628906 A 1.0001 1.0001 0 0 0 5 13 L 7.65625 13 L 5.0429688 21.712891 A 1.0001 1.0001 0 0 0 6.6503906 22.759766 L 20.650391 10.759766 A 1.0001 1.0001 0 0 0 20 9 L 16.617188 9 L 19.894531 2.4472656 A 1.0001 1.0001 0 0 0 19 1 L 9 1 z M 9.6757812 3 L 17.382812 3 L 14.105469 9.5527344 A 1.0001 1.0001 0 0 0 15 11 L 17.296875 11 L 7.9355469 19.023438 L 9.9570312 12.287109 A 1.0001 1.0001 0 0 0 9 11 L 6.4765625 11 L 9.6757812 3 z"/>
            </svg>
            Saved prompts
          </button>
        </div>
        <button 
          onClick={handleSend}
          disabled={!message.trim()}
          className={`px-3 h-8 bg-[#41629E] text-white border border-[#344D7A] rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 ${
            message.trim() 
              ? 'hover:bg-[#385389]' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Ask
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="fill-current">
            <path d="M 16.017578 3.0019531 C 15.804328 3.0019531 15.592188 3.0816406 15.429688 3.2441406 L 12.005859 6.9375 C 11.628859 7.3425 11.91575 8 12.46875 8 L 15 8 L 15 16 C 15 17.668484 13.668484 19 12 19 L 4 19 A 1.0001 1.0001 0 1 0 4 21 L 12 21 C 14.749516 21 17 18.749516 17 16 L 17 8 L 19.566406 8 C 20.118406 8 20.40725 7.3425 20.03125 6.9375 L 16.607422 3.2441406 C 16.444922 3.0816406 16.230828 3.0019531 16.017578 3.0019531 z"></path>
          </svg>
        </button>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder="Ask Anything"
        rows={2}
        className="w-full bg-white rounded-lg pl-3 pr-4 py-3 text-[15px] leading-[20px] font-oracle text-[#1A1A1A] placeholder:text-[#6B7280] resize-none 
        border border-[#41629E] 
        shadow-[0_0_8px_rgba(65,98,158,0.15)] 
        focus:outline-none focus:border-[#41629E] focus:ring-1 focus:ring-[#41629E] focus:shadow-[0_0_0_rgba(65,98,158,0)]
        transition-all duration-300"
      />
    </div>
  )
} 