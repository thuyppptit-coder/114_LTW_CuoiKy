export const formatMoney = (n) => `${Number(n || 0).toLocaleString("vi-VN")} đ`;

// "2026-11" -> "Tháng 11/2026"
export const formatMonth = (month) => {
    if (!month) return "";
    const [year, m] = month.split("-");
    return `Tháng ${m}/${year}`;
};

export const formatDate = (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "");