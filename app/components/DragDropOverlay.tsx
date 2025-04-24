import { useDropzone } from 'react-dropzone';

interface DragDropOverlayProps {
  onDrop: (files: File[]) => void;
}

export default function DragDropOverlay({ onDrop }: DragDropOverlayProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  if (!isDragActive) return null;

  return (
    <div 
      {...getRootProps()}
      className="absolute inset-0 bg-[#1A1A1A]/5 flex items-center justify-center z-50"
    >
      <input {...getInputProps()} />
      <div className="bg-white rounded-xl border-2 border-dashed border-[#1A1A1A] p-8 mx-6">
        <p className="text-[16px] leading-[24px] font-medium font-['Inter'] text-[#1A1A1A] text-center">
          Drop files to upload
        </p>
      </div>
    </div>
  );
} 