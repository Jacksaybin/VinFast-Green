# 📋 Kế hoạch phát triển tính năng Admin — V-GREEN Platform

> **Phạm vi**: Cải thiện các tính năng Admin hiện có, tập trung **Vận hành tài chính** (treasury, payout, hoa hồng, đối soát)
> **Thời gian**: Roadmap dài hạn (3 giai đoạn, không deadline cứng)
> **Stack**: React + TypeScript + Tailwind + Zustand (frontend) · Node.js + Express + PostgreSQL/Neon (backend)

---

## 1. Hiện trạng hệ thống Admin (Baseline)

### 1.1. Backend routes & services đã có (`server/src/`)

| Module | Routes | Service | Trạng thái |
|---|---|---|---|
| Thống kê | `GET /api/admin/stats` | `authService.getStats()` | ✅ Hoạt động |
| Users | `GET/PUT /api/admin/users` | `authService` | ✅ Cơ bản |
| Ví (cộng/trừ) | `POST /api/admin/wallet/adjust` | `walletService` | ✅ Cơ bản, chưa có giới hạn |
| Duyệt nạp | `GET/POST /api/admin/deposits` | `walletService` | ✅ Cơ bản |
| Duyệt rút | `GET/POST /api/admin/withdrawals` | `walletService` | ✅ Cơ bản |
| Gói đầu tư | `GET/PUT /api/admin/packages` | `investmentService` | ⚠️ Chỉ GET/UPDATE, chưa có CREATE/DELETE |
| Tin tức | `GET/POST/PUT/DELETE /api/admin/news` | `newsService` | ✅ Đầy đủ CRUD |
| Chat hỗ trợ | `GET/POST /api/admin/chat/*` | `chatService` | ✅ OK |
| KYC | `POST /api/kyc/admin/*` | `kycService` | ✅ OK |
| Audit log | `GET /api/audit` | `auditService` | ✅ OK |
| Settings | `GET/PUT/DELETE /api/settings` | `settingsService` | ✅ Generic, chưa có UI riêng |

### 1.2. Frontend Admin pages (`src/pages/`)

- `Admin.tsx` (55 KB) — Container chính, có sidebar 11 modules
- `AdminAudit.tsx`, `AdminKyc.tsx`, `AdminSettings.tsx` — Tách riêng

### 1.3. Các "gap" quan trọng đã phát hiện

1. **Thiếu CRUD đầy đủ cho Packages**: chỉ sửa, không tạo mới / xóa
2. **Thiếu chính sách giới hạn điều chỉnh số dư**: admin nào cũng có thể +/- không giới hạn
3. **Thiếu lý do bắt buộc khi duyệt / từ chối** (chỉ ghi audit chung chung)
4. **Thiếu báo cáo Treasury** (tổng nạp – rút – lợi nhuận theo ngày/tuần/tháng)
5. **Thiếu đối soát (reconciliation)** giữa số dư hệ thống và số dư thực tế
6. **Thiếu commission/referral payout dashboard** (mặc dù `transactions.type` đã có `referral`)
7. **Thiếu bulk actions** trong duyệt nạp/rút
8. **Thiếu export CSV/Excel** cho các danh sách
9. **Thiếu phân quyền admin chi tiết** (hiện chỉ `admin` / `super_admin` đơn giản)
10. **Thiếu dashboard real-time** (đang phải bấm refresh thủ công)

---

## 2. Mục tiêu giai đoạn

| Giai đoạn | Tên gọi | Trọng tâm | Giá trị kinh doanh |
|---|---|---|---|
| **Phase 1** | Foundation & Hardening | Bảo mật + workflow duyệt chuẩn | Giảm rủi ro vận hành, audit rõ ràng |
| **Phase 2** | Treasury & Reporting | Báo cáo tài chính + đối soát | Ra quyết định nhanh, minh bạch dòng tiền |
| **Phase 3** | Scale & Automation | Bulk actions, payout tự động, RBAC | Tiết kiệm thời gian vận hành khi scale |

---

## 3. Phase 1 — Foundation & Hardening (Tuần 1-3)

### 🎯 Mục tiêu: Chuẩn hóa quy trình duyệt, tăng cường audit

### 3.1. Bắt buộc nhập lý do khi duyệt / từ chối

**Backend** — `server/src/services/walletService.ts`
- `approveDeposit(txId, adminId, reason, req)` — thêm `reason`
- `rejectDeposit(txId, adminId, reason, req)`
- `approveWithdraw(txId, adminId, reason, req)`
- `rejectWithdraw(txId, adminId, reason, req)`
- Validate: `reason.length >= 5`

**Routes** — `server/src/routes/admin.ts`
- Validate bằng `express-validator`: `body('reason').trim().isLength({ min: 5 })`

