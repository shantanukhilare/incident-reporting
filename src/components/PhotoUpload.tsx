import React, { useRef } from 'react';
import { TiDelete } from 'react-icons/ti';

interface PhotoUploadProps {
  label?: string;
  onChange?: (files: FileList | null) => void;
  value?: FileList | null;
  className?: string;
  required?: boolean;
  multiple?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  label, 
  onChange, 
  value,
  className = '',
  required = false,
  multiple = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Derive fileCount directly from value prop
  const fileCount = value?.length || 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    onChange?.(files);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange?.(null);
  };

  const fileId = `photo-upload-${label?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  return (
    <div className={`form-row ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex-1 flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          required={required}
          multiple={multiple}
          id={fileId}
        />
        <div className='flex items-center gap-3'>

        <label
          htmlFor={fileId}
          className="file-upload-button flex-1 text-center cursor-pointer"
          >
          {fileCount > 0 
            ? `${fileCount} photo${fileCount > 1 ? 's' : ''} selected` 
            : `Choose ${multiple ? 'Photos' : 'Photo'}`}
        </label>
        {fileCount > 0 && (
          <TiDelete onClick={handleClear} className="cursor-pointer text-red-600 text-4xl" />
        )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;