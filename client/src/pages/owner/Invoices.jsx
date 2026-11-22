import { useState, useMemo } from "react";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import {
    STATUS_LABELS,
    STATUS_COLORS,
    NEXT_STATUS,
    NEXT_LABELS,
    ACTION_PATH,
    formatMoney,
} from "../../utils/invoiceStatus";

const roomName = (invoice) => invoice.roomId?.name ?? "—";

const Invoices = () => {
    const [month, setMonth] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [confirming, setConfirming] = useState(null);
    const [detail, setDetail] = useState(null);
    const [actionError, setActionError] = useState("");

    const path = useMemo(() => {
        const query = new URLSearchParams({ page, limit: 10 });
        if (month) query.set("month", month);
        if (status) query.set("status", status);
        return `/invoices?${query}`;
    }, [month, status, page]);

    const { data, loading, error, refetch } = useFetch(path);
    const invoices = data?.invoices ?? [];

    const handleMonth = (e) => {
        setMonth(e.target.value);
        setPage(1);
    };

    const handleStatus = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    const handleConfirm = async () => {
        setActionError("");
        try {
            await api(`/invoices/${confirming._id}/${ACTION_PATH[confirming.status]}`, {
                method: "PATCH",
            });
            setConfirming(null);
            refetch();
        } catch (err) {
            setActionError(err.message);
            setConfirming(null);
        }
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="month" className="text-sm font-medium">Tháng:</label>
                    <input
                        id="month"
                        type="month"
                        value={month}
                        onChange={handleMonth}
                        className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="status" className="text-sm font-medium">Trạng thái:</label>
                    <select
                        id="status"
                        value={status}
                        onChange={handleStatus}
                        className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    >
                        <option value="">Tất cả</option>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {(error || actionError) && <p className="mb-3 text-sm text-red-600">{error || actionError}</p>}

            {loading ? (
                <p>Đang tải...</p>
            ) : invoices.length === 0 ? (
                <p className="text-gray-500">Chưa có hóa đơn nào.</p>
            ) : (
                <ul className="space-y-3">
                    {invoices.map((inv) => (
                        <li key={inv._id} className="rounded border border-gray-200 p-3 dark:border-gray-700">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="font-medium">Phòng {roomName(inv)} · Tháng {inv.month}</h4>
                                    <p className="text-sm text-gray-500">
                                        Điện {inv.electricOld} → {inv.electricNew} · Nước {inv.waterOld} → {inv.waterNew}
                                    </p>
                                    <p className="mt-1 font-semibold">{formatMoney(inv.total)}</p>
                                </div>
                                <Badge color={STATUS_COLORS[inv.status]}>{STATUS_LABELS[inv.status]}</Badge>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Button variant="secondary" onClick={() => setDetail(inv)}>Chi tiết</Button>
                                {NEXT_STATUS[inv.status] && (
                                    <Button onClick={() => setConfirming(inv)}>{NEXT_LABELS[inv.status]}</Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />

            <Modal open={!!confirming} title="Xác nhận" onClose={() => setConfirming(null)}>
                <p className="mb-4">
                    Chuyển hóa đơn phòng {confirming && roomName(confirming)} tháng {confirming?.month} sang trạng thái{" "}
                    <strong>{confirming && STATUS_LABELS[NEXT_STATUS[confirming.status]]}</strong>?
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setConfirming(null)}>Hủy</Button>
                    <Button onClick={handleConfirm}>Xác nhận</Button>
                </div>
            </Modal>

            <Modal open={!!detail} title={`Hóa đơn tháng ${detail?.month ?? ""}`} onClose={() => setDetail(null)}>
                {detail && (
                    <ul className="space-y-2 text-sm">
                        <li className="flex justify-between"><span>Phòng</span><span>{roomName(detail)}</span></li>
                        <li className="flex justify-between"><span>Tiền phòng</span><span>{formatMoney(detail.roomFee)}</span></li>
                        <li className="flex justify-between">
                            <span>Điện ({detail.electricOld} → {detail.electricNew}) × {formatMoney(detail.electricPrice)}</span>
                            <span>{formatMoney(detail.electricFee)}</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Nước ({detail.waterOld} → {detail.waterNew}) × {formatMoney(detail.waterPrice)}</span>
                            <span>{formatMoney(detail.waterFee)}</span>
                        </li>
                        <li className="flex justify-between"><span>Phí dịch vụ</span><span>{formatMoney(detail.serviceFee)}</span></li>
                        <li className="flex justify-between border-t pt-2 font-semibold">
                            <span>Tổng cộng</span><span>{formatMoney(detail.total)}</span>
                        </li>
                        {detail.paidAt && (
                            <li className="text-gray-500">Đã thu lúc {new Date(detail.paidAt).toLocaleString("vi-VN")}</li>
                        )}
                    </ul>
                )}
            </Modal>
        </div>
    );
};

export default Invoices;