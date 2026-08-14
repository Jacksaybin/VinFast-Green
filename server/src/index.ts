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

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: any) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
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

  async function runProfitJob() {
    if (jobRunning) return;
    jobRunning = true;
    try {
      const result = await investmentService.addDailyProfits();
      jobLastResult = `credited=${result.credited}, completed=${result.completed}`;
      if (result.credited > 0 || result.completed > 0) {
        console.log(`💸 Daily profit job: ${jobLastResult}`);
      }
    } catch (err) {
      console.error('⚠️  Daily profit job failed:', err);
    } finally {
      setTimeout(() => { jobRunning = false; }, MAX_JOB_LOCK_MS);
    }
  }

  runProfitJob();
  setInterval(runProfitJob, 5 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API Base: http://localhost:${PORT}/api`);
    console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || '*'}\n`);
  });
}

start().catch(console.error);
