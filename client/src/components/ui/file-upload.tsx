import { useRef, useState } from "react";
import { FileUploadProps } from "@/types";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileUpload({
  onFileSelect,
  accept = ".pdf,.png,.jpg,.jpeg,.gif",
  maxSize = 10 * 1024 * 1024 // 10MB default
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  }
  
  function processFile(selectedFile: File | undefined) {
    if (!selectedFile) return;
    
    setError(null);
    
    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      return;
    }
    
    // Store the file
    setFile(selectedFile);
    onFileSelect(selectedFile);
  }
  
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }
  
  function handleDragLeave() {
    setIsDragging(false);
  }
  
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  }
  
  function handleRemoveFile() {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
  
  function handleBrowseClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }
  
  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      {!file ? (
        <div 
          className={cn(
            "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md",
            isDragging ? "border-primary bg-primary/5" : "border-neutral-300 dark:border-neutral-700",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="space-y-1 text-center">
            <UploadCloud className="h-10 w-10 text-neutral-400 mx-auto" />
            <div className="flex text-sm text-neutral-600 dark:text-neutral-400">
              <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                <span>Upload a file</span>
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              PDF, PNG, JPG, GIF up to {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between p-3 border border-neutral-300 dark:border-neutral-700 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="ri-file-line text-primary text-xl"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{file.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFile();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
