/**
 * set-referral-code.mjs
 *
 * Idempotently assigns the fixed referral code `VIC1289` (configurable via
 * TARGET_REFERRAL_CODE env var) to the admin account so the
 * FALLBACK_REFERRAL_CODE feature works end-to-end.
 *
 * Steps:
 *  1. If TARGET_CODE already belongs to admin → done.
 *  2. If TARGET_CODE is held by another user → clear it (the trigger will regenerate a new code).
 *  3. If admin has a different referral_code → clear it first to free up the slot.
 *  4. Set admin.referral_code = TARGET_CODE.
 *
 * Usage:
 *   cd server && node ../scripts/set-referral-code.mjs
 *
 * Environment variables (loaded from server/.env):
 *   - DATABASE_URL           (required) PostgreSQL connection string
 *   - ADMIN_PHONE            (optional, default 'admin') admin user phone
 *   - TARGET_REFERRAL_CODE   (optional, default 'VIC1289') code to assign
 */

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ENV = path.resolve(__dirname, '..', 'server', '.env');

loadEnv({ path: SERVER_ENV });

const ADMIN_PHONE = process.env.ADMIN_PHONE || 'admin';
const TARGET_CODE = (process.env.TARGET_REFERRAL_CODE || 'VIC1289').trim().toUpperCase();

if (!/^[A-Z0-9]{3,20}$/.test(TARGET_CODE)) {
  console.error(`❌ Invalid TARGET_REFERRAL_CODE: "${TARGET_CODE}". Must match /^[A-Z0-9]{3,20}$/.`);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Check server/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Find admin user
    const adminRes = await client.query(
      'SELECT id, phone, full_name, referral_code, role FROM users WHERE phone = $1 FOR UPDATE',
      [ADMIN_PHONE]
    );
    if (adminRes.rowCount === 0) {
      throw new Error(`Admin user with phone="${ADMIN_PHONE}" not found. Start the backend once so it auto-seeds the admin.`);
    }
    const admin = adminRes.rows[0];
    console.log(`👤 Admin: ${admin.phone} (${admin.full_name}) — role=${admin.role}`);
    console.log(`   current referral_code = ${admin.referral_code}`);

    // 2. Find any other user already holding TARGET_CODE
    const holderRes = await client.query(
      'SELECT id, phone, full_name FROM users WHERE referral_code = $1 AND id <> $2 FOR UPDATE',
      [TARGET_CODE, admin.id]
    );

    if (holderRes.rowCount > 0) {
      const holder = holderRes.rows[0];
      console.log(`⚠️  VIC1289 is currently held by ${holder.phone} (${holder.full_name}). Freeing it...`);
      // Set to NULL so the BEFORE INSERT trigger can't regenerate — but we're updating,
      // not inserting, so the trigger doesn't fire. We manually set to NULL + regenerate.
      await client.query(
        'UPDATE users SET referral_code = NULL WHERE id = $1',
        [holder.id]
      );
      // Manually generate a new code (the trigger is BEFORE INSERT only)
      const newCodeRes = await client.query(
        `SELECT 'VIC' || upper(substring(replace(replace(gen_random_uuid()::text, '-', ''), 'a', chr(65 + floor(random() * 26)::int)), 1, 6)) AS code`
      );
      const newCode = newCodeRes.rows[0].code;
      await client.query(
        'UPDATE users SET referral_code = $1 WHERE id = $2',
        [newCode, holder.id]
      );
      console.log(`   → reassigned ${holder.phone} a new code: ${newCode}`);
    }

    // 3. If admin currently holds a different code, nothing to free (we overwrite below)

    // 4. Assign TARGET_CODE to admin (no trigger on UPDATE, safe to overwrite)
    await client.query(
      'UPDATE users SET referral_code = $1 WHERE id = $2',
      [TARGET_CODE, admin.id]
    );

    await client.query('COMMIT');

    // 5. Verify
    const verify = await client.query(
      'SELECT phone, referral_code FROM users WHERE referral_code = $1',
      [TARGET_CODE]
    );
    console.log('\n✅ Done. Users with referral_code = VIC1289:');
    for (const row of verify.rows) {
      console.log(`   - ${row.phone}: ${row.referral_code}`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
