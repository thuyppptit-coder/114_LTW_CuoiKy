import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/InputField";
import Button from "../components/Button";

const validate = ({ email, password }) => {
    const errors = {};
    if (!email.trim()) errors.email = "Vui lòng nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Email không hợp lệ";
    if (!password) errors.password = "Vui lòng nhập mật khẩu";
    return errors;
};

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value })); // không sửa trực tiếp state
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        setServerError("");
        try {
            const user = await login(form.email, form.password);
            const fallback = user.role === "owner" ? "/owner" : "/tenant";
            navigate(location.state?.from?.pathname || fallback, { replace: true });
        } catch (err) {
            setServerError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-sm">
            <h2 className="mb-4 text-2xl font-bold">Đăng nhập</h2>
            <form onSubmit={handleSubmit} noValidate>
                <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
                <InputField label="Mật khẩu" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
                {serverError && <p className="mb-3 text-sm text-red-600">{serverError}</p>}
                <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
            </form>
        </div>
    );
};

export default Login;