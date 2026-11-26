import Modal from "./Modal";
import { formatMoney } from "../utils/invoiceStatus";

const InvoiceDetailModal = ({ invoice, onClose }) => {
    // In hóa đơn: đặt tên file PDF theo tháng và phòng, in xong trả lại tiêu đề trang
    const handlePrint = () => {
        const oldTitle = document.title;
        document.title = `hoa-don-${invoice.month}-${invoice.roomId?.name ?? "phong"}`;
        window.addEventListener(
            "afterprint",
            () => {
                document.title = oldTitle;
            },
            { once: true }
        );
        window.print();
    };

    return (
        <Modal open={!!invoice} title={`Hóa đơn tháng ${invoice?.month ?? ""}`} onClose={onClose}>
            {invoice && (
                <>
                    <div className="print-area">
                        <h2 className="mb-4 hidden text-center text-xl font-bold print:block">
                            HÓA ĐƠN TIỀN PHÒNG THÁNG {invoice.month}
                        </h2>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                                <span>Phòng</span><span>{invoice.roomId?.name ?? "—"}</span>
                            </li>
                            {invoice.tenantId?.name && (
                                <li className="flex justify-between">
                                    <span>Người thuê</span><span>{invoice.tenantId.name}</span>
                                </li>
                            )}
                            <li className="flex justify-between">
                                <span>Tiền phòng</span><span>{formatMoney(invoice.roomFee)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Điện ({invoice.electricOld} → {invoice.electricNew}) × {formatMoney(invoice.electricPrice)}</span>
                                <span>{formatMoney(invoice.electricFee)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Nước ({invoice.waterOld} → {invoice.waterNew}) × {formatMoney(invoice.waterPrice)}</span>
                                <span>{formatMoney(invoice.waterFee)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Phí dịch vụ</span><span>{formatMoney(invoice.serviceFee)}</span>
                            </li>
                            <li className="flex justify-between border-t pt-2 font-semibold">
                                <span>Tổng cộng</span><span>{formatMoney(invoice.total)}</span>
                            </li>
                            {invoice.paidAt && (
                                <li className="text-gray-500">
                                    Đã thu lúc {new Date(invoice.paidAt).toLocaleString("vi-VN")}
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="mt-4 flex justify-end print:hidden">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            In / Lưu PDF
                        </button>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default InvoiceDetailModal;