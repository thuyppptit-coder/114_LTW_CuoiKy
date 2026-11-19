import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // đang kiểm tra token cũ

    // Mở app: nếu còn token thì hỏi server "tôi là ai"
    useEffect(() => {
        const loadUser = async () => {
            if (!localStorage.getItem("token")) {
                setLoading(false);
                return;
            }
            try {
                const { user } = await api("/auth/me");
                setUser(user);
            } catch {
                localStorage.removeItem("token"); // token hết hạn hoặc sai
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        const data = await api("/auth/login", { method: "POST", body: { email, password } });
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return data.user;
    };

    const register = async (form) => {
        const data = await api("/auth/register", { method: "POST", body: form });
        localStorage.setItem("token", data.token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook tiện dụng: const { user, login } = useAuth();
export const useAuth = () => useContext(AuthContext);