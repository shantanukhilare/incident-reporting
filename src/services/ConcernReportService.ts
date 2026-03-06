import axios from "axios";
import type { ConcernFormData } from "../pages/CreateConcernReport";

export interface SubmitConcernPayload {
  siteid: number;
  concerntype: string;
  reportername: string;
  repoteremail: string;
  reporteddate: string;
  concerndescription: string;
  location: string;
  seviertyid: number;
  categoryid: number;
  statusid: number;
  concernReportingPhotos1: string;
  concernReportingPhotos2: string;
  concernReportingPhotos3: string;
}

const API_BASE_URL = "https://testteqoosstg-api.mahindrateqo.com";

// --- AUTHENTICATION ---

// 1. Globally set the token so we don't have to pass it to every single request
export const setAuthToken = (token: string) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
};

// 2. Fetch the token using the URL code
export const getToken = async (code: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/ConcernReporting/GetToken/${code}`);
        return response.data;
    } catch (err) {
        console.error("Error fetching token:", err);
        throw err;
    }
};


// --- API CALLS ---

export const categoryDropdownOptions = () => {
    // Notice we removed the headers block! setAuthToken handles it automatically now.
    const response = axios.get(`${API_BASE_URL}/api/ConcernReporting/GetCategoryDetails`)
    .then(res => res.data)
    .catch(err => {
        console.error("Error fetching category options:", err);
        return [];
    });

    return response;
}

export const severityDropdownOptions = () => {
    const response = axios.get(`${API_BASE_URL}/api/ConcernReporting/GetSeverity`)
    .then(res => res.data)
    .catch(err => {
        console.error("Error fetching severity options:", err);
        return [];
    });

    return response;
}

export const statusDropdownOptions = () => {
    const response = axios.get("/statuses/options")
    .then(res => res.data)
    .catch(err => {
        console.error("Error fetching status options:", err);
        return [];
    });

    return response;
}

export const saveConcernReport = async (formData: ConcernFormData) => {
    const response = await axios.post("/concern-reports", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
            // Auth header is automatically injected here too!
        }
    })
    .then(res => res.data)
    .catch(err => {
        console.error("Error saving concern report:", err);
        throw err;
    });
    return response;
}

export const submitConcernReport = async (payload: SubmitConcernPayload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/ConcernReporting/SubmitConcernReport`, payload);
        return response.data;
    } catch (err) {
        console.error("Error submitting report:", err);
        throw err; 
    }
}