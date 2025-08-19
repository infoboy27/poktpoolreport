import { Pool } from 'pg';
import { env } from './env';

// Poktpooldb connection pool
export const poktpoolDb = new Pool({
  host: env.POKTPOOLDB_HOST,
  port: env.POKTPOOLDB_PORT,
  database: env.POKTPOOLDB_NAME,
  user: env.POKTPOOLDB_USER,
  password: env.POKTPOOLDB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Waxtrax connection pool
export const waxtraxDb = new Pool({
  host: env.WAXTRAX_HOST,
  port: env.WAXTRAX_PORT,
  database: env.WAXTRAX_NAME,
  user: env.WAXTRAX_USER,
  password: env.WAXTRAX_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper function to format POKT amounts
export function formatPOKT(amount: number, convertMicroUnits: boolean = false): string {
  if (convertMicroUnits) {
    // Convert from microPOKT to POKT (divide by 1,000,000)
    amount = amount / 1000000;
  }
  
  // Format to 6-8 decimal places
  return amount.toFixed(6);
}

// Helper function to calculate difference
export function calculateDifference(sent: number, requested: number, convertMicroUnits: boolean = false): number {
  if (convertMicroUnits) {
    sent = sent / 1000000;
    requested = requested / 1000000;
  }
  return sent - requested;
}
