# V-GREEN Platform

Nền tảng đầu tư trạm sạc VinFast — Frontend React + Backend Node.js + PostgreSQL (Neon)

## Cấu trúc dự án

```
VinFast/
├── server/               # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── seed.ts        # Database seed script
│   │   ├── schema.sql     # PostgreSQL schema (chạy trên Neon)
│   │   ├── db.ts          # PostgreSQL connection pool
│   │   ├── routes/        # API routes (auth, wallet, investments, admin, notifications, news)
│   │   ├── services/      # Business logic services
│   │   └── middleware/    # Auth, audit middleware
│   ├── .env               # Environment variables
│   └── package.json
├── src/                   # Frontend (React + TypeScript)
│   ├── lib/
│   │   ├── api.ts         # API client (kết nối backend)
│   │   └── format.ts      # Utilities định dạng tiền/ngày
│   ├── stores/            # Zustand stores (auth, wallet, investment, notification)
│   ├── components/        # UI components + Header, InvestmentForm
│   └── pages/             # 15 trang (Home, Investment, Admin, v.v.)
├── supabase/              # Schema cũ (Supabase - không còn dùng)
├── .env                   # Frontend env
└── .env.example
```

---

## Hướng dẫn cài đặt nhanh

### Bước 1: Chạy Schema trên Neon

1. Đăng nhập [Neon Console](https://neon.tech)
2. Mở **SQL Editor** trong project của bạn
3. Copy toàn bộ nội dung `server/src/schema.sql` và paste → Run
4. Chờ tạo bảng xong

### Bước 2: Khởi động Backend

```bash
cd server

# Cài dependencies (nếu chưa có)
npm install

# Chạy seed data (tạo gói đầu tư, bài viết, admin account)
npm run seed

# Khởi động dev server
npm run dev
# → Backend chạy tại http://localhost:3001
```

### Bước 3: Khởi động Frontend

```bash
# Terminal mới
npm run dev
# → Frontend chạy tại http://localhost:5173
```

### Bước 4: Đăng nhập Admin

```
Số điện thoại: admin
Mật khẩu:     admin123
```

---

## Các lệnh

### Backend

```bash
cd server

npm run dev      # Dev server với hot reload
npm run seed     # Seed data (packages, news, settings)
npm run start    # Production
```

### Frontend

```bash
npm run dev      # Dev server
npm run build    # Production build → dist/
```

---

## API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập (trả về JWT) |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |
| PUT | `/api/auth/profile` | Cập nhật thông tin cá nhân |

### Wallet (cần Auth)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/wallet` | Lấy số dư ví |
| POST | `/api/wallet/deposit` | Yêu cầu nạp tiền |
| POST | `/api/wallet/withdraw` | Yêu cầu rút tiền |
| GET | `/api/wallet/transactions` | Lịch sử giao dịch |

### Investments
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/investments/packages` | Danh sách gói đầu tư |
| POST | `/api/investments/invest` | Tạo đầu tư (cần Auth) |
| GET | `/api/investments/my-investments` | Đầu tư của tôi (cần Auth) |

### Admin (cần role=admin)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/deposits` | Danh sách nạp tiền chờ duyệt |
| POST | `/api/admin/deposits/:id/approve` | Duyệt nạp tiền |
| POST | `/api/admin/deposits/:id/reject` | Từ chối nạp tiền |
| GET | `/api/admin/withdrawals` | Danh sách rút tiền chờ duyệt |
| POST | `/api/admin/withdrawals/:id/approve` | Duyệt rút tiền |
| POST | `/api/admin/withdrawals/:id/reject` | Từ chối rút tiền |
| POST | `/api/admin/wallet/adjust` | Cộng/trừ số dư user |
| GET | `/api/admin/users` | Danh sách người dùng |
| PUT | `/api/admin/users/:id/status` | Khóa/mở tài khoản |
| GET/POST/PUT/DELETE | `/api/admin/news` | CRUD tin tức |
| GET/PUT | `/api/admin/packages` | Quản lý gói đầu tư |

### Notifications (cần Auth)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/notifications` | Danh sách thông báo |
| GET | `/api/notifications/unread-count` | Số thông báo chưa đọc |
| PUT | `/api/notifications/:id/read` | Đánh dấu đã đọc |
| PUT | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc |

### News (Public)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/news` | Danh sách bài viết |
| GET | `/api/news/:slug` | Chi tiết bài viết |

---

## Tính năng đã triển khai

### User
- ✅ Đăng nhập / Đăng ký (JWT)
- ✅ Dashboard tài khoản (số dư, đầu tư, lợi nhuận)
- ✅ Nạp tiền / Rút tiền
- ✅ Đầu tư gói (form 4 bước)
- ✅ Lịch sử giao dịch
- ✅ Thông báo in-app
- ✅ Phúc lợi & Thưởng
- ✅ Giới thiệu bạn bè

### Admin
- ✅ Dashboard tổng quan
- ✅ Duyệt nạp tiền
- ✅ Duyệt rút tiền
- ✅ Quản lý người dùng
- ✅ Cộng/trừ số dư user
- ✅ CRUD tin tức
- ✅ Quản lý gói đầu tư
- ✅ Audit log

### Backend
- ✅ PostgreSQL (Neon) connection pool
- ✅ JWT authentication
- ✅ RLS (Row Level Security) via API middleware
- ✅ Audit logging
- ✅ Transaction safety (BEGIN/COMMIT/ROLLBACK)
- ✅ Validation (express-validator)
- ✅ CORS configuration
- ✅ Seed data script

---

## Environment Variables

### Backend (`server/.env`)

```env
DATABASE_URL=postgresql://...   # Từ Neon Console
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=3001
CORS_ORIGIN=http://localhost:5173
ADMIN_PHONE=admin
ADMIN_PASSWORD=admin123
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## Database Schema

```
users ──────────────── wallets (1:1)
  │                        │
  │                        │
  ├── investments ── packages (N:1)
  ├── transactions (N:1)
  └── notifications (1:N)

news ────────────────────── authors
```

---

## Kết nối Backend → Frontend

Stores (`src/stores/`) tự động kết nối backend API:

1. Thử gọi API backend
2. Nếu backend offline → fallback localStorage
3. User vẫn sử dụng được mà không cần backend

---

## Troubleshooting

**Backend không khởi động?**
- Kiểm tra `DATABASE_URL` trong `.env`
- Chạy `npm run seed` trước

**Frontend không gọi được API?**
- Kiểm tra backend đang chạy port 3001
- Kiểm tra `VITE_API_URL` trong `.env`

**Lỗi CORS?**
- Cập nhật `CORS_ORIGIN` trong `server/.env`

**Tạo thêm admin?**
```sql
UPDATE users SET role = 'admin' WHERE phone = 'your-phone';
```
