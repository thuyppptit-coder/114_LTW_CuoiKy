import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// roles để trống = chỉ cần đăng nhập
const ProtectedRoute = ({ roles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <p className="p-4">Đang tải...</p>;

    // Chưa đăng nhập -> về trang login, nhớ trang đang muốn vào
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    // Đăng nhập rồi nhưng sai vai trò -> về trang chủ
    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;