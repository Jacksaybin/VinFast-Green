#!/usr/bin/env node
/**
 * Pre-commit secret scanner (cross-platform, không cần cài gitleaks).
 *
 * Quy tắc:
 *   - Quét TẤT CẢ staged files (không chỉ diff) cho pattern secret thường gặp.
 *   - Bỏ qua: .env.example, node_modules, dist, build, .git, lockfiles.
 *   - Nếu phát hiện → exit code 1, commit bị block.
 *
 * Cài đặt:
 *   1. Chạy: node scripts/install-hooks.mjs
 *   2. Hook sẽ tự động chạy trước mỗi `git commit`.
 *
 * Cài đặt gitleaks (tốt hơn, rule phong phú hơn):
 *   brew install gitleaks
 *   Sau đó pre-commit sẽ dùng gitleaks nếu có, fallback về scanner này.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();

// Patterns secret thường gặp — giữ đơn giản để chạy nhanh trong hook
const PATTERNS = [
  // PostgreSQL / MySQL connection string với password
  { name: 'DB connection string', re: /postgres(ql)?:\/\/[^:]+:[^@\s]+@[^\s'"]+/i },
  // Generic password assignment
  { name: 'Password assignment', re: /(?:password|passwd|pwd)\s*[:=]\s*['"]?[a-zA-Z0-9_!@#$%^&*()-]{6,}['"]?/i },
  // JWT secret hardcoded
  { name: 'JWT_SECRET value', re: /JWT_SECRET\s*=\s*['"][a-zA-Z0-9_/+=-]{16,}['"]/ },
  // Private keys
  { name: 'Private key (PEM)', re: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY( BLOCK)?-----/ },
  // Stripe live keys
  { name: 'Stripe live secret key', re: /sk_live_[a-zA-Z0-9]{24,}/ },
  // AWS access key
  { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
  // Google API key
  { name: 'Google API key', re: /AIza[0-9A-Za-z_-]{35}/ },
  // Generic API key shape
  { name: 'API key assignment', re: /(?:api[_-]?key|apikey|access[_-]?token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/i },
];

const IGNORE_PATTERNS = [
  /^\.env\.example/,
  /^\.env\.sample/,
  /node_modules\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /\.git\//,
  /coverage\//,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /SECURITY\.md$/,
];

function isIgnored(filePath) {
  return IGNORE_PATTERNS.some((p) => p.test(filePath));
}

function getStagedFiles() {
  try {
    // Lấy cả added + modified + copied (chưa untracked)
    const out = execSync(
      "git diff --cached --name-only --diff-filter=ACMR",
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return out.split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

function scanFile(filePath) {
  const abs = join(ROOT, filePath);
  if (!existsSync(abs)) return [];
  let content;
  try {
    content = readFileSync(abs, 'utf8');
  } catch {
    // Binary file hoặc không đọc được → skip
    return [];
  }

  const findings = [];
  for (const { name, re } of PATTERNS) {
    const m = content.match(re);
    if (m) {
      // Tìm số dòng
      const idx = content.indexOf(m[0]);
      const line = content.slice(0, idx).split('\n').length;
      findings.push({ file: filePath, line, pattern: name, sample: m[0].slice(0, 80) });
    }
  }
  return findings;
}

function tryGitleaks() {
  try {
    execSync('gitleaks version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function main() {
  // Ưu tiên dùng gitleaks nếu có
  if (tryGitleaks()) {
    console.log('🔒 Running gitleaks (native)...');
    try {
      execSync(
        'gitleaks protect --staged --redact --config .gitleaks.toml --no-banner',
        { stdio: 'inherit', cwd: ROOT }
      );
      console.log('✅ gitleaks: no secrets detected');
      process.exit(0);
    } catch (err) {
      console.error('\n❌ gitleaks detected secrets in staged files. Commit blocked.');
      console.error('   See findings above. Move secrets to .env (gitignored) and retry.');
      process.exit(1);
    }
  }

  // Fallback: scanner built-in
  console.log('🔒 Running pre-commit secret scanner (fallback — cài `brew install gitleaks` để có rule tốt hơn)...');
  const files = getStagedFiles().filter((f) => !isIgnored(f));
  if (files.length === 0) {
    console.log('   No staged files to scan.');
    process.exit(0);
  }

  const allFindings = [];
  for (const file of files) {
    const findings = scanFile(file);
    allFindings.push(...findings);
  }

  if (allFindings.length > 0) {
    console.error('\n❌ Potential secrets detected in staged files:\n');
    for (const f of allFindings) {
      console.error(`   ${f.file}:${f.line}  [${f.pattern}]`);
      console.error(`      → ${f.sample}`);
    }
    console.error('\n💡 Fix:');
    console.error('   1. Move secret values to .env (đã có trong .gitignore)');
    console.error('   2. Use placeholder values in .env.example / source code');
    console.error('   3. If false positive, edit scripts/pre-commit.mjs to add ignore pattern');
    console.error('   4. To bypass (KHÔNG khuyến nghị): git commit --no-verify\n');
    process.exit(1);
  }

  console.log(`✅ Scanned ${files.length} staged files — no secrets detected`);
  process.exit(0);
}

main();
