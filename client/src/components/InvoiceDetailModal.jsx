import Modal from "./Modal";
import { formatMoney } from "../utils/invoiceStatus";

const InvoiceDetailModal = ({ invoice, onClose }) => (
    <Modal open={!!invoice} title={`Hóa đơn tháng ${invoice?.month ?? ""}`} onClose={onClose}>
        {invoice && (
            <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                    <span>Phòng</span><span>{invoice.roomId?.name ?? "—"}</span>
                </li>
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
        )}
    </Modal>
);

export default InvoiceDetailModal;