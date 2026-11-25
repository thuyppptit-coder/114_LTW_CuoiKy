import Button from "./Button";
import Badge from "./Badge";
import {
    STATUS_LABELS,
    STATUS_COLORS,
    NEXT_STATUS,
    NEXT_LABELS,
    formatMoney,
} from "../utils/invoiceStatus";

const InvoiceCard = ({ invoice, onDetail, onAction }) => (
    <li className="rounded border border-gray-200 p-3 dark:border-gray-700">
        <div className="flex items-start justify-between gap-2">
            <div>
                <h4 className="font-medium">
                    Phòng {invoice.roomId?.name ?? "—"} · Tháng {invoice.month}
                </h4>
                <p className="text-sm text-gray-500">
                    Điện {invoice.electricOld} → {invoice.electricNew} · Nước {invoice.waterOld} → {invoice.waterNew}
                </p>
                <p className="mt-1 font-semibold">{formatMoney(invoice.total)}</p>
            </div>
            <Badge color={STATUS_COLORS[invoice.status]}>{STATUS_LABELS[invoice.status]}</Badge>
        </div>
        <div className="mt-3 flex gap-2">
            <Button variant="secondary" onClick={() => onDetail(invoice)}>Chi tiết</Button>
            {onAction && NEXT_STATUS[invoice.status] && (
                <Button onClick={() => onAction(invoice)}>{NEXT_LABELS[invoice.status]}</Button>
            )}
        </div>
    </li>
);

export default InvoiceCard;