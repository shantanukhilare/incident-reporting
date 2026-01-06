import { useState } from "react";
import Dropdown from "../components/Dropdown";
import DatePicker from "../components/DatePicker";
import Button from "../components/Button";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import PhotoUpload from "../components/PhotoUpload";

export interface ConcernFormData {
  siteName: string;
  name: string;
  category: number;
  dateOfIdentification: string;
  severity: number;
  observationDetails: string;
  location: string;
  actionTaken: string;
  responsibility: string;
  status: string;
  targetClosureDate: string;
  actualClosureDate: string;
  numberOfDays: number;
  attachment: FileList | null;
  photo: File | null;
  remarks: string;
}

interface ConcernFormErrors {
  siteName?: string;
  name?: string;
  category?: string;
  dateOfIdentification?: string;
  severity?: string;
  observationDetails?: string;
  location?: string;
  actionTaken?: string;
  responsibility?: string;
  status?: string;
  targetClosureDate?: string;
  actualClosureDate?: string;
  numberOfDays?: string;
  attachment?: string;
  photo?: string;
  remarks?: string;
}

export default function CreateConcernReport() {
  const initialFormData: ConcernFormData = {
    siteName: "",
    name: "",
    category: 0,
    dateOfIdentification: "",
    severity: 0,
    observationDetails: "",
    location: "",
    actionTaken: "",
    responsibility: "",
    status: "",
    targetClosureDate: "",
    actualClosureDate: "",
    numberOfDays: 0,
    attachment: null,
    photo: null,
    remarks: "",
  };

  const [formData, setFormData] = useState<ConcernFormData>(initialFormData);
  const [errors, setErrors] = useState<ConcernFormErrors>({});

  const onSubmit = () => {
    console.log("Concern Form Data:", formData);
    toast.success("Form submitted successfully!");

    setFormData(initialFormData);
    setErrors({});
  };

  const onClear = () => {
    setFormData(initialFormData);
    setErrors({});    
  };

  const categoryOptions = [
    { value: 1, label: "Category 1" },
    { value: 2, label: "Category 2" },
    { value: 3, label: "Category 3" },
    { value: 4, label: "Category 4" },
    { value: 5, label: "Category 5" },
  ];

  const severityOptions = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
    { value: 4, label: "Critical" },
  ];

  const handleInputChange = (
    field: keyof ConcernFormData,
    value: string | number | File | FileList | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold mb-8 text-secondary">
        Create Concern Report
      </h2>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        <div className="form-row">
          <label className="form-label">
            Site Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            // value={formData.siteName}
            value="Enfinity_20_TS_IN"
            readOnly
            className={`form-input flex-1 cursor-not-allowed bg-slate-200 ${
              errors.siteName ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Site Name"
          />
        </div>
        {/* <div className="form-row">
          <label className="form-label">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`form-input flex-1 ${
              errors.name ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Full Name"
          />
        </div> */}

        <Dropdown
          label="Category"
          options={categoryOptions}
          value={formData.category}
          onChange={(value) => handleInputChange("category", value)}
          required
        />
        <DatePicker
          label="Date of Identification"
          value={formData.dateOfIdentification}
          onChange={(value) => handleInputChange("dateOfIdentification", value)}
          required
        />
        <Dropdown
          label="Severity"
          options={severityOptions}
          value={formData.severity}
          onChange={(value) => handleInputChange("severity", value)}
          required
          placeholder="Select Severity"
        />
        <div className="form-row">
          <label className="form-label">
            Observation Details <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.observationDetails}
            onChange={(e) =>
              handleInputChange("observationDetails", e.target.value)
            }
            className={`form-input flex-1 ${
              errors.observationDetails ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Observation Details"
          />
        </div>
        <div className="form-row">
          <label className="form-label">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className={`form-input flex-1 ${
              errors.location ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Location"
          />
        </div>
        <div className="form-row">
          <label className="form-label">
            Action Taken <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.actionTaken}
            onChange={(e) => handleInputChange("actionTaken", e.target.value)}
            className={`form-input flex-1 ${
              errors.actionTaken ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Action Taken"
          />
        </div>
        <div className="form-row">
          <label className="form-label">
            Responsibility <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.responsibility}
            onChange={(e) =>
              handleInputChange("responsibility", e.target.value)
            }
            className={`form-input flex-1 ${
              errors.responsibility ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Responsibility"
          />
        </div>
        <div className="form-row">
          <label className="form-label">
            Status <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className={`form-input flex-1 ${
              errors.status ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Status"
          />
        </div>
        <DatePicker
          label="Target Closure Date"
          value={formData.targetClosureDate}
          onChange={(value) => handleInputChange("targetClosureDate", value)}
          required
        />
        <DatePicker
          label="Date of Actual Closure"
          value={formData.actualClosureDate}
          onChange={(value) => handleInputChange("actualClosureDate", value)}
          required
        />
        <div className="form-row">
          <label className="form-label">
            Number of Days <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.numberOfDays}
            onChange={(e) => handleInputChange("numberOfDays", e.target.value)}
            className={`form-input flex-1 ${
              errors.numberOfDays ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Number of Days"
          />
        </div>
        <div className="form-row">
          <label className="form-label">
            Remarks <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.remarks}
            onChange={(e) => handleInputChange("remarks", e.target.value)}
            className={`form-input flex-1 ${
              errors.remarks ? "border-red-500" : ""
            }`}
            required
            placeholder="Enter Remarks"
          />
        </div>
        <PhotoUpload
          label="Upload Photos/Videos"
          value={formData.attachment}
          onChange={(newFiles) => setFormData({...formData, attachment: newFiles})}
          multiple
          required
        />
        
      </form>
      <div className="flex justify-center items-center">
        <span>Not signed in?</span>
          <Link to="/auth" className="text-blue-700 underline">Authenticate Email</Link>
      </div>
      <div className="flex items-center justify-center">
        <Button
          onClick={onSubmit}
          label="Submit"
          className="mt-4 teqo-button-secondary"
          ></Button>
        <Button
          onClick={onClear}
          label="Clear"
          className="mt-4 teqo-button ml-4"
          ></Button>
        </div>

    </div>
  );
}
