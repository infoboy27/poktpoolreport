import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';

export async function GET() {
  try {
    const healthStatus = await checkDatabaseHealth();
    
    const overallStatus = healthStatus.poktpool.connected && healthStatus.waxtrax.connected ? 'healthy' : 'unhealthy';
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      databases: {
        poktpool: {
          name: 'Poktpooldb',
          status: healthStatus.poktpool.connected ? 'connected' : 'disconnected',
          latency: healthStatus.poktpool.latency,
          error: healthStatus.poktpool.error,
          lastChecked: healthStatus.poktpool.lastChecked.toISOString(),
        },
        waxtrax: {
          name: 'Waxtrax',
          status: healthStatus.waxtrax.connected ? 'connected' : 'disconnected',
          latency: healthStatus.waxtrax.latency,
          error: healthStatus.waxtrax.error,
          lastChecked: healthStatus.waxtrax.lastChecked.toISOString(),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
