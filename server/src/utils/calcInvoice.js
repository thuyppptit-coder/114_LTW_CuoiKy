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
        throw new Error("Chỉ số điện mới không được nhỏ hơn chỉ số cũ");
    }
    if (waterNew < waterOld) {
        throw new Error("Chỉ số nước mới không được nhỏ hơn chỉ số cũ");
    }

    const electricFee = (electricNew - electricOld) * electricPrice;
    const waterFee = (waterNew - waterOld) * waterPrice;
    const total = roomFee + electricFee + waterFee + serviceFee;

    return { electricFee, waterFee, total };
};