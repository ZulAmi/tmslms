import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = {
      app: 'tms',
      timestamp: new Date().toISOString(),
      status: 'healthy',
      message: 'TMS API is running with demo data',
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        app: 'tms',
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'API error',
      },
      { status: 503 }
    );
  }
}
