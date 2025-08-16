import { NextRequest, NextResponse } from 'next/server';
import {
  withSSGWSG,
  type MockServices,
} from '../../../../lib/ssg-wsg-integration';

// Get available courses for learners
export const GET = withSSGWSG(
  async (req: NextRequest, services: MockServices) => {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId');
      const category = searchParams.get('category');
      const level = searchParams.get('level');

      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required' },
          { status: 400 }
        );
      }

      const courses = await services.cache.getOrSet(
        `lms:courses:${userId}:${category || 'all'}:${level || 'all'}`,
        async () => {
          const result = await services.client.get('/courses', {
            eligible: true,
            available: true,
            ...(category && { category }),
            ...(level && { level }),
          });

          // Transform WSG course data to LMS format
          if (result.success) {
            return services.transformer.transformList(
              result.data,
              'wsg-course-to-lms',
              { userId, context: 'course-catalog' }
            );
          }

          return result;
        },
        { ttl: 1800, tags: ['lms', 'courses', `user:${userId}`] }
      );

      return NextResponse.json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }
  }
);
