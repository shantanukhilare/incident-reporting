import { useState } from "react";
import Button from "../components/Button";
import DatePicker from "../components/DatePicker";
import Dropdown from "../components/Dropdown";
import RadioButton from "../components/RadioButton";
import PhotoVideoUpload from "../components/PhotoVideoUpload";

function FormPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        birthDate: "",
        country: 0,
        gender: 0,
        experience: 0,
        resume: null as FileList | null,
    });

    const countryOptions = [
        { value: 1, label: "United States" },
        { value: 2, label: "United Kingdom" },
        { value: 3, label: "Canada" },
        { value: 4, label: "Australia" },
        { value: 5, label: "Germany" },
    ];

    const genderOptions = [
        { value: 1, label: "Male" },
        { value: 2, label: "Female" },
        { value: 3, label: "Other" },
        { value: 4, label: "Prefer not to say" },
    ];

    const experienceOptions = [
        { value: 1, label: "Beginner (0-2 years)" },
        { value: 2, label: "Intermediate (3-5 years)" },
        { value: 3, label: "Advanced (6-10 years)" },
        { value: 4, label: "Expert (10+ years)" },
    ];

    const handleInputChange = (field: string, value: string|number|File | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (files: FileList | null) => {
        setFormData(prev => ({ ...prev, resume: files }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        alert("Form Submitted! Check console for data.");
    };

    const onReset = () => {
        setFormData({
            fullName: "",
            email: "",
            birthDate: "",
            country: 0,
            gender: 0,
            experience: 0,
            resume: null,
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-secondary">Registration Form</h2>
            
            <form onSubmit={onSubmit} className="space-y-0">
                {/* Full Name */}
                <div className="form-row">
                    <label className="form-label">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="form-input flex-1"
                        required
                        placeholder="Enter your full name"
                    />
                </div>

                {/* Email */}
                <div className="form-row">
                    <label className="form-label">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="form-input flex-1"
                        required
                        placeholder="your.email@example.com"
                    />
                </div>

                {/* Date Picker */}
                <DatePicker
                    label="Date of Birth"
                    value={formData.birthDate}
                    onChange={(value) => handleInputChange("birthDate", value)}
                    required
                />

                {/* Dropdown */}
                <Dropdown
                    label="Country"
                    options={countryOptions}
                    value={formData.country}
                    onChange={(value) => handleInputChange("country", value)}
                    required
                    placeholder="Select your country"
                />

                {/* Radio Buttons */}
                <RadioButton
                    label="Gender"
                    name="gender"
                    options={genderOptions}
                    value={formData.gender}
                    onChange={(value) => handleInputChange("gender", value)}
                />

                {/* Experience Dropdown */}
                <Dropdown
                    label="Experience Level"
                    options={experienceOptions}
                    value={formData.experience}
                    onChange={(value) => handleInputChange("experience", value)}
                    required
                    placeholder="Select your experience level"
                />

                {/* File Upload */}
                <PhotoVideoUpload
                    label="Upload Resume/CV"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleFileChange}
                    required
                />

                {/* Buttons */}
                <div className="flex gap-4 pt-6 justify-end">
                    <Button
                        onClick={onReset}
                        label="Reset"
                        className="teqo-button-secondary"
                    />
                    <button
                        type="submit"
                        className="teqo-button"
                        onClick={(e) => {
                            e.preventDefault();
                            onSubmit(e);
                        }}
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FormPage;