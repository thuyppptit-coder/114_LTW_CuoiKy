# Ghi chú kỹ thuật & Quy ước phát triển (Đề 4: Quản lý nhà trọ)

## 1. Cấu trúc thư mục & Môi trường chạy
- **`/server`**: Backend Node.js + Express + MongoDB Atlas (chạy mặc định ở cổng `5000`).
  - Lệnh khởi chạy phát triển: `npm run dev`
  - Lệnh nạp dữ liệu mẫu: `npm run seed`
- **`/client`**: Frontend React + Vite + Tailwind CSS + Redux Toolkit (chạy mặc định ở cổng `5173`).
  - Lệnh khởi chạy giao diện: `npm run dev`
- **Biến môi trường (`.env`)**:
  - Tuyệt đối **không** commit file `.env` lên GitHub.
  - Khi thêm biến môi trường mới, cần cập nhật tên biến mẫu vào `.env.example` để các thành viên khác nắm được.

## 2. Quy ước API & Xử lý lỗi (Backend)
- **Định dạng phản hồi**: Thống nhất trả về JSON từ các controller, sử dụng `asyncHandler` để bọc các hàm bất đồng bộ và đẩy lỗi về middleware `errorHandler` tập trung.
- **Xác thực & Phân quyền**:
  - Client gửi JWT qua Header: `Authorization: Bearer <token>`.
  - Middleware `protect` giải mã token và gắn thông tin người dùng vào `req.user`.
  - Middleware `authorize('owner')` hoặc `authorize('tenant')` dùng để giới hạn quyền truy cập theo vai trò.
- **Upload ảnh**: Ảnh minh họa (ví dụ ảnh sự cố sửa chữa) được lưu qua `multer` vào thư mục `server/uploads` và phục vụ tĩnh qua đường dẫn `/uploads/<tên-file>`.

## 3. Quy ước Giao diện & Luồng điều hướng (Frontend)
- **Phân luồng sau đăng nhập**:
  - Vai trò `owner` (Chủ trọ) -> điều hướng vào cụm route `/owner/...`.
  - Vai trò `tenant` (Người thuê) -> điều hướng vào cụm route `/tenant/...`.
- **Bảo vệ Route**: Sử dụng `ProtectedRoute` để chặn người dùng chưa đăng nhập hoặc truy cập trái vai trò.
- **Giao diện Sáng/Tối (Dark Mode)**: Quản lý tập trung qua `ThemeContext` và áp dụng class `dark` của Tailwind CSS lên thẻ gốc `<html>`.

## 4. Quy trình Git của nhóm
- **Nhánh chung**: `main` (chỉ merge code đã chạy ổn định, không lỗi).
- **Nhánh cá nhân**:
  - Phạm Phương Thúy: `pham-thuy/auth`
  - Đặng Phương Thúy: nhánh quản lý tòa nhà, phòng, hợp đồng
  - Tống Thị Vân Anh: nhánh quản lý hóa đơn, thanh toán, dashboard
- **Lưu ý trước khi code**: Luôn chạy `git pull origin main` về nhánh cá nhân trước khi bắt đầu tính năng mới để tránh xung đột (conflict).