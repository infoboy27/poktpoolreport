'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatabaseStatus } from '@/components/database-status';
import Image from 'next/image';

// Utility functions for client-side formatting
function formatPOKT(amount: number, convertMicroUnits: boolean = false): string {
  if (convertMicroUnits) {
    amount = amount / 1000000;
  }
  return amount.toFixed(6);
}

interface ReportData {
  success: boolean;
  poktpool: {
    data: {
      wallet_address: string;
      req_timestamp: string;
      verf_amount: number;
    } | null;
    error: string | null;
    latency: number;
  };
  waxtrax: {
    data: {
      network_id: number;
      network_txn_hash: string;
      from_wallet_address: string;
      to_wallet_address: string;
      amount: number;
    } | null;
    error: string | null;
    latency: number;
  };
  summary: {
    difference: number;
    status: 'success' | 'insufficient' | 'error';
  };
}

export default function ReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState('');
  const [txnHash, setTxnHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#EAF0FF] flex items-center justify-center">
        <div className="text-[#1F4DD9]">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setReportData(null);

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress.trim().toLowerCase(),
          network_txn_hash: txnHash.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReportData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-[#EAF0FF]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#1F4DD9]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image
                              src="/brand/logo.svg"
              alt="PoktPool Logo"
                width={150}
                height={45}
                className="h-9 w-auto"
              />
              <h1 className="text-xl font-semibold text-[#0A1633]">
                POKT Payment Report
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#1F4DD9]">
                Welcome, {session?.user?.email}
              </span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-[#1F4DD9] text-[#1F4DD9] hover:bg-[#1F4DD9] hover:text-white"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Status */}
        <DatabaseStatus />
        
        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-[#0A1633]">Generate Payment Report</CardTitle>
            <CardDescription>
              Enter wallet address and transaction hash to generate a payment verification report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="wallet" className="text-sm font-medium text-[#0A1633]">
                    Wallet Address
                  </label>
                  <Input
                    id="wallet"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter wallet address"
                    required
                    className="border-[#1F4DD9] focus:border-[#1F4DD9] focus:ring-[#1F4DD9]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="txn" className="text-sm font-medium text-[#0A1633]">
                    Transaction Hash
                  </label>
                  <Input
                    id="txn"
                    value={txnHash}
                    onChange={(e) => setTxnHash(e.target.value)}
                    placeholder="Enter transaction hash"
                    required
                    className="border-[#1F4DD9] focus:border-[#1F4DD9] focus:ring-[#1F4DD9]"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#1F4DD9] hover:bg-[#0A1633] text-white"
              >
                {isLoading ? 'Generating Report...' : 'Generate Report'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {reportData && (
          <div className="space-y-6">
            {/* Summary Banner */}
            <Card className="border-l-4 border-l-[#1F4DD9]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A1633]">Payment Summary</h3>
                    <p className="text-sm text-gray-600">
                      Difference: {formatPOKT(reportData.summary.difference, false)} POKT
                    </p>
                  </div>
                  <Badge
                    variant={reportData.summary.status === 'success' ? 'default' : 'destructive'}
                    className={
                      reportData.summary.status === 'success'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }
                  >
                    {reportData.summary.status === 'success' ? 'Payment Sufficient' : 'Payment Insufficient'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Amounts shown in POKT (6 decimal places)
                </p>
              </CardContent>
            </Card>

            {/* Results Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Poktpooldb Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A1633] flex items-center justify-between">
                    System Requested (Poktpooldb)
                    <Badge variant="outline" className="text-xs">
                      {reportData.poktpool.latency}ms
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.poktpool.error ? (
                    <Alert variant="destructive">
                      <AlertDescription>{reportData.poktpool.error}</AlertDescription>
                    </Alert>
                  ) : reportData.poktpool.data ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Wallet Address</label>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                          {reportData.poktpool.data.wallet_address}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Request Timestamp</label>
                        <p className="text-sm">
                          {new Date(reportData.poktpool.data.req_timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Requested Amount</label>
                        <p className="text-lg font-semibold text-[#1F4DD9]">
                          {formatPOKT(reportData.poktpool.data.verf_amount, false)} POKT
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No data found</p>
                  )}
                </CardContent>
              </Card>

              {/* Waxtrax Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0A1633] flex items-center justify-between">
                    Client Sent (Waxtrax)
                    <Badge variant="outline" className="text-xs">
                      {reportData.waxtrax.latency}ms
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.waxtrax.error ? (
                    <Alert variant="destructive">
                      <AlertDescription>{reportData.waxtrax.error}</AlertDescription>
                    </Alert>
                  ) : reportData.waxtrax.data ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Transaction Hash</label>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                          {reportData.waxtrax.data.network_txn_hash}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">From → To</label>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                          {reportData.waxtrax.data.from_wallet_address} → {reportData.waxtrax.data.to_wallet_address}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Sent Amount</label>
                        <p className="text-lg font-semibold text-[#1F4DD9]">
                          {formatPOKT(reportData.waxtrax.data.amount, false)} POKT
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No data found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
