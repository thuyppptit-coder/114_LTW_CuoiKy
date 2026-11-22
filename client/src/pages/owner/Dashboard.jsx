import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import StatCard from "../../components/StatCard";
import RevenueChart from "../../components/RevenueChart";
import { formatMoney } from "../../utils/invoiceStatus";

const Dashboard = () => {
    const [year, setYear] = useState(new Date().getFullYear());

    const summary = useFetch("/stats/summary");
    const overdue = useFetch("/stats/overdue");
    const revenue = useFetch(`/stats/revenue?year=${year}`);

    const rooms = summary.data?.rooms ?? { available: 0, occupied: 0, maintenance: 0 };
    const overdueList = overdue.data?.overdue ?? [];
    const months = revenue.data?.months ?? [];

    const error = summary.error || overdue.error || revenue.error;

    return (
        <div className="space-y-6">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="Phòng trống" value={rooms.available} tone="green" />
                <StatCard label="Đang thuê" value={rooms.occupied} />
                <StatCard label="Đang sửa" value={rooms.maintenance} tone="yellow" />
                <StatCard label="Phòng nợ tiền" value={summary.data?.overdueRooms ?? 0} tone="red" />
            </div>

            <section>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">Doanh thu năm {year}</h3>
                    <div className="flex items-center gap-2">
                        <label htmlFor="year" className="text-sm font-medium">Năm:</label>
                        <input
                            id="year"
                            type="number"
                            min="2000"
                            max="2100"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-24 rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                        />
                    </div>
                </div>
                <p className="mb-2 text-sm text-gray-500">
                    Tổng đã thu: <strong>{formatMoney(revenue.data?.totalRevenue)}</strong>
                </p>
                {revenue.loading ? <p>Đang tải...</p> : <RevenueChart months={months} />}
            </section>

            <section>
                <h3 className="mb-2 text-lg font-semibold">Phòng đang nợ tiền</h3>
                {overdue.loading ? (
                    <p>Đang tải...</p>
                ) : overdueList.length === 0 ? (
                    <p className="text-gray-500">Không có phòng nào nợ tiền.</p>
                ) : (
                    <ul className="space-y-2">
                        {overdueList.map((item) => (
                            <li
                                key={item.roomId}
                                className="flex items-start justify-between gap-2 rounded border border-gray-200 p-3 dark:border-gray-700"
                            >
                                <div>
                                    <p className="font-medium">Phòng {item.roomName ?? "—"}</p>
                                    <p className="text-sm text-gray-500">
                                        {item.invoiceCount} hóa đơn chưa thu: {item.months.join(", ")}
                                    </p>
                                </div>
                                <p className="font-semibold text-red-600">{formatMoney(item.totalDebt)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default Dashboard;