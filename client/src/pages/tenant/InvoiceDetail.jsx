import { useParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Badge from "../../components/Badge";
import { formatMoney, formatMonth, formatDate } from "../../utils/format";
import { INVOICE_LABELS, INVOICE_COLORS } from "../../utils/invoiceStatus";

const InvoiceDetail = () => {
    const { id } = useParams(); // route động: /tenant/invoices/:id
    const { data, loading, error } = useFetch(`/invoices/${id}`);

    if (loading) return <p>Đang tải...</p>;
    if (error) {
        // Hóa đơn của phòng khác: server trả 403, hiện thông báo của server
        return (
            <div>
                <p className="mb-3 text-red-600">{error}</p>
                <Link to="/tenant/invoices" className="text-blue-600 underline">Quay lại danh sách</Link>
            </div>
        );
    }

    const inv = data.invoice;
    const electricUsed = inv.electricNew - inv.electricOld;
    const waterUsed = inv.waterNew - inv.waterOld;

    const lines = [
        { name: "Tiền phòng", detail: "", amount: inv.roomFee },
        { name: "Tiền điện", detail: `${inv.electricOld} → ${inv.electricNew} (${electricUsed} số × ${formatMoney(inv.electricPrice)})`, amount: inv.electricFee },
        { name: "Tiền nước", detail: `${inv.waterOld} → ${inv.waterNew} (${waterUsed} số × ${formatMoney(inv.waterPrice)})`, amount: inv.waterFee },
        { name: "Phí dịch vụ", detail: "", amount: inv.serviceFee },
    ];

    return (
        <div className="max-w-2xl">
            <Link to="/tenant/invoices" className="mb-3 inline-block text-sm text-blue-600 underline">← Danh sách hóa đơn</Link>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-semibold">
                    Hóa đơn {formatMonth(inv.month)} · Phòng {inv.roomId?.name}
                </h3>
                <Badge color={INVOICE_COLORS[inv.status]}>{INVOICE_LABELS[inv.status]}</Badge>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <caption className="sr-only">Chi tiết các khoản trong hóa đơn</caption>
                    <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-600">
                            <th className="py-2">Khoản</th>
                            <th className="py-2">Cách tính</th>
                            <th className="py-2 text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((line) => (
                            <tr key={line.name} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-2">{line.name}</td>
                                <td className="py-2 text-sm text-gray-500">{line.detail}</td>
                                <td className="py-2 text-right">{formatMoney(line.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold">
                            <td className="py-3" colSpan="2">Tổng cộng</td>
                            <td className="py-3 text-right">{formatMoney(inv.total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {inv.status === "paid" && inv.paidAt && (
                <p className="mt-3 text-sm text-gray-500">Đã thu ngày {formatDate(inv.paidAt)}</p>
            )}
        </div>
    );
};

export default InvoiceDetail;