**Frontend** — `src/pages/Admin.tsx`
- Modal "Lý do duyệt/từ chối" trước khi gọi API
- Hiển thị lý do trong danh sách giao dịch

**Audit log** — ghi `old_data.reason` để tra cứu

### 3.2. Giới hạn điều chỉnh số dư (`/api/admin/wallet/adjust`)

- Thêm settings: `admin_max_credit_per_tx`, `admin_max_debit_per_tx`
- Validate số tiền tối đa mỗi lần (mặc định: 100,000,000 VND)
- **Double-confirm** cho `subtract`: bắt buộc nhập mật khẩu admin
- Log chi tiết `entity_type = 'wallet_adjustment'` với `old_data.balance`, `new_data.balance`

### 3.3. Trạng thái xử lý rõ ràng cho giao dịch

- Thêm `processing_status`: `pending → reviewing → approved/rejected`
- UI: pill trạng thái + timeline

### 3.4. Cải thiện Audit Log (`AdminAudit.tsx`)

- Thêm filter: `userId`, `dateRange`, `entityType`
- Hiển thị `old_data` vs `new_data` dạng JSON diff
- Export CSV

### 3.5. Cải thiện Settings UI (`AdminSettings.tsx`)

Hiện đang là JSON raw → cần form-friendly:

| Setting key | Loại | Mô tả |
|---|---|---|
| `min_deposit` | number | Số tiền nạp tối thiểu |
| `max_deposit` | number | Số tiền nạp tối đa |
| `min_withdraw` | number | Số tiền rút tối thiểu |
| `max_withdraw` | number | Số tiền rút tối đa |
| `withdraw_fee_percent` | number | Phí rút tiền (%) |
| `referral_bonus_percent` | number | Hoa hồng giới thiệu (%) |
| `admin_max_credit_per_tx` | number | Giới hạn cộng tiền/lần |
| `admin_max_debit_per_tx` | number | Giới hạn trừ tiền/lần |
| `maintenance_mode` | boolean | Bật/tắt chế độ bảo trì |

**Acceptance**: Form input riêng cho từng loại (number/boolean/string), preview JSON.

### 3.6. Checklist Phase 1

- [ ] Migration DB: thêm cột `reason` cho `audit_logs` (nếu cần) — có thể dùng `new_data->>'reason'`
- [ ] API mới: thêm `reason` vào 4 endpoints duyệt
- [ ] UI modal lý do
- [ ] Form Settings UI chuyên biệt
- [ ] Test: duyệt không có lý do → 400

---

## 4. Phase 2 — Treasury & Reporting (Tuần 4-7)

### 🎯 Mục tiêu: Báo cáo tài chính chuyên sâu + đối soát

### 4.1. Dashboard nâng cao (`Admin.tsx` - module `dashboard`)

Thay vì chỉ 5 chỉ số cơ bản, bổ sung:

**Tổng quan tài chính (treasury summary)**
```
+ Tổng nạp vào (30 ngày)        + Đang chờ duyệt
+ Tổng rút ra (30 ngày)          + Đã hoàn tất
+ Tổng lợi nhuận đã trả         + Tỷ lệ duyệt (approve rate)
+ Tổng hoa hồng giới thiệu      + Số dư ví tổng hệ thống
```

**Charts** (dùng `recharts` đã có sẵn trong `package.json`)
- Line chart: nạp/rút theo ngày (30 ngày gần nhất)
- Pie chart: phân bố đầu tư theo gói
- Bar chart: top 10 user theo tổng đầu tư

**Backend mới**: `GET /api/admin/treasury/summary?from=&to=`
- Aggregate từ `transactions` theo `type` + `status`
- Trả về time-series

### 4.2. Báo cáo đối soát (Reconciliation)

**Vấn đề hiện tại**: Không có cách nào kiểm tra `SUM(wallets.balance) == SUM(nạp) - SUM(rút) - SUM(investment) + SUM(profit)`

**API mới**: `GET /api/admin/reconcile/daily?date=YYYY-MM-DD`
```typescript
{
  date: "2026-08-15",
  totalDeposits: 1234567890,
  totalWithdraws: 234567890,
  totalInvestments: 567890123,
  totalProfits: 12345678,
  systemBalance: 446789555,
  expectedBalance: 446789555,    // Khớp = OK
  discrepancy: 0,
  status: "matched" | "mismatch"
}
```

**UI mới**: Module "Đối soát" trong sidebar
- Bảng theo ngày (7/30 ngày)
- Highlight dòng có `discrepancy != 0` màu đỏ
- Nút "Xuất Excel"

### 4.3. Báo cáo hoa hồng giới thiệu

**Backend**: `GET /api/admin/referrals/stats`
```typescript
{
  totalReferrers: 123,
  totalBonusPaid: 12345678,
  topReferrers: [{ userId, fullName, phone, count, totalBonus }]
}
```

