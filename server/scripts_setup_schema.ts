import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

const here = dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log('1. Dropping legacy tables...');
  await pool.query('DROP TABLE IF EXISTS investment_packages, investments, users CASCADE');
  console.log('   dropped');

  console.log('\n2. Applying schema.sql...');
  const sql = readFileSync(join(here, 'src', 'schema.sql'), 'utf8')
    .replace(/^\/\*[\s\S]*?\*\//gm, '')
    .replace(/^--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  await pool.query(sql);
  console.log('   schema applied');

  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('\nTables now:', tables.rows.map((r: any) => r.table_name).join(', '));

  await pool.end();
  process.exit(0);
}

run().catch((e) => {
  console.error('FAILED:', e);
  process.exit(1);
});