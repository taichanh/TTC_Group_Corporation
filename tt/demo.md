# Kịch Bản Chạy Demo Dự Án: User Auth & Logging Service

## Tổng Quan
Kịch bản này hướng dẫn cách chạy demo cho dự án backend "User Auth & Logging Service". Demo sẽ bao gồm khởi động server, đăng ký người dùng, đăng nhập, và test một số API cơ bản.

## Chia Công Việc Cho 3 Thành Viên
Để demo hiệu quả và tránh chồng chéo, chia thành 3 thành viên theo chuyên trách module. Mỗi thành viên sẽ demo các API liên quan trên Postman, với thứ tự thực hiện tuần tự để đảm bảo dữ liệu phụ thuộc (như token) được tạo trước.

### Chuẩn Bị Chung Trước Demo
1. **Thiết lập môi trường Postman**:
   - Import collection `postman_collection.json`.
   - Tạo environment mới với tên "Demo Environment".
   - Thêm biến `baseURL` = `http://localhost:3000/api/v1`.
   - Thêm biến `token` (sẽ được set sau).

2. **Tạo User Admin**:
   - Sau khi server chạy, sử dụng MongoDB Compass hoặc terminal để thêm user admin trực tiếp vào DB:
     ```javascript
     db.users.insertOne({
       name: "Admin User",
       email: "admin@example.com",
       password: "$2a$10$hashed_password", // Hash của "admin123"
       role: "admin",
       createdAt: new Date()
     });
     ```
   - Hoặc chỉnh sửa code để cho phép register với role admin.

3. **Thời gian ước tính**: Mỗi thành viên ~10-15 phút, tổng cộng ~30-45 phút.

### Thành Viên 1: Chuyên Trách Người Dùng & Xác Thực (Thực hiện đầu tiên)
- **Nhiệm vụ**: Tạo tài khoản user và admin, lấy token để các thành viên khác sử dụng.
- **Thời gian**: 10 phút.
- **Các bước demo chi tiết trên Postman**:
  1. **Health Check** (Tất cả thành viên có thể làm song song):
     - Method: GET, URL: {{baseURL}}/health
     - Expected: {"status": "ok"}
  2. **Đăng ký user thường**:
     - Method: POST, URL: {{baseURL}}/auth/register
     - Body: {"name": "Demo User", "email": "demo@example.com", "password": "password123"}
     - Lưu user ID từ response.
  3. **Đăng nhập user thường**:
     - Method: POST, URL: {{baseURL}}/auth/login
     - Body: {"email": "demo@example.com", "password": "password123"}
     - Lưu token từ response vào biến `token` trong environment.
  4. **Lấy profile user**:
     - Method: GET, URL: {{baseURL}}/users/profile
     - Headers: Authorization: Bearer {{token}}
     - Expected: Thông tin user.
  5. **Cập nhật profile**:
     - Method: PUT, URL: {{baseURL}}/users/profile
     - Headers: Authorization: Bearer {{token}}
     - Body: {"fullName": "Updated Demo User", "phone": "0123456789", "address": "Demo Address"}
  6. **Đăng nhập admin** (nếu đã tạo):
     - Method: POST, URL: {{baseURL}}/auth/login
     - Body: {"email": "admin@example.com", "password": "admin123"}
     - Lưu token admin vào biến `adminToken`.
  7. **Liệt kê users (Admin)**:
     - Method: GET, URL: {{baseURL}}/users
     - Headers: Authorization: Bearer {{adminToken}}
- **Sau khi hoàn thành**: Chia sẻ biến `token` và `adminToken` với các thành viên khác qua Postman environment hoặc copy-paste.

