# User Auth & Logging Service (Node.js + Express + MongoDB)

Mục tiêu: Triển khai module "Người dùng & Xác thực" cho dự án backup/restore — bao gồm đăng ký, đăng nhập, profile update, JWT auth, RBAC (user/admin), system logs và restore request logging.

## Tính năng đã triển khai
- Register/Login với JWT authentication và session management
- User profile management với avatar support
- CRUD operations cho user data
- Role-based access control (RBAC) với user/admin roles
- System logging cho tất cả operations
- Audit trails cho sensitive actions
- Automated backup với cron scheduling
- Manual backup trigger và download
- Restore request workflow (request → approve → execute)
- Notification system cho user alerts
- Session tracking và management
- Rate limiting và security middleware

## Sơ đồ dữ liệu (9 Collections chính)
1) users
- _id: ObjectId
- name: string
- email: string (unique)
- password: string (hashed)
- role: "user" | "admin"
- profile: { fullName, phone, address, avatar }
- lastLoginAt: Date
- isActive: boolean
- emailVerified: boolean
- createdAt, updatedAt: Date

2) user_data
- _id: ObjectId
- user: ObjectId (ref: users)
- key: string
- value: Mixed
- metadata: Object
- createdAt, updatedAt: Date

3) system_logs
- _id: ObjectId
- user: ObjectId | null (ref: users)
- action: string (USER_REGISTER | USER_LOGIN | ...)
- meta: Object
- ip: string
- userAgent: string
- createdAt: Date

4) audit_trails
- _id: ObjectId
- user: ObjectId (ref: users)
- action: string
- resource: string
- oldValue: Mixed
- newValue: Mixed
- ip: string
- createdAt: Date

5) backups
- _id: ObjectId
- name: string
- status: "pending" | "in_progress" | "completed" | "failed"
- filePath: string
- fileSize: number
- createdBy: ObjectId (ref: users)
- createdAt, completedAt: Date

6) backup_schedules
- _id: ObjectId
- name: string
- cronExpression: string
- enabled: boolean
- lastRun: Date
- nextRun: Date
- createdBy: ObjectId (ref: users)
- createdAt: Date

7) restore_logs
- _id: ObjectId
- user: ObjectId (ref: users)
- requestedBy: ObjectId (ref: users)
- status: "pending" | "approved" | "in_progress" | "completed" | "failed"
- backupRef: string
- notes: string
- approvedBy: ObjectId (ref: users)
- createdAt, completedAt: Date

8) notifications
- _id: ObjectId
- user: ObjectId (ref: users)
- type: string ("backup_completed" | "restore_requested" | ...)
- title: string
- message: string
- isRead: boolean
- metadata: Object
- createdAt: Date

9) sessions
- _id: ObjectId
- user: ObjectId (ref: users)
- token: string (unique)
- ipAddress: string
- userAgent: string
- deviceInfo: Object
- loginAt: Date
- logoutAt: Date
- isActive: boolean
- expiresAt: Date

Quan hệ: Tất cả collections đều liên kết với users qua ObjectId references. System_logs, audit_trails, notifications, sessions tham chiếu trực tiếp đến users. User_data, restore_logs có quan hệ với users. Backups và backup_schedules được tạo bởi users.

3) restore_logs
- _id
- user: ObjectId (owner of data)
- requestedBy: ObjectId (who requested)
- status: pending|in_progress|completed|failed
- backupRef: string (tùy chọn)
- notes: string
- createdAt, completedAt

Quan hệ: system_logs và restore_logs tham chiếu tới users bằng ObjectId.

## Cách chạy
1. Copy `.env.example` -> `.env` và điền:
   - MONGO_URI (mặc định trong example là connection bạn cung cấp — tốt nhất thay bằng biến an toàn)
   - JWT_SECRET
2. Cài dependencies:
   npm install
3. Chạy dev:
   npm run dev

## Endpoints (ví dụ)
- POST /api/v1/auth/register
  - body: { email, password, profile? }
- POST /api/v1/auth/login
  - body: { email, password }
  - returns token (Bearer)
- GET /api/v1/users/me
  - headers: Authorization: Bearer <token>
- PATCH /api/v1/users/me
  - body: { profile?, password?, email? }
- POST /api/v1/users/:id/request-restore
  - headers: Bearer token (user or admin)
  - body: { notes? }
- GET /api/v1/users
  - admin only

## Ví dụ Postman (tóm tắt)
1. Register -> Login -> lấy token
2. GET /users/me với header Authorization
3. POST /users/:id/request-restore (id = mình hoặc admin có thể cho id khác)

## Quick curl examples

- Register:

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret123","name":"User"}'
```

- Login:

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret123"}'
```

- Trigger backup (admin):

```bash
curl -X POST http://localhost:4000/api/v1/backups/trigger \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'
```

## Notifications

You can configure an external webhook to receive lifecycle events for backup/restore by setting the environment variable `NOTIFY_WEBHOOK` to a URL. Events posted are: `backup.start`, `backup.complete`, `backup.failed`, `restore.request`, `restore.approved`, `restore.executed`, `restore.verified`.

Example (dev):

```bash
export NOTIFY_WEBHOOK="http://localhost:9000/hooks"
```

## Bảo mật & Triển khai
- Không lưu JWT_SECRET / MONGO_URI trong mã nguồn public.
- Sử dụng TLS/SSL cho API endpoint khi triển khai.
- Giới hạn số lần đăng nhập (rate-limiting) và theo dõi logs (Log retention) - có thể bổ sung sau.

## Mở rộng (gợi ý)
- Tạo collection `backups` + scheduler cron để tự động snapshot -> lưu metadata vào backups.
- Endpoint admin để xem/approve/execute restore (kết nối với module backup/restore).
- Giám sát: metrics cho số restore, thời gian backup, lỗi.
