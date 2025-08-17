import { NextRequest, NextResponse } from 'next/server';

// Mock data for participants
const mockParticipants = [
  {
    id: '1',
    name: 'Emma Thompson',
    email: 'emma.thompson@company.com',
    phone: '+1 (555) 123-4567',
    department: 'Human Resources',
    status: 'confirmed',
    registrationDate: new Date().toLocaleDateString(),
    lastActivity: new Date().toLocaleDateString(),
    completedSessions: 3,
  },
  {
    id: '2',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    phone: '+1 (555) 987-6543',
    department: 'Engineering',
    status: 'attended',
    registrationDate: new Date(Date.now() - 172800000).toLocaleDateString(),
    lastActivity: new Date().toLocaleDateString(),
    completedSessions: 5,
  },
];

// GET all participants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    let filteredParticipants = [...mockParticipants];

    // Filter by status if provided
    if (status) {
      filteredParticipants = filteredParticipants.filter(
        (p) => p.status === status
      );
    }

    // Filter by department if provided
    if (department) {
      filteredParticipants = filteredParticipants.filter((p) =>
        p.department.toLowerCase().includes(department.toLowerCase())
      );
    }

    // Limit results if provided
    if (limit) {
      filteredParticipants = filteredParticipants.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      success: true,
      participants: filteredParticipants,
      total: filteredParticipants.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch participants',
      },
      { status: 500 }
    );
  }
}

// POST create new participant
export async function POST(request: NextRequest) {
  try {
    const participantData = await request.json();

    // Validate required fields
    if (!participantData.name || !participantData.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, email',
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingParticipant = mockParticipants.find(
      (p) => p.email === participantData.email
    );
    if (existingParticipant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Participant with this email already exists',
        },
        { status: 409 }
      );
    }

    // Create new participant (in a real app, this would use the ParticipantManagementService)
    const newParticipant = {
      id: (mockParticipants.length + 1).toString(),
      ...participantData,
      status: participantData.status || 'registered',
      registrationDate: new Date().toLocaleDateString(),
      lastActivity: new Date().toLocaleDateString(),
      completedSessions: 0,
    };

    mockParticipants.push(newParticipant);

    return NextResponse.json(
      {
        success: true,
        participant: newParticipant,
        message: 'Participant created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create participant',
      },
      { status: 500 }
    );
  }
}
