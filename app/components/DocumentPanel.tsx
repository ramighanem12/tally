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

export default function DocumentPanel() {
  return <div>Document Panel</div>;
} 
