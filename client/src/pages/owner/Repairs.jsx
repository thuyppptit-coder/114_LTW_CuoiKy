import { useState, useEffect } from "react";
import api from "../../services/api";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { STATUS_LABELS, NEXT_STATUS, NEXT_LABELS } from "../../utils/repairStatus";
import { imageUrl } from "../../utils/imageUrl";

const STATUS_COLORS = { new: "blue", in_progress: "yellow", done: "green" };

const Repairs = () => {
    const [repairs, setRepairs] = useState([]);
    const [status, setStatus] = useState(""); // bộ lọc: rỗng = tất cả
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({ page, limit: 10 });
                if (status) query.set("status", status);
                const data = await api(`/repairs?${query}`);
                setRepairs(data.repairs);
                setTotalPages(data.totalPages);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [status, page]);

    const handleFilter = (e) => {
        setStatus(e.target.value);
        setPage(1); // đổi bộ lọc thì về trang 1
    };

    const handleNext = async (repair) => {
        try {
            const { repair: updated } = await api(`/repairs/${repair._id}/status`, {
                method: "PATCH",
                body: { status: NEXT_STATUS[repair.status] },
            });
            // Thay đúng 1 phần tử, không sửa trực tiếp mảng cũ
            setRepairs((prev) => prev.map((r) => (r._id === repair._id ? { ...r, status: updated.status } : r)));
        } catch (err) {
            setError(err.message);
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

            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

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
                                <Button className="mt-3" onClick={() => handleNext(r)}>
                                    {NEXT_LABELS[r.status]}
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* Tạm dùng nút đơn giản, mục 5 sẽ thay bằng component Pagination */}
            <div className="mt-4 flex items-center gap-2">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</Button>
                <span className="text-sm">Trang {page} / {totalPages}</span>
                <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sau</Button>
            </div>
        </div>
    );
};

export default Repairs;