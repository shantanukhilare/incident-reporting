
import React, { useRef } from 'react';
import { ConcernType, SeverityLevel } from '../../types';
import { Mic, MicOff, Camera, Image, Check, X, Send, AlertCircle } from 'lucide-react';
import type { SpeechRecognitionError } from '../../hooks/useSpeechRecognition';

interface TypeSelectorProps {
  onSelect: (type: ConcernType) => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({ onSelect }) => {
  const types = [ConcernType.UnsafeAct, ConcernType.UnsafeCondition, ConcernType.SafeAct];
  return (
    <div className="grid grid-cols-1 gap-3 w-full mt-2 pb-4">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="w-full py-4 px-6 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95 text-lg shadow-sm"
        >
          {type}
        </button>
      ))}
    </div>
  );
};

interface SeveritySelectorProps {
  onSelect: (severity: SeverityLevel) => void;
}

export const SeveritySelector: React.FC<SeveritySelectorProps> = ({ onSelect }) => {
  const levels = [
    SeverityLevel.FirstAid,
    SeverityLevel.MTC,
    SeverityLevel.RWC,
    SeverityLevel.LTI,
    SeverityLevel.Fatal
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full mt-2 pb-4">
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onSelect(level)}
          className={`py-3 px-4 font-bold rounded-xl transition-all active:scale-95 shadow-sm border-2 ${
            level === SeverityLevel.Fatal
              ? 'bg-red-50 border-alert text-alert hover:bg-alert hover:text-white'
              : 'bg-white border-primary text-primary hover:bg-primary hover:text-white'
          } ${level === SeverityLevel.Fatal ? 'col-span-2' : ''}`}
        >
          {level}
        </button>
      ))}
    </div>
  );
};

interface DescriptionInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isListening: boolean;
  onToggleMic: () => void;
  error: SpeechRecognitionError | null;
}

export const DescriptionInput: React.FC<DescriptionInputProps> = ({
  value,
  onChange,
  onSubmit,
  isListening,
  onToggleMic,
  error
}) => {
  return (
    <div className="w-full mt-2 flex flex-col space-y-3 pb-6">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe the incident in detail..."
          className={`w-full p-4 border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none h-40 text-secondary bg-white shadow-inner transition-all ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleMic();
          }}
          className={`absolute bottom-4 right-4 p-3 rounded-full transition-all flex items-center justify-center shadow-lg ${
            isListening 
              ? 'bg-alert text-white animate-pulse scale-110' 
              : error 
                ? 'bg-red-100 text-red-500' 
                : 'bg-primary text-white hover:bg-primary/90'
          }`}
          title={isListening ? "Stop Recording" : "Voice Input"}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={16} />
          <span>{error.message}</span>
        </div>
      )}

      {isListening && (
        <div className="flex items-center space-x-2 text-xs text-primary font-bold uppercase tracking-widest animate-pulse px-2">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span>Listening...</span>
        </div>
      )}

      <button
        disabled={!value.trim() || isListening}
        onClick={onSubmit}
        className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 transition-all active:scale-95 shadow-xl hover:bg-primary/90"
      >
        <span>Submit Description</span>
        <Send size={20} />
      </button>
    </div>
  );
};

interface ImageUploaderProps {
  images: any[];
  onUpload: (files: FileList) => void;
  onRemove: (index: number) => void;
  onComplete: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onUpload,
  onRemove,
  onComplete
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full mt-2 flex flex-col space-y-4 pb-6">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-primary rounded-2xl text-primary hover:bg-primary/5 transition-all shadow-sm"
        >
          <Camera size={40} />
          <span className="mt-2 font-bold">Use Camera</span>
          <input
            type="file"
            ref={cameraInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files && onUpload(e.target.files)}
          />
        </button>
        <button
          onClick={() => galleryInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-primary rounded-2xl text-primary hover:bg-primary/5 transition-all shadow-sm"
        >
          <Image size={40} />
          <span className="mt-2 font-bold">Photo Library</span>
          <input
            type="file"
            ref={galleryInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && onUpload(e.target.files)}
          />
        </button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-100 rounded-2xl max-h-60 overflow-y-auto shadow-inner">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
              <img src={img.previewUrl} alt="preview" className="w-full h-full object-cover" />
              <button
                onClick={() => onRemove(idx)}
                className="absolute top-1 right-1 bg-alert text-white rounded-full p-1.5 shadow-lg opacity-90 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onComplete}
        className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-xl hover:bg-primary/90"
      >
        <Check size={24} />
        <span>{images.length > 0 ? 'Submit Report' : 'Skip & Finalize'}</span>
      </button>
    </div>
  );
};
