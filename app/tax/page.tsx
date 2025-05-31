'use client'
import CopilotNavigation from "../components/CopilotNavigation"
import Image from 'next/image'

export default function TaxPage() {
  return (
    <div className="h-screen flex overflow-hidden">
      <CopilotNavigation selectedTab="tax" />
      <div className="flex-1 overflow-hidden bg-[#F3F6F6] pt-4 pr-4 pb-4">
        <main className="h-full w-full bg-white overflow-hidden flex flex-col rounded-lg relative">
          {/* Fixed Header */}
          <div className="pl-4 pr-4 py-3 border-b border-[#E4E5E1] flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-[24px] w-auto">
                  <svg 
                    viewBox="0 0 500 500" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-auto"
                  >
                    <rect width="500" height="500" rx="100" fill="#00458F"/>
                    <path d="M386.9 326.9C387.75 337.95 388.883 345.883 390.3 350.7C391.717 355.517 394.55 359.2 398.8 361.75C403.333 364.3 410.417 365.717 420.05 366V384.275C398.8 382.858 379.533 382.15 362.25 382.15C344.683 382.15 325.275 382.858 304.025 384.275V366C316.775 365.433 325.417 363.025 329.95 358.775C334.767 354.242 337.175 346.45 337.175 335.4L336.75 326.9L328.25 185.8L250.9 385.975H235.175L149.75 182.825L141.25 321.8C140.683 336.533 142.808 347.442 147.625 354.525C152.725 361.608 161.65 365.433 174.4 366V384.275C157.4 382.858 141.958 382.15 128.075 382.15C114.192 382.15 98.75 382.858 81.75 384.275V366C94.2167 365.433 102.575 361.892 106.825 355.375C111.075 348.858 113.767 337.667 114.9 321.8L124.675 170.5C125.242 158.033 122.267 149.25 115.75 144.15C109.517 138.767 101.583 136.075 91.95 136.075V117.375C107.817 118.225 121.7 118.65 133.6 118.65C145.5 118.65 157.967 118.225 171 117.375L255.575 304.8L328.25 117.375C346.383 117.942 359.983 118.225 369.05 118.225C378.4 118.225 391.858 117.942 409.425 117.375V136.075C398.658 136.075 390.3 138.625 384.35 143.725C378.4 148.542 375.85 157.325 376.7 170.075L386.9 326.9Z" fill="white"/>
                  </svg>
                </div>
                <h1 className="text-[18px] leading-[22px] font-medium font-oracle text-[#1A1A1A]">
                  Tax
                </h1>
              </div>
              <button 
                className="px-3 h-8 bg-[#41629E] hover:bg-[#385389] text-white rounded-lg text-[14px] leading-[20px] font-medium font-oracle transition-colors flex items-center gap-2 border border-[#344D7A]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                New return
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 