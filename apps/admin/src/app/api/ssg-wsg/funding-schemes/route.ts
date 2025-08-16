import { NextRequest, NextResponse } from 'next/server';

// Mock implementation for funding schemes API
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    console.log(
      `[ADMIN MOCK] GET funding-schemes - category: ${category}, status: ${status}`
    );

    // Mock funding schemes data
    const mockSchemes = [
      {
        id: 'wsg-001',
        name: 'Workforce Skills Qualifications (WSQ)',
        category: 'skills-development',
        status: 'active',
        description:
          'National credentialing system that trains, develops, assesses and certifies skills and competencies',
        fundingPercentage: 70,
        maxFunding: 2000,
        eligibility: ['Singapore Citizens', 'Permanent Residents'],
      },
      {
        id: 'ssg-002',
        name: 'SkillsFuture Credit',
        category: 'individual-funding',
        status: 'active',
        description:
          'Credit to encourage individuals to take ownership of their skills development',
        fundingPercentage: 100,
        maxFunding: 500,
        eligibility: ['Singapore Citizens aged 25 and above'],
      },
    ];

    // Filter based on query parameters
    let filteredSchemes = mockSchemes;
    if (category) {
      filteredSchemes = filteredSchemes.filter(
        (scheme) => scheme.category === category
      );
    }
    if (status) {
      filteredSchemes = filteredSchemes.filter(
        (scheme) => scheme.status === status
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredSchemes,
      total: filteredSchemes.length,
    });
  } catch (error) {
    console.error('Error in funding schemes API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('[ADMIN MOCK] POST funding-schemes:', data);

    // Mock creating a new funding scheme
    const newScheme = {
      id: `mock-${Date.now()}`,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newScheme,
    });
  } catch (error) {
    console.error('Error creating funding scheme:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
