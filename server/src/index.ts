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
import { testConnection, query, queryOne } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
  } catch (err) {
    console.error('⚠️  Could not seed admin:', err);
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

  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   API Base: http://localhost:${PORT}/api`);
    console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || '*'}\n`);
  });
}

start().catch(console.error);
