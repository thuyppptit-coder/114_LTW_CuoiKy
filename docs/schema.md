# Schema và API chung của nhóm (Đề 4: Quản lý nhà trọ)

## 0. Phân công

| Phần | Người | Phạm vi dữ liệu |
|---|---|---|
| A | Phạm Phương Thúy | `User`, `RepairRequest`, API hóa đơn phía người thuê |
| B | Tống Thị Vân Anh | `Building`, `Room`, `Contract`, `Contact` |
| C | Đặng Phương Thúy | `Invoice`, thống kê (Aggregation) |

## 1. Quy ước chung

- Mọi model dùng `{ timestamps: true }` (tự có `createdAt`, `updatedAt`).
- Tên model PascalCase, khớp tên file trong `server/src/models/`.
- Mongoose tự đặt tên collection thành chữ thường, số nhiều (`RepairRequest` -> `repairrequests`). Muốn đúng như báo cáo thì khai báo `collection: 'repairRequests'` trong schema, hoặc ghi đúng tên thực tế vào báo cáo.
- **Giá trị enum lưu bằng mã tiếng Anh, giao diện tự map sang tiếng Việt.** Không trộn tiếng Việt và tiếng Anh trong DB.

| Mã trong DB | Hiển thị |
|---|---|
| Room: `available` / `occupied` / `maintenance` | Trống / Đang thuê / Đang sửa |
| Repair: `new` / `in_progress` / `done` | Mới / Đang xử lý / Xong |
| Contract: `active` / `ended` | Đang hiệu lực / Đã kết thúc |
| Invoice: `draft` / `issued` / `paid` | Nháp / Đã phát hành / Đã thu |

- Tiền: số nguyên đơn vị VND, làm tròn ở server.
- Quan hệ: dùng tham chiếu `_id` (`ref`) giữa các collection; không lồng document vì dữ liệu thay đổi độc lập (giá phòng, người thuê...). Ngoại lệ: Invoice **lưu bản chụp (snapshot)** đơn giá, tiền phòng, phí dịch vụ tại thời điểm lập, để đổi giá sau này không làm sai hóa đơn cũ.

## 2. Tài khoản & Phân quyền (A)

**`User` (`users`)**
- `name`: String, required
- `email`: String, required, unique, lowercase
- `password`: String, required, bcrypt, `select: false`
- `phone`: String
- `role`: `"owner"` | `"tenant"`, mặc định `"tenant"`

JWT payload chỉ chứa `{ id, role }`, có `expiresIn`. Không đưa email, password, phone vào payload.

**`RepairRequest` (`repairRequests`)**
- `tenantId`: ObjectId (ref `User`, required)
- `roomId`: ObjectId (ref `Room`, required)
- `title`: String, required
- `description`: String
- `image`: [String] (mảng đường dẫn ảnh upload, Multer)
- `status`: `"new"` | `"in_progress"` | `"done"`, mặc định `"new"`

Quy tắc: chỉ chuyển trạng thái theo chiều `new -> in_progress -> done`; chuyển sai thứ tự trả 400.

## 3. Dãy trọ, Phòng, Hợp đồng, Liên hệ (B)

**`Building` (`buildings`)**
- `ownerId`: ObjectId (ref `User`, required), chủ trọ sở hữu dãy
- `name`: String, required
- `address`: String, required
- `electricPrice`: Number, required, >= 0
- `waterPrice`: Number, required, >= 0
- `serviceFee`: Number, mặc định 0

**`Room` (`rooms`)**
- `buildingId`: ObjectId (ref `Building`, required)
- `name`: String, required
- `price`: Number, required, >= 0 (giá thuê niêm yết)
- `area`: Number, required, > 0
- `status`: `"available"` | `"occupied"` | `"maintenance"`, mặc định `"available"`
- `description`: String (tùy chọn, hiển thị ở trang khách)
- **Index**: unique `(buildingId, name)` để không trùng tên phòng trong cùng dãy.

