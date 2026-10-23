import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load variables from .env.local and fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * Service 1: Neon Postgres
 * Best practice: Uses the Neon serverless HTTP driver (@neondatabase/serverless)
 * via DATABASE_URL for fast, pool-friendly serverless queries.
 */
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
if (!databaseUrl) {
  console.warn('[Neon Postgres] DATABASE_URL is not set.');
}
export const sql = databaseUrl ? neon(databaseUrl) : null;

export async function testPostgresConnection() {
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }
  // Run test query verifying PostgreSQL & PostGIS version / timestamp
  const result = await sql`SELECT NOW() as current_time, version() as pg_version;`;
  return result[0];
}

/**
 * Service 2: Neon Auth
 * Wires into NEON_AUTH_BASE_URL and NEON_AUTH_JWKS_URL to verify authentication
 * endpoints and fetch the public JSON Web Key Set (JWKS).
 */
export async function testAuthService() {
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) {
    throw new Error('NEON_AUTH_JWKS_URL is not configured.');
  }
  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS from ${jwksUrl}: ${response.statusText}`);
  }
  const jwks = await response.json();
  return {
    authBaseUrl: process.env.NEON_AUTH_BASE_URL,
    jwksUrl,
    jwksStatus: response.status,
    keysFound: Array.isArray(jwks.keys) ? jwks.keys.length : 0,
  };
}

/**
 * Service 3: Neon Functions
 * Wires into NEON_FUNCTION_HELLO_BASE_URL to execute the serverless
 * hello function provisioned from neon.ts.
 */
export async function testFunctionService() {
  const functionBaseUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL;
  if (!functionBaseUrl) {
    throw new Error('NEON_FUNCTION_HELLO_BASE_URL is not configured.');
  }
  const url = functionBaseUrl.endsWith('/') ? functionBaseUrl : `${functionBaseUrl}/`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Function call failed: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return {
    functionUrl: url,
    status: response.status,
    responseBody: text,
  };
}
