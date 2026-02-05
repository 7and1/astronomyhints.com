import { NextResponse } from 'next/server';

// Lightweight readiness check for load balancers
export async function GET() {
  return NextResponse.json(
    { status: 'ready' },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
