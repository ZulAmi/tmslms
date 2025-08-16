import {
  ParticipantManagementSystem,
  ParticipantStatus,
  CommunicationChannel,
  AttendanceVerificationMethod,
  DocumentType,
  EnrollmentStatus,
  ProgressStatus,
  CommunicationType,
} from '../src/index';
import { v4 as uuidv4 } from 'uuid';

/**
 * Example Usage of the Participant Management System
 * Demonstrates the complete participant lifecycle
 */
async function demonstrateParticipantManagement() {
  console.log('🚀 Initializing Participant Management System...');

  // Generate UUIDs for demo
  const userId = uuidv4();
  const adminId = uuidv4();
  const trainingProgramId = uuidv4();
  const sessionId = uuidv4();
  const cohortId = uuidv4();
  const milestoneId = uuidv4();

  // Initialize the comprehensive system
  const participantSystem = new ParticipantManagementSystem({
    email: {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || 'test-sid',
      authToken: process.env.TWILIO_AUTH_TOKEN || 'test-token',
      fromNumber: process.env.TWILIO_FROM_NUMBER || '+1234567890',
    },
  });

  // Initialize default templates and workflows
  await participantSystem.initialize();

  console.log('✅ System initialized successfully');

  // ============================================================================
  // 1. CREATE PARTICIPANT
  // ============================================================================
  console.log('\n📝 Creating new participant...');

  const participant =
    await participantSystem.participantService.createParticipant({
      userId: userId as any,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      department: 'Engineering',
      position: 'Senior Developer',
      location: 'New York',
      status: ParticipantStatus.ACTIVE,
      profileData: {
        bio: 'Experienced software developer with 5+ years in web development',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuingOrganization: 'Amazon Web Services',
            issueDate: new Date('2023-01-15'),
            expiryDate: new Date('2026-01-15'),
            credentialId: 'AWS-123456',
          },
        ],
        education: [
          {
            institution: 'University of Technology',
            degree: 'Bachelor of Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-05-31'),
            gpa: 3.8,
          },
        ],
        workExperience: [
          {
            company: 'Tech Corp',
            position: 'Software Developer',
            department: 'Engineering',
            startDate: new Date('2019-06-01'),
            endDate: new Date('2023-12-31'),
            description: 'Full-stack web development using modern technologies',
            skills: ['React', 'Node.js', 'PostgreSQL'],
          },
        ],
        languages: [
          { language: 'English', level: 'Native' },
          { language: 'Spanish', level: 'Intermediate' },
        ],
        accessibility: {
          visualAids: false,
          hearingAids: false,
          mobilityAssistance: false,
          cognitiveSupport: false,
          screenReader: false,
          largeText: true,
          highContrast: false,
          additionalTime: false,
          notes: 'Prefers larger text for reading',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1234567891',
          email: 'jane.doe@example.com',
        },
        customFields: {
          employeeId: 'EMP-001',
          startDate: '2024-01-15',
          manager: 'Sarah Smith',
        },
      },
      preferences: {
        communicationChannels: [
          CommunicationChannel.EMAIL,
          CommunicationChannel.SMS,
        ],
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        language: 'en',
        timezone: 'America/New_York',
        schedulingPreferences: {
          preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday'],
          preferredTimes: [
            {
              startTime: new Date('2024-01-01T09:00:00Z'),
              endTime: new Date('2024-01-01T12:00:00Z'),
              isAvailable: true,
            },
            {
              startTime: new Date('2024-01-01T14:00:00Z'),
              endTime: new Date('2024-01-01T17:00:00Z'),
              isAvailable: true,
            },
          ],
          blackoutPeriods: [],
          maxSessionsPerDay: 2,
          minBreakBetweenSessions: 30,
        },
        privacySettings: {
          shareProgressWithManager: true,
          shareProgressWithPeers: false,
          allowDirectMessages: true,
          showInDirectory: true,
          shareContactInfo: false,
        },
      },
      createdBy: adminId as any,
      updatedBy: adminId as any,
      enrollments: [],
      documents: [],
      communications: [],
      metadata: {},
    });

  console.log(
    `✅ Participant created: ${participant.firstName} ${participant.lastName} (ID: ${participant.id})`
  );

  // ============================================================================
  // 2. CREATE REGISTRATION WORKFLOW
  // ============================================================================
  console.log('\n🔄 Creating registration workflow...');

  const workflow =
    await participantSystem.registrationService.createFromTemplate(
      'advanced',
      trainingProgramId as any,
      {
        name: 'Advanced JavaScript Training Registration',
        description:
          'Multi-step registration for advanced JavaScript training program',
      }
    );

  console.log(
    `✅ Registration workflow created: ${workflow.name} (ID: ${workflow.id})`
  );

  // ============================================================================
  // 3. ENROLL PARTICIPANT
  // ============================================================================
  console.log('\n📚 Enrolling participant in training program...');

  const enrollment =
    await participantSystem.participantService.enrollParticipant(
      participant.id,
      trainingProgramId as any,
      {
        sessionId: sessionId as any,
        cohortId: cohortId as any,
        startDate: new Date('2024-02-01'),
        expectedCompletionDate: new Date('2024-04-30'),
        autoStart: true,
      }
    );

  console.log(
    `✅ Participant enrolled successfully (Enrollment ID: ${enrollment.id})`
  );

  // ============================================================================
  // 4. CONFIGURE ATTENDANCE TRACKING
  // ============================================================================
  console.log('\n📍 Configuring attendance tracking...');

  await participantSystem.attendanceService.configureSessionAttendance(
    sessionId as any,
    {
      checkInWindowStart: 15, // 15 minutes before session
      checkInWindowEnd: 30, // 30 minutes after session start
      checkOutRequired: true,
      verificationMethods: [
        AttendanceVerificationMethod.QR_CODE,
        AttendanceVerificationMethod.GPS,
        AttendanceVerificationMethod.MANUAL,
      ],
      locationRequired: true,
      allowedLocations: [
        { latitude: 40.7128, longitude: -74.006, accuracy: 50 },
      ],
      locationRadius: 100, // 100 meters
      requiresApproval: false,
      autoMarkAbsent: true,
      absentAfterMinutes: 45,
    }
  );

  // Generate QR code for attendance
  const qrCode =
    await participantSystem.attendanceService.generateSessionQRCode(
      sessionId as any,
      30 // Valid for 30 minutes
    );

  console.log(
    `✅ Attendance configured. QR Code generated (expires: ${qrCode.expiresAt})`
  );

  // ============================================================================
  // 5. SIMULATE ATTENDANCE CHECK-IN
  // ============================================================================
  console.log('\n✅ Simulating attendance check-in...');

  const attendance =
    await participantSystem.attendanceService.checkInWithQRCode(
      participant.id,
      qrCode.qrCodeData,
      {
        deviceId: 'device-123',
        deviceType: 'mobile',
        operatingSystem: 'iOS 15.0',
        ipAddress: '192.168.1.100',
        userAgent: 'Training App/1.0',
      },
      {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
      }
    );

  console.log(
    `✅ Attendance recorded: ${attendance.status} at ${attendance.checkInTime}`
  );

  // ============================================================================
  // 6. UPDATE PROGRESS
  // ============================================================================
  console.log('\n📈 Updating participant progress...');

  await participantSystem.participantService.updateProgress(enrollment.id, {
    overallProgress: 25,
    modulesCompleted: 2,
    totalModules: 8,
    assessmentsPassed: 1,
    totalAssessments: 4,
    attendancePercentage: 100,
    milestones: [
      {
        id: milestoneId as any,
        name: 'JavaScript Fundamentals',
        description: 'Complete basic JavaScript concepts',
        targetDate: new Date('2024-02-15'),
        completedDate: new Date('2024-02-14'),
        status: ProgressStatus.COMPLETED,
        requirements: [
          {
            type: 'module',
            description: 'Variables and Data Types',
            isCompleted: true,
            completedDate: new Date('2024-02-10'),
          },
          {
            type: 'assessment',
            description: 'Fundamentals Quiz',
            isCompleted: true,
            completedDate: new Date('2024-02-14'),
          },
        ],
      },
    ],
  });

  console.log('✅ Progress updated successfully');

  // ============================================================================
  // 7. SEND COMMUNICATION
  // ============================================================================
  console.log('\n💬 Sending progress update communication...');

  const templates = await participantSystem.communicationService.getTemplates({
    type: CommunicationType.REMINDER,
    channel: CommunicationChannel.EMAIL,
    isActive: true,
  });

  if (templates.length > 0) {
    await participantSystem.communicationService.sendCommunication(
      participant.id,
      templates[0].id,
      CommunicationChannel.EMAIL,
      {
        participantName: `${participant.firstName} ${participant.lastName}`,
        sessionName: 'Advanced JavaScript - Module 3',
        sessionDate: '2024-02-20',
        sessionTime: '10:00 AM',
        location: 'Training Room A',
      }
    );

    console.log('✅ Communication sent successfully');
  }

  // ============================================================================
  // 8. GENERATE COMPLETION CERTIFICATE
  // ============================================================================
  console.log('\n📜 Generating completion certificate...');

  // Simulate course completion
  await participantSystem.participantService.updateEnrollmentStatus(
    enrollment.id,
    EnrollmentStatus.COMPLETED,
    'Successfully completed all requirements'
  );

  const certificate =
    await participantSystem.documentService.generateCertificate(
      participant.id,
      {
        participantName: `${participant.firstName} ${participant.lastName}`,
        courseName: 'Advanced JavaScript Training',
        completionDate: new Date(),
        grade: 'A',
        instructor: 'Dr. Sarah Johnson',
        organizationName: 'TechTraining Institute',
      }
    );

  console.log(
    `✅ Certificate generated: ${certificate.title} (ID: ${certificate.id})`
  );

  // ============================================================================
  // 9. GET PARTICIPANT ANALYTICS
  // ============================================================================
  console.log('\n📊 Generating participant analytics...');

  const analytics =
    await participantSystem.participantService.getParticipantAnalytics(
      participant.id
    );

  console.log('📈 Participant Analytics:');
  console.log(`   - Total Enrollments: ${analytics.totalEnrollments}`);
  console.log(`   - Active Enrollments: ${analytics.activeEnrollments}`);
  console.log(`   - Completed Enrollments: ${analytics.completedEnrollments}`);
  console.log(
    `   - Average Progress: ${analytics.averageProgress.toFixed(1)}%`
  );
  console.log(`   - Attendance Rate: ${analytics.attendanceRate.toFixed(1)}%`);
  console.log(
    `   - Last Activity: ${analytics.lastActivity?.toLocaleDateString() || 'N/A'}`
  );

  // ============================================================================
  // 10. HEALTH CHECK
  // ============================================================================
  console.log('\n🏥 Performing system health check...');

  const healthCheck = await participantSystem.healthCheck();

  console.log(`🎯 System Status: ${healthCheck.status.toUpperCase()}`);
  console.log('🔧 Service Status:');
  Object.entries(healthCheck.services).forEach(([service, status]) => {
    console.log(`   - ${service}: ${String(status).toUpperCase()}`);
  });
  console.log(`🕐 Timestamp: ${healthCheck.timestamp.toISOString()}`);

  console.log(
    '\n🎉 Participant Management System demonstration completed successfully!'
  );
  console.log('\n📋 Summary of what was accomplished:');
  console.log('   ✅ Created comprehensive participant profile');
  console.log('   ✅ Set up advanced registration workflow');
  console.log('   ✅ Enrolled participant in training program');
  console.log('   ✅ Configured multi-method attendance tracking');
  console.log('   ✅ Recorded attendance with QR code verification');
  console.log('   ✅ Tracked detailed progress and milestones');
  console.log('   ✅ Sent automated communications');
  console.log('   ✅ Generated completion certificate');
  console.log('   ✅ Provided comprehensive analytics');
  console.log('   ✅ Verified system health status');
}

// Run the demonstration
if (require.main === module) {
  demonstrateParticipantManagement()
    .then(() => {
      console.log('\n🏁 Demonstration finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Demonstration failed:', error);
      process.exit(1);
    });
}

export default demonstrateParticipantManagement;
