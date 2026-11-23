import { useState, useMemo } from "react";
import api from "../../services/api";
import Button from "../../components/Button";
import ReadingRow from "../../components/ReadingRow";
import { validateRow } from "../../utils/readingValidation";

const USE_DEMO_DATA = true;
const DEMO_ROOMS = [
    { _id: "demo-1", name: "P101", electricOld: 120, waterOld: 15 },
    { _id: "demo-2", name: "P102", electricOld: 340, waterOld: 42 },
    { _id: "demo-3", name: "P201", electricOld: 87, waterOld: 9 },
    { _id: "demo-4", name: "P202", electricOld: 205, waterOld: 30 },
];

const currentMonth = () => new Date().toISOString().slice(0, 7);

const Readings = () => {
    const rooms = DEMO_ROOMS;

    const [month, setMonth] = useState(currentMonth());
    const [values, setValues] = useState({}); // { [roomId]: { electricNew, waterNew } }
    const [serverErrors, setServerErrors] = useState({}); // lỗi do server trả về theo phòng
    const [message, setMessage] = useState(null); // { text, ok }
    const [saving, setSaving] = useState(false);

    const results = useMemo(
        () =>
            rooms.map((room) => ({
                room,
                ...validateRow({
                    electricOld: room.electricOld,
                    waterOld: room.waterOld,
                    ...values[room._id],
                }),
            })),
        [rooms, values]
    );

    const filled = results.filter((r) => !r.empty);
    const hasError = filled.some((r) => Object.keys(r.errors).length > 0);

    const handleChange = (roomId, field, value) => {
        setValues((prev) => ({ ...prev, [roomId]: { ...prev[roomId], [field]: value } }));
        setServerErrors((prev) => ({ ...prev, [roomId]: "" }));
    };

    const handleSave = async () => {
        if (saving) return;
        setMessage(null);

        if (filled.length === 0) {
            setMessage({ text: "Chưa nhập dòng nào.", ok: false });
            return;
        }
        if (hasError) {
            setMessage({ text: "Còn dòng nhập sai, hãy sửa các ô màu đỏ trước khi lưu.", ok: false });
            return;
        }
        if (USE_DEMO_DATA) {
            setMessage({
                text: `Dữ liệu của ${filled.length} phòng hợp lệ. Đang dùng dữ liệu giả nên chưa gửi lên server.`,
                ok: true,
            });
            return;
        }

        setSaving(true);
        const errs = {};
        let success = 0;
        for (const { room } of filled) {
            try {
                await api("/invoices", {
                    method: "POST",
                    body: {
                        roomId: room._id,
                        month,
                        electricOld: room.electricOld,
                        waterOld: room.waterOld,
                        electricNew: Number(values[room._id].electricNew),
                        waterNew: Number(values[room._id].waterNew),
                    },
                });
                success += 1;
            } catch (err) {
                errs[room._id] = err.message;
            }
        }
        setServerErrors(errs);
        
        setValues((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => errs[id])));
        setSaving(false);
        setMessage({
            text: `Đã tạo ${success} hóa đơn nháp${Object.keys(errs).length ? `, ${Object.keys(errs).length} phòng lỗi` : ""}.`,
            ok: Object.keys(errs).length === 0,
        });
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <label htmlFor="month" className="text-sm font-medium">Tháng:</label>
                <input
                    id="month"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                />
            </div>

            {USE_DEMO_DATA && (
                <p className="mb-3 text-sm text-yellow-700">Đang dùng dữ liệu phòng giả, chờ API phòng của B.</p>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-500">
                            <th className="px-2 py-2">Phòng</th>
                            <th className="px-2 py-2">Điện cũ</th>
                            <th className="px-2 py-2">Điện mới</th>
                            <th className="px-2 py-2">Đã dùng</th>
                            <th className="px-2 py-2">Nước cũ</th>
                            <th className="px-2 py-2">Nước mới</th>
                            <th className="px-2 py-2">Đã dùng</th>
                            <th className="px-2 py-2">Server</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(({ room, errors }) => (
                            <ReadingRow
                                key={room._id}
                                room={room}
                                values={values[room._id]}
                                errors={errors}
                                serverError={serverErrors[room._id]}
                                onChange={handleChange}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {message && (
                <p className={`mt-3 text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>
            )}

            <Button className="mt-4" onClick={handleSave}>
                {saving ? "Đang lưu..." : "Lưu hóa đơn"}
            </Button>
        </div>
    );
};

export default Readings;