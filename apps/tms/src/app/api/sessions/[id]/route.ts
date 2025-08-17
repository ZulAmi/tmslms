import { NextRequest, NextResponse } from 'next/server';

// Mock session data for individual session operations
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
    description:
      'Comprehensive leadership training program focusing on advanced management techniques and team building strategies.',
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
    description:
      'Interactive workshop on digital transformation strategies for modern businesses.',
  },
];

// GET individual session by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const session = mockSessions.find((s) => s.id === sessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch session',
      },
      { status: 500 }
    );
  }
}

// PUT update session
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const updateData = await request.json();

    const sessionIndex = mockSessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 404 }
      );
    }

    // Update session (in a real app, this would use the SchedulingService)
    mockSessions[sessionIndex] = {
      ...mockSessions[sessionIndex],
      ...updateData,
    };

    return NextResponse.json({
      success: true,
      session: mockSessions[sessionIndex],
      message: 'Session updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update session',
      },
      { status: 500 }
    );
  }
}

// DELETE session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const sessionIndex = mockSessions.findIndex((s) => s.id === sessionId);

    if (sessionIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 404 }
      );
    }

    // Remove session (in a real app, this would use the SchedulingService)
    mockSessions.splice(sessionIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete session',
      },
      { status: 500 }
    );
  }
}
