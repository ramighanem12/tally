'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface VaultFile {
  id: string;
  name: string;
  url?: string;
  storage_path?: string;
  uploaded_by: string;
  uploaded_at: string;
  type: string;
  size: number;
  mime_type: string;
  document_type: string;
  kind: string;
  metadata?: Record<string, any>;
  projects: Array<{
    id: string;
    name: string;
  }>;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: VaultFile | null;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, file }) => {
  // State hooks
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [docViewerUrl, setDocViewerUrl] = useState<string | null>(null);

  // Memoized values
  const fileType = useMemo(() => {
    if (!file) return null;
    const isImage = file.mime_type.startsWith('image/');
    const isPDF = file.mime_type === 'application/pdf';
    const isDoc = file.mime_type === 'application/msword' || 
                 file.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return { isImage, isPDF, isDoc, isViewable: isImage || isPDF || isDoc };
  }, [file?.mime_type]);

  // Effects
  useEffect(() => {
    if (!file?.url) return;
    
    setImageError(false);
    setIsImageLoading(true);
    setDocViewerUrl(null);

    // If it's a doc/docx file, get a fresh signed URL and set up the viewer
    if (file.storage_path && fileType?.isDoc) {
      getDocViewerUrl();
    }
  }, [file?.url, file?.storage_path, fileType?.isDoc]);

  const getDocViewerUrl = async () => {
    if (!file?.storage_path) return;

    try {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(file.storage_path, 3600); // 1 hour expiry

      if (signedError || !signedData?.signedUrl) {
        throw new Error('Failed to generate document viewer link');
      }

      // Use Google Docs Viewer
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(signedData.signedUrl)}&embedded=true`;
      setDocViewerUrl(viewerUrl);
    } catch (error) {
      console.error('Error setting up document viewer:', error);
      toast.error('Failed to load document preview');
    }
  };

  const handleDownload = async () => {
    if (!file || !file.storage_path) {
      toast.error('File not available for download');
      return;
    }

    setIsDownloading(true);
    const loadingToast = toast.loading('Preparing download...');

    try {
      // Get fresh signed URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(file.storage_path, 60); // 60 seconds expiry

      if (signedError || !signedData?.signedUrl) {
        throw new Error('Failed to generate download link');
      }

      // Fetch the file and save it
      const response = await fetch(signedData.signedUrl);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Download started', {
        id: loadingToast
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file', {
        id: loadingToast
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !file || !file.url || !fileType) return null;

  const { isImage, isPDF, isDoc, isViewable } = fileType;

  return (
    <div className="fixed inset-0 z-50 bg-black/90">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="absolute top-4 right-16 z-50 p-2 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4v12m0 0l-4-4m4 4l4-4m-9 6h10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Content */}
      <div className="h-full flex items-center justify-center p-4">
        {isViewable ? (
          isPDF ? (
            <div className="w-full h-full max-w-6xl mx-auto">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <div className="w-full h-full bg-white">
                  <Viewer 
                    fileUrl={file.url}
                    defaultScale={1}
                  />
                </div>
              </Worker>
            </div>
          ) : isDoc && docViewerUrl ? (
            <div className="w-full h-full max-w-6xl mx-auto bg-white">
              <iframe
                src={docViewerUrl}
                className="w-full h-full border-0"
                frameBorder="0"
              />
            </div>
          ) : isImage ? (
            <div className="relative max-w-full max-h-full">
              {!imageError ? (
                <>
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                  <Image
                    src={file.url}
                    alt={file.name}
                    width={1200}
                    height={800}
                    className={`max-h-[90vh] w-auto object-contain transition-opacity duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onError={() => {
                      setImageError(true);
                      setIsImageLoading(false);
                    }}
                    onLoad={() => setIsImageLoading(false)}
                    priority
                    unoptimized
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <svg className="w-12 h-12 text-white/70 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z"/>
                    <path d="M14 2V8H20"/>
                  </svg>
                  <p className="text-white/70 mb-4">Failed to load image preview</p>
                </div>
              )}
            </div>
          ) : null
        ) : (
          <div className="flex flex-col items-center justify-center text-white">
            <svg className="w-12 h-12 text-white/70 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z"/>
              <path d="M14 2V8H20"/>
            </svg>
            <p className="text-white/70 mb-4">This file type cannot be previewed in the browser</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreviewModal; 