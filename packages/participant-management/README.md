# Participant Management Package

A comprehensive participant lifecycle management system for training and learning management systems. This package provides complete functionality for managing participants from registration to completion, including multi-step registration workflows, attendance tracking, communication management, and document generation.

## Features

### 🎯 Core Participant Management

- **Complete Participant Lifecycle**: From registration to completion
- **Status Tracking**: Active, inactive, completed, withdrawn participants
- **Profile Management**: Comprehensive participant profiles with custom fields
- **Bulk Operations**: Bulk enrollment, status updates, and communications

### 📋 Registration & Enrollment

- **Multi-Step Registration**: Configurable workflows with conditional fields
- **Prerequisite Checking**: Automated validation of requirements
- **Approval Workflows**: Multi-level approval chains with escalation
- **Auto-Enrollment Rules**: Intelligent enrollment based on conditions

### 📊 Attendance Tracking

- **Multiple Verification Methods**:
  - QR Code check-in/check-out
  - GPS location verification
  - Biometric authentication
  - Facial recognition
  - Manual check-in by instructors
- **Real-time Monitoring**: Live attendance tracking
- **Automated Absence Management**: Auto-mark absent after timeouts
- **Attendance Analytics**: Comprehensive reporting and statistics

### 💬 Communication Hub

- **Multi-Channel Support**: Email, SMS, in-app, push notifications
- **Template Management**: Rich template system with variables
- **Automated Communications**: Rule-based triggered messages
- **Communication Tracking**: Delivery, read receipts, response tracking

### 📄 Document Management

- **Automated Generation**: Certificates, transcripts, reports
- **Template System**: Customizable document templates
- **Multiple Formats**: PDF, HTML, images
- **Verification System**: Digital signatures and QR code verification
- **Access Control**: Granular document access permissions

### 📈 Progress Visualization

- **Real-time Dashboards**: Customizable participant dashboards
- **Progress Tracking**: Module completion, assessment scores, milestones
- **Analytics**: Performance metrics and trend analysis
- **Intervention Alerts**: Automated early warning system

## Installation

```bash
npm install @your-org/participant-management
```

## Quick Start

```typescript
import { ParticipantManagementSystem } from '@your-org/participant-management';

// Initialize the system
const participantSystem = new ParticipantManagementSystem({
  email: {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@example.com',
      pass: 'your-password',
    },
  },
  twilio: {
    accountSid: 'your-twilio-sid',
    authToken: 'your-twilio-token',
    fromNumber: '+1234567890',
  },
});

// Initialize default templates and workflows
await participantSystem.initialize();

// Create a participant
const participant =
  await participantSystem.participantService.createParticipant({
    userId: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    status: ParticipantStatus.ACTIVE,
    profileData: {
      bio: 'Software developer',
      skills: ['JavaScript', 'TypeScript'],
      certifications: [],
      education: [],
      workExperience: [],
      languages: [],
      accessibility: {
        visualAids: false,
        hearingAids: false,
        mobilityAssistance: false,
        cognitiveSupport: false,
        screenReader: false,
        largeText: false,
        highContrast: false,
        additionalTime: false,
      },
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1234567890',
      },
      customFields: {},
    },
    preferences: {
      communicationChannels: [CommunicationChannel.EMAIL],
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      language: 'en',
      timezone: 'UTC',
      schedulingPreferences: {
        preferredDays: ['monday', 'tuesday', 'wednesday'],
        preferredTimes: [],
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
    createdBy: 'admin-123',
    updatedBy: 'admin-123',
  });

// Enroll participant in a training program
const enrollment = await participantSystem.participantService.enrollParticipant(
  participant.id,
  'training-program-123',
  {
    autoStart: true,
    expectedCompletionDate: new Date('2024-12-31'),
  }
);
```

## API Reference

### ParticipantManagementService

#### Core Methods

- `createParticipant(data)` - Create a new participant
- `getParticipant(id)` - Get participant by ID
- `getParticipants(options)` - Get participants with filtering and pagination
- `updateParticipant(id, updates)` - Update participant information
- `updateParticipantStatus(id, status, reason)` - Update participant status

#### Enrollment Methods

- `enrollParticipant(participantId, programId, options)` - Enroll participant
- `updateEnrollmentStatus(enrollmentId, status, reason)` - Update enrollment status
- `withdrawParticipant(enrollmentId, reason, withdrawnBy)` - Withdraw participant
- `transferParticipant(enrollmentId, newSessionId, newCohortId, reason)` - Transfer participant

#### Analytics Methods

- `getParticipantAnalytics(participantId)` - Get comprehensive analytics
- `bulkEnrollParticipants(participantIds, programId, options)` - Bulk enrollment
- `searchParticipants(criteria)` - Advanced search functionality

### RegistrationWorkflowService

#### Workflow Management

- `createWorkflow(data)` - Create registration workflow
- `getWorkflow(id)` - Get workflow by ID
- `updateWorkflow(id, updates)` - Update workflow
- `createFromTemplate(type, programId, customizations)` - Create from template

#### Step Management

- `addStep(workflowId, stepData)` - Add step to workflow
- `updateStep(workflowId, stepId, updates)` - Update step
- `removeStep(workflowId, stepId)` - Remove step

#### Validation

- `validateStepData(workflowId, stepNumber, data)` - Validate step data
- `checkPrerequisites(workflowId, participantData)` - Check prerequisites
- `checkAutoEnrollmentRules(workflowId, registrationData)` - Check auto-enrollment

### AttendanceTrackingService

#### Configuration

