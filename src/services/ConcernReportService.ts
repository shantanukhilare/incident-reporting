import axios from "axios";
import type { ConcernFormData } from "../pages/CreateConcernReport";

export const categoryDropdownOptions = () => {
    const response = axios.get("/categories/options")
    .then(res => res.data)
    .catch(err => {
        console.error("Error fetching category options:", err);
        return [];
    });

    return response;
}

export const severityDropdownOptions = () => {
    const response = axios.get("/severities/options")
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
        }
    })
    .then(res => res.data)
    .catch(err => {
        console.error("Error saving concern report:", err);
        throw err;
    });
    return response;
}