# Schema và API chung của nhóm (Đề 4: Quản lý nhà trọ)

## 1. Tài khoản & Phân quyền (Phạm Phương Thúy)
- **Collection `users`**:
  - `name`: String (required)
  - `email`: String (required, unique)
  - `password`: String (required, đã mã hóa bcrypt)
  - `phone`: String
  - `role`: String (`"owner"` | `"tenant"`, mặc định `"tenant"`)
  - `createdAt`, `updatedAt`: Date
- **API Auth**:
  - `POST /api/auth/register` - Đăng ký tài khoản mới
  - `POST /api/auth/login` - Đăng nhập, trả về JWT token
  - `GET /api/auth/me` - Lấy thông tin tài khoản hiện tại (yêu cầu Bearer token)

## 2. Yêu cầu sửa chữa (Phạm Phương Thúy)
- **Collection `repairRequests`**:
  - `tenantId`: ObjectId (ref: `users`)
  - `roomId`: ObjectId (ref: `rooms`)
  - `title`: String (required)
  - `description`: String
  - `image`: String (đường dẫn ảnh upload)
  - `status`: String (`"Mới"` | `"Đang xử lý"` | `"Xong"`, mặc định `"Mới"`)
  - `createdAt`, `updatedAt`: Date
- **API Repair**:
  - `POST /api/repairs` - Người thuê gửi yêu cầu sửa chữa kèm ảnh
  - `GET /api/repairs/my` - Người thuê xem danh sách yêu cầu của mình
  - `GET /api/repairs` - Chủ trọ xem tất cả yêu cầu
  - `PATCH /api/repairs/:id/status` - Chủ trọ cập nhật trạng thái (`Mới` -> `Đang xử lý` -> `Xong`)

## 3. Tòa nhà, Phòng & Hợp đồng (Đặng Phương Thúy điền tiếp)
- **Collection `buildings`**: (B bổ sung các trường)
- **Collection `rooms`**: (B bổ sung các trường)
- **Collection `contracts`**: (B bổ sung các trường)

## 4. Hóa đơn & Thanh toán (Tống Thị Vân Anh điền tiếp)
- **Collection `invoices`**: (C bổ sung các trường)
- **Collection `payments`**: (C bổ sung các trường)