import { NextRequest, NextResponse } from 'next/server';

// Mock settings storage (in a real app, this would be in a database)
let mockSettings = {
  organizationName: 'Training Management Corp',
  defaultDuration: '2 hours',
  timeZone: 'UTC-5 (Eastern Time)',
  emailNotifications: 'All notifications',
  reminderSettings: '24 hours before',
  lastUpdated: new Date().toISOString(),
};

// GET settings
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      settings: mockSettings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}

// POST/PUT update settings
export async function POST(request: NextRequest) {
  try {
    const newSettings = await request.json();

    // Validate required fields
    if (!newSettings.organizationName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization name is required',
        },
        { status: 400 }
      );
    }

    // Update settings
    mockSettings = {
      ...mockSettings,
      ...newSettings,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: mockSettings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
      },
      { status: 500 }
    );
  }
}
