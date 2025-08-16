# TMS Integration Guide for Participant Management

This guide shows how to integrate the comprehensive participant management system into your TMS (Training Management System) application.

## 📋 Overview

The participant management package provides a complete solution for:

- **Multi-step Registration Workflows** with conditional fields and validation
- **Enrollment Automation** with batch processing and auto-assignment
- **Attendance Tracking** with QR codes, GPS verification, and biometric options
- **Communication Hub** with email, SMS, in-app notifications, and push notifications
- **Document Management** with PDF generation, certificates, and templates
- **Progress Tracking** with milestones, analytics, and visualization
- **Survey Integration** with automated distribution and response tracking

## 🚀 Quick Start

### 1. Add to TMS Package Dependencies

First, add the participant management package to your TMS app:

```json
// apps/tms/package.json
{
  "dependencies": {
    "@tmslms/participant-management": "*"
    // ... other dependencies
  }
}
```

### 2. Initialize in TMS Application

```typescript
// apps/tms/src/lib/participant-system.ts
import { ParticipantManagementSystem } from '@tmslms/participant-management';

export const participantSystem = new ParticipantManagementSystem({
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },
});

// Initialize default templates and workflows
await participantSystem.initialize();
```

### 3. Create API Routes

```typescript
// apps/tms/src/app/api/participants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { participantSystem } from '@/lib/participant-system';

export async function POST(request: NextRequest) {
  try {
    const participantData = await request.json();
    const participant =
      await participantSystem.participantService.createParticipant(
        participantData
      );
    return NextResponse.json(participant);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams);
    const participants =
      await participantSystem.participantService.getParticipants(filters);
    return NextResponse.json(participants);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}
```

## 🎨 UI Components

### Participant Registration Form

```typescript
// apps/tms/src/components/ParticipantRegistration.tsx
'use client';

import React, { useState } from 'react';
import { ParticipantStatus, CommunicationChannel } from '@tmslms/participant-management';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  // ... other fields
}

export function ParticipantRegistrationForm() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: ParticipantStatus.ACTIVE,
          preferences: {
            communicationChannels: [CommunicationChannel.EMAIL],
            emailNotifications: true,
            language: 'en',
            timezone: 'America/New_York'
          }
        })
      });

      if (response.ok) {
        const participant = await response.json();
        console.log('Participant created:', participant);
        // Handle success (redirect, show message, etc.)
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Register Participant
      </button>
    </form>
  );
}
```

### QR Code Attendance Component

```typescript
// apps/tms/src/components/AttendanceQRCode.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface AttendanceQRCodeProps {
  sessionId: string;
  validityMinutes?: number;
}

export function AttendanceQRCode({ sessionId, validityMinutes = 30 }: AttendanceQRCodeProps) {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [sessionId]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/attendance/qr-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, validityMinutes })
      });

      if (response.ok) {
        const { qrCodeData, expiresAt } = await response.json();
        setQrCodeData(qrCodeData);
        setExpiresAt(new Date(expiresAt));
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>;
  }

  if (!qrCodeData) {
    return (
      <div className="text-center">
        <p className="text-red-600">Failed to generate QR code</p>
        <button
          onClick={generateQRCode}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-4">
        <Image
          src={qrCodeData}
          alt="Attendance QR Code"
          width={256}
          height={256}
          className="mx-auto border-2 border-gray-300 rounded-lg"
        />
      </div>
      <p className="text-sm text-gray-600">
        QR Code expires at: {expiresAt?.toLocaleString()}
      </p>
      <button
        onClick={generateQRCode}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Generate New Code
      </button>
    </div>
  );
}
```

### Progress Tracking Dashboard

```typescript
// apps/tms/src/components/ProgressDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface ProgressData {
  participantId: string;
  participantName: string;
  overallProgress: number;
  modulesCompleted: number;
  totalModules: number;
  attendancePercentage: number;
  lastActivity?: Date;
}

export function ProgressDashboard({ participantId }: { participantId: string }) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [participantId]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`/api/participants/${participantId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading progress...</div>;
  }

  if (!progressData) {
    return <div className="text-red-600">Failed to load progress data</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Progress for {progressData.participantName}
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {progressData.overallProgress}%
          </div>
          <div className="text-sm text-blue-600">Overall Progress</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {progressData.modulesCompleted}/{progressData.totalModules}
          </div>
          <div className="text-sm text-green-600">Modules Completed</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{progressData.overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressData.overallProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Attendance</span>
          <span>{progressData.attendancePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressData.attendancePercentage}%` }}
          ></div>
        </div>
      </div>

      {progressData.lastActivity && (
        <p className="text-sm text-gray-600">
          Last activity: {new Date(progressData.lastActivity).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
```

## 🔧 Environment Variables

Add these environment variables to your TMS application:

```env
# Email Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+1234567890

# Database (if using persistent storage)
DATABASE_URL=your-database-connection-string
```

## 📝 Example Usage Scenarios

### 1. Employee Onboarding Training

```typescript
// Create participant and enroll in onboarding program
const participant =
  await participantSystem.participantService.createParticipant({
    // ... participant data
  });

const enrollment = await participantSystem.participantService.enrollParticipant(
  participant.id,
  'onboarding-program-id',
  {
    sessionId: 'onboarding-session-id',
    autoStart: true,
  }
);

// Send welcome email
await participantSystem.communicationService.sendCommunication(
  participant.id,
  'welcome-template-id',
  CommunicationChannel.EMAIL
);
```

### 2. Compliance Training with Mandatory Attendance

```typescript
// Configure strict attendance tracking
await participantSystem.attendanceService.configureSessionAttendance(
  sessionId,
  {
    checkInWindowStart: 5,
    checkInWindowEnd: 10,
    verificationMethods: [
      AttendanceVerificationMethod.QR_CODE,
      AttendanceVerificationMethod.GPS,
    ],
    locationRequired: true,
    requiresApproval: false,
    autoMarkAbsent: true,
  }
);

// Track attendance with GPS verification
const attendance =
  await participantSystem.attendanceService.checkInWithLocation(
    participantId,
    sessionId,
    { latitude: 40.7128, longitude: -74.006 }
  );
```

### 3. Skills Assessment and Certification

```typescript
// Update progress with assessment results
await participantSystem.participantService.updateProgress(enrollmentId, {
  overallProgress: 100,
  assessmentsPassed: 5,
  totalAssessments: 5,
});

// Generate completion certificate
const certificate = await participantSystem.documentService.generateCertificate(
  participantId,
  {
    participantName: 'John Doe',
    courseName: 'Advanced JavaScript',
    completionDate: new Date(),
    grade: 'A',
  }
);
```

## 🎯 Next Steps

1. **Install Dependencies**: Add the participant management package to your TMS app
2. **Create API Routes**: Implement the necessary API endpoints for your frontend
3. **Build UI Components**: Create React components for registration, attendance, and progress tracking
4. **Configure Environment**: Set up email and SMS service credentials
5. **Test Integration**: Use the comprehensive demo as a reference for testing all features
6. **Customize Templates**: Create custom email templates and registration workflows
7. **Add Analytics**: Implement dashboard views for participant analytics and reporting

For more detailed examples, check the `examples/comprehensive-demo.ts` file in the participant management package.
