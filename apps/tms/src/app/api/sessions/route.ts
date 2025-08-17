import { NextRequest, NextResponse } from 'next/server';

// Mock data for sessions - in a real app this would connect to the backend services
const mockSessions = [
  {
    id: '1',
    title: 'Advanced Leadership Training',
    date: new Date().toLocaleDateString(),
    time: '09:00 AM',
    duration: '4 hours',
    participants: 18,
    maxParticipants: 20,
    status: 'in-progress',
    location: 'Conference Room A',
    instructor: 'Sarah Johnson',
    category: 'Leadership',
  },
  {
    id: '2',
    title: 'Digital Transformation Workshop',
    date: new Date(Date.now() + 86400000).toLocaleDateString(),
    time: '02:00 PM',
    duration: '3 hours',
    participants: 25,
    maxParticipants: 30,
    status: 'scheduled',
    location: 'Training Center',
    instructor: 'Michael Chen',
    category: 'Technology',
  },
  {
    id: '3',
    title: 'Project Management Fundamentals',
    date: new Date(Date.now() - 86400000).toLocaleDateString(),
    time: '10:00 AM',
    duration: '6 hours',
    participants: 22,
    maxParticipants: 25,
    status: 'completed',
    location: 'Online',
    instructor: 'David Rodriguez',
    category: 'Management',
  },
];

// GET all sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const instructor = searchParams.get('instructor');

    let filteredSessions = [...mockSessions];

    // Filter by status if provided
    if (status) {
      filteredSessions = filteredSessions.filter(
        (session) => session.status === status
      );
    }

    // Filter by category if provided
    if (category) {
      filteredSessions = filteredSessions.filter((session) =>
        session.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filter by instructor if provided
    if (instructor) {
      filteredSessions = filteredSessions.filter((session) =>
        session.instructor.toLowerCase().includes(instructor.toLowerCase())
      );
    }

    // Limit results if provided
    if (limit) {
      filteredSessions = filteredSessions.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      success: true,
      sessions: filteredSessions,
      total: filteredSessions.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sessions',
      },
      { status: 500 }
    );
  }
}

// POST create new session
export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json();

    // Validate required fields
    if (!sessionData.title || !sessionData.date || !sessionData.time) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, date, time',
        },
        { status: 400 }
      );
    }

    // Create new session (in a real app, this would use the SchedulingService)
    const newSession = {
      id: (mockSessions.length + 1).toString(),
      ...sessionData,
      participants: 0,
      maxParticipants: sessionData.maxParticipants || 20,
      status: 'scheduled',
    };

    mockSessions.push(newSession);

    return NextResponse.json(
      {
        success: true,
        session: newSession,
        message: 'Session created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create session',
      },
      { status: 500 }
    );
  }
}
