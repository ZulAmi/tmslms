import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import dynamically to avoid module resolution issues during build
    const { checkSSGWSGHealth } = await import(
      '../../../lib/ssg-wsg-integration'
    );
    const health = await checkSSGWSGHealth();

    const response = {
      app: 'admin',
      timestamp: new Date().toISOString(),
      status: health.healthy ? 'healthy' : 'unhealthy',
      ssgwsg: health.details || { error: health.error },
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(response, {
      status: health.healthy ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        app: 'admin',
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
