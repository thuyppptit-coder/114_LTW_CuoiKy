# Schema và API chung của nhóm (Đề 4: Quản lý nhà trọ)

## 1. Tài khoản & Phân quyền (Phạm Phương Thúy)
- **Model `User` (Collection `users`)**:
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
- **Model `RepairRequest` (Collection `repairRequests`)**:
  - `tenantId`: ObjectId (ref: `User`)
  - `roomId`: ObjectId (ref: `Room`)
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

## 3. Tòa nhà, Phòng & Hợp đồng (Đặng Phương Thúy)
- **Model `Building` (Collection `buildings`)**:
  - `name`: String (required)
  - `address`: String (required)
  - `electricPrice`: Number (đơn giá điện)
  - `waterPrice`: Number (đơn giá nước)
  - `serviceFee`: Number (phí dịch vụ chung)
  - `createdAt`, `updatedAt`: Date
- **Model `Room` (Collection `rooms`)**:
  - `buildingId`: ObjectId (ref: `Building`, required)
  - `name`: String (required)
  - `price`: Number (giá thuê phòng)
  - `area`: Number (diện tích phòng)
  - `status`: String (`"available"` | `"occupied"` | `"maintenance"`, mặc định `"available"`)
  - `createdAt`, `updatedAt`: Date
- **Model `Contract` (Collection `contracts`)**:
  - `tenantId`: ObjectId (ref: `User`, required)
  - `roomId`: ObjectId (ref: `Room`, required)
  - `startDate`: Date (required)
  - `endDate`: Date (required)
  - `rent`: Number (giá thuê chốt trên hợp đồng)
  - `deposit`: Number (tiền cọc)
  - `status`: String (`"active"` | `"ended"`, mặc định `"active"`)
  - `createdAt`, `updatedAt`: Date

## 4. Hóa đơn & Thanh toán (Tống Thị Vân Anh)
- **Model `Invoice` (Collection `invoices`)**:
  - `roomId`: ObjectId (ref: `Room`, required)
  - `month`: String (định dạng `"YYYY-MM"`, required)
  - `electricOld`: Number (chỉ số điện cũ)
  - `electricNew`: Number (chỉ số điện mới)
  - `waterOld`: Number (chỉ số nước cũ)
  - `waterNew`: Number (chỉ số nước mới)
  - `electricPrice`: Number (chốt đơn giá điện tại thời điểm lập hóa đơn)
  - `waterPrice`: Number (chốt đơn giá nước tại thời điểm lập hóa đơn)
  - `roomFee`: Number (tiền phòng)
  - `electricFee`: Number (tiền điện)
  - `waterFee`: Number (tiền nước)
  - `serviceFee`: Number (phí dịch vụ)
  - `total`: Number (tổng tiền thanh toán)
  - `status`: String (`"draft"` | `"issued"` | `"paid"`, mặc định `"draft"`)
  - `paidAt`: Date (thời điểm thanh toán)
  - `createdAt`, `updatedAt`: Date
  - **Index**: Unique index kết hợp `(roomId, month)` để mỗi phòng chỉ có 1 hóa đơn trong 1 tháng.

---

## 5. Quy ước nghiệp vụ & Đặt tên chung
- **Tên Model & Tệp**: Đặt đúng chuẩn PascalCase khớp với tên tệp trong `server/src/models/`: `User`, `RepairRequest`, `Building`, `Room`, `Contract`, `Invoice`.
- **Hiển thị hóa đơn theo vai trò**: Người thuê (`tenant`) chỉ được xem các hóa đơn có trạng thái `"issued"` (đã phát hành) hoặc `"paid"` (đã thanh toán); trạng thái `"draft"` là bản nháp chỉ chủ trọ (`owner`) mới thấy.
- **Xác định người thuê của phòng**: Được liên kết thông qua bản ghi `Contract` (đang hiệu lực) ứng với `roomId` và `tenantId` đó.