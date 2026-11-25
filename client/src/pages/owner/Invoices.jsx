import { useState, useMemo } from "react";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import InvoiceCard from "../../components/InvoiceCard"; // SỬA: thêm component thẻ hóa đơn
import InvoiceDetailModal from "../../components/InvoiceDetailModal"; // SỬA: thêm component chi tiết
import { STATUS_LABELS, NEXT_STATUS, ACTION_PATH } from "../../utils/invoiceStatus"; // SỬA: bỏ các import không còn dùng

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
                    {/* SỬA: mỗi hóa đơn là một InvoiceCard thay cho khối <li> dài */}
                    {invoices.map((inv) => (
                        <InvoiceCard
                            key={inv._id}
                            invoice={inv}
                            onDetail={setDetail}
                            onAction={setConfirming}
                        />
                    ))}
                </ul>
            )}

            <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />

            <Modal open={!!confirming} title="Xác nhận" onClose={() => setConfirming(null)}>
                <p className="mb-4">
                    Chuyển hóa đơn phòng {confirming?.roomId?.name ?? "—"} tháng {confirming?.month} sang trạng thái{" "}
                    <strong>{confirming && STATUS_LABELS[NEXT_STATUS[confirming.status]]}</strong>?
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setConfirming(null)}>Hủy</Button>
                    <Button onClick={handleConfirm}>Xác nhận</Button>
                </div>
            </Modal>

            {/* SỬA: hộp thoại chi tiết thành component riêng */}
            <InvoiceDetailModal invoice={detail} onClose={() => setDetail(null)} />
        </div>
    );
};

export default Invoices;