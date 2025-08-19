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

// Database connection status interface
export interface DatabaseStatus {
  connected: boolean;
  latency: number;
  error?: string;
  lastChecked: Date;
}

// Database health check function
export async function checkDatabaseHealth(): Promise<{
  poktpool: DatabaseStatus;
  waxtrax: DatabaseStatus;
}> {
  const startTime = Date.now();

  // Check Poktpooldb
  const poktpoolStatus: DatabaseStatus = {
    connected: false,
    latency: 0,
    lastChecked: new Date(),
  };

  try {
    const poktpoolStart = Date.now();
    const client = await poktpoolDb.connect();
    await client.query('SELECT 1');
    client.release();
    poktpoolStatus.connected = true;
    poktpoolStatus.latency = Date.now() - poktpoolStart;
  } catch (error) {
    poktpoolStatus.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Check Waxtrax
  const waxtraxStatus: DatabaseStatus = {
    connected: false,
    latency: 0,
    lastChecked: new Date(),
  };

  try {
    const waxtraxStart = Date.now();
    const client = await waxtraxDb.connect();
    await client.query('SELECT 1');
    client.release();
    waxtraxStatus.connected = true;
    waxtraxStatus.latency = Date.now() - waxtraxStart;
  } catch (error) {
    waxtraxStatus.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return {
    poktpool: poktpoolStatus,
    waxtrax: waxtraxStatus,
  };
}

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

// Enhanced query function with better error handling
export async function executeQuery(pool: Pool, query: string, params: any[] = []): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  latency: number;
}> {
  const startTime = Date.now();

  try {
    const result = await pool.query(query, params);
    return {
      success: true,
      data: result.rows,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      latency: Date.now() - startTime,
    };
  }
}
