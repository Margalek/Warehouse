import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For hidden file input styling if needed, or direct use

interface FileUploadProps {
  /**
   * Callback function invoked when a file is selected by the user.
   * @param file The selected File object.
   */
  onFileSelect: (file: File) => void;
  /**
   * Optional string specifying the file types that the input should accept.
   * Example: ".json, .csv, image/*"
   * @default ".json"
   */
  acceptedFileTypes?: string; // e.g., ".json, .csv"
  /**
   * Optional text to display on the upload button.
   * @default "Upload File"
   */
  buttonText?: string;
  /**
   * Optional variant for the button's appearance, based on Shadcn/UI Button variants.
   * @default "outline"
   */
  buttonVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  /** Optional CSS class name to apply to the root div of the component. */
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
      <Button
        variant={buttonVariant}
        onClick={triggerFileSelect}
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
}
