import { NavLink, Outlet } from "react-router-dom";

const subLink = ({ isActive }) =>
    `px-3 py-1 rounded ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`;

const OwnerArea = () => (
    <section>
        <h2 className="mb-4 text-2xl font-bold">Khu vực chủ trọ</h2>
        <nav className="mb-4 flex flex-wrap gap-1">
            <NavLink to="/owner" end className={subLink}>Tổng quan</NavLink>
            <NavLink to="/owner/repairs" className={subLink}>Sửa chữa</NavLink>
            {/* THÊM: nút Hóa đơn của C */}
            <NavLink to="/owner/invoices" className={subLink}>Hóa đơn</NavLink>
            {/* B thêm NavLink của mình vào đây */}
        </nav>
        <Outlet />
    </section>
);

export default OwnerArea;