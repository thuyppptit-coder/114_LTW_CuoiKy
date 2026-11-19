const API_URL = import.meta.env.VITE_API_URL;

// Gọi API, tự gắn token, ném lỗi kèm message từ server
const api = async (path, { method = "GET", body, isFormData = false, signal } = {}) => {
    const token = localStorage.getItem("token");

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body && !isFormData) headers["Content-Type"] = "application/json";

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.message || "Có lỗi xảy ra");
        error.status = res.status;
        throw error;
    }
    return data;
};

export default api;