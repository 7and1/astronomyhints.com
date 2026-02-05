import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message?: string;
    duration?: number;
  }[];
}

const startTime = Date.now();

export async function GET() {
  const checks: HealthStatus['checks'] = [];
  let overallStatus: HealthStatus['status'] = 'healthy';

  // Check 1: Basic application health
  checks.push({
    name: 'application',
    status: 'pass',
    message: 'Application is running',
  });

  // Check 2: Memory usage
  const memoryCheck = checkMemory();
  checks.push(memoryCheck);
  if (memoryCheck.status === 'fail') overallStatus = 'unhealthy';
  if (memoryCheck.status === 'warn' && overallStatus === 'healthy') overallStatus = 'degraded';

  // Check 3: Environment configuration
  const envCheck = checkEnvironment();
  checks.push(envCheck);
  if (envCheck.status === 'fail') overallStatus = 'unhealthy';

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/health+json',
    },
  });
}

function checkMemory(): HealthStatus['checks'][0] {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;

    if (usagePercent > 90) {
      return {
        name: 'memory',
        status: 'fail',
        message: `High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
      };
    }

    if (usagePercent > 75) {
      return {
        name: 'memory',
        status: 'warn',
        message: `Elevated memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
      };
    }

    return {
      name: 'memory',
      status: 'pass',
      message: `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${usagePercent.toFixed(1)}%)`,
    };
  }

  return {
    name: 'memory',
    status: 'pass',
    message: 'Memory check not available in this environment',
  };
}

function checkEnvironment(): HealthStatus['checks'][0] {
  const requiredVars = ['NODE_ENV'];
  const missingVars = requiredVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    return {
      name: 'environment',
      status: 'warn',
      message: `Missing environment variables: ${missingVars.join(', ')}`,
    };
  }

  return {
    name: 'environment',
    status: 'pass',
    message: `Environment: ${process.env.NODE_ENV}`,
  };
}
