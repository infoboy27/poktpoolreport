import { NextRequest, NextResponse } from 'next/server';
import { poktpoolDb, waxtraxDb, calculateDifference, executeQuery } from '@/lib/db';
import { reportInputSchema } from '@/lib/schemas';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, network_txn_hash } = reportInputSchema.parse(body);

    // Query both databases concurrently
    const [poktpoolResult, waxtraxResult] = await Promise.allSettled([
      queryPoktpoolDb(wallet_address),
      queryWaxtraxDb(network_txn_hash),
    ]);

    // Process Poktpooldb results
    let poktpoolData = null;
    let poktpoolError = null;
    let poktpoolLatency = 0;

    if (poktpoolResult.status === 'fulfilled') {
      poktpoolData = poktpoolResult.value.data;
      poktpoolLatency = poktpoolResult.value.latency;
    } else {
      poktpoolError = poktpoolResult.reason?.message || 'Unknown error';
    }

    // Process Waxtrax results
    let waxtraxData = null;
    let waxtraxError = null;
    let waxtraxLatency = 0;

    if (waxtraxResult.status === 'fulfilled') {
      waxtraxData = waxtraxResult.value.data;
      waxtraxLatency = waxtraxResult.value.latency;
    } else {
      waxtraxError = waxtraxResult.reason?.message || 'Unknown error';
    }

    // Calculate summary
    let difference = 0;
    let status: 'success' | 'insufficient' | 'error' = 'error';

    if (poktpoolData && waxtraxData) {
      difference = calculateDifference(
        waxtraxData.amount,
        poktpoolData.verf_amount,
        env.BRAND_CONVERT_MICRO_UNITS
      );
      status = difference >= 0 ? 'success' : 'insufficient';
    }

    const response = {
      success: true,
      poktpool: {
        data: poktpoolData,
        error: poktpoolError,
        latency: poktpoolLatency,
      },
      waxtrax: {
        data: waxtraxData,
        error: waxtraxError,
        latency: waxtraxLatency,
      },
      summary: {
        difference,
        status,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    );
  }
}

async function queryPoktpoolDb(wallet_address: string) {
  const query = `
    SELECT
      wvr.wallet_address,
      wvr.req_timestamp,
      wvr.verf_amount
    FROM wallet_verf_req AS wvr
    WHERE wvr.network_id = 2
      AND wvr.wallet_address = $1
    ORDER BY wvr.req_timestamp DESC
    LIMIT 1;
  `;

  const result = await executeQuery(poktpoolDb, query, [wallet_address]);
  
  if (!result.success) {
    throw new Error(`Poktpooldb query failed: ${result.error}`);
  }

  return {
    data: result.data?.[0] || null,
    latency: result.latency,
  };
}

async function queryWaxtraxDb(network_txn_hash: string) {
  const query = `
    SELECT
      network_id,
      network_txn_hash,
      from_wallet_address,
      to_wallet_address,
      amount
    FROM public.network_txn
    WHERE network_id = 2
      AND network_txn_hash = $1
    LIMIT 1;
  `;

  const result = await executeQuery(waxtraxDb, query, [network_txn_hash]);
  
  if (!result.success) {
    throw new Error(`Waxtrax query failed: ${result.error}`);
  }

  return {
    data: result.data?.[0] || null,
    latency: result.latency,
  };
}
