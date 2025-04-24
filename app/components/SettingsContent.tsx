import React from 'react';

export default function SettingsContent() {
  return (
    <div className="flex gap-4 h-[calc(100vh-180px)]">
      <div className="w-[40%] bg-[#FFFFFF80] rounded-xl border border-gray-200 flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-[14px] text-gray-600">Agent settings</div>
        </div>
      </div>
      <div className="w-[60%] bg-[#FFFFFF80] rounded-xl border border-gray-200 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="text-[14px] text-gray-600 p-6">Agent settings</div>
        </div>
      </div>
    </div>
  );
} 