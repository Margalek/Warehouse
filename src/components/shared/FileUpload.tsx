import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For hidden file input styling if needed, or direct use

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string; // e.g., ".json, .csv"
  buttonText?: string;
  buttonVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  className?: string;
}

export function FileUpload({
  onFileSelect,
  acceptedFileTypes = '.json', // Default to JSON as per primary requirement
  buttonText = 'Upload File',
  buttonVariant = 'outline',
  className,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset file input to allow uploading the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden" // Hidden, triggered by the button
      />
      <Button variant={buttonVariant} onClick={triggerFileSelect}>
        {buttonText}
      </Button>
    </div>
  );
}
