import React, { useRef, useState } from 'react';

interface PhotoVideoUploadProps {
  label?: string;
  accept?: string;
  onChange?: (files: FileList | null) => void;
  className?: string;
  required?: boolean;
  multiple?: boolean;
}

const PhotoVideoUpload: React.FC<PhotoVideoUploadProps> = ({ 
  label, 
  accept = 'image/*,video/*',
  onChange, 
  className = '',
  required = false,
  multiple = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileCount, setFileCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileCount(files?.length || 0);
    onChange?.(files);
  };

  const fileId = `file-upload-${label?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;

  return (
    <div className={`form-row ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          required={required}
          multiple={multiple}
          id={fileId}
        />
        <label
          htmlFor={fileId}
          className="file-upload-button block"
        >
          {fileCount > 0 
            ? `${fileCount} file${fileCount > 1 ? 's' : ''} selected` 
            : `Choose ${multiple ? 'Files' : 'File'}`}
        </label>
      </div>
    </div>
  );
};

export default PhotoVideoUpload;

