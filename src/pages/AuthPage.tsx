import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import { useNavigate } from "react-router-dom";

function AuthPage() {
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        siteMember: "",
        type: "",
    });

    const [errors, setErrors] = useState({
        email: "",
        otp: "",
        siteMember: "",
        type: "",
    });
    const nav = useNavigate();

    

    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0); // Timer in seconds (5 minutes = 300 seconds)
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const timerIntervalRef = useRef<number | null>(null);

    const siteMemberOptions = [
        { value: "site-member", label: "Site Member" },
        { value: "visitor", label: "Visitor" },
        { value: "site-incharge", label: "Site Incharge" },
    ];

    const typeOptions = [
        { value: "concern-report", label: "Concern Report" },
        { value: "incident", label: "Incident" },
    ];

    // Timer effect
    useEffect(() => {
        if (timer > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setIsResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        }

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [timer]);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSendOTP = () => {
        if (!formData.email) {
            setErrors(prev => ({ ...prev, email: "Email is required" }));
            toast.error("Please enter an email address");
            return;
        }

        if (!validateEmail(formData.email)) {
            setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
            toast.error("Please enter a valid email address");
            return;
        }

        // Simulate sending OTP
        toast.success(`OTP sent to ${formData.email}`);
        setOtpSent(true);
        setTimer(300); // 5 minutes = 300 seconds
        setIsResendDisabled(true);
        setErrors(prev => ({ ...prev, email: "" }));
    };

    const handleResendOTP = () => {
        if (isResendDisabled) return;
        handleSendOTP();
    };

    const validateForm = (): boolean => {
        const newErrors = {
            email: "",
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
        } else if (timer === 0) {
            newErrors.otp = "OTP has expired. Please resend";
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
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly");
            return;
        }

        console.log("Auth Form Data:", formData);
        toast.success("Form submitted successfully!");
        
        // Reset form after successful submission
        setFormData({
            email: "",
            otp: "",
            siteMember: "",
            type: "",
        });
        setErrors({
            email: "",
            otp: "",
            siteMember: "",
            type: "",
        });
        setOtpSent(false);
        setTimer(0);
        setIsResendDisabled(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-secondary">User Authentication</h2>
            
            <form onSubmit={onSubmit} className="space-y-0">
                {/* Email with Send OTP Button */}
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
                                className={`form-input flex-1 ${errors.email ? 'border-red-500' : ''}`}
                                required
                                placeholder="Enter your email address"
                                disabled={otpSent}
                            />
                            {otpSent ? (
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={isResendDisabled}
                                    className={`whitespace-nowrap ${isResendDisabled ? 'teqo-button-secondary opacity-60 cursor-not-allowed' : 'teqo-button'}`}
                                >
                                    {isResendDisabled ? `Resend (${formatTime(timer)})` : "Resend OTP"}
                                </button>
                            ) : (
                                <Button
                                    onClick={handleSendOTP}
                                    label="Send OTP"
                                    className="teqo-button whitespace-nowrap"
                                />
                            )}
                        </div>
                        {errors.email && (
                            <span className="text-red-500 text-xs ml-1">{errors.email}</span>
                        )}
                    </div>
                </div>

                {/* OTP Input Field */}
                {otpSent && (
                    <div className="form-row">
                        <label className="form-label">
                            Enter OTP <span className="text-red-500">*</span>
                            {timer > 0 && (
                                <span className="text-xs text-gray-500 ml-2">(Expires in {formatTime(timer)})</span>
                            )}
                        </label>
                        <div className="flex-1 flex flex-col gap-1 w-full">
                            <input
                                type="text"
                                value={formData.otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    handleInputChange("otp", value);
                                }}
                                className={`form-input flex-1 ${errors.otp ? 'border-red-500' : ''} ${timer === 0 ? 'opacity-60' : ''}`}
                                required
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                disabled={timer === 0}
                            />
                            {errors.otp && (
                                <span className="text-red-500 text-xs ml-1">{errors.otp}</span>
                            )}
                            {timer === 0 && otpSent && (
                                <span className="text-orange-500 text-xs ml-1">OTP expired. Please resend.</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Site Member/ Visitor/ Site Incharge */}
                <Dropdown
                    label="Designation"
                    options={siteMemberOptions}
                    value={formData.siteMember}
                    onChange={(value) => handleInputChange("siteMember", value)}
                    required
                    placeholder="Select designation"
                    error={errors.siteMember}
                />

                {/* Select Type with Radio Buttons */}
                <div className="form-row">
                    <label className="form-label">
                        Report Type  <span className="text-red-500">*</span>
                    </label>
                    <div className="flex-1 flex flex-col gap-1">
                        <div className="flex gap-6">
                            {typeOptions.map((option) => (
                                <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="type"
                                        value={option.value}
                                        checked={formData.type === option.value}
                                        onChange={(e) => handleInputChange("type", e.target.value)}
                                        className="w-4 h-4 text-[#8bbb04] focus:ring-[#8bbb04] focus:ring-2 accent-[#8bbb04]"
                                        required
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-secondary transition-colors">{option.label}</span>
                                </label>
                            ))}
                        </div>
                        {errors.type && (
                            <span className="text-red-500 text-xs ml-1">{errors.type}</span>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
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
                    <Button
                        label="Already Logged In"
                        className="teqo-button-secondary ml-4"
                        onClick={() => {
                            nav("/");
                        }}
                    >
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default AuthPage;

