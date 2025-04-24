'use client'
import { Document } from '../types/documents'
import { Viewer, Worker, SpecialZoomLevel, Plugin, RenderViewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { useState, useEffect, useRef, useMemo } from 'react'
import { selectionModePlugin, SelectionMode } from '@react-pdf-viewer/selection-mode'
import '@react-pdf-viewer/selection-mode/lib/styles/index.css'
import { toolbarPlugin } from '@react-pdf-viewer/toolbar'
import '@react-pdf-viewer/toolbar/lib/styles/index.css'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const DocumentIcon = ({ fileName }: { fileName: string }) => {
  const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.csv');
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isWord = fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc');
  
  if (isExcel) {
    return (
      <img src="/excel.svg" alt="Excel file" className="w-4 h-4 mr-2" />
    );
  }

  if (isPdf) {
    return (
      <img src="/pdflogo.svg" alt="PDF file" className="w-4 h-4 mr-2" />
    );
  }

  if (isWord) {
    return (
      <img src="/doc.svg" alt="Word file" className="w-4 h-4 mr-2" />
    );
  }

  return (
    <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 16 16" fill="none">
      <path d="M4 1.5H8.58579C8.851 1.5 9.10536 1.60536 9.29289 1.79289L13.2071 5.70711C13.3946 5.89464 13.5 6.149 13.5 6.41421V13C13.5 13.8284 12.8284 14.5 12 14.5H4C3.17157 14.5 2.5 13.8284 2.5 13V3C2.5 2.17157 3.17157 1.5 4 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 1.5V4.5C8.5 5.32843 9.17157 6 10 6H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

interface DocumentPanelProps {
  document: any;
  onClose: () => void;
  className?: string;
}

export default function DocumentPanel({ document: documentFile, onClose, className = '' }: DocumentPanelProps) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [width, setWidth] = useState(40); // width in percentage
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  
  // Call hooks at the top level
  const toolbarPluginInstance = toolbarPlugin();
  const selectionModePluginInstance = selectionModePlugin({
    selectionMode: SelectionMode.Hand,
  });
  
  const { Toolbar } = toolbarPluginInstance;

  useEffect(() => {
    if (documentFile) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [documentFile]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Prevent text selection
      e.preventDefault();
      e.stopPropagation();

      const windowWidth = window.innerWidth;
      const newWidth = ((windowWidth - e.clientX) / windowWidth) * 100;
      
      // Limit the width between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Disable text selection while resizing
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Re-enable text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isResizing]);

  if (!documentFile) return null;

  return (
    <>
      <div className={`${!className ? `
          absolute inset-y-0 right-0 bg-white border-l border-gray-200
          transform transition-transform duration-300 ease-in-out z-20
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        ` : className}
      `}
      style={{ width: `${width}%` }}
      >
        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="absolute left-0 inset-y-0 flex items-center cursor-col-resize group select-none"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        >
          {/* Double line resize indicator */}
          <div className="absolute inset-y-0 -left-1 flex">
            <div className="w-px bg-gray-200 group-hover:bg-gray-400" />
            <div className="w-px bg-gray-200 ml-[2px] group-hover:bg-gray-400" />
          </div>

          {/* Always visible resize icon */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm border border-gray-200 rounded-md p-1 group-hover:border-gray-300 group-hover:shadow-md transition-shadow">
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 17L13 12L18 7M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Wider hit area */}
          <div className="absolute inset-y-0 -left-2 w-4" />
        </div>

        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-[16px] font-medium text-gray-900 truncate max-w-[400px]">
                {documentFile.name}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Content area - PDF viewer */}
          <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
            {documentFile.url ? (
              <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                <div className="h-12 bg-white border-b border-gray-200 flex-shrink-0 flex items-center justify-center px-4">
                  <div className="w-full max-w-3xl">
                    <Toolbar />
                  </div>
                </div>
                <div className="flex-1 overflow-auto relative">
                  <Viewer 
                    fileUrl={documentFile.url}
                    plugins={[toolbarPluginInstance, selectionModePluginInstance]}
                    defaultScale={1}
                  />
                </div>
              </Worker>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No PDF URL available
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fixed top-4 right-4 z-[9999]">
        <Toaster />
      </div>
    </>
  );
} 
