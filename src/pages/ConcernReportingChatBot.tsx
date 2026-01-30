import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Camera, Image, X, CheckCircle } from "lucide-react";

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

const ConcernReportingChatbot: React.FC = () => {
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
  const [savedDescription, setSavedDescription] = useState<string>(""); // Permanently store description
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<
    "granted" | "denied" | "prompt" | "checking"
  >("checking");
  const [showPermissionAlert, setShowPermissionAlert] =
    useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          setMicPermission(result.state as "granted" | "denied" | "prompt");

          // Listen for permission changes
          result.onchange = () => {
            setMicPermission(result.state as "granted" | "denied" | "prompt");
          };
        } else {
          // Permissions API not supported, assume prompt
          setMicPermission("prompt");
        }
      } catch (error) {
        console.log("Permission check not supported:", error);
        setMicPermission("prompt");
      }
    };

    checkMicrophonePermission();

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription((prev) => prev + (prev ? " " : "") + transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        if (
          event.error === "not-allowed" ||
          event.error === "permission-denied"
        ) {
          setMicPermission("denied");
          setShowPermissionAlert(true);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOptionSelect = (option: string) => {
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: option,
      sender: "user",
    };

    // Add bot response
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
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Check permission status before starting
      if (micPermission === "denied") {
        setShowPermissionAlert(true);
        return;
      }

      try {
        // Request microphone access
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission("granted");
        recognitionRef.current.start();
        setIsListening(true);
        setShowPermissionAlert(false);
      } catch (error: any) {
        console.error("Microphone access error:", error);
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setMicPermission("denied");
          setShowPermissionAlert(true);
        } else {
          alert(
            "Could not access microphone. Please check your browser settings.",
          );
        }
      }
    }
  };

  const handleSubmitDescription = () => {
    if (!description.trim()) return;

    // Save description permanently before clearing the input
    setSavedDescription(description);

    // Add user description message
    const userMessage: Message = {
      id: messages.length + 1,
      text: description,
      sender: "user",
    };

    // Add severity selection message
    const botMessage: Message = {
      id: messages.length + 2,
      text: `Please select the severity of the concern:`,
      sender: "bot",
      severityOptions: true,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setCurrentStep("severity");
    
    // Now clear the input field
    setDescription("");
  };

  const handleSeveritySelect = (severity: string) => {
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: severity,
      sender: "user",
    };

    // Add bot response
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

    // Reset input
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
    // Create form data object using savedDescription
    const newReportId = `RPT-${Date.now()}`;
    setReportId(newReportId);
    
    const formData = {
      concernType: selectedConcern,
      description: savedDescription, // Use the saved description here
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

    // Log form data to console
    console.log("=== CONCERN REPORT SUBMITTED ===");
    console.log("Form Data:", formData);
    console.log("================================");

    // If you need to send actual image files, create FormData
    const formDataWithFiles = new FormData();
    formDataWithFiles.append("concernType", selectedConcern);
    formDataWithFiles.append("description", savedDescription); // Use saved description
    formDataWithFiles.append("severity", selectedSeverity);
    formDataWithFiles.append("timestamp", formData.timestamp);
    formDataWithFiles.append("reportId", newReportId);

    uploadedImages.forEach((img, index) => {
      formDataWithFiles.append(`image_${index}`, img.file);
    });

    console.log("FormData object (with files):", formDataWithFiles);
    console.log("================================");

    // Add user message with image count
    const userMessage: Message = {
      id: messages.length + 1,
      text:
        uploadedImages.length > 0
          ? `Uploaded ${uploadedImages.length} image${uploadedImages.length > 1 ? "s" : ""}`
          : "No images attached",
      sender: "user",
    };

    // Add confirmation message
    const botMessage: Message = {
      id: messages.length + 2,
      text: `Thank you for reporting this ${selectedConcern.toLowerCase()}. Your concern has been submitted with ${selectedSeverity} severity and will be reviewed by our safety team.`,
      sender: "bot",
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setCurrentStep("complete");

    // Show success modal
    setShowSuccessModal(true);

    // Don't clear images yet, wait for reset
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
    setSavedDescription(""); // Clear saved description
    setSelectedSeverity("");
    setUploadedImages([]);
    setShowSuccessModal(false);
    setReportId(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-green-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div
          className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-6"
          style={{ background: "linear-gradient(to right, #254C5A, #1a3840)" }}
        >
          <h1 className="text-2xl font-bold">Concern Reporting Chatbot</h1>
          <p className="text-teal-100 text-sm mt-1">
            Report safety concerns quickly and easily
          </p>
        </div>

        {/* Microphone Permission Alert */}
        {showPermissionAlert && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 m-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Mic className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Microphone Permission Required
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>To use voice input, please allow microphone access:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>
                      Tap the <strong>address bar</strong> or{" "}
                      <strong>lock icon</strong>
                    </li>
                    <li>
                      Find <strong>Microphone</strong> permissions
                    </li>
                    <li>
                      Select <strong>Allow</strong>
                    </li>
                    <li>Refresh the page if needed</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowPermissionAlert(false)}
                  className="mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${message.sender === "user" ? "order-2" : "order-1"}`}
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
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>

                {/* Options Buttons */}
                {message.options && currentStep === "selection" && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        className="w-full bg-white text-gray-800 px-4 py-3 rounded-xl hover:text-white transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
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
                          className={`bg-white px-4 py-3 rounded-xl hover:text-white transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md ${
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

        {/* Input Area */}
        {currentStep === "description" && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type your description here or use voice input..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none resize-none focus:border-[#8bbb04] outline-none"
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
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isListening
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : micPermission === "denied"
                      ? "bg-amber-100 text-amber-700 border-2 border-amber-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                title={
                  micPermission === "denied"
                    ? "Microphone permission denied. Click to see instructions."
                    : micPermission === "prompt"
                      ? "Click to request microphone permission"
                      : isListening
                        ? "Stop recording"
                        : "Start voice input"
                }
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                <span className="text-sm font-medium">
                  {isListening
                    ? "Stop"
                    : micPermission === "denied"
                      ? "Enable Mic"
                      : "Voice Input"}
                </span>
              </button>
              <button
                onClick={handleSubmitDescription}
                disabled={!description.trim()}
                className="flex-1 flex items-center justify-center gap-2 text-white px-6 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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

        {/* Image Upload Area */}
        {currentStep === "images" && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
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
              <div className="mb-4 grid grid-cols-3 gap-2">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Uploaded"
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
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
                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-4 py-3 rounded-xl hover:text-white transition-all duration-200 font-medium"
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
                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-4 py-3 rounded-xl hover:text-white transition-all duration-200 font-medium"
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
              className="w-full flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md"
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
              className="w-full mt-2 text-gray-600 text-sm hover:text-gray-800 transition-colors duration-200"
            >
              Skip and Submit Without Images
            </button>
          </div>
        )}

        {/* Reset Button */}
        {currentStep === "complete" && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={handleReset}
              className="w-full text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium"
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Report Submitted!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your concern has been successfully submitted and will be
                  reviewed by our safety team shortly.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-gray-700">
                    <strong>Report ID:</strong> {reportId}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Type:</strong> {selectedConcern}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Severity:</strong> {selectedSeverity}
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md"
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

export default ConcernReportingChatbot;