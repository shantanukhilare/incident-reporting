import React, { useState, useRef, useEffect } from "react";
import { Upload, X, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import logo from "../assets/teqo_logo.png";
// TODO: Update your imports to include the new submit function
import { categoryDropdownOptions, severityDropdownOptions, submitConcernReport, getToken, setAuthToken } from "../services/ConcernReportService";

// --- Types ---
interface ApiOption {
  id: number;
  name: string;
}

interface FormData {
  siteName: string;
  siteId: number | ""; // Added siteId to match the API payload
  concernType: number | "";
  description: string;
  location: string;
  severity: number | "";
  date: string;
  name: string;
  email: string;
}

interface FormErrors {
  [key: string]: string;
}

interface PhotoPreview {
  file: File;
  previewUrl: string;
}

export default function ConcernReportingForm() {
  // --- API State ---
  const [categories, setCategories] = useState<ApiOption[]>([]);
  const [severities, setSeverities] = useState<ApiOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(true); // New state to hide form until token loads

  // --- Form State ---
  const [formData, setFormData] = useState<FormData>({
    siteName: "20MW ES SUN POWER PVT LTD",
    siteId: "", // This will be set from the URL code
    concernType: "",
    description: "",
    location: "",
    severity: "",
    date: "",
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Fetching & Auth ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Extract the 'name' code from the URL (e.g., ?name=MjBNVy...)
        const queryParams = new URLSearchParams(window.location.search);
        const encodedCode = queryParams.get("name");
        const encodedSiteId = queryParams.get("id");

        if (encodedCode) {
          // Decode the Base64 string to use as the Site Name
          try {
            const decodedSiteName = atob(encodedCode);
            const decodedSiteId = atob(encodedSiteId || ""); // Decode site ID as well
            setFormData(prev => ({ ...prev, siteName: decodedSiteName }));
            if (decodedSiteId) {
              setFormData(prev => ({ ...prev, siteId: Number(decodedSiteId) }));
            }
          } catch (e) {
            console.error("Could not decode site name", e);
          }

          // Fetch the Auth Token
          const code = 'dGVxb09TXyVDUiVfdG9rZW4qJA=='; // This should ideally come from the URL or a secure source
          const tokenResponse = await getToken(code);
          
          // Assuming your API returns a raw token string, or adjust to tokenResponse.token
          const actualToken = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;
          
          if (actualToken) {
            setAuthToken(actualToken); // Tells Axios to use this for all future calls
          }
        }

        // 2. Fetch Dropdowns (Now authenticated!)
        const fetchedCategories = await categoryDropdownOptions();
        const fetchedSeverities = await severityDropdownOptions();

        setCategories(fetchedCategories?.length ? fetchedCategories : [
          { id: 1, name: "UNSAFE ACT" },
          { id: 2, name: "UNSAFE CONDITION" },
          { id: 3, name: "SAFE ACT" }
        ]);
        
        setSeverities(fetchedSeverities?.length ? fetchedSeverities : [
          { id: 1, name: "First Aid" },
          { id: 2, name: "MTC" },
          { id: 4, name: "LTI" },
          { id: 5, name: "Fatal" },
          { id: 3, name: "RWC" }
        ]);

      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsLoadingApp(false); // Stop loading screen
      }
    };

    initializeApp();
  }, []);

  // --- Helpers ---
  // Converts an image File to a Base64 string for the API payload
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = name === "severity" && value !== "" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTypeToggle = (id: number) => {
    setFormData((prev) => ({ ...prev, concernType: id }));
    if (errors.concernType) setErrors((prev) => ({ ...prev, concernType: "" }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const validPhotos: PhotoPreview[] = [];
    let errorMessage = "";

    newFiles.forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        errorMessage = "Some files exceed the 3MB limit.";
      } else if (validPhotos.length + photos.length < 3) {
        validPhotos.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      } else {
        errorMessage = "Maximum 3 photos allowed.";
      }
    });

    if (errorMessage) {
      setErrors((prev) => ({ ...prev, photos: errorMessage }));
    } else {
      setErrors((prev) => ({ ...prev, photos: "" }));
    }

    setPhotos((prev) => [...prev, ...validPhotos].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[indexToRemove].previewUrl);
      newPhotos.splice(indexToRemove, 1);
      return newPhotos;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.siteName.trim()) newErrors.siteName = "Site Name is required";
    if (formData.concernType === "") newErrors.concernType = "Please select a type of concern";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.severity === "") newErrors.severity = "Severity Level is required";
    if (!formData.date) newErrors.date = "Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Convert all photos to Base64
      const base64Photos = await Promise.all(photos.map(p => fileToBase64(p.file)));
      
      // 2. Find the string name for the selected category
      const selectedCategoryName = categories.find(c => c.id === formData.concernType)?.name || "";

      // 3. Build the exact payload required by the API
      const apiPayload = {
        siteid: Number(formData.siteId), // Hardcoded per your payload example
        concerntype: selectedCategoryName,
        reportername: formData.name,
        repoteremail: formData.email,
        reporteddate: new Date(formData.date).toISOString(), // Converts to '2026-03-06T...'
        concerndescription: formData.description,
        location: formData.location,
        seviertyid: Number(formData.severity),
        categoryid: Number(formData.concernType),
        statusid: 1, // Hardcoded per your payload example
        concernReportingPhotos1: base64Photos[0] || "",
        concernReportingPhotos2: base64Photos[1] || "",
        concernReportingPhotos3: base64Photos[2] || ""
      };

      console.log("Sending Payload:", apiPayload);

      // 4. Send to backend
      await submitConcernReport(apiPayload);
      
      // 5. Show Success Screen
      setIsSubmitted(true);

    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit the report. Please try again."); // Simple fallback error message
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingApp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#8bbb04] animate-spin" />
          <p className="text-gray-600 font-medium">Loading form details...</p>
        </div>
      </div>
    );
  }

  // --- Success View ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-12 mx-auto relative">
          <div className="h-2 w-full bg-[#8bbb04] absolute top-0 left-0" />
          <CheckCircle2 className="w-20 h-20 text-[#8bbb04] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted</h2>
          <p className="text-gray-600 mb-8">
            Thank you for reporting this concern. Your vigilance helps keep our sites safe.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setPhotos([]);
              setFormData((prev) => ({
                ...prev,
                concernType: "",
                description: "",
                location: "",
                severity: "",
                date: "",
                name: "",
                email: "",
              }));
            }}
            className="px-6 py-3 bg-[#254C5A] hover:bg-[#1a3a47] text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  // --- Form View ---
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl relative overflow-hidden">
        {/* Top Accent Stripe */}
        <div className="h-2 w-full bg-[#8bbb04]" />

        {/* Header & Logo */}
        <div className="pt-8 pb-6 px-8 text-center flex justify-between items-center gap-4">
          <img className="h-20" src={logo} alt="Logo" />
          <h2 className="text-3xl font-bold text-secondary">Concern Reporting</h2>
        </div>

        <hr className="border-gray-200" />

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* 1. Site Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Site Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="siteName"
              readOnly
              value={formData.siteName}
              onChange={handleInputChange}
              className={`w-full bg-gray-50 border ${errors.siteName ? "border-red-500" : "border-gray-200"} rounded-lg px-4 py-3 outline-none text-secondary ring-2 ring-[#8bbb04] border-transparent transition-all`}
            />
            {errors.siteName && <p className="text-red-500 text-sm mt-1">{errors.siteName}</p>}
          </div>

          {/* 2. Type of Concern */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type of Concern <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleTypeToggle(cat.id)}
                  className={`flex-1 min-w-[120px] cursor-pointer py-2.5 px-4 rounded-full text-sm font-bold transition-all border ${
                    formData.concernType === cat.id
                      ? "bg-[#254C5A] border-[#254C5A] text-white shadow-md"
                      : "bg-white border-gray-300 text-gray-600 hover:border-[#8bbb04] hover:text-[#8bbb04]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {errors.concernType && <p className="text-red-500 text-sm mt-1">{errors.concernType}</p>}
          </div>

          {/* 3. Concern Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Concern Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter Description"
              className={`w-full bg-gray-50 border ${errors.description ? "border-red-500" : "border-gray-200"} rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all resize-y`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Row: Location Details & Severity Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* 4. Location Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location Details</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location details"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all"
              />
            </div>

            {/* 5. Severity Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Severity Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className={`w-full appearance-none bg-gray-50 border ${errors.severity ? "border-red-500" : "border-gray-200"} rounded-lg px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all cursor-pointer`}
                >
                  <option value="" disabled>Select Severity Level</option>
                  {severities.map((sev) => (
                    <option key={sev.id} value={sev.id}>
                      {sev.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>
              {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity}</p>}
            </div>

          </div>

          {/* 6. Upload Photos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Photos</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#8bbb04] hover:bg-gray-50 transition-all"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-600">JPG, JPEG, PNG</span>
              <span className="text-xs text-gray-400 mt-1">Max 3 files (Under 3MB each)</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/jpeg, image/png, image/jpg"
                multiple
                className="hidden"
              />
            </div>
            {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}

            {/* Thumbnails */}
            {photos.length > 0 && (
              <div className="flex gap-4 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img src={photo.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Date of Concern */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Date of Concern <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full bg-gray-50 border ${errors.date ? "border-red-500" : "border-gray-200"} rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all cursor-pointer`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 8. Your Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all"
              />
            </div>

            {/* 9. Email Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 bg-[#254C5A] text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-gray-200/50 outline-none focus:ring-4 focus:ring-[#8bbb04]/30 flex items-center justify-center gap-2 ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:bg-[#1a3a47] cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}