**Frontend**: Module mới "Giới thiệu" trong Admin
- Bảng top referrer
- Drill-down: xem user nào đã giới thiệu, đã nhận bao nhiêu

### 4.4. Export dữ liệu

Thêm button "Export CSV" cho:
- Danh sách users
- Danh sách giao dịch
- Lịch sử audit log
- Báo cáo đối soát

**Helper mới**: `src/lib/export.ts` — `exportToCSV(data, filename)`

### 4.5. Checklist Phase 2

- [ ] API `/api/admin/treasury/summary`
- [ ] API `/api/admin/reconcile/daily`
- [ ] API `/api/admin/referrals/stats`
- [ ] Charts trên Dashboard
- [ ] Module "Đối soát"
- [ ] Module "Giới thiệu"
- [ ] Helper export CSV + áp dụng 4 chỗ

---

## 5. Phase 3 — Scale & Automation (Tuần 8-12)

### 🎯 Mục tiêu: Tiết kiệm thời gian vận hành khi user tăng

### 5.1. Bulk Actions

**Module duyệt nạp/rút**:
- Checkbox từng dòng + "Chọn tất cả"
- Buttons: `[Duyệt tất cả đã chọn] [Từ chối tất cả]`
- Validate: chỉ cho bulk action các giao dịch cùng `type` và cùng trạng thái `pending`

**Backend mới**:
- `POST /api/admin/deposits/bulk-approve` — body: `{ ids: [], reason: "" }`
- `POST /api/admin/deposits/bulk-reject`
- Tương tự cho withdrawals

### 5.2. Phân quyền admin chi tiết (RBAC)

**Schema mới**:
```sql
ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '{}';
```

**Các permission keys**:
- `deposits.approve`, `deposits.reject`
- `withdrawals.approve`, `withdrawals.reject`
- `wallet.adjust`
- `users.suspend`, `users.edit`
- `packages.edit`
- `news.edit`
- `settings.edit`
- `audit.view`

**Middleware mới** — `server/src/middleware/auth.ts`:
- `requirePermission('wallet.adjust')`
- Super admin luôn pass mọi permission

**UI**:
- Trang "Quản lý Admin" trong sidebar (chỉ super_admin thấy)
- Bảng user có role `admin` → click vào để tick permission

### 5.3. Auto-payout cho lợi nhuận & hoa hồng

**Hiện trạng**: `investmentService` có code `accumulated_profit` nhưng việc cộng lợi nhuận hàng ngày đang thủ công / không rõ.

**Cải tiến**:
- Tạo `server/src/cron/dailyProfit.ts` — chạy mỗi ngày 00:05
- Tính lợi nhuận cho tất cả `investments.status = 'active'`
- Cộng vào `wallets.balance`
- Ghi transaction `type = 'profit'`
- Gửi notification cho user
- Cần scheduler: `node-cron` (thêm dep)

**Hoàn thành kỳ hạn**:
- Khi `end_date < NOW()`, set `investments.status = 'completed'`
- Hoàn vốn + lợi nhuận cuối kỳ vào `wallets.balance`

### 5.4. Auto-pay hoa hồng giới thiệu

- Khi user nạp tiền lần đầu → cộng `referral_bonus_percent` cho người giới thiệu
- Trigger: trong `approveDeposit()` → kiểm tra `is_first_deposit` → bonus cho referrer

### 5.5. Real-time dashboard

- Backend: `GET /api/admin/stats/stream` (SSE) hoặc WebSocket
- Frontend: dùng `EventSource` → auto refresh stats mỗi 30s
- Hiển thị "Last updated: 3s ago" + indicator "🟢 Live"

### 5.6. Module "Thông báo hàng loạt" (Broadcast)

- Tạo form gửi notification cho:
  - Tất cả users
  - Filter: theo KYC status, theo role
- Preview trước khi gửi
- Tracking: bao nhiêu user đã đọc

**API**:
- `POST /api/admin/notifications/broadcast` — body: `{ title, message, type, targetFilter, link }`
- Service: `notificationService.broadcast()`

### 5.7. Checklist Phase 3

- [ ] Bulk approve/reject API + UI
- [ ] Migration: `users.permissions` JSONB
- [ ] Permission middleware + 9 permission keys
- [ ] Cron daily profit (test với 1 user trước)
- [ ] Cron referral bonus
- [ ] SSE endpoint + UI live indicator
- [ ] Broadcast notification API + UI

---

## 6. Cải tiến UI/UX xuyên suốt (Làm song song mọi phase)

### 6.1. Tổ chức lại `Admin.tsx`

File hiện tại 55 KB chứa 11 modules → tách thành:

