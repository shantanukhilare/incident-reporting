import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

export const designationDropdownOptions = () => {
    const response = axios.get("/designations/options")
    .then(res => res.data)
    .catch(err => {
        console.error("Error fetching designation options:", err);
        return [];
    });

    return response;
}

export const getOtp = async (email: string) => {
    const response = await axios.post("/auth/get-otp", { email })
    .then(res => res.data)
    .catch(err => {
        console.error("Error getting OTP:", err);
        throw err;
    });
    return response;
}

export const verifyOtp = async (email: string, otp: string) => {
    const response = await axios.post("/auth/verify-otp", { email, otp })
    .then(res => res.data)
    .catch(err => {
        console.error("Error verifying OTP:", err);
        throw err;
    });
    return response;
}

export const userRegistration = async (email: string, designation: string) => {
    const response = await axios.post("/auth/register", { email, designation })
    .then(res => res.data)
    .catch(err => {
        console.error("Error during user registration:", err);
        throw err;
    });
    return response;
}
