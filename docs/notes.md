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

---

## 5. Chi tiết luồng xử lý & Lưu ý kỹ thuật theo phân hệ

### 5.1. Xác thực, Phân quyền & Giao diện nền (Phạm Phương Thúy)
- **Chức năng chính**: Đăng nhập/đăng ký từ giao diện, duy trì trạng thái đăng nhập sau khi tải lại trang (F5), phân quyền truy cập route theo vai trò (`owner` / `tenant`), chuyển đổi chế độ giao diện Sáng/Tối.
- **Tệp liên quan**: `api.js`, `AuthContext.jsx`, `ProtectedRoute.jsx`, `Layout.jsx`, `App.jsx`, `ThemeContext.jsx`, `useLocalStorage.js`.
- **Luồng xử lý**: Mở ứng dụng → `AuthProvider` đọc `token` từ `localStorage` → gọi `GET /api/auth/me` → xác thực thành công và lưu thông tin `user` → `ProtectedRoute` kiểm tra quyền hợp lệ → `Layout` hiển thị `<Outlet />` (trang con tương ứng).
- **Lỗi thường gặp**:
  - Thiếu kiểm tra trạng thái `loading` trong `ProtectedRoute` khiến người dùng bị chuyển hướng nhầm về `/login` khi bấm F5 lúc API `/auth/me` chưa phản hồi xong.
  - Sắp xếp sai thứ tự bọc các Provider trong `main.jsx` hoặc `App.jsx` (gọi `useAuth()` ngoài phạm vi của `AuthProvider`).
  - Lỗi **CORS** do giá trị `CLIENT_URL` trong `server/.env` không khớp với địa chỉ chạy của Vite (`http://localhost:5173`).

### 5.2. Yêu cầu sửa chữa & Khu vực làm việc (Phạm Phương Thúy)
- **Chức năng chính**: Người thuê gửi yêu cầu sửa chữa kèm ảnh minh họa và theo dõi tiến độ xử lý; chủ trọ điều hướng qua Sidebar khu vực quản lý, xem toàn bộ danh sách sự cố và cập nhật trạng thái (`Mới` → `Đang xử lý` → `Xong`).
- **Tệp liên quan**: `RepairRequest.js`, `upload.js`, `repairController.js`, `repairRoutes.js`, `index.js`, `OwnerArea.jsx`, `TenantArea.jsx`, `OwnerRepairs.jsx`, `TenantRepairs.jsx`.
- **Luồng xử lý**:
  - **Người thuê**: Nhập thông tin sự cố và chọn ảnh → đóng gói dữ liệu bằng `FormData` → gọi `POST /api/repairs` → `protect` & `authorize('tenant')` xác thực quyền → `multer` lưu tệp ảnh vào `server/uploads` → lưu bản ghi vào MongoDB → tải lại danh sách từ `GET /api/repairs/my`.
  - **Chủ trọ**: Truy cập `/owner/repairs` từ Sidebar của `OwnerArea` → gọi `GET /api/repairs` lấy toàn bộ danh sách → chọn trạng thái mới → gọi `PATCH /api/repairs/:id/status` cập nhật cơ sở dữ liệu và giao diện.
- **Lỗi thường gặp**:
  - Gửi kèm tệp ảnh từ Client nhưng quên sử dụng `FormData` (hoặc ép cứng header `Content-Type: application/json`) khiến `multer` không nhận được `req.file`.
  - Quên khai báo phục vụ tệp tĩnh `app.use('/uploads', express.static(...))` trong `server/src/index.js` hoặc thiếu tiền tố `http://localhost:5000` ở thuộc tính `src` của thẻ `<img>`.
  - Khai báo route con trong `App.jsx` nhưng quên đặt `<Outlet />` trong `OwnerArea.jsx` hoặc `TenantArea.jsx` khiến giao diện không hiển thị trang con khi chuyển mục.

### 5.3. Thành phần dùng chung & Tối ưu gọi API (Phạm Phương Thúy)
- **Chức năng chính**: Xây dựng 3 thành phần dùng chung (`Modal`, `Pagination`, custom hook `useFetch`) và áp dụng vào trang quản lý sửa chữa để lọc, phân trang, xem chi tiết và hủy request cũ.
- **Tệp liên quan**: `Modal.jsx`, `Pagination.jsx`, `useFetch.js`, `api.js`, `owner/Repairs.jsx`, `tenant/Repairs.jsx`.
- **Luồng xử lý**: State lọc/phân trang quản lý ở component cha (`owner/Repairs.jsx`) → tạo chuỗi truy vấn `path` → truyền vào `useFetch(path)` → gọi API qua `api.js` → trả về `data` → render danh sách. Hai component `Pagination` và `Modal` chỉ nhận dữ liệu qua `props` và báo sự kiện ngược lại component cha thông qua hàm `callback`.
- **Lỗi thường gặp**:
  - Quên hàm cleanup (`AbortController.abort()`) trong `useFetch` khiến các request cũ phản hồi chậm ghi đè dữ liệu lên request mới nhất.
  - Tạo chuỗi hoặc object `path` mới sau mỗi lần render mà không bọc `useMemo` khiến `useEffect` trong `useFetch` chạy liên tục gây vòng lặp gọi API vô hạn.
  - `Modal` đăng ký lắng nghe sự kiện bàn phím (`Escape`) nhưng quên gỡ bỏ `removeEventListener` trong hàm cleanup khi đóng modal.

### 5.4. Tòa nhà, Phòng & Hợp đồng (Đặng Phương Thúy bổ sung)
- **Chức năng chính**: (B điền tiếp)
- **Tệp liên quan**: (B điền tiếp)
- **Luồng xử lý**: (B điền tiếp)
- **Lỗi thường gặp**: (B điền tiếp)

### 5.5. Hóa đơn, Thanh toán & Dashboard (Tống Thị Vân Anh bổ sung)
- **Chức năng chính**: (C điền tiếp)
- **Tệp liên quan**: (C điền tiếp)
- **Luồng xử lý**: (C điền tiếp)
- **Lỗi thường gặp**: (C điền tiếp)