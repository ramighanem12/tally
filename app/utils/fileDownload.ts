import JSZip from 'jszip'
import { toast } from 'react-hot-toast'

// Helper function for downloading single files
export const downloadSingleFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error('Failed to download file');
  }
};

// Helper function for downloading files to zip
const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return { blob, filename };
  } catch (error) {
    console.error(`Error downloading ${filename}:`, error);
    return null;
  }
};

// Main function to handle multiple file downloads
export const downloadMultipleFiles = async (files: { url: string; name: string }[]) => {
  const zip = new JSZip();
  
  const downloadPromises = files.map(file => 
    downloadFile(file.url, file.name)
  );
  
  const downloadedFiles = await Promise.all(downloadPromises);
  
  downloadedFiles.forEach(file => {
    if (file) {
      zip.file(file.filename, file.blob);
    }
  });
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(zipBlob);
  
  const link = document.createElement('a');
  link.href = zipUrl;
  link.download = 'documents.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(zipUrl);
}; 