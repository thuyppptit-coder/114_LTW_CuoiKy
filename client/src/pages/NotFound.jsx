import { Link } from "react-router-dom";

const NotFound = () => (
    <div className="py-16 text-center">
        <h2 className="mb-2 text-4xl font-bold">404</h2>
        <p className="mb-4">Không tìm thấy trang bạn cần.</p>
        <Link to="/" className="text-blue-600 underline">Về trang chủ</Link>
    </div>
);

export default NotFound;