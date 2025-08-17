import { NextRequest, NextResponse } from 'next/server';

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
    address: '123 Main St, City, State 12345',
    emergencyContact: 'John Thompson - (555) 123-4568',
  },
];

// GET individual participant by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participantId = params.id;
    const participant = mockParticipants.find((p) => p.id === participantId);

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Participant not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      participant,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch participant',
      },
      { status: 500 }
    );
  }
}

// PUT update participant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participantId = params.id;
    const updateData = await request.json();

    const participantIndex = mockParticipants.findIndex(
      (p) => p.id === participantId
    );

    if (participantIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Participant not found',
        },
        { status: 404 }
      );
    }

    // Update participant (in a real app, this would use the ParticipantManagementService)
    mockParticipants[participantIndex] = {
      ...mockParticipants[participantIndex],
      ...updateData,
      lastActivity: new Date().toLocaleDateString(),
    };

    return NextResponse.json({
      success: true,
      participant: mockParticipants[participantIndex],
      message: 'Participant updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update participant',
      },
      { status: 500 }
    );
  }
}

// DELETE participant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participantId = params.id;
    const participantIndex = mockParticipants.findIndex(
      (p) => p.id === participantId
    );

    if (participantIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Participant not found',
        },
        { status: 404 }
      );
    }

    // Remove participant (in a real app, this would use the ParticipantManagementService)
    mockParticipants.splice(participantIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Participant removed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete participant',
      },
      { status: 500 }
    );
  }
}
