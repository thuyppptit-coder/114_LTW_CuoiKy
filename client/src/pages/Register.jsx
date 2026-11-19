import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/InputField";
import Button from "../components/Button";

const validate = ({ name, email, password, confirm, phone }) => {
    const errors = {};
    if (!name.trim()) errors.name = "Vui lòng nhập họ tên";
    if (!email.trim()) errors.email = "Vui lòng nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Email không hợp lệ";
    if (password.length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự";
    if (confirm !== password) errors.confirm = "Mật khẩu nhập lại không khớp";
    if (phone && !/^0\d{9}$/.test(phone)) errors.phone = "Số điện thoại gồm 10 số, bắt đầu bằng 0";
    return errors;
};

const Register = () => {
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        setServerError("");
        try {
            const { confirm, ...payload } = form; // không gửi confirm lên server
            await register(payload);
            navigate("/tenant", { replace: true });
        } catch (err) {
            setServerError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-sm">
            <h2 className="mb-4 text-2xl font-bold">Đăng ký người thuê</h2>
            <form onSubmit={handleSubmit} noValidate>
                <InputField label="Họ tên" name="name" value={form.name} onChange={handleChange} error={errors.name} />
                <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
                <InputField label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} />
                <InputField label="Mật khẩu" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
                <InputField label="Nhập lại mật khẩu" name="confirm" type="password" value={form.confirm} onChange={handleChange} error={errors.confirm} />
                {serverError && <p className="mb-3 text-sm text-red-600">{serverError}</p>}
                <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
            </form>
        </div>
    );
};

export default Register;