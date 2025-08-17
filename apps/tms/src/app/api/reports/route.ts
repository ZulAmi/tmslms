import { NextRequest, NextResponse } from 'next/server';

// Generate different types of reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const format = searchParams.get('format') || 'json';

    let reportData: any = {};
    const generatedAt = new Date().toISOString();

    switch (reportType) {
      case 'attendance':
        reportData = {
          type: 'attendance',
          summary: {
            totalSessions: 15,
            averageAttendance: 85,
            highestAttendance: 95,
            lowestAttendance: 72,
            noShowRate: 8,
          },
          details: [
            {
              sessionId: '1',
              sessionTitle: 'Leadership Training',
              attendance: 90,
              registered: 20,
              attended: 18,
            },
            {
              sessionId: '2',
              sessionTitle: 'Digital Workshop',
              attendance: 83,
              registered: 30,
              attended: 25,
            },
            {
              sessionId: '3',
              sessionTitle: 'Project Management',
              attendance: 88,
              registered: 25,
              attended: 22,
            },
          ],
          generatedAt,
        };
        break;

      case 'financial':
        reportData = {
          type: 'financial',
          summary: {
            totalBudget: 250000,
            spentBudget: 147500,
            remainingBudget: 102500,
            costPerParticipant: 2950,
            projectedOverrun: 0,
          },
          breakdown: [
            { category: 'Instructor Fees', amount: 75000, percentage: 51 },
            { category: 'Venue Costs', amount: 35000, percentage: 24 },
            { category: 'Materials', amount: 22500, percentage: 15 },
            { category: 'Technology', amount: 15000, percentage: 10 },
          ],
          generatedAt,
        };
        break;

      case 'completion':
        reportData = {
          type: 'completion',
          summary: {
            totalParticipants: 50,
            completed: 40,
            inProgress: 7,
            notStarted: 3,
            completionRate: 80,
          },
          departmentBreakdown: [
            {
              department: 'Engineering',
              participants: 15,
              completed: 13,
              rate: 87,
            },
            {
              department: 'Marketing',
              participants: 12,
              completed: 9,
              rate: 75,
            },
            { department: 'HR', participants: 10, completed: 8, rate: 80 },
            { department: 'Finance', participants: 8, completed: 7, rate: 88 },
            {
              department: 'Operations',
              participants: 5,
              completed: 3,
              rate: 60,
            },
          ],
          generatedAt,
        };
        break;

      case 'performance':
        reportData = {
          type: 'performance',
          summary: {
            averageScore: 4.2,
            participantSatisfaction: 4.8,
            instructorRating: 4.6,
            contentQuality: 4.4,
            recommendationRate: 92,
          },
          trends: [
            { month: 'January', score: 4.0, satisfaction: 4.5 },
            { month: 'February', score: 4.1, satisfaction: 4.6 },
            { month: 'March', score: 4.2, satisfaction: 4.8 },
            { month: 'April', score: 4.3, satisfaction: 4.7 },
          ],
          generatedAt,
        };
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              'Invalid report type. Available types: attendance, financial, completion, performance',
          },
          { status: 400 }
        );
    }

    if (format === 'csv' && reportType === 'attendance') {
      // Generate CSV for attendance report
      const csv =
        'Session ID,Session Title,Attendance Rate,Registered,Attended\n' +
        reportData.details
          .map(
            (row: any) =>
              `${row.sessionId},${row.sessionTitle},${row.attendance}%,${row.registered},${row.attended}`
          )
          .join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate report',
      },
      { status: 500 }
    );
  }
}
