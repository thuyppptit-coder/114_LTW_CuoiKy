import useFetch from "../../hooks/useFetch";
import { formatMoney, formatDate } from "../../utils/format";

const Row = ({ label, children }) => (
    <div className="flex justify-between gap-4 border-b border-gray-200 py-2 dark:border-gray-700">
        <dt className="text-gray-500">{label}</dt>
        <dd className="font-medium">{children}</dd>
    </div>
);

const Overview = () => {
    const { data, loading, error } = useFetch("/tenant/overview");

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const contract = data?.contract;
    if (!contract) {
        return <p className="text-gray-500">Bạn chưa có hợp đồng thuê phòng nào. Vui lòng liên hệ chủ trọ.</p>;
    }

    const room = contract.roomId;
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <section>
                <h3 className="mb-2 text-xl font-semibold">Phòng đang thuê</h3>
                <dl>
                    <Row label="Phòng">{room.name}</Row>
                    <Row label="Dãy trọ">{room.buildingId?.name}</Row>
                    <Row label="Địa chỉ">{room.buildingId?.address}</Row>
                    <Row label="Diện tích">{room.area} m²</Row>
                </dl>
            </section>
            <section>
                <h3 className="mb-2 text-xl font-semibold">Hợp đồng</h3>
                <dl>
                    <Row label="Ngày bắt đầu">{formatDate(contract.startDate)}</Row>
                    <Row label="Ngày kết thúc">{contract.endDate ? formatDate(contract.endDate) : "Không thời hạn"}</Row>
                    <Row label="Tiền thuê">{formatMoney(contract.rent)} / tháng</Row>
                    <Row label="Tiền cọc">{formatMoney(contract.deposit)}</Row>
                </dl>
            </section>
        </div>
    );
};

export default Overview;