import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Camera, Image, X, CheckCircle } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  options?: string[];
  severityOptions?: boolean;
}

interface UploadedImage {
  id: string;
  url: string;
  file: File;
}

const ConcernReportingChatBot_lib: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! What do you want to report today?",
      sender: "bot",
      options: ["Unsafe Act", "Unsafe Condition", "Safe Act"],
    },
  ]);
  const [currentStep, setCurrentStep] = useState<
    "selection" | "description" | "severity" | "images" | "complete"
  >("selection");
  const [selectedConcern, setSelectedConcern] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [savedDescription, setSavedDescription] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showPermissionAlert, setShowPermissionAlert] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  // Use react-speech-recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // Update description when transcript changes
  useEffect(() => {
    if (transcript) {
      setDescription(transcript);
    }
  }, [transcript]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check browser support on mount
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("Browser doesn't support speech recognition.");
    }
  }, [browserSupportsSpeechRecognition]);

  const handleOptionSelect = (option: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: option,
      sender: "user",
    };

    const botMessage: Message = {
      id: messages.length + 2,
      text: `Please describe the "${option}" you noticed:`,
      sender: "bot",
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setSelectedConcern(option);
    setCurrentStep("description");
  };

  const toggleListening = async () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      // Check microphone availability
      if (isMicrophoneAvailable === false) {
        setShowPermissionAlert(true);
        return;
      }

      try {
        // Reset transcript before starting new recording
        resetTranscript();
        await SpeechRecognition.startListening({ 
          continuous: false,
          language: 'en-US' 
        });
        setShowPermissionAlert(false);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setShowPermissionAlert(true);
      }
    }
  };

  const handleSubmitDescription = () => {
    if (!description.trim()) return;

    setSavedDescription(description);

    const userMessage: Message = {
      id: messages.length + 1,
      text: description,
      sender: "user",
    };

    const botMessage: Message = {
      id: messages.length + 2,
      text: `Please select the severity of the concern:`,
      sender: "bot",
      severityOptions: true,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setCurrentStep("severity");
    setDescription("");
    resetTranscript();
  };

  const handleSeveritySelect = (severity: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: severity,
      sender: "user",
    };

    const botMessage: Message = {
      id: messages.length + 2,
      text: `Please attach image/images:`,
      sender: "bot",
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setSelectedSeverity(severity);
    setCurrentStep("images");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: Date.now().toString() + Math.random().toString(),
            url: e.target?.result as string,
            file: file,
          };
          setUploadedImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleOpenGallery = () => {
    fileInputRef.current?.click();
  };

  const handleOpenCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleSubmitReport = () => {
    const newReportId = `RPT-${Date.now()}`;
    setReportId(newReportId);
    
    const formData = {
      concernType: selectedConcern,
      description: savedDescription,
      severity: selectedSeverity,
      images: uploadedImages.map((img) => ({
        name: img.file.name,
        type: img.file.type,
        size: img.file.size,
        lastModified: img.file.lastModified,
      })),
      imageCount: uploadedImages.length,
      timestamp: new Date().toISOString(),
      reportId: newReportId,
    };

    console.log("=== CONCERN REPORT SUBMITTED ===");
    console.log("Form Data:", formData);
    console.log("================================");

    const formDataWithFiles = new FormData();
    formDataWithFiles.append("concernType", selectedConcern);
    formDataWithFiles.append("description", savedDescription);
    formDataWithFiles.append("severity", selectedSeverity);
    formDataWithFiles.append("timestamp", formData.timestamp);
    formDataWithFiles.append("reportId", newReportId);

    uploadedImages.forEach((img, index) => {
      formDataWithFiles.append(`image_${index}`, img.file);
    });

    console.log("FormData object (with files):", formDataWithFiles);
    console.log("================================");

    const userMessage: Message = {
      id: messages.length + 1,
      text:
        uploadedImages.length > 0
          ? `Uploaded ${uploadedImages.length} image${uploadedImages.length > 1 ? "s" : ""}`
          : "No images attached",
      sender: "user",
    };

    const botMessage: Message = {
      id: messages.length + 2,
      text: `Thank you for reporting this ${selectedConcern.toLowerCase()}. Your concern has been submitted with ${selectedSeverity} severity and will be reviewed by our safety team.`,
      sender: "bot",
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setCurrentStep("complete");
    setShowSuccessModal(true);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 1,
        text: "Hi there! What do you want to report today?",
        sender: "bot",
        options: ["Unsafe Act", "Unsafe Condition", "Safe Act"],
      },
    ]);
    setCurrentStep("selection");
    setSelectedConcern("");
    setDescription("");
    setSavedDescription("");
    setSelectedSeverity("");
    setUploadedImages([]);
    setShowSuccessModal(false);
    setReportId(null);
    resetTranscript();
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-teal-50 to-green-50 overflow-hidden">
      <div className="w-full h-full flex flex-col bg-white md:max-w-4xl md:mx-auto md:my-0 md:h-full lg:max-w-5xl xl:max-w-6xl md:shadow-2xl">
        {/* Header - Fixed */}
        <div
          className="shrink-0 text-white p-4 md:p-6 shadow-md"
          style={{ background: "linear-gradient(to right, #254C5A, #1a3840)" }}
        >
          <h1 className="text-xl md:text-2xl font-bold">Concern Reporting Chatbot</h1>
          <p className="text-teal-100 text-xs md:text-sm mt-1">
            Report safety concerns quickly and easily
          </p>
        </div>

        {/* Microphone Permission Alert */}
        {showPermissionAlert && (
          <div className="shrink-0 bg-amber-50 border-l-4 border-amber-500 p-3 md:p-4 mx-3 md:mx-4 mt-3 md:mt-4 rounded-lg">
            <div className="flex items-start">
              <div className="shrink-0">
                <Mic className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Microphone Permission Required
                </h3>
                <div className="mt-2 text-xs md:text-sm text-amber-700">
                  <p>To use voice input, please allow microphone access:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Tap the <strong>address bar</strong> or <strong>lock icon</strong></li>
                    <li>Find <strong>Microphone</strong> permissions</li>
                    <li>Select <strong>Allow</strong></li>
                    <li>Refresh the page if needed</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowPermissionAlert(false)}
                  className="mt-3 text-xs md:text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Browser Support Warning */}
        {!browserSupportsSpeechRecognition && (
          <div className="shrink-0 bg-red-50 border-l-4 border-red-500 p-3 md:p-4 mx-3 md:mx-4 mt-3 md:mt-4 rounded-lg">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Speech Recognition Not Supported
                </h3>
                <div className="mt-2 text-xs md:text-sm text-red-700">
                  <p>Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari for voice input functionality.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] ${message.sender === "user" ? "order-2" : "order-1"}`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                  style={
                    message.sender === "user"
                      ? { backgroundColor: "#8bbb04" }
                      : {}
                  }
                >
                  <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
                </div>

                {/* Options Buttons */}
                {message.options && currentStep === "selection" && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        className="w-full bg-white text-gray-800 px-4 py-3 md:py-3.5 rounded-xl hover:text-white transition-all duration-200 font-medium text-sm md:text-base shadow-sm hover:shadow-md active:scale-95"
                        style={{
                          border: "2px solid #8bbb04",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#8bbb04";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Severity Options */}
                {message.severityOptions && currentStep === "severity" && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {["First Aid", "MTC", "RWC", "LTI", "Fatal"].map(
                      (severity, index) => (
                        <button
                          key={index}
                          onClick={() => handleSeveritySelect(severity)}
                          className={`bg-white px-3 md:px-4 py-3 md:py-3.5 rounded-xl hover:text-white transition-all duration-200 font-medium text-sm md:text-base shadow-sm hover:shadow-md active:scale-95 ${
                            severity === "Fatal"
                              ? "border-red-600 text-red-600 hover:bg-red-600 col-span-2"
                              : "text-gray-800"
                          }`}
                          style={
                            severity === "Fatal"
                              ? { border: "2px solid #dc2626" }
                              : { border: "2px solid #8bbb04" }
                          }
                          onMouseEnter={(e) => {
                            if (severity !== "Fatal") {
                              e.currentTarget.style.backgroundColor = "#8bbb04";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (severity !== "Fatal") {
                              e.currentTarget.style.backgroundColor = "white";
                            }
                          }}
                        >
                          {severity}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        {currentStep === "description" && (
          <div className="shrink-0 border-t border-gray-200 p-3 md:p-4 bg-gray-50 safe-area-bottom">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type your description here or use voice input..."
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-xl focus:outline-none resize-none focus:border-[#8bbb04] outline-none text-sm md:text-base"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#8bbb04";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitDescription();
                    }
                  }}
                />
                {listening && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-2 text-red-600 text-xs font-medium bg-white px-2 py-1 rounded-full shadow-sm">
                    <span className="animate-pulse">●</span>
                    Recording...
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={toggleListening}
                disabled={!browserSupportsSpeechRecognition}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                  listening
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : !browserSupportsSpeechRecognition
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isMicrophoneAvailable === false
                        ? "bg-amber-100 text-amber-700 border-2 border-amber-500"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                title={
                  !browserSupportsSpeechRecognition
                    ? "Speech recognition not supported in this browser"
                    : isMicrophoneAvailable === false
                      ? "Microphone permission denied. Click to see instructions."
                      : listening
                        ? "Stop recording"
                        : "Start voice input"
                }
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
                <span className="text-xs md:text-sm font-medium">
                  {listening
                    ? "Stop"
                    : isMicrophoneAvailable === false
                      ? "Enable Mic"
                      : "Voice"}
                </span>
              </button>
              <button
                onClick={handleSubmitDescription}
                disabled={!description.trim()}
                className="flex-1 flex items-center justify-center gap-2 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base active:scale-95"
                style={{ backgroundColor: "#8bbb04" }}
                onMouseEnter={(e) => {
                  if (description.trim()) {
                    e.currentTarget.style.backgroundColor = "#7aa603";
                  }
                }}
                onMouseLeave={(e) => {
                  if (description.trim()) {
                    e.currentTarget.style.backgroundColor = "#8bbb04";
                  }
                }}
              >
                <Send size={18} />
                <span>Submit</span>
              </button>
            </div>
          </div>
        )}

        {/* Image Upload Area - Fixed at bottom */}
        {currentStep === "images" && (
          <div className="shrink-0 border-t border-gray-200 p-3 md:p-4 bg-gray-50 safe-area-bottom">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="mb-3 md:mb-4 grid grid-cols-3 md:grid-cols-4 gap-2">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Uploaded"
                      className="w-full h-20 md:h-24 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 shadow-lg active:scale-90"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleOpenCamera}
                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-3 md:px-4 py-3 md:py-3.5 rounded-xl hover:text-white transition-all duration-200 font-medium text-sm md:text-base active:scale-95"
                style={{ border: "2px solid #8bbb04" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8bbb04";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <Camera size={20} />
                <span>Camera</span>
              </button>
              <button
                onClick={handleOpenGallery}
                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-3 md:px-4 py-3 md:py-3.5 rounded-xl hover:text-white transition-all duration-200 font-medium text-sm md:text-base active:scale-95"
                style={{ border: "2px solid #8bbb04" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8bbb04";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <Image size={20} />
                <span>Gallery</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitReport}
              className="w-full flex items-center justify-center gap-2 text-white px-4 md:px-6 py-3 md:py-3.5 rounded-xl transition-all duration-200 font-medium shadow-md text-sm md:text-base active:scale-95"
              style={{
                background: "linear-gradient(to right, #8bbb04, #7aa603)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #7aa603, #699502)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #8bbb04, #7aa603)";
              }}
            >
              <Send size={18} />
              <span>Submit Report</span>
            </button>

            {/* Skip Images Option */}
            <button
              onClick={handleSubmitReport}
              className="w-full mt-2 text-gray-600 text-xs md:text-sm hover:text-gray-800 transition-colors duration-200"
            >
              Skip and Submit Without Images
            </button>
          </div>
        )}

        {/* Reset Button - Fixed at bottom */}
        {currentStep === "complete" && (
          <div className="shrink-0 border-t border-gray-200 p-3 md:p-4 bg-gray-50 safe-area-bottom">
            <button
              onClick={handleReset}
              className="w-full text-white px-4 md:px-6 py-3 md:py-3.5 rounded-xl transition-all duration-200 font-medium text-sm md:text-base active:scale-95"
              style={{
                background: "linear-gradient(to right, #8bbb04, #7aa603)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #7aa603, #699502)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #8bbb04, #7aa603)";
              }}
            >
              Report Another Concern
            </button>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="text-center">
                <div
                  className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4"
                  style={{ backgroundColor: "#8bbb04" }}
                >
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Report Submitted!
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  Your concern has been successfully submitted and will be
                  reviewed by our safety team shortly.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-xs md:text-sm text-gray-700">
                    <strong>Report ID:</strong> {reportId}
                  </p>
                  <p className="text-xs md:text-sm text-gray-700 mt-1">
                    <strong>Type:</strong> {selectedConcern}
                  </p>
                  <p className="text-xs md:text-sm text-gray-700 mt-1">
                    <strong>Severity:</strong> {selectedSeverity}
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full text-white px-4 md:px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md text-sm md:text-base active:scale-95"
                  style={{ backgroundColor: "#8bbb04" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#7aa603";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#8bbb04";
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConcernReportingChatBot_lib;