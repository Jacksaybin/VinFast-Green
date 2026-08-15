# Pre-commit Secret Scanning

Tự động phát hiện secret trong staged files **trước khi commit** để tránh leak credential lên git history.

## Cài đặt

```bash
# Cài hook (chạy 1 lần sau khi clone repo)
npm run install:hooks

# Script sẽ:
#   1. Tạo .githooks/pre-commit (auto-generated)
#   2. Set git config core.hooksPath = .githooks
#   3. Verify hook hoạt động
```

Sau khi cài, mọi `git commit` sẽ tự động scan secret. Commit bị block nếu phát hiện pattern giống credential.

## Cách hoạt động

Hook chạy `scripts/pre-commit.mjs`, thực hiện:

1. **Ưu tiên `gitleaks`** (nếu có trong PATH):
   ```bash
   brew install gitleaks   # macOS
   scoop install gitleaks  # Windows
   ```
   Với `gitleaks`, hook dùng config tại `.gitleaks.toml` (đã include rules cho V-GREEN stack: JWT secret, Neon DB URL, bcrypt hash, ...).

2. **Fallback scanner built-in** (Node.js, không cần cài gì):
   - Quét các pattern phổ biến: DB connection string, password assignment, JWT_SECRET, private keys, AWS/GCP/Stripe keys
   - Bỏ qua: `.env.example`, `node_modules`, `dist`, lockfiles, `SECURITY.md`

## Test thử

```bash
# Tạo một file có "secret" giả
echo 'JWT_SECRET=super-secret-key-1234567890' > /tmp/test-secret.txt
git add /tmp/test-secret.txt

# Hook sẽ báo:
# ❌ Potential secrets detected: JWT_SECRET value
#    → JWT_SECRET=super-secret-key-1234567890
```

## Bypass khi cần (không khuyến nghị)

```bash
git commit --no-verify -m "Emergency fix"
```

## False positives

Nếu scanner báo nhầm (ví dụ: regex khớp vào test fixture), edit `scripts/pre-commit.mjs`:

```js
const IGNORE_PATTERNS = [
  // ... existing
  /tests\/fixtures\//,
];
```

Hoặc với gitleaks, edit `.gitleaks.toml` → `[allowlist]`.

## Files

| File | Vai trò |
|------|---------|
| `scripts/pre-commit.mjs` | Scanner built-in (Node.js, fallback) |
| `scripts/install-hooks.mjs` | Installer: tạo hook + set `core.hooksPath` |
| `.gitleaks.toml` | Config cho gitleaks (nếu user cài) |
| `.githooks/pre-commit` | Auto-generated, gitignored |

## Maintenance

Khi thêm regex mới:
1. Update `PATTERNS` trong `scripts/pre-commit.mjs` (cho fallback)
2. Update `.gitleaks.toml` (cho gitleaks)
3. Test bằng cách stage file có pattern đó → confirm bị block

## Lưu ý quan trọng

⚠️ **Pre-commit hook KHÔNG phát hiện được secret đã có trong git history**.

Nếu lỡ commit secret:
1. **Rotate credential ngay lập tức** (xem `SECURITY.md`)
2. Clean history bằng `git filter-repo` hoặc `bfg`
3. Force-push (cảnh báo team)
