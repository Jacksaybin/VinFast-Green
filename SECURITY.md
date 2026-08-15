# Security Policy & Secrets Rotation

Tài liệu này hướng dẫn cách **rotate secrets** khi bị lộ và **checklist trước khi go-live production**.

> **Nguyên tắc vàng**: Mọi secret phải được cấp qua biến môi trường. File `.env` (và mọi biến thể `.env.local`, `.env.production`, …) **KHÔNG BAO GIỜ** được commit vào git.

---

## 1. Quy trình rotate secrets khi bị lộ

Nếu bất kỳ secret nào dưới đây lộ (commit nhầm, log ra stdout, đăng lên Slack, ...) → phải rotate ngay trong vòng 24h.

### Bước 1 — Sinh secret mới

```bash
# JWT secrets (48 bytes base64url ~ 64 ký tự)
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# Admin password (16 ký tự random)
node -e "console.log(require('crypto').randomBytes(16).toString('base64url'))"

# Refresh token secret — dùng command trên, secret khác với JWT_SECRET
```

### Bước 2 — Cập nhật secrets

| Nơi | Hành động |
|---|---|
| **Neon Console** | Rotate `DATABASE_URL` (nếu lộ) → Project → Settings → Reset Password |
| **Render / hosting** | Update env vars: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_PASSWORD` |
| **Local** | Sửa `server/.env` của máy dev (KHÔNG commit) |

### Bước 3 — Vô hiệu hoá phiên cũ

Đổi `JWT_SECRET` sẽ tự động vô hiệu hoá **mọi access token đang lưu hành** — user phải đăng nhập lại. Đây là hành vi mong muốn sau sự cố.

### Bước 4 — Gỡ secret đã lộ khỏi git history

```bash
# Dùng BFG Repo-Cleaner hoặc git filter-repo
# Sau đó force-push (cảnh báo team trước)

bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

> ⚠️ Nếu repo đã public, **mọi secret trong history là đã lộ** → rotate secrets BẮT BUỘC, không chỉ xoá khỏi HEAD.

---

## 2. Production checklist

Trước khi deploy lên production, đảm bảo:

### Backend (`server/.env`)

- [ ] `DATABASE_URL` dùng user riêng (không phải `neondb_owner` nếu có thể) + sslmode=require
- [ ] `JWT_SECRET` ≥ 32 ký tự random (KHÔNG dùng giá trị mặc định)
- [ ] `JWT_REFRESH_SECRET` khác `JWT_SECRET`
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` chỉ chứa domain production (KHÔNG có `localhost`)
- [ ] `ADMIN_PASSWORD` đã đổi, không còn là `admin123`
- [ ] `FALLBACK_REFERRAL_CODE` trỏ tới user thật

### Frontend (`.env.production`)

- [ ] `VITE_API_URL` trỏ tới backend production
- [ ] `VITE_ENABLE_DEV_FALLBACK=false`
- [ ] Không có `VITE_SENTRY_DSN` test/staging

### Database

- [ ] Đã chạy `server/src/schema.sql` đầy đủ (bao gồm CHECK constraints)
- [ ] Backups enabled trên Neon
- [ ] Có ít nhất 2 super_admin (phòng mất quyền)
- [ ] Không có test user với password yếu trong production

### Code

- [ ] `git log` không chứa secret đã rotate
- [ ] `.env`, `server/.env` đã được ignore bởi `.gitignore`
- [ ] CORS không cho phép `*`
- [ ] Rate limit đang bật cho `/api/auth/*`
- [ ] HTTPS bật ở reverse proxy / hosting

---

## 3. Báo cáo lỗ hổng

Nếu bạn phát hiện lỗ hổng bảo mật:

- **KHÔNG** tạo public issue
- Liên hệ trực tiếp team lead / maintainer qua kênh riêng
- Cung cấp: mô tả, bước tái tạo, impact assessment, đề xuất fix

Thời gian phản hồi mục tiêu:
- **Critical** (auth bypass, RCE, data leak): trong 24h
- **High** (XSS stored, privilege escalation): trong 72h
- **Medium/Low**: trong sprint tiếp theo

---

## 4. Tự động phát hiện secret bị commit

Thêm vào pre-commit hook (khuyến nghị):

```bash
# .git/hooks/pre-commit
#!/usr/bin/env bash
if git diff --cached --name-only | grep -E '^\.env$|^server/\.env$|\.env\.(production|local)$'; then
  echo "❌ Refusing to commit .env file!"
  exit 1
fi
```

Hoặc dùng tool như [`gitleaks`](https://github.com/gitleaks/gitleaks):

```bash
brew install gitleaks
gitleaks detect --source . --verbose
```