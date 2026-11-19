import { Outlet } from "react-router-dom";

// Khung khu vực chủ trọ. B, C thêm route con vào đây
const OwnerArea = () => (
    <section>
        <h2 className="mb-4 text-2xl font-bold">Khu vực chủ trọ</h2>
        <Outlet />
    </section>
);

export default OwnerArea;