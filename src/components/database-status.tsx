'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HealthResponse {
  status: string;
  timestamp: string;
  databases: {
    poktpool: {
      name: string;
      status: string;
      latency: number;
      error?: string;
    };
    waxtrax: {
      name: string;
      status: string;
      latency: number;
      error?: string;
    };
  };
}

export function DatabaseStatus() {
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error('Failed to fetch health status');
      }
      const data = await response.json();
      setHealthStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Checking database connections...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-800">Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>Failed to check database status: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!healthStatus) return null;

  const overallStatus = healthStatus.status === 'healthy' ? 'success' : 'destructive';

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Database Status</CardTitle>
          <Badge variant={overallStatus === 'success' ? 'default' : 'destructive'}>
            {healthStatus.status === 'healthy' ? 'All Systems Operational' : 'System Issues Detected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${healthStatus.databases.poktpool.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <div className="font-medium">{healthStatus.databases.poktpool.name}</div>
              <div className="text-sm text-gray-500">
                {healthStatus.databases.poktpool.status === 'connected' 
                  ? `Latency: ${healthStatus.databases.poktpool.latency}ms`
                  : healthStatus.databases.poktpool.error || 'Disconnected'
                }
              </div>
            </div>
          </div>
          <Badge variant={healthStatus.databases.poktpool.status === 'connected' ? 'default' : 'destructive'}>
            {healthStatus.databases.poktpool.status}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${healthStatus.databases.waxtrax.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <div className="font-medium">{healthStatus.databases.waxtrax.name}</div>
              <div className="text-sm text-gray-500">
                {healthStatus.databases.waxtrax.status === 'connected' 
                  ? `Latency: ${healthStatus.databases.waxtrax.latency}ms`
                  : healthStatus.databases.waxtrax.error || 'Disconnected'
                }
              </div>
            </div>
          </div>
          <Badge variant={healthStatus.databases.waxtrax.status === 'connected' ? 'default' : 'destructive'}>
            {healthStatus.databases.waxtrax.status}
          </Badge>
        </div>

        <div className="text-xs text-gray-400 text-center">
          Last updated: {new Date(healthStatus.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
