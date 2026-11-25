import AppError from "./AppError.js";
export const calcInvoice = ({
    roomFee,
    serviceFee,
    electricPrice,
    waterPrice,
    electricOld,
    electricNew,
    waterOld,
    waterNew,
}) => {
    if (electricNew < electricOld) {
        throw new AppError("Chỉ số điện mới không được nhỏ hơn chỉ số cũ", 400);
    }
    if (waterNew < waterOld) {
        throw new AppError("Chỉ số nước mới không được nhỏ hơn chỉ số cũ", 400);
    }

    const electricFee = Math.round((electricNew - electricOld) * electricPrice);
    const waterFee = Math.round((waterNew - waterOld) * waterPrice);
    const total = Math.round(roomFee + electricFee + waterFee + serviceFee);

    return { electricFee, waterFee, total };
};