**`Contract` (`contracts`)**
- `tenantId`: ObjectId (ref `User`, required)
- `roomId`: ObjectId (ref `Room`, required)
- `startDate`: Date, required
- `endDate`: Date, required, phải sau `startDate`
- `rent`: Number, required (giá thuê chốt trên hợp đồng)
- `deposit`: Number, mặc định 0
- `status`: `"active"` | `"ended"`, mặc định `"active"`
- `endedAt`: Date (thời điểm kết thúc thực tế)
- **Index**: unique `(roomId)` với `partialFilterExpression: { status: "active" }`, đảm bảo mỗi phòng chỉ có 1 hợp đồng hiệu lực (chặn ngay ở DB, kể cả khi hai request đến cùng lúc). Server vẫn kiểm tra trước để trả 409 có thông báo rõ.

**`Contact` (`contacts`)**: khách chưa đăng nhập để lại thông tin
- `name`: String, required
- `phone`: String, required
- `email`: String
- `message`: String
- `roomId`: ObjectId (ref `Room`, tùy chọn, phòng khách quan tâm)
- `isRead`: Boolean, mặc định `false`

## 4. Hóa đơn & Thống kê (C)

**`Invoice` (`invoices`)**
- `roomId`: ObjectId (ref `Room`, required)
- `contractId`: ObjectId (ref `Contract`, required), hợp đồng hiệu lực lúc lập hóa đơn
- `tenantId`: ObjectId (ref `User`, required), người thuê lúc lập (snapshot)
- `month`: String, required, đúng định dạng `YYYY-MM` (validate regex `/^\d{4}-(0[1-9]|1[0-2])$/`)
- `electricOld`, `electricNew`: Number, required, >= 0
- `waterOld`, `waterNew`: Number, required, >= 0
- `electricPrice`, `waterPrice`: Number (snapshot từ `Building`)
- `roomFee`: Number (snapshot từ `Contract.rent`)
- `serviceFee`: Number (snapshot từ `Building.serviceFee`)
- `electricFee`: Number = (`electricNew` − `electricOld`) × `electricPrice`
- `waterFee`: Number = (`waterNew` − `waterOld`) × `waterPrice`
- `total`: Number = `roomFee` + `electricFee` + `waterFee` + `serviceFee`
- `status`: `"draft"` | `"issued"` | `"paid"`, mặc định `"draft"`
- `issuedAt`: Date (lúc phát hành)
- `paidAt`: Date (lúc thu tiền)
- **Index**:
  - unique `(roomId, month)`: mỗi phòng 1 hóa đơn mỗi tháng.
  - `(status, month)`: phục vụ lọc danh sách và thống kê.
  - `(tenantId, status)`: phục vụ `GET /api/invoices/mine`.

**Quy tắc nghiệp vụ hóa đơn (tất cả tính ở server, client gửi số tiền lên cũng bị bỏ qua)**
1. Chỉ số cũ lấy tự động từ `electricNew`/`waterNew` của hóa đơn tháng trước; tháng đầu tiên của phòng thì nhập tay.
2. `electricNew < electricOld` hoặc `waterNew < waterOld` -> 400.
3. Phòng không có hợp đồng `active` -> 400 (không lập hóa đơn cho phòng trống).
4. Trùng `(roomId, month)` -> 409.
5. Luồng trạng thái: `draft -> issued -> paid`. Chỉ sửa chỉ số khi còn `draft`. Hóa đơn `paid` không được sửa.
6. **Phòng nợ tiền** = hóa đơn có `status = "issued"` (đã phát hành nhưng chưa thu).
7. **Doanh thu theo tháng** = tổng `total` của hóa đơn `status = "paid"`, nhóm theo `month`.

## 5. Phân quyền hiển thị hóa đơn

- `owner`: thấy mọi hóa đơn (kể cả `draft`).
- `tenant`: chỉ thấy hóa đơn có `tenantId` là mình và `status` là `issued` hoặc `paid`.
- Tenant gọi `GET /api/invoices/:id` của hóa đơn người khác -> **403**.
- Tenant gọi hóa đơn `draft` của chính mình -> **404** (không để lộ sự tồn tại của bản nháp).
- Vì hóa đơn lưu `tenantId`, người thuê vẫn xem được lịch sử hóa đơn sau khi hợp đồng đã kết thúc.

## 6. Danh sách API

| Method | URL | Vai trò | Mã trả về chính |
|---|---|---|---|
| POST | `/api/auth/register` | Công khai | 201, 400, 409 |
| POST | `/api/auth/login` | Công khai | 200, 400, 401 |
| GET | `/api/auth/me` | Đăng nhập | 200, 401 |
| GET | `/api/users?role=tenant` | owner | 200, 401, 403 |
| GET/POST | `/api/buildings` | owner | 200, 201, 400, 401, 403 |
| PUT/DELETE | `/api/buildings/:id` | owner | 200, 400, 401, 403, 404 |
| GET | `/api/rooms` (lọc `minPrice`, `maxPrice`, `minArea`, `maxArea`, `status`, `page`, `limit`) | Công khai (khách chỉ thấy phòng trống) | 200 |
| GET | `/api/rooms/:id` | Công khai | 200, 404 |
| POST/PUT/DELETE | `/api/rooms`, `/api/rooms/:id` | owner | 200, 201, 400, 401, 403, 404 |
| GET/POST | `/api/contracts` | owner | 200, 201, 400, 401, 403, 409 |
| PATCH | `/api/contracts/:id/end` | owner | 200, 400, 401, 403, 404 |
| POST | `/api/contacts` | Công khai | 201, 400 |
| GET | `/api/contacts` | owner | 200, 401, 403 |
| POST | `/api/repairs` | tenant | 201, 400, 401, 403 |
| GET | `/api/repairs/my` | tenant | 200, 401, 403 |
| GET | `/api/repairs` | owner | 200, 401, 403 |
| PATCH | `/api/repairs/:id/status` | owner | 200, 400, 401, 403, 404 |
| GET | `/api/invoices/mine` | tenant | 200, 401, 403 |
| GET | `/api/invoices/:id` | owner, tenant (đúng phòng mình) | 200, 401, 403, 404 |
| GET | `/api/invoices` (lọc `month`, `status`, `page`, `limit`) | owner | 200, 401, 403 |
| POST | `/api/invoices` | owner | 201, 400, 401, 403, 409 |
| POST | `/api/invoices/bulk` (nhập chỉ số hàng loạt) | owner | 201, 400, 401, 403, 409 |
| PATCH | `/api/invoices/:id/issue` | owner | 200, 400, 401, 403, 404 |
| PATCH | `/api/invoices/:id/pay` | owner | 200, 400, 401, 403, 404 |
| GET | `/api/stats/summary` (số phòng theo trạng thái, số phòng nợ) | owner | 200, 401, 403 |
| GET | `/api/stats/overdue` (danh sách phòng nợ tiền) | owner | 200, 401, 403 |
| GET | `/api/stats/revenue?year=YYYY` | owner | 200, 400, 401, 403 |

Lỗi 500 do middleware xử lý lỗi tập trung trả về cho mọi API.

## 7. Thống kê dùng Aggregation Pipeline (C)

- **Doanh thu theo tháng**: `$match { status: "paid" }` -> `$group { _id: "$month", revenue: { $sum: "$total" } }` -> `$sort { _id: 1 }`.
- **Phòng nợ tiền**: `$match { status: "issued" }` -> `$group` theo `roomId` (tổng nợ, số hóa đơn, danh sách tháng) -> `$lookup` sang `rooms` -> `$unwind` -> `$project` -> `$sort { totalDebt: -1 }`.