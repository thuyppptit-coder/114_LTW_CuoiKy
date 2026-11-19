// VITE_API_URL = http://localhost:5000/api -> lấy phần gốc http://localhost:5000
const SERVER_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

export const imageUrl = (path) => `${SERVER_URL}${path}`;