```
src/pages/admin/
├── Dashboard.tsx       # Tổng quan + charts
├── Deposits.tsx        # Duyệt nạp
├── Withdrawals.tsx     # Duyệt rút
├── Chat.tsx            # Hỗ trợ
├── Users.tsx           # Quản lý user
├── KYC.tsx             # (đã có AdminKyc)
├── Packages.tsx        # Quản lý gói
├── News.tsx            # Quản lý tin tức
├── Transactions.tsx    # Lịch sử giao dịch
├── Audit.tsx           # (đã có AdminAudit)
├── Settings.tsx        # (đã có AdminSettings)
├── Treasury.tsx        # MỚI (Phase 2)
├── Referral.tsx        # MỚI (Phase 2)
├── Admins.tsx          # MỚI (Phase 3 - quản lý admin)
└── Broadcast.tsx       # MỚI (Phase 3)
```

`Admin.tsx` chỉ còn shell + sidebar + router.

### 6.2. State management chuẩn hóa

Hiện `Admin.tsx` quản lý ~25 `useState` → tách thành Zustand store:

```
src/stores/adminStore.ts
  ├── dashboard: { stats, treasury, recentTx, ... }
  ├── deposits: { list, pagination, filters }
  ├── withdrawals: ...
  ├── users: ...
  ├── chat: ...
  └── ui: { activeModule, sidebarOpen, ... }
```

### 6.3. Component dùng chung

Tạo `src/components/admin/AdminShell.tsx` chứa:
- Sidebar (responsive: drawer trên mobile)
- Topbar (search, refresh, admin name)
- Toast container

### 6.4. Loading & Empty states

- Đã có `Loading`, `Empty`, `ErrorBox` trong `components/ui/StateViews` — dùng xuyên suốt
- Skeleton loading cho tables

### 6.5. Mobile-first

- Bảng dài → chuyển thành card list trên mobile
- Sidebar → drawer
- Modal chiếm 90% width

---

## 7. Bảng tổng hợp theo Sprint (đề xuất không cứng)

| Sprint | Phase | Stories chính | Effort |
|---|---|---|---|
| **S1** | 1 | Lý do duyệt + Modal | M |
| **S2** | 1 | Giới hạn adjust + double-confirm | M |
| **S3** | 1 | Settings UI chuyên biệt | S |
| **S4** | 1 | Audit log filter + export | S |
| **S5** | 2 | Treasury summary API + UI charts | L |
| **S6** | 2 | Reconciliation module | L |
| **S7** | 2 | Referral stats + Export CSV | M |
| **S8** | 3 | Bulk actions API + UI | M |
| **S9** | 3 | RBAC schema + middleware | L |
| **S10** | 3 | Admin management UI | M |
| **S11** | 3 | Cron daily profit + referral bonus | L |
| **S12** | 3 | SSE + Broadcast | M |

**Effort**: S = 1-3 ngày · M = 4-7 ngày · L = 8-14 ngày

---

## 8. Rủi ro & Mitigation

| Rủi ro | Tác động | Mitigation |
|---|---|---|
| Cron job chạy 2 lần → cộng lợi nhuận 2 lần | Rất cao | Idempotency: ghi transaction `reference = 'PROFIT-YYYYMMDD-USERID'`, dùng UNIQUE |
| Admin bulk approve nhầm | Cao | Modal confirm + nhập số lượng để xác nhận |
| Lộ permissions của admin khác | Trung bình | Chỉ super_admin mới thấy trang Admins |
| Reconciliation sai do có transaction race condition | Cao | Chạy reconcile lúc 02:00 sáng khi traffic thấp |
| Export CSV lộ thông tin nhạy cảm | Trung bình | Mask số điện thoại, ẩn email theo permission |

---

## 9. Metrics thành công (KPIs)

- ⏱️ **Thời gian duyệt giao dịch trung bình** < 5 phút
- 📉 **Tỷ lệ bulk action** > 30% tổng giao dịch sau Phase 3
- ✅ **Reconciliation matched days** = 100%
- 🐛 **Số lỗi do admin thao tác nhầm** giảm 80% sau khi có confirm dialog
- 📊 **Admin dùng Dashboard charts** > 60% session

---

## 10. Bước tiếp theo đề xuất

1. **Review kế hoạch** với team/stakeholders
2. **Ưu tiên Phase 1** (Foundation & Hardening) — chạy trước
3. **Bắt đầu Sprint 1**: "Lý do bắt buộc khi duyệt/từ chối" — Quick win, ít phụ thuộc
4. Sau khi Phase 1 xong → review lại để điều chỉnh Phase 2/3

> 💡 Bạn muốn tôi bắt đầu implement Sprint 1 (lý do duyệt + modal) ngay bây giờ không? Hay muốn xem thêm chi tiết phần nào trước?