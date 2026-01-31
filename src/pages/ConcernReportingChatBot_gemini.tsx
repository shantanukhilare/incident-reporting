
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BotMessage, UserMessage } from '../components/gemini/BotMessage';
import { 
  TypeSelector, 
  SeveritySelector, 
  DescriptionInput, 
  ImageUploader 
} from '../components/gemini/StepActions';
import { SuccessModal } from '../components/gemini/SuccessModal';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { 
  ConcernType, 
  SeverityLevel, 
  Step, 
  type ReportFormData, 
  type Message, 
  type ImageMetadata 
} from '../types';
import { ShieldAlert, Info } from 'lucide-react';

const ConcernReportingChatBot_gemini: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'initial-message',
        sender: 'bot',
        text: "Hello! I'm your Safety Assistant. I'll help you report a concern efficiently. What type of incident are you reporting?",
        timestamp: new Date(),
        isActionable: false
    }
  ]);
  const [currentStep, setCurrentStep] = useState<Step>(Step.TypeSelection);
  const [reportData, setReportData] = useState<ReportFormData>({
    concernType: null,
    description: '',
    severity: null,
    images: [],
    imageCount: 0,
    timestamp: '',
    reportId: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inputDescription, setInputDescription] = useState('');
  const [preSpeechValue, setPreSpeechValue] = useState('');

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentStep]);

  // Speech Recognition Result Handler
  const onSpeechResult = useCallback((transcript: string, isFinal: boolean) => {
    setInputDescription(prev => {
      const base = preSpeechValue ? preSpeechValue.trim() + ' ' : '';
      const newVal = base + transcript;
      if (isFinal) setPreSpeechValue(newVal);
      return newVal;
    });
  }, [preSpeechValue]);

  const { isListening, startListening, stopListening, error: speechError } = useSpeechRecognition(onSpeechResult);

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setPreSpeechValue(inputDescription);
      startListening();
    }
  }, [isListening, inputDescription, startListening, stopListening]);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'bot',
      text,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text,
      timestamp: new Date()
    }]);
  };

  // Flow handlers
  const handleTypeSelect = (type: ConcernType) => {
    addUserMessage(type);
    setReportData((prev) => ({ ...prev, concernType: type }));
    setTimeout(() => {
      addBotMessage(`Understood. Please describe the ${type.toLowerCase()} in detail. Use the voice button for hands-free reporting.`);
      setCurrentStep(Step.Description);
    }, 500);
  };

  const handleDescriptionSubmit = () => {
    if (!inputDescription.trim()) return;
    if (isListening) stopListening();
    addUserMessage("Details provided.");
    setReportData((prev) => ({ ...prev, description: inputDescription }));
    setTimeout(() => {
      addBotMessage("Got it. What is the severity level of this incident?");
      setCurrentStep(Step.Severity);
    }, 500);
  };

  const handleSeveritySelect = (severity: SeverityLevel) => {
    addUserMessage(severity);
    setReportData((prev) => ({ ...prev, severity }));
    setTimeout(() => {
      addBotMessage("Almost done. Please upload any photos of the situation if possible.");
      setCurrentStep(Step.ImageUpload);
    }, 500);
  };

  const handleImageUpload = (files: FileList) => {
    const newImages: ImageMetadata[] = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      previewUrl: URL.createObjectURL(file),
      file
    }));
    setReportData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
      imageCount: prev.images.length + newImages.length
    }));
  };

  const handleImageRemove = (index: number) => {
    setReportData((prev) => {
      const updatedImages = [...prev.images];
      const removed = updatedImages.splice(index, 1)[0];
      URL.revokeObjectURL(removed.previewUrl);
      return { ...prev, images: updatedImages, imageCount: updatedImages.length };
    });
  };

  const handleFinalSubmit = () => {
    const now = new Date();
    const finalData: ReportFormData = {
      ...reportData,
      timestamp: now.toISOString(),
      reportId: `RPT-${now.getTime()}`
    };
    setReportData(finalData);
    setShowSuccessModal(true);
    console.log('Submission:', finalData);
  };

  const resetReport = () => {
    setMessages([]);
    setCurrentStep(Step.TypeSelection);
    setReportData({
      concernType: null, description: '', severity: null,
      images: [], imageCount: 0, timestamp: '', reportId: ''
    });
    setInputDescription('');
    setPreSpeechValue('');
    setShowSuccessModal(false);
    addBotMessage("Hello! Let's start a new report. What type of concern are you reporting?");
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Immersive Header */}
      <header className="bg-secondary px-6 py-4 flex items-center justify-between shadow-lg z-20 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-primary p-2.5 rounded-xl shadow-inner">
            <ShieldAlert className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-lg leading-none tracking-tight">Safety Report</h1>
            <p className="text-white/50 text-[10px] uppercase font-black tracking-widest mt-1">Real-time Compliance</p>
          </div>
        </div>
        <div className="flex items-center bg-black/20 px-3 py-1.5 rounded-full space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(139,187,4,0.8)]" />
          <span className="text-white/90 text-[11px] font-black uppercase tracking-tighter">System Online</span>
        </div>
      </header>

      {/* Main Content Area - Constrained on desktop, full on mobile */}
      <main className="flex-1 flex flex-col min-h-0 bg-gray-50 items-center overflow-hidden">
        <div className="w-full max-w-2xl h-full flex flex-col relative">
          
          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
          >
            {messages.map((msg) => (
              msg.sender === 'bot' ? (
                <BotMessage key={msg.id} text={msg.text} />
              ) : (
                <UserMessage key={msg.id} text={msg.text} />
              )
            ))}
            
            {/* Contextual Action Layer */}
            <div className="pt-2">
              {currentStep === Step.TypeSelection && (
                <TypeSelector onSelect={handleTypeSelect} />
              )}
              {currentStep === Step.Description && (
                <DescriptionInput 
                  value={inputDescription}
                  onChange={(val) => {
                    setInputDescription(val);
                    if (!isListening) setPreSpeechValue(val);
                  }}
                  onSubmit={handleDescriptionSubmit}
                  isListening={isListening}
                  onToggleMic={toggleMic}
                  error={speechError}
                />
              )}
              {currentStep === Step.Severity && (
                <SeveritySelector onSelect={handleSeveritySelect} />
              )}
              {currentStep === Step.ImageUpload && (
                <ImageUploader 
                  images={reportData.images}
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  onComplete={handleFinalSubmit}
                />
              )}
            </div>
          </div>

          {/* Contextual Helper Bar (Desktop only or conditional) */}
          <div className="px-6 py-2 bg-white/60 backdrop-blur-sm border-t border-gray-200 hidden md:flex items-center space-x-2 shrink-0">
            <Info size={14} className="text-secondary opacity-40" />
            <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-tight">
              Safety First: Report all incidents regardless of size.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="shrink-0 bg-white border-t border-gray-100 py-3 px-6 flex justify-between items-center z-10">
        <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Safety App v1.0</span>
        <div className="flex space-x-3">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
        </div>
      </footer>

      {showSuccessModal && (
        <SuccessModal data={reportData} onReset={resetReport} />
      )}
    </div>
  );
};

export default ConcernReportingChatBot_gemini;
