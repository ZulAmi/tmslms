import { NextRequest, NextResponse } from 'next/server';
import { withSSGWSG } from '../../../lib/ssg-wsg-integration';

// Submit funding application
export const POST = withSSGWSG(async (req: NextRequest, services) => {
  try {
    const applicationData = await req.json();

    // Validate required fields
    if (
      !applicationData.userId ||
      !applicationData.courseId ||
      !applicationData.schemeId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, courseId, schemeId' },
        { status: 400 }
      );
    }

    const result = await services.errorHandler.executeWithRetry(
      async () => {
        // Transform application data to SSG format
        const transformResult =
          await services.transformer.transformApplicationToSSG(applicationData);

        if (!transformResult.success) {
          throw new Error(
            `Data transformation failed: ${transformResult.error}`
          );
        }

        const submitResult = await services.client.post(
          '/applications',
          transformResult.data
        );

        // Cache the submitted application
        if (submitResult.success) {
          await services.cache.set(
            `lms:application:${submitResult.data.id}`,
            submitResult.data,
            {
              ttl: 86400,
              tags: ['lms', 'applications', `user:${applicationData.userId}`],
            }
          );
        }

        return submitResult;
      },
      { operation: 'submitFundingApplication', endpoint: '/applications' }
    );

    if (result.success) {
      return NextResponse.json(result.result, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Failed to submit application', details: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Get application status
export const GET = withSSGWSG(async (req: NextRequest, services) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const applicationId = searchParams.get('applicationId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (applicationId) {
      // Get specific application
      const application = await services.cache.getOrSet(
        `lms:application:${applicationId}`,
        async () => {
          return services.client.get(`/applications/${applicationId}`);
        },
        { ttl: 300, tags: ['lms', 'applications', `user:${userId}`] }
      );
      return NextResponse.json(application);
    } else {
      // Get all applications for user
      const applications = await services.cache.getOrSet(
        `lms:applications:${userId}`,
        async () => {
          return services.client.get('/applications', { userId });
        },
        { ttl: 300, tags: ['lms', 'applications', `user:${userId}`] }
      );
      return NextResponse.json(applications);
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
});
