/**
 * Run this script to create tables and seed data via Supabase.
 *
 * Usage:
 *   1. Go to your Supabase Dashboard -> SQL Editor
 *   2. Copy/paste each SQL file from supabase/migrations/
 *   3. Run them in order: 001_create_tables.sql then 002_seed_sources.sql
 *
 * OR if you have your database password:
 *   DB_PASSWORD=your_db_password node scripts/run-migrations.js
 */

const fs = require('fs');
const path = require('path');

async function main() {
  const dbPassword = process.env.DB_PASSWORD;

  if (!dbPassword) {
    console.log('\n========================================');
    console.log('  SUPABASE MIGRATION INSTRUCTIONS');
    console.log('========================================\n');
    console.log('No DB_PASSWORD found. Please run the migrations manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/edklbcjlvrpmdrxjhdnc/sql/new');
    console.log('2. Paste the contents of each file below and click "Run":\n');

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`--- ${file} ---`);
      console.log(content);
      console.log('');
    }

    console.log('========================================\n');
    return;
  }

  // If DB_PASSWORD is provided, connect and run migrations
  const postgres = require('postgres');
  const sql = postgres({
    host: 'db.edklbcjlvrpmdrxjhdnc.supabase.co',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: dbPassword,
    ssl: 'require',
  });

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    console.log(`Running ${file}...`);
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await sql.unsafe(content);
      console.log(`  ✓ ${file} completed`);
    } catch (e) {
      console.error(`  ✗ ${file} failed:`, e.message);
    }
  }

  await sql.end();
  console.log('\nDone!');
}

main().catch(console.error);
