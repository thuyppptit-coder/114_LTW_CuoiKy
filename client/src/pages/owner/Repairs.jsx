import { useState, useMemo } from "react";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import { STATUS_LABELS, NEXT_STATUS, NEXT_LABELS } from "../../utils/repairStatus";
import { imageUrl } from "../../utils/imageUrl";

const STATUS_COLORS = { new: "blue", in_progress: "yellow", done: "green" };

const Repairs = () => {
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [confirming, setConfirming] = useState(null);
    const [actionError, setActionError] = useState("");

    const path = useMemo(() => {
        const query = new URLSearchParams({ page, limit: 10 });
        if (status) query.set("status", status);
        return `/repairs?${query}`;
    }, [status, page]);

    const { data, loading, error, refetch } = useFetch(path);
    const repairs = data?.repairs ?? [];

    const handleFilter = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    const handleConfirm = async () => {
        try {
            await api(`/repairs/${confirming._id}/status`, {
                method: "PATCH",
                body: { status: NEXT_STATUS[confirming.status] },
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
            <div className="mb-4 flex items-center gap-2">
                <label htmlFor="status" className="text-sm font-medium">Lọc theo trạng thái:</label>
                <select
                    id="status"
                    value={status}
                    onChange={handleFilter}
                    className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                >
                    <option value="">Tất cả</option>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            {(error || actionError) && <p className="mb-3 text-sm text-red-600">{error || actionError}</p>}

            {loading ? (
                <p>Đang tải...</p>
            ) : repairs.length === 0 ? (
                <p className="text-gray-500">Không có yêu cầu nào.</p>
            ) : (
                <ul className="space-y-3">
                    {repairs.map((r) => (
                        <li key={r._id} className="rounded border border-gray-200 p-3 dark:border-gray-700">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="font-medium">{r.title}</h4>
                                    <p className="text-sm text-gray-500">
                                        {r.tenantId?.name} {r.tenantId?.phone && `· ${r.tenantId.phone}`}
                                    </p>
                                </div>
                                <Badge color={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                            </div>
                            {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                            {r.images.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {r.images.map((src) => (
                                        <a key={src} href={imageUrl(src)} target="_blank" rel="noreferrer">
                                            <img src={imageUrl(src)} alt="Ảnh sự cố" className="h-20 w-20 rounded object-cover" />
                                        </a>
                                    ))}
                                </div>
                            )}
                            {NEXT_STATUS[r.status] && (
                                <Button className="mt-3" onClick={() => setConfirming(r)}>
                                    {NEXT_LABELS[r.status]}
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />

            <Modal open={!!confirming} title="Xác nhận" onClose={() => setConfirming(null)}>
                <p className="mb-4">
                    Chuyển yêu cầu "{confirming?.title}" sang trạng thái{" "}
                    <strong>{confirming && STATUS_LABELS[NEXT_STATUS[confirming.status]]}</strong>?
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setConfirming(null)}>Hủy</Button>
                    <Button onClick={handleConfirm}>Xác nhận</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Repairs;