- `configureSessionAttendance(sessionId, config)` - Configure attendance settings
- `getSessionConfiguration(sessionId)` - Get session configuration

#### Check-in Methods

- `generateSessionQRCode(sessionId, validForMinutes)` - Generate QR code
- `checkInWithQRCode(participantId, qrCode, deviceInfo, location)` - QR check-in
- `checkInWithGPS(participantId, sessionId, location, deviceInfo)` - GPS check-in
- `checkInWithBiometric(participantId, sessionId, biometricHash, deviceInfo)` - Biometric check-in
- `manualCheckIn(participantId, sessionId, status, checkedInBy, notes)` - Manual check-in

#### Analytics

- `getSessionAttendance(sessionId)` - Get session attendance records
- `getParticipantAttendance(participantId, options)` - Get participant attendance
- `getSessionAttendanceStats(sessionId)` - Get attendance statistics

### CommunicationService

#### Template Management

- `createTemplate(data)` - Create communication template
- `getTemplate(id)` - Get template by ID
- `getTemplates(filters)` - Get templates with filters
- `updateTemplate(id, updates)` - Update template

#### Sending Communications

- `sendCommunication(participantId, templateId, channel, variables)` - Send immediate
- `scheduleCommunication(participantId, templateId, channel, scheduledAt, variables)` - Schedule
- `sendBulkCommunication(participantIds, templateId, channel, variables)` - Bulk send

#### Rule Management

- `createRule(data)` - Create communication rule
- `processTriggerEvent(event, participantId, eventData)` - Process triggered events

### DocumentManagementService

#### Template Management

- `createTemplate(data)` - Create document template
- `getTemplate(id)` - Get template by ID
- `getTemplatesByType(type)` - Get templates by type

#### Document Generation

- `generateDocument(participantId, templateId, data, options)` - Generate document
- `generateCertificate(participantId, certificateData)` - Generate certificate
- `generateTranscript(participantId, transcriptData)` - Generate transcript

#### Document Management

- `getParticipantDocuments(participantId, filters)` - Get participant documents
- `updateDocument(id, updates)` - Update document
- `trackDownload(id, downloadedBy)` - Track document download
- `verifyDocument(id, providedHash)` - Verify document authenticity

## Configuration

### Environment Variables

```bash
# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=+1234567890

# Application Configuration
BASE_URL=https://your-app.com
DEFAULT_FROM_EMAIL=noreply@your-app.com
```

### TypeScript Configuration

The package is fully typed with TypeScript. All interfaces and types are exported for use in your application.

## Events

The system emits various events that you can listen to:

```typescript
// Participant events
participantSystem.participantService.on('participantCreated', (event) => {
  console.log('New participant created:', event.participant);
});

participantSystem.participantService.on('participantEnrolled', (event) => {
  console.log('Participant enrolled:', event.enrollment);
});

// Attendance events
participantSystem.attendanceService.on('attendanceRecorded', (event) => {
  console.log('Attendance recorded:', event.attendance);
});

// Communication events
participantSystem.communicationService.on('communicationSent', (event) => {
  console.log('Communication sent:', event.communication);
});

// Document events
participantSystem.documentService.on('documentGenerated', (event) => {
  console.log('Document generated:', event.document);
});
```

## Templates

### Registration Workflow Templates

The system includes several pre-built registration workflow templates:

- **Basic**: Simple registration with essential information
- **Advanced**: Multi-step registration with validation
- **Corporate**: Enterprise workflow with approval chains
- **Academic**: Academic institution workflow with prerequisites

### Communication Templates

Built-in communication templates include:

- Welcome emails
- Session reminders
- Assignment notifications
- Completion certificates
- Intervention alerts

### Document Templates

Default document templates:

- Completion certificates
- Training transcripts
- Attendance records
- Assessment results

## Examples

### Complete Registration Flow

```typescript
// 1. Create registration workflow
const workflow = await participantSystem.registrationService.createFromTemplate(
  'advanced',
  'training-program-123'
);

// 2. Start participant registration
const registration =
  await participantSystem.registrationService.startRegistration(
    'participant-123',
    workflow.id,
    'training-program-123'
  );

// 3. Submit step data
await participantSystem.registrationService.updateRegistrationStep(
  registration.id,
  1,
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  }
);

// 4. Submit registration for approval
await participantSystem.registrationService.submitRegistration(registration.id);

// 5. Approve registration
await participantSystem.registrationService.approveRegistration(
  registration.id,
  'approver-123',
  'Approved for enrollment'
);
```

### Attendance Tracking Setup

```typescript
// 1. Configure session attendance
await participantSystem.attendanceService.configureSessionAttendance(
  'session-123',
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
    allowedLocations: [{ latitude: 40.7128, longitude: -74.006, accuracy: 50 }],
    locationRadius: 100, // 100 meters
    requiresApproval: false,
    autoMarkAbsent: true,
    absentAfterMinutes: 45,
  }
);

// 2. Generate QR code for session
const qrCode = await participantSystem.attendanceService.generateSessionQRCode(
  'session-123',
  30 // Valid for 30 minutes
);

// 3. Participant checks in with QR code
const attendance = await participantSystem.attendanceService.checkInWithQRCode(
  'participant-123',
  qrCode.qrCodeData,
  {
    deviceId: 'device-123',
    deviceType: 'mobile',
    operatingSystem: 'iOS 15.0',
    ipAddress: '192.168.1.100',
    userAgent: 'Mobile App',
  }
);
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Email: support@your-org.com
- Documentation: https://docs.your-org.com/participant-management
