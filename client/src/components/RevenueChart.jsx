import { formatMoney } from "../utils/invoiceStatus";

const RevenueChart = ({ months }) => {
    const max = Math.max(...months.map((m) => m.revenue), 0);

    return (
        <div className="flex h-48 items-end gap-2 overflow-x-auto rounded border border-gray-200 p-3 dark:border-gray-700">
            {months.map((m) => {
                const height = max === 0 ? 2 : Math.max((m.revenue / max) * 100, 2);
                return (
                    <div key={m.month} className="flex h-full min-w-8 flex-1 flex-col items-center justify-end">
                        <div
                            className="w-full rounded-t bg-blue-500"
                            style={{ height: `${height}%` }}
                            title={`${m.month}: ${formatMoney(m.revenue)}`}
                        />
                        <span className="mt-1 text-xs text-gray-500">{m.month.slice(5)}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default RevenueChart;