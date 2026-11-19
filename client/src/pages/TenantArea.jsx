import { NavLink, Outlet } from "react-router-dom";

const subLink = ({ isActive }) =>
    `px-3 py-1 rounded ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`;

const TenantArea = () => (
    <section>
        <h2 className="mb-4 text-2xl font-bold">Khu vực người thuê</h2>
        <nav className="mb-4 flex flex-wrap gap-1">
            <NavLink to="/tenant" end className={subLink}>Phòng và hóa đơn</NavLink>
            <NavLink to="/tenant/repairs" className={subLink}>Sửa chữa</NavLink>
        </nav>
        <Outlet />
    </section>
);

export default TenantArea;