### Thành Viên 2: Chuyên Trách Dữ liệu Người Dùng & Sao Lưu (Thực hiện thứ hai)
- **Nhiệm vụ**: Demo CRUD dữ liệu user và quản lý backup.
- **Thời gian**: 15 phút.
- **Điều kiện**: Cần token từ Thành viên 1.
- **Các bước demo chi tiết trên Postman**:
  1. **Tạo dữ liệu user**:
     - Method: POST, URL: {{baseURL}}/user-data
     - Headers: Authorization: Bearer {{token}}
     - Body: {"key": "demo_key", "value": "demo_value", "metadata": {"type": "test"}}
  2. **Lấy danh sách dữ liệu user**:
     - Method: GET, URL: {{baseURL}}/user-data
     - Headers: Authorization: Bearer {{token}}
  3. **Cập nhật dữ liệu user**:
     - Method: PUT, URL: {{baseURL}}/user-data/:id (thay :id bằng ID từ bước 1)
     - Headers: Authorization: Bearer {{token}}
     - Body: {"value": "updated_value"}
  4. **Xóa dữ liệu user**:
     - Method: DELETE, URL: {{baseURL}}/user-data/:id
     - Headers: Authorization: Bearer {{token}}
  5. **Tạo backup schedule (Admin)**:
     - Method: POST, URL: {{baseURL}}/backup-schedules
     - Headers: Authorization: Bearer {{adminToken}}
     - Body: {"name": "Daily Backup", "cronExpression": "0 0 * * *", "enabled": true}
  6. **Liệt kê backup schedules (Admin)**:
     - Method: GET, URL: {{baseURL}}/backup-schedules
     - Headers: Authorization: Bearer {{adminToken}}
  7. **Trigger backup manual (Admin)**:
     - Method: POST, URL: {{baseURL}}/backups/trigger
     - Headers: Authorization: Bearer {{adminToken}}
     - Expected: Backup job started.
  8. **Liệt kê backups**:
     - Method: GET, URL: {{baseURL}}/backups
     - Headers: Authorization: Bearer {{adminToken}}
  9. **Download backup** (nếu có backup):
     - Method: GET, URL: {{baseURL}}/backups/:id/download
     - Headers: Authorization: Bearer {{adminToken}}
     - Save file.

### Thành Viên 3: Chuyên Trách Phục Hồi & Giám Sát (Thực hiện thứ ba)
- **Nhiệm vụ**: Demo khôi phục dữ liệu và xem logs.
- **Thời gian**: 15 phút.
- **Điều kiện**: Cần token từ Thành viên 1 và dữ liệu từ Thành viên 2.
- **Các bước demo chi tiết trên Postman**:
  1. **Yêu cầu khôi phục dữ liệu**:
     - Method: POST, URL: {{baseURL}}/restore
     - Headers: Authorization: Bearer {{token}}
     - Body: {"restoreType": "DATA", "notes": "Demo restore from backup"}
     - Lưu restore ID từ response.
  2. **Approve restore (Admin)**:
     - Method: PUT, URL: {{baseURL}}/restore/:id/approve (thay :id)
     - Headers: Authorization: Bearer {{adminToken}}
     - Body: {"approved": true, "approvedBy": "admin"}
  3. **Execute restore (Admin)**:
     - Method: POST, URL: {{baseURL}}/restore/:id/execute
     - Headers: Authorization: Bearer {{adminToken}}
     - Expected: Restore job started.
  4. **Liệt kê logs hệ thống (Admin)**:
     - Method: GET, URL: {{baseURL}}/logs
     - Headers: Authorization: Bearer {{adminToken}}
     - Params: ?limit=10
  5. **Liệt kê audit trails (Admin)**:
     - Method: GET, URL: {{baseURL}}/audit-trails
     - Headers: Authorization: Bearer {{adminToken}}
     - Params: ?limit=10
  6. **Xem notifications**:
     - Method: GET, URL: {{baseURL}}/notifications
     - Headers: Authorization: Bearer {{token}}
     - Expected: Danh sách notifications (có thể rỗng nếu chưa có).
  7. **Đánh dấu notification đã đọc** (nếu có notification):
     - Method: PUT, URL: {{baseURL}}/notifications/:id/read
     - Headers: Authorization: Bearer {{token}}

**Lưu ý chung cho demo trên Postman**:
- **Thứ tự thực hiện**: Thành viên 1 hoàn thành trước, sau đó Thành viên 2 và 3 có thể làm song song.
- **Chia sẻ token**: Sử dụng Postman environment để chia sẻ `token` và `adminToken`.
- **Xử lý lỗi**: Nếu gặp lỗi 401, kiểm tra token; nếu 500, kiểm tra logs server.
- **Cleanup**: Sau demo, xóa dữ liệu test nếu cần.

## Yêu Cầu Hệ Thống
- Node.js (phiên bản 14+)
- MongoDB (local hoặc cloud, ví dụ MongoDB Atlas)
- Postman (để test API) hoặc curl

## Bước 1: Chuẩn Bị Môi Trường
1. Đảm bảo MongoDB đang chạy. Nếu dùng local MongoDB, khởi động MongoDB service.
2. Sao chép file môi trường:
   ```
   cp .env.example .env
   ```
3. Chỉnh sửa `.env` với thông tin thực tế:
   - `MONGO_URI`: Chuỗi kết nối MongoDB (ví dụ: `mongodb://localhost:27017/backup_restore_db`)
   - `JWT_SECRET`: Một chuỗi bí mật ngẫu nhiên (ví dụ: `my_super_secret_jwt_key`)
   - `CORS_ORIGINS`: Origins cho CORS (tùy chọn, mặc định là tất cả)

## Bước 2: Cài Đặt Dependencies
```
npm install
```

## Bước 3: Khởi Động Server
Chạy server ở chế độ development:
```
npm run dev
```
Server sẽ chạy trên `http://localhost:4000` (hoặc port được cấu hình).

## Bước 4: Demo Các API
Sử dụng Postman để import collection `postman_collection.json` và test các endpoint sau.

### 4.1 Health Check
- **Method**: GET
- **URL**: `http://localhost:4000/api/v1/health`
- **Expected Response**: `{"status": "ok"}`

### 4.2 Đăng Ký Người Dùng
- **Method**: POST
- **URL**: `http://localhost:4000/api/v1/auth/register`
- **Body** (JSON):
  ```json
  {
    "name": "Demo User",
    "email": "demo@example.com",
    "password": "password123"
  }
  ```
- **Expected Response**: Thông tin user mới với ID.

### 4.3 Đăng Nhập
- **Method**: POST
- **URL**: `http://localhost:4000/api/v1/auth/login`
- **Body** (JSON):
  ```json
  {
    "email": "demo@example.com",
    "password": "password123"
  }
  ```
- **Expected Response**: Token JWT.

Lưu token này để sử dụng trong các request sau (thêm vào header `Authorization: Bearer <token>`).

### 4.4 Lấy Profile Người Dùng
- **Method**: GET
- **URL**: `http://localhost:4000/api/v1/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Expected Response**: Thông tin profile user.

### 4.5 Cập Nhật Profile
- **Method**: PUT
- **URL**: `http://localhost:4000/api/v1/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body** (JSON):
  ```json
  {
    "fullName": "Updated Name",
    "phone": "123456789",
    "address": "Demo Address"
  }
  ```
- **Expected Response**: Profile đã cập nhật.

### 4.6 Yêu Cầu Khôi Phục Dữ Liệu (User)
- **Method**: POST
- **URL**: `http://localhost:4000/api/v1/restore`
- **Headers**: `Authorization: Bearer <token>`
- **Body** (JSON):
  ```json
  {
    "restoreType": "DATA",
    "notes": "Demo restore request"
  }
  ```
- **Expected Response**: Thông tin restore request với status "pending".

### 4.7 Liệt Kê Logs Hệ Thống (Admin)
- **Method**: GET
- **URL**: `http://localhost:4000/api/v1/logs`
- **Headers**: `Authorization: Bearer <admin_token>` (cần đăng ký user với role admin)
- **Expected Response**: Danh sách logs.

### 4.8 Trigger Backup Manual (Admin)
- **Method**: POST
- **URL**: `http://localhost:4000/api/v1/backups/trigger`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Expected Response**: Backup started.

## Bước 5: Dừng Demo
- Dừng server bằng Ctrl+C.
- Nếu cần, xóa dữ liệu demo từ MongoDB.

## Lưu Ý
- Đảm bảo MongoDB connection hoạt động.
- Nếu gặp lỗi, kiểm tra logs trong terminal.
- Để demo đầy đủ, tạo ít nhất một user admin bằng cách chỉnh sửa trực tiếp DB hoặc thêm logic trong code.
- Cron job backup sẽ chạy tự động theo lịch (mặc định hàng ngày), nhưng có thể trigger manual.

## Troubleshooting
- **Lỗi kết nối DB**: Kiểm tra MONGO_URI trong .env.
- **JWT lỗi**: Đảm bảo JWT_SECRET được set.
- **Port conflict**: Thay đổi port trong server.js nếu cần.