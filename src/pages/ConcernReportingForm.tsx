import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/teqo_logo.png";
import {
  X,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// TODO: Update your imports to include the new submit function
import {
  categoryDropdownOptions,
  severityDropdownOptions,
  submitConcernReport,
  getToken,
  setAuthToken,
} from "../services/ConcernReportService";

// --- Types ---
interface ApiOption {
  id: number;
  name: string;
}

interface FormData {
  siteName: string;
  siteId: number | "";
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
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  // --- Form State ---
  const [formData, setFormData] = useState<FormData>({
    siteName: "20MW ES SUN POWER PVT LTD",
    siteId: "",
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
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // --- Data Fetching & Auth ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const encodedCode = queryParams.get("name");
        const encodedSiteId = queryParams.get("id");

        if (encodedCode) {
          try {
            const decodedSiteName = atob(encodedCode);
            const decodedSiteId = atob(encodedSiteId || "");
            setFormData((prev) => ({ ...prev, siteName: decodedSiteName }));
            if (decodedSiteId) {
              setFormData((prev) => ({
                ...prev,
                siteId: Number(decodedSiteId),
              }));
            }
          } catch (e) {
            console.error("Could not decode site name", e);
          }

          const code = "dGVxb09TXyVDUiVfdG9rZW4qJA==";
          const tokenResponse = await getToken(code);

          const actualToken =
            typeof tokenResponse === "string"
              ? tokenResponse
              : tokenResponse?.token;

          if (actualToken) {
            setAuthToken(actualToken);
          }
        }

        const fetchedCategories = await categoryDropdownOptions();
        const fetchedSeverities = await severityDropdownOptions();

        setCategories(
          fetchedCategories?.length
            ? fetchedCategories
            : [
                { id: 1, name: "UNSAFE ACT" },
                { id: 2, name: "UNSAFE CONDITION" },
                { id: 3, name: "SAFE ACT" },
              ],
        );

        setSeverities(
          fetchedSeverities?.length
            ? fetchedSeverities
            : [
                { id: 1, name: "First Aid" },
                { id: 2, name: "MTC" },
                { id: 4, name: "LTI" },
                { id: 5, name: "Fatal" },
                { id: 3, name: "RWC" },
              ],
        );
      } catch (error) {
        console.error("Failed to initialize app:", error);
        toast.error("Failed to load initial data.");
      } finally {
        setIsLoadingApp(false);
      }
    };

    initializeApp();
  }, []);

  // --- Helpers ---
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "severity" && value !== "" ? Number(value) : value;
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
    let hasWarning = false;

    newFiles.forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        errorMessage = "Some files exceed the 3MB limit.";
        if (!hasWarning) toast.error(errorMessage);
        hasWarning = true;
      } else if (validPhotos.length + photos.length < 3) {
        validPhotos.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      } else {
        errorMessage = "Maximum 3 photos allowed.";
        if (!hasWarning) toast.warning(errorMessage);
        hasWarning = true;
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    });

    if (errorMessage) {
      setErrors((prev) => ({ ...prev, photos: errorMessage }));
    } else {
      setErrors((prev) => ({ ...prev, photos: "" }));
    }

    setPhotos((prev) => [...prev, ...validPhotos].slice(0, 3));
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
    if (formData.concernType === "")
      newErrors.concernType = "Please select a type of concern";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.severity === "")
      newErrors.severity = "Severity Level is required";
    if (!formData.date) newErrors.date = "Date is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill in all required fields.");
      // Auto-scroll to top so user sees the errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const base64Photos = await Promise.all(
        photos.map((p) => fileToBase64(p.file)),
      );

      const selectedCategoryName =
        categories.find((c) => c.id === formData.concernType)?.name || "";

      const apiPayload = {
        siteid: Number(formData.siteId),
        concerntype: selectedCategoryName,
        reportername: formData.name,
        repoteremail: formData.email,
        reporteddate: new Date(formData.date).toISOString(),
        concerndescription: formData.description,
        location: formData.location,
        seviertyid: Number(formData.severity),
        categoryid: Number(formData.concernType),
        statusid: 1,
        concernReportingPhotos1: base64Photos[0] || "",
        concernReportingPhotos2: base64Photos[1] || "",
        concernReportingPhotos3: base64Photos[2] || "",
      };

      await submitConcernReport(apiPayload);

      toast.success("Report submitted successfully!");
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit the report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingApp) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg">
          <Loader2 className="w-10 h-10 text-[#8bbb04] animate-spin" />
          <p className="text-gray-600 font-medium text-center">Loading form details...</p>
        </div>
      </div>
    );
  }

  // --- Success View ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-4 md:py-12 flex items-center justify-center">
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8 md:p-12 relative">
          <div className="h-2 w-full bg-[#8bbb04] absolute top-0 left-0" />
          <CheckCircle2 className="w-20 h-20 text-[#8bbb04] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Report Submitted
          </h2>
          <p className="text-gray-600 mb-8 text-sm md:text-base">
            Thank you for reporting this concern. Your vigilance helps keep our
            sites safe.
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
            className="w-full md:w-auto px-6 py-4 md:py-3 bg-secondary hover:bg-[#1a3a47] text-white font-bold rounded-xl transition-colors cursor-pointer text-lg md:text-base active:scale-95"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  // --- Form View ---
  return (
    <div className="min-h-screen bg-gray-100 py-4 px-2 md:py-12 md:px-4 flex flex-col items-center">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
      
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl relative overflow-hidden mb-8">
        {/* Top Accent Stripe */}
        <div className="h-2 w-full bg-[#8bbb04]" />

        {/* Header & Logo - Adjusted for mobile scale */}
        <div className="pt-6 pb-4 px-4 md:pt-8 md:pb-6 md:px-8 flex items-center justify-between gap-3">
          <img className="h-12 md:h-20 object-contain" src={logo} alt="Logo" />
          <h2 className="text-xl md:text-3xl font-bold text-secondary text-right leading-tight">
            Concern<br className="md:hidden"/> Reporting
          </h2>
        </div>

        <hr className="border-gray-100" />

        {/* Form Body - Tighter padding on mobile */}
        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-5 md:space-y-6">
          {/* 1. Site Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Site Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="siteName"
              readOnly
              value={formData.siteName}
              onChange={handleInputChange}
              className={`w-full bg-gray-50 border ${errors.siteName ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 md:py-3.5 outline-none text-base text-secondary ring-2 ring-[#8bbb04] border-transparent transition-all`}
            />
            {errors.siteName && (
              <p className="text-red-500 text-sm mt-1">{errors.siteName}</p>
            )}
          </div>

          {/* 2. Type of Concern */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type of Concern <span className="text-red-500">*</span>
            </label>
            {/* Switched to a grid on mobile to prevent awkward wrapping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleTypeToggle(cat.id)}
                  className={`w-full cursor-pointer py-3 md:py-3.5 px-3 rounded-xl text-sm md:text-base font-bold transition-all border active:scale-95 ${
                    formData.concernType === cat.id
                      ? "bg-[#254C5A] border-[#254C5A] text-white shadow-md"
                      : "bg-white border-gray-300 text-gray-600 hover:border-[#8bbb04] hover:text-[#8bbb04]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {errors.concernType && (
              <p className="text-red-500 text-sm mt-1">{errors.concernType}</p>
            )}
          </div>

          {/* 3. Concern Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Concern Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter details of the concern..."
              className={`w-full bg-gray-50 border ${errors.description ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 md:py-3.5 outline-none text-base focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all resize-y`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Row: Location Details & Severity Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {/* 4. Location Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Location Details
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Where did this happen?"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 md:py-3.5 outline-none text-base focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all"
              />
            </div>

            {/* 5. Severity Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Severity Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className={`w-full appearance-none bg-gray-50 border ${errors.severity ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 md:py-3.5 pr-10 outline-none text-base focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all cursor-pointer`}
                >
                  <option value="" disabled>
                    Select Severity
                  </option>
                  {severities.map((sev) => (
                    <option key={sev.id} value={sev.id}>
                      {sev.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              </div>
              {errors.severity && (
                <p className="text-red-500 text-sm mt-1">{errors.severity}</p>
              )}
            </div>
          </div>

          {/* 6. Upload Photos */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Photos 
              <span className="block sm:inline text-gray-500 font-normal text-xs sm:ml-2 mt-0.5 sm:mt-0">
                (Max 3 files, under 3MB each)
              </span>
            </label>
            
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/jpeg, image/png, image/jpg"
              multiple
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handlePhotoUpload}
              accept="image/jpeg, image/png, image/jpg"
              capture="environment" 
              multiple
              className="hidden"
            />

            {/* Upload Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-white text-gray-800 px-2 py-3 md:py-4 rounded-xl hover:text-white transition-all duration-200 font-medium text-sm cursor-pointer group shadow-sm active:scale-95"
                style={{ border: "2px solid #8bbb04" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8bbb04"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
              >
                <Camera size={22} className="text-[#8bbb04] group-hover:text-white transition-colors" />
                <span>Take Photo</span>
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col sm:flex-row items-center justify-center gap-2 bg-white text-gray-800 px-2 py-3 md:py-4 rounded-xl hover:text-white transition-all duration-200 font-medium text-sm cursor-pointer group shadow-sm active:scale-95"
                style={{ border: "2px solid #8bbb04" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#8bbb04"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
              >
                <ImageIcon size={22} className="text-[#8bbb04] group-hover:text-white transition-colors" />
                <span>Gallery</span>
              </button>
            </div>
            
            {errors.photos && <p className="text-red-500 text-sm mt-2 font-medium">{errors.photos}</p>}

            {/* Thumbnails */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm group">
                    <img src={photo.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600/90 text-white rounded-full p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 shadow-md cursor-pointer hover:bg-red-700 active:scale-90"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Date of Concern */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Date of Concern <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full bg-gray-50 border ${errors.date ? "border-red-500" : "border-gray-200"} rounded-xl px-4 py-3 md:py-3.5 outline-none text-base focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all cursor-pointer`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {/* 8. Your Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 md:py-3.5 outline-none text-base focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all"
              />
            </div>

            {/* 9. Email Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-gray-400 font-normal text-xs">(Optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 md:py-3.5 outline-none text-base focus:ring-2 focus:ring-[#8bbb04] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 bg-[#254C5A] text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-[#254C5A]/30 outline-none focus:ring-4 focus:ring-[#8bbb04]/40 flex items-center justify-center gap-2 active:scale-[0.98] ${
                isSubmitting
                  ? "opacity-80 cursor-not-allowed"
                  : "hover:bg-[#1a3a47] cursor-pointer hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Submitting Report...
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