import { useState } from "react";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { STATUS_LABELS } from "../../utils/repairStatus";
import { imageUrl } from "../../utils/imageUrl";

const STATUS_COLORS = { new: "blue", in_progress: "yellow", done: "green" };
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

const validate = ({ title }, files) => {
    const errors = {};
    if (!title.trim()) errors.title = "Vui lòng nhập tiêu đề";
    if (files.length > 3) errors.images = "Tối đa 3 ảnh";
    else if (files.some((f) => !ALLOWED_TYPES.includes(f.type))) errors.images = "Chỉ nhận ảnh JPG, PNG, WEBP";
    else if (files.some((f) => f.size > MAX_SIZE)) errors.images = "Mỗi ảnh tối đa 2MB";
    return errors;
};

const Repairs = () => {
    const { data, loading, refetch } = useFetch("/repairs/mine");
    const repairs = data?.repairs ?? [];
    const [form, setForm] = useState({ title: "", description: "" });
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const found = validate(form, files);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        const body = new FormData();
        body.append("title", form.title);
        body.append("description", form.description);
        files.forEach((file) => body.append("images", file));

        setSubmitting(true);
        setServerError("");
        try {
            await api("/repairs", { method: "POST", body, isFormData: true });
            setForm({ title: "", description: "" });
            setFiles([]);
            e.target.reset();
            refetch();
        } catch (err) {
            setServerError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <section>
                <h3 className="mb-3 text-xl font-semibold">Gửi yêu cầu sửa chữa</h3>
                <form onSubmit={handleSubmit} noValidate>
                    <InputField label="Tiêu đề" name="title" value={form.title} onChange={handleChange} error={errors.title} />

                    <div className="mb-4">
                        <label htmlFor="description" className="mb-1 block text-sm font-medium">Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="3"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="images" className="mb-1 block text-sm font-medium">Ảnh (tối đa 3, mỗi ảnh 2MB)</label>
                        <input
                            id="images"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(e) => setFiles(Array.from(e.target.files))}
                        />
                        {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                    </div>

                    {serverError && <p className="mb-3 text-sm text-red-600">{serverError}</p>}
                    <Button type="submit" disabled={submitting}>
                        {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
                    </Button>
                </form>
            </section>

            <section>
                <h3 className="mb-3 text-xl font-semibold">Yêu cầu của tôi</h3>
                {loading ? (
                    <p>Đang tải...</p>
                ) : repairs.length === 0 ? (
                    <p className="text-gray-500">Bạn chưa gửi yêu cầu nào.</p>
                ) : (
                    <ul className="space-y-3">
                        {repairs.map((r) => (
                            <li key={r._id} className="rounded border border-gray-200 p-3 dark:border-gray-700">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium">{r.title}</h4>
                                    <Badge color={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                                </div>
                                {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                                {r.images.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {r.images.map((src) => (
                                            <img key={src} src={imageUrl(src)} alt="Ảnh sự cố" className="h-20 w-20 rounded object-cover" />
                                        ))}
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString("vi-VN")}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default Repairs;