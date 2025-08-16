import { NextRequest, NextResponse } from 'next/server';
import { withSSGWSG } from '../../../lib/ssg-wsg-integration';

// Register training provider
export const POST = withSSGWSG(async (req: NextRequest, services) => {
  try {
    const providerData = await req.json();

    // Validate required fields
    if (!providerData.companyName || !providerData.registrationNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, registrationNumber' },
        { status: 400 }
      );
    }

    const result = await services.errorHandler.executeWithRetry(
      async () => {
        // Transform provider data to WSG format
        const transformResult = await services.transformer.transform(
          providerData,
          'tms-provider-to-wsg',
          { context: 'registration' }
        );

        if (!transformResult.success) {
          throw new Error(
            `Provider data transformation failed: ${transformResult.error}`
          );
        }

        const registerResult = await services.client.post(
          '/training-providers',
          transformResult.data
        );

        // Cache the registered provider
        if (registerResult.success) {
          await services.cache.set(
            `tms:provider:${registerResult.data.id}`,
            registerResult.data,
            { ttl: 86400, tags: ['tms', 'providers'] }
          );
        }

        return registerResult;
      },
      { operation: 'registerTrainingProvider', endpoint: '/training-providers' }
    );

    if (result.success) {
      return NextResponse.json(result.result, { status: 201 });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to register training provider',
          details: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error registering training provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Get training provider information
export const GET = withSSGWSG(async (req: NextRequest, services) => {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId is required' },
        { status: 400 }
      );
    }

    const provider = await services.cache.getOrSet(
      `tms:provider:${providerId}`,
      async () => {
        return services.client.get(`/training-providers/${providerId}`);
      },
      { ttl: 3600, tags: ['tms', 'providers'] }
    );

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error fetching training provider:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training provider' },
      { status: 500 }
    );
  }
});
