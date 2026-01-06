import { useState } from "react";
import { toast } from "react-toastify";
// import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import { useNavigate } from "react-router-dom";
import { MdVerified } from "react-icons/md";

export default function AuthPage() {
  const [formData, setFormData] = useState({
    email: "shantanu.khilare.16@gmail.com",
    firstName: "",
    lastName: "",
    otp: "123456",
    siteMember: 0,
    type: 0,
  });

  const [errors, setErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
    otp: "",
    siteMember: "",
    type: "",
  });
  const nav = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  // const timerIntervalRef = useRef<number | null>(null);

  const siteMemberOptions = [
    { value: 1, label: "Site Member" },
    { value: 2, label: "Visitor" },
    { value: 3, label: "Site Incharge" },
  ];

  const typeOptions = [
    { value: 1, label: "Concern Report" },
    { value: 2, label: "Incident" },
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (
    field: string,
    value: string | number | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSendOTP = () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      toast.error("Please enter an email address");
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      toast.error("Please enter a valid email address");
      return;
    }

    // Simulate sending OTP
    toast.success(`OTP sent to ${formData.email}`);
    setOtpSent(true);
    // setTimer(60); // 5 minutes = 300 seconds
    // setIsResendDisabled(true);
    setErrors((prev) => ({ ...prev, email: "" }));
  };

  const handleVerifyOTP = () => {
    if (formData.otp === "123456") {
      // Simulated correct OTP
      toast.success("OTP verified successfully!");
      setIsVerified(true);
      setIsEmailVerified(true);
    } else {
      //   setErrors((prev) => ({ ...prev, otp: "Invalid OTP. Please try again." }));
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      firstName: "",
      lastName: "",
      otp: "",
      siteMember: "",
      type: "",
    };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!otpSent) {
      newErrors.otp = "Please send OTP first";
      isValid = false;
    } else if (!formData.otp) {
      newErrors.otp = "OTP is required";
      isValid = false;
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
      isValid = false;
    } 
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.siteMember) {
      newErrors.siteMember = "Please select a designation";
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = "Please select a type";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onSubmit = (e: React.FormEvent) => {
    console.warn("called on submit");
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    console.log("Auth Form Data:", formData);
    toast.success("Authentication successfully!");

    // Reset form after successful submission
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      otp: "",
      siteMember: 0,
      type: 0,
    });
    setErrors({
      email: "",
      firstName: "",
      lastName: "",
      otp: "",
      siteMember: "",
      type: "",
    });
    setOtpSent(false);
    // setTimer(0);
    // setIsResendDisabled(false);
    nav("/concern-report");
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-secondary">
        User Authentication
      </h2>

      <div  className="space-y-0">
        {!isEmailVerified ? (
          <>
            <div className="form-row">
              <label className="form-label">
                Enter Email <span className="text-red-500">*</span>
              </label>
              <div className="flex-1 flex flex-col gap-1 w-full">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`form-input flex-1 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    placeholder="Enter your email address"
                    disabled={otpSent}
                  />
                    <button
                      onClick={handleSendOTP}
                      className="teqo-button-secondary whitespace-nowrap"
                    >
                      Send OTP
                      </button>
                  {/* )} */}
                </div>

                {errors.email && (
                  <span className="text-red-500 text-xs ml-1">
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            {otpSent && (
              <div className="form-row">
                <label className="form-label">
                  Enter OTP <span className="text-red-500">*</span>
                </label>

                <div className="flex-1 flex flex-col gap-1 w-full">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        handleInputChange("otp", value);
                      }}
                      className={`form-input flex-1 ${
                        errors.otp ? "border-red-500" : ""
                      }`}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      // disabled={timer === 0}
                    />

                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="teqo-button"
                    >
                      Verify OTP
                    </button>
                  </div>

                  {errors.otp && (
                    <span className="text-red-500 text-xs ml-1">
                      {errors.otp}
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-start gap-4">
            <input
              type="text"
              value={formData.email}
              readOnly
              className="form-input bg-gray-100 cursor-not-allowed"
            />
            <span className="text-3xl text-green-600">
              <MdVerified />
            </span>
          </div>
        )}

        {isVerified && (
          <div>
            <div className="flex gap-5 items-center">
              <div className="form-row flex-1">
                <label className="form-label">
                  Enter First Name <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 flex flex-col gap-1 w-full">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`form-input flex-1 ${
                        errors.firstName ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your first name"
                    />
                  </div>
                    {errors.firstName && (
                      <span className="text-red-500 text-xs ml-1">{errors.firstName}</span>
                    )}
                </div>
              </div>
              <div className="form-row flex-1">
                <label className="form-label">
                  Enter Last Name <span className="text-red-500">*</span>
                </label>
                <div className="flex-1 flex flex-col gap-1 w-full">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`form-input flex-1 ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your last name"
                    />
                  </div>
                    {errors.lastName && (
                      <span className="text-red-500 text-xs ml-1">{errors.lastName}</span>
                    )}
                </div>
              </div>
            </div>
            <Dropdown
              label="Designation"
              options={siteMemberOptions}
              value={formData.siteMember}
              onChange={(value) => handleInputChange("siteMember", value)}
              required
              placeholder="Select designation"
              error={errors.siteMember}
            />

            <div className="form-row">
              <label className="form-label">
                Report Type <span className="text-red-500">*</span>
              </label>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex gap-6">
                  {typeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={option.value}
                        checked={formData.type === option.value}
                        onChange={(e) =>
                          handleInputChange("type", Number(e.target.value))
                        }
                        className="w-4 h-4 accent-[#8bbb04] cursor-pointer focus:ring-2 focus:ring-[#8bbb04]"
                      />
                      <span
                        className={`text-sm transition-colors ${
                          formData.type === option.value
                            ? "text-[#8bbb04] font-semibold"
                            : "text-gray-700 group-hover:text-secondary"
                        }`}
                      >
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <span className="text-red-500 text-xs ml-1">
                    {errors.type}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <button type="submit" className="teqo-button" onClick={onSubmit}>
                Submit
              </button>
              <button
                className="teqo-button-secondary ml-4"
                onClick={() => {
                  nav("/");
                }}
              >
                Already Logged In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
