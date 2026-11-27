import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
                Đang tải...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === "owner") {
        return <Navigate to="/owner" replace />;
    }

    return <Navigate to="/tenant" replace />;
};

export default Home;