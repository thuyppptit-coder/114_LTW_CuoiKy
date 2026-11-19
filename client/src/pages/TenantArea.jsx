import { Outlet } from "react-router-dom";

const TenantArea = () => (
    <section>
        <h2 className="mb-4 text-2xl font-bold">Khu vực người thuê</h2>
        <Outlet />
    </section>
);

export default TenantArea;