export const STATUS_LABELS = {
    draft: "Nháp",
    issued: "Đã phát hành",
    paid: "Đã thu tiền",
};

export const STATUS_COLORS = { draft: "blue", issued: "yellow", paid: "green" };

export const NEXT_STATUS = { draft: "issued", issued: "paid" };
export const NEXT_LABELS = { draft: "Phát hành", issued: "Đánh dấu đã thu" };

export const ACTION_PATH = { draft: "issue", issued: "pay" };

export const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;