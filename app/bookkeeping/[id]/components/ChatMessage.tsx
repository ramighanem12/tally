'use client'
import { useState, useEffect } from 'react'

type ChatMessageProps = {
  message: string
  isUser?: boolean
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 10) // Reduced from 20ms to 10ms for faster typing

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text])

  return displayedText
}

export default function ChatMessage({ message, isUser = false }: ChatMessageProps) {
  if (isUser) {
    return (
      <div className="flex flex-col items-end mb-2 animate-[slideUp_0.3s_ease-out]">
        <div className="max-w-[50%] px-3 h-8 flex items-center rounded-lg bg-[#41629E] text-white border border-[#344D7A]">
          <p className="text-[14px] leading-[20px] font-oracle font-medium truncate">
            {message}
          </p>
        </div>
        <span className="text-[11px] leading-[14px] font-oracle text-[#6B7280] mt-1">
          {new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: 'numeric',
            hour12: true 
          })}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-[8px] mb-4 animate-[slideUp_0.3s_ease-out]">
      <div className="flex-shrink-0 w-[18.5px] h-[18.5px] mt-[2px]">
        <img 
          src="/ModusLetter.svg"
          alt="Modus AI"
          className="w-full h-full"
        />
      </div>
      <div className="max-w-[65%] pb-1">
        <p className="text-[14px] leading-[20px] font-oracle text-[#1A1A1A]">
          <TypewriterText text={message} />
        </p>
      </div>
    </div>
  )
} 