import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

// Tự gọi GET khi path đổi. Trả về { data, loading, error, refetch }
const useFetch = (path) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!path) return;
        const controller = new AbortController();

        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await api(path, { signal: controller.signal });
                setData(result);
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        load();

        // Cleanup: path đổi hoặc component đóng thì hủy request đang chạy
        return () => controller.abort();
    }, [path, reloadKey]);

    // Gọi lại cùng path (sau khi thêm/sửa dữ liệu)
    const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

    return { data, loading, error, refetch };
};

export default useFetch;