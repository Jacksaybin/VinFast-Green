/**
 * V-GREEN Backend Server
 * Node.js + Express + PostgreSQL (Neon)
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

import authRouter from './routes/auth';
import walletRouter from './routes/wallet';
import investmentRouter from './routes/investments';
import adminRouter from './routes/admin';
import notificationRouter from './routes/notifications';
import newsRouter from './routes/news';
import chatRouter from './routes/chat';
import kycRouter from './routes/kyc';
import settingsRouter from './routes/settings';
import auditRouter from './routes/audit';
import referralRouter from './routes/referrals';
import reinvestmentRouter from './routes/reinvestments';
import { investmentService } from './services/investmentService';
import { testConnection, query, queryOne } from './db';
import { auditLog } from './middleware/audit';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: any) => {
    // Allow requests with no Origin (e.g. curl, server-to-server) and any whitelisted origin.
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Pass `false` (not an Error) so the cors middleware responds with a proper
    // CORS rejection (no ACAO header) instead of throwing a 500 — the browser
    // then surfaces a clear CORS error instead of a generic network failure.
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    status: 'ok',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/investments', investmentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/news', newsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/referrals', referralRouter);
app.use('/api/reinvestments', reinvestmentRouter);

// Create admin account if not exists
async function seedAdmin() {
  try {
    const adminPhone = process.env.ADMIN_PHONE || 'admin';
    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE phone = $1',
      [adminPhone]
    );

    if (!existing) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
      await query(
        `INSERT INTO users (phone, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)`,
        [adminPhone, passwordHash, process.env.ADMIN_NAME || 'Quản trị viên', 'admin']
      );
      console.log('✅ Admin account created');
      console.log(`   Phone: ${adminPhone}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    } else {
      console.log('✅ Admin account already exists');
    }

    // Promote to super_admin if no super_admin exists yet (guarantees RBAC manageability)
    const superCount = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users WHERE role = 'super_admin'`
    );
    if (parseInt(superCount?.count || '0') === 0) {
      await query(`UPDATE users SET role = 'super_admin' WHERE phone = $1`, [adminPhone]);
      console.log('👑 Promoted admin account to super_admin');
    }
  } catch (err) {
    console.error('⚠️  Could not seed admin:', err);
  }
}

// Idempotent runtime migrations (project has no migration framework)
async function runMigrations() {
  try {
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'`);
    await query(
      `CREATE INDEX IF NOT EXISTS idx_transactions_processed_by ON transactions(processed_by)`
    );

    // Referral system tables (Phase 2)
    await query(`
      CREATE TABLE IF NOT EXISTS referral_bonuses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
        bonus_amount DECIMAL(18, 2) NOT NULL,
        bonus_type VARCHAR(30) NOT NULL CHECK (bonus_type IN ('signup', 'first_investment', 'milestone')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'credited', 'cancelled', 'expired')),
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        credited_at TIMESTAMPTZ
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_referral_bonuses_referrer ON referral_bonuses(referrer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_referral_bonuses_referred ON referral_bonuses(referred_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_referral_bonuses_status ON referral_bonuses(status)`);

    // Reinvestments table
    await query(`
      CREATE TABLE IF NOT EXISTS reinvestments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
        new_investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
        amount DECIMAL(18, 2) NOT NULL,
        profit_used DECIMAL(18, 2) DEFAULT 0,
        cash_added DECIMAL(18, 2) DEFAULT 0,
        package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_reinvestments_user ON reinvestments(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_reinvestments_original ON reinvestments(original_investment_id)`);

    // Reinvestment tracking columns on investments
    await query(`ALTER TABLE investments ADD COLUMN IF NOT EXISTS reinvested_from UUID REFERENCES investments(id) ON DELETE SET NULL`);
    await query(`ALTER TABLE investments ADD COLUMN IF NOT EXISTS total_cycles INTEGER DEFAULT 1`);

    // Referral tracking columns on users
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_signup_bonus_claimed BOOLEAN DEFAULT false`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_total_earnings DECIMAL(18, 2) DEFAULT 0`);

    console.log('✅ Migrations applied');
  } catch (err) {
    console.error('⚠️  Migration failed:', err);
  }
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

async function start() {
  console.log('\n🚀 V-GREEN Backend Server');
  console.log('========================');

  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('❌ Cannot start: Database connection failed');
    process.exit(1);
  }

  await runMigrations();
  await seedAdmin();

  // Daily profit job: credit accumulated profit + complete matured investments.
  // Idempotent (guarded by last_profit_date), so running frequently is safe.
  const MAX_JOB_LOCK_MS = 30 * 1000;
  let jobRunning = false;
  let jobLastResult: string | null = null;
  let jobLastRunAt: string | null = null;
  let jobTotalRuns = 0;

  async function runProfitJob(trigger: 'cron' | 'manual' = 'cron') {
    if (jobRunning) return;
    jobRunning = true;
    const runStart = Date.now();
    try {
      const result = await investmentService.addDailyProfits();
      jobLastRunAt = new Date().toISOString();
      jobTotalRuns++;
      const durationMs = Date.now() - runStart;

      // Lock bị instance khác giữ — bỏ qua silently
      if (result.skipped === 'lock_held_by_other_instance') {
        jobLastResult = 'skipped=lock_held_by_other_instance';
        console.log(`⏭️  Daily profit job: skipped (lock held by other instance)`);
        return;
      }

      jobLastResult = `credited=${result.credited}, completed=${result.completed}`;
      // Log cron run tới audit log (chỉ khi có hoạt động thực sự)
      if (result.credited > 0 || result.completed > 0) {
        console.log(`💸 Daily profit job: ${jobLastResult} (${durationMs}ms)`);
        try {
          await auditLog({
            action: 'cron_profit_run',
            entityType: 'system_job',
            newData: {
              trigger,
              credited: result.credited,
              completed: result.completed,
              checked: result.checked,
              durationMs,
              runAt: jobLastRunAt,
            },
          });
        } catch (logErr) {
          console.error('Failed to audit cron run:', logErr);
        }
      }
    } catch (err) {
      console.error('⚠️  Daily profit job failed:', err);
      try {
        await auditLog({
          action: 'cron_profit_run',
          entityType: 'system_job',
          newData: {
            trigger,
            status: 'failed',
            error: String(err),
            durationMs: Date.now() - runStart,
            runAt: new Date().toISOString(),
          },
        });
      } catch {}
    } finally {
      setTimeout(() => { jobRunning = false; }, MAX_JOB_LOCK_MS);
    }
  }

  // Health endpoint mở rộng để monitoring
  app.get('/health/cron', (_req, res) => {
    res.json({
      success: true,
      data: {
        jobRunning,
        jobLastResult,
        jobLastRunAt,
        jobTotalRuns,
      },
    });
  });

  runProfitJob('cron');
  setInterval(() => runProfitJob('cron'), 5 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API Base: http://localhost:${PORT}/api`);
    console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || '*'}\n`);
  });
}

start().catch(console.error);
