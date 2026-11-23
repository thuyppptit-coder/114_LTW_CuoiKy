const toNumber = (value) =>
    value === "" || value === undefined || value === null ? null : Number(value);

const checkField = (value, oldValue, label) => {
    if (value === null) return `Thiếu chỉ số ${label} mới`;
    if (!Number.isFinite(value) || value < 0) return "Phải là số không âm";
    if (value < oldValue) return `Nhỏ hơn chỉ số cũ (${oldValue})`;
    return "";
};

export const validateRow = ({ electricOld, waterOld, electricNew, waterNew }) => {
    const eNew = toNumber(electricNew);
    const wNew = toNumber(waterNew);

    if (eNew === null && wNew === null) return { empty: true, errors: {} };

    const errors = {};
    const electricError = checkField(eNew, electricOld, "điện");
    const waterError = checkField(wNew, waterOld, "nước");
    if (electricError) errors.electricNew = electricError;
    if (waterError) errors.waterNew = waterError;

    return { empty: false, errors };
};