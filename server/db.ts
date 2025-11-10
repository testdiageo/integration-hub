import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  throw new Error('DATABASE_URL environment variable is not set');
}

console.log('📊 Connecting to database...');
console.log('   Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Timeout after 10 seconds if connection cannot be established
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Test database connection on startup
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection verified successfully');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    console.error('   Please check your DATABASE_URL environment variable');
  }
})();

// Test database connection
pool.on('connect', () => {
  console.log('✅ New database client connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  console.error('   The database connection will be retried automatically');
});
