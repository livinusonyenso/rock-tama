import { readFileSync } from 'node:fs';
import pg from 'pg';

const { Pool } = pg;

const { DATABASE_URL, DATABASE_URL_FILE } = process.env;
if (DATABASE_URL && DATABASE_URL_FILE) {
  throw new Error('Set only one of DATABASE_URL and DATABASE_URL_FILE');
}
const connectionString = DATABASE_URL_FILE ? readFileSync(DATABASE_URL_FILE, 'utf8').trim() : DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL or DATABASE_URL_FILE is required');

export const pool = new Pool({
  connectionString,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});
