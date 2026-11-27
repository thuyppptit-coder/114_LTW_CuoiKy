import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Badge from "../../components/Badge";
import Pagination from "../../components/Pagination";
import { formatMoney, formatMonth } from "../../utils/format";
import { INVOICE_LABELS, INVOICE_COLORS } from "../../utils/invoiceStatus";

const Invoices = () => {
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const path = useMemo(() => {
        const query = new URLSearchParams({ page, limit: 6 });
        if (status) query.set("status", status);
        return `/invoices/mine?${query}`;
    }, [status, page]);

    const { data, loading, error } = useFetch(path);
    const invoices = data?.invoices ?? [];

    return (
        <div>
            <div className="mb-4 flex items-center gap-2">
                <label htmlFor="status" className="text-sm font-medium">Trạng thái:</label>
                <select
                    id="status"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                >
                    <option value="">Tất cả</option>
                    {Object.entries(INVOICE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            {loading ? (
                <p>Đang tải...</p>
            ) : invoices.length === 0 ? (
                <p className="text-gray-500">Chưa có hóa đơn nào.</p>
            ) : (
                <ul className="space-y-3">
                    {invoices.map((inv) => (
                        <li key={inv._id}>
                            <Link
                                to={`/tenant/invoices/${inv._id}`}
                                className="flex items-center justify-between gap-3 rounded border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                <div>
                                    <p className="font-medium">{formatMonth(inv.month)}</p>
                                    <p className="text-sm text-gray-500">Phòng {inv.roomId?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{formatMoney(inv.total)}</p>
                                    <Badge color={INVOICE_COLORS[inv.status]}>{INVOICE_LABELS[inv.status]}</Badge>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </div>
    );
};

export default Invoices;