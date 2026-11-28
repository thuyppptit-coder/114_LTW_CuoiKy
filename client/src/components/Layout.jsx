import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";

const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`;

const Layout = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.history.replaceState(null, "", "/login");
        window.location.replace("/login");
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <header className="border-b border-gray-200 dark:border-gray-700">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 p-3">
                    <h1 className="text-xl font-bold">Quản lý nhà trọ</h1>

                    <nav className="flex flex-wrap items-center gap-1">
                        <NavLink to="/" end className={linkClass}>Trang chủ</NavLink>
                        {user?.role === "owner" && (
                            <NavLink to="/owner" className={linkClass}>Quản lý</NavLink>
                        )}
                        {user?.role === "tenant" && (
                            <NavLink to="/tenant" className={linkClass}>Của tôi</NavLink>
                        )}
                        {!user && (
                            <>
                                <NavLink to="/login" className={linkClass}>Đăng nhập</NavLink>
                                <NavLink to="/register" className={linkClass}>Đăng ký</NavLink>
                            </>
                        )}
                    </nav>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={toggleTheme}>
                            {theme === "light" ? "Tối" : "Sáng"}
                        </Button>
                        {user && (
                            <>
                                <span className="hidden text-sm sm:inline">{user.name}</span>
                                <Button variant="danger" onClick={handleLogout}>Đăng xuất</Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;