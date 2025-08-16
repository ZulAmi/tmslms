import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceVerificationMethod,
  AttendanceVerificationData,
  AttendanceConfiguration,
  GeoLocation,
  DeviceInfo,
  UUID,
  createUUID,
} from '../types';

/**
 * Advanced Attendance Tracking Service
 * Supports multiple verification methods: QR codes, GPS, biometric, manual check-in
 */
export class AttendanceTrackingService extends EventEmitter {
  private attendanceRecords: Map<UUID, AttendanceRecord> = new Map();
  private sessionConfigurations: Map<UUID, AttendanceConfiguration> = new Map();
  private activeQRCodes: Map<string, { sessionId: UUID; expiresAt: Date }> =
    new Map();

  constructor() {
    super();
    this.startQRCodeCleanup();
  }

  // ============================================================================
  // ATTENDANCE CONFIGURATION
  // ============================================================================

  /**
   * Configure attendance settings for a session
   */
  async configureSessionAttendance(
    sessionId: UUID,
    config: Omit<AttendanceConfiguration, 'sessionId'>
  ): Promise<AttendanceConfiguration> {
    const configuration: AttendanceConfiguration = {
      sessionId,
      ...config,
    };

    this.sessionConfigurations.set(sessionId, configuration);

    this.emit('attendanceConfigured', { sessionId, configuration });

    return configuration;
  }

  /**
   * Get attendance configuration for session
   */
  async getSessionConfiguration(
    sessionId: UUID
  ): Promise<AttendanceConfiguration | null> {
    return this.sessionConfigurations.get(sessionId) || null;
  }

  /**
   * Update attendance configuration
   */
  async updateSessionConfiguration(
    sessionId: UUID,
    updates: Partial<Omit<AttendanceConfiguration, 'sessionId'>>
  ): Promise<AttendanceConfiguration | null> {
    const existing = this.sessionConfigurations.get(sessionId);
    if (!existing) {
      return null;
    }

    const updated: AttendanceConfiguration = {
      ...existing,
      ...updates,
    };

    this.sessionConfigurations.set(sessionId, updated);

    this.emit('attendanceConfigurationUpdated', {
      sessionId,
      configuration: updated,
    });

    return updated;
  }

  // ============================================================================
  // QR CODE ATTENDANCE
  // ============================================================================

  /**
   * Generate QR code for session check-in
   */
  async generateSessionQRCode(
    sessionId: UUID,
    validForMinutes: number = 30
  ): Promise<{
    qrCodeData: string;
    qrCodeImage: string;
    expiresAt: Date;
  }> {
    const config = this.sessionConfigurations.get(sessionId);
    if (
      !config ||
      !config.verificationMethods.includes(AttendanceVerificationMethod.QR_CODE)
    ) {
      throw new Error('QR code verification not enabled for this session');
    }

    const qrCodeData = uuidv4();
    const expiresAt = new Date(Date.now() + validForMinutes * 60 * 1000);

    // Store QR code mapping
    this.activeQRCodes.set(qrCodeData, { sessionId, expiresAt });

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(
      JSON.stringify({
        type: 'attendance',
        sessionId,
        qrCode: qrCodeData,
        timestamp: new Date().toISOString(),
      })
    );

    this.emit('qrCodeGenerated', { sessionId, qrCodeData, expiresAt });

    return {
      qrCodeData,
      qrCodeImage,
      expiresAt,
    };
  }

  /**
   * Check in using QR code
   */
  async checkInWithQRCode(
    participantId: UUID,
    qrCodeData: string,
    deviceInfo: DeviceInfo,
    location?: GeoLocation
  ): Promise<AttendanceRecord> {
    const qrCodeInfo = this.activeQRCodes.get(qrCodeData);
    if (!qrCodeInfo) {
      throw new Error('Invalid or expired QR code');
    }

    if (new Date() > qrCodeInfo.expiresAt) {
      this.activeQRCodes.delete(qrCodeData);
      throw new Error('QR code has expired');
    }

    const verificationData: AttendanceVerificationData = {
      method: AttendanceVerificationMethod.QR_CODE,
      qrCodeData,
      gpsCoordinates: location,
      deviceInfo,
      timestamp: new Date(),
    };

    return await this.recordAttendance(
      participantId,
      qrCodeInfo.sessionId,
      AttendanceStatus.PRESENT,
      verificationData,
      location
    );
  }

  // ============================================================================
  // GPS ATTENDANCE
  // ============================================================================

  /**
   * Check in using GPS location
   */
  async checkInWithGPS(
    participantId: UUID,
    sessionId: UUID,
    location: GeoLocation,
    deviceInfo: DeviceInfo
  ): Promise<AttendanceRecord> {
    const config = this.sessionConfigurations.get(sessionId);
    if (
      !config ||
      !config.verificationMethods.includes(AttendanceVerificationMethod.GPS)
    ) {
      throw new Error('GPS verification not enabled for this session');
    }

    // Verify location if required
    if (config.locationRequired && config.allowedLocations) {
      const isLocationValid = this.verifyLocation(
        location,
        config.allowedLocations,
        config.locationRadius || 100
      );
      if (!isLocationValid) {
        throw new Error('Check-in location is outside allowed area');
      }
    }

    const verificationData: AttendanceVerificationData = {
      method: AttendanceVerificationMethod.GPS,
      gpsCoordinates: location,
      deviceInfo,
      timestamp: new Date(),
    };

    return await this.recordAttendance(
      participantId,
      sessionId,
      AttendanceStatus.PRESENT,
      verificationData,
      location
    );
  }

  // ============================================================================
  // BIOMETRIC ATTENDANCE
  // ============================================================================

  /**
   * Check in using biometric verification
   */
  async checkInWithBiometric(
    participantId: UUID,
    sessionId: UUID,
    biometricHash: string,
    deviceInfo: DeviceInfo,
    location?: GeoLocation
  ): Promise<AttendanceRecord> {
    const config = this.sessionConfigurations.get(sessionId);
    if (
      !config ||
      !config.verificationMethods.includes(
        AttendanceVerificationMethod.BIOMETRIC
      )
    ) {
      throw new Error('Biometric verification not enabled for this session');
    }

    // In a real implementation, you would verify the biometric hash against stored data
    const isValidBiometric = await this.verifyBiometric(
      participantId,
      biometricHash
    );
    if (!isValidBiometric) {
      throw new Error('Biometric verification failed');
    }

    const verificationData: AttendanceVerificationData = {
      method: AttendanceVerificationMethod.BIOMETRIC,
      biometricHash,
      gpsCoordinates: location,
      deviceInfo,
      timestamp: new Date(),
    };

    return await this.recordAttendance(
      participantId,
      sessionId,
      AttendanceStatus.PRESENT,
      verificationData,
      location
    );
  }

  // ============================================================================
  // FACIAL RECOGNITION ATTENDANCE
  // ============================================================================

  /**
   * Check in using facial recognition
   */
  async checkInWithFacialRecognition(
    participantId: UUID,
    sessionId: UUID,
    faceData: string,
    confidence: number,
    deviceInfo: DeviceInfo,
    location?: GeoLocation
  ): Promise<AttendanceRecord> {
    const config = this.sessionConfigurations.get(sessionId);
    if (
      !config ||
      !config.verificationMethods.includes(
        AttendanceVerificationMethod.FACIAL_RECOGNITION
      )
    ) {
      throw new Error('Facial recognition not enabled for this session');
    }

    if (confidence < 0.8) {
      // 80% confidence threshold
      throw new Error('Facial recognition confidence too low');
    }

    const verificationData: AttendanceVerificationData = {
      method: AttendanceVerificationMethod.FACIAL_RECOGNITION,
      faceRecognitionConfidence: confidence,
      gpsCoordinates: location,
      deviceInfo,
      timestamp: new Date(),
    };

    return await this.recordAttendance(
      participantId,
      sessionId,
      AttendanceStatus.PRESENT,
      verificationData,
      location
    );
  }

  // ============================================================================
  // MANUAL ATTENDANCE
  // ============================================================================

  /**
   * Manual check-in by instructor/admin
   */
  async manualCheckIn(
    participantId: UUID,
    sessionId: UUID,
    status: AttendanceStatus,
    checkedInBy: UUID,
    notes?: string
  ): Promise<AttendanceRecord> {
    const config = this.sessionConfigurations.get(sessionId);
    if (
      !config ||
      !config.verificationMethods.includes(AttendanceVerificationMethod.MANUAL)
    ) {
      throw new Error('Manual verification not enabled for this session');
    }

    const verificationData: AttendanceVerificationData = {
      method: AttendanceVerificationMethod.MANUAL,
      timestamp: new Date(),
    };

    const attendance = await this.recordAttendance(
      participantId,
      sessionId,
      status,
      verificationData
    );

    // Add additional metadata for manual check-in
    attendance.notes = notes;
    attendance.approvedBy = checkedInBy;

    this.attendanceRecords.set(attendance.id, attendance);

    this.emit('manualCheckIn', { attendance, checkedInBy });

    return attendance;
  }

  // ============================================================================
  // ATTENDANCE MANAGEMENT
  // ============================================================================

  /**
   * Record attendance
   */
  private async recordAttendance(
    participantId: UUID,
    sessionId: UUID,
    status: AttendanceStatus,
    verificationData: AttendanceVerificationData,
    location?: GeoLocation
  ): Promise<AttendanceRecord> {
    const config = this.sessionConfigurations.get(sessionId);
    if (!config) {
      throw new Error('Session not configured for attendance tracking');
    }

    // Check if participant already checked in
    const existingRecord = this.findExistingAttendance(
      participantId,
      sessionId
    );
    if (existingRecord) {
      throw new Error('Participant already checked in for this session');
    }

    // Validate check-in window
    await this.validateCheckInWindow(config);

    const attendanceId = createUUID(uuidv4());
    const now = new Date();

    const attendance: AttendanceRecord = {
      id: attendanceId,
      participantId,
      sessionId,
      status,
      checkInTime: now,
      verificationMethod: verificationData.method,
      verificationData,
      location,
      createdAt: now,
      updatedAt: now,
    };

    this.attendanceRecords.set(attendanceId, attendance);

    this.emit('attendanceRecorded', { attendance });

    return attendance;
  }

  /**
   * Check out participant
   */
  async checkOut(
    participantId: UUID,
    sessionId: UUID,
    verificationData: AttendanceVerificationData
  ): Promise<AttendanceRecord | null> {
    const attendance = this.findExistingAttendance(participantId, sessionId);
    if (!attendance) {
      throw new Error('No check-in record found for participant');
    }

    const checkOutTime = new Date();
    const duration = attendance.checkInTime
      ? Math.round(
          (checkOutTime.getTime() - attendance.checkInTime.getTime()) / 60000
        ) // minutes
      : undefined;

    const updatedAttendance: AttendanceRecord = {
      ...attendance,
      checkOutTime,
      duration,
      updatedAt: checkOutTime,
    };

    this.attendanceRecords.set(attendance.id, updatedAttendance);

    this.emit('participantCheckedOut', { attendance: updatedAttendance });

    return updatedAttendance;
  }

  /**
   * Update attendance status
   */
  async updateAttendanceStatus(
    attendanceId: UUID,
    status: AttendanceStatus,
    updatedBy: UUID,
    notes?: string
  ): Promise<AttendanceRecord | null> {
    const attendance = this.attendanceRecords.get(attendanceId);
    if (!attendance) {
      return null;
    }

    const updatedAttendance: AttendanceRecord = {
      ...attendance,
      status,
      notes: notes || attendance.notes,
      approvedBy: updatedBy,
      updatedAt: new Date(),
    };

    this.attendanceRecords.set(attendanceId, updatedAttendance);

    this.emit('attendanceStatusUpdated', {
      attendance: updatedAttendance,
      previousStatus: attendance.status,
      updatedBy,
    });

    return updatedAttendance;
  }

  /**
   * Get attendance records for session
   */
  async getSessionAttendance(sessionId: UUID): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values())
      .filter((record) => record.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Get attendance records for participant
   */
  async getParticipantAttendance(
    participantId: UUID,
    options?: {
      sessionId?: UUID;
      startDate?: Date;
      endDate?: Date;
      status?: AttendanceStatus[];
    }
  ): Promise<AttendanceRecord[]> {
    let records = Array.from(this.attendanceRecords.values()).filter(
      (record) => record.participantId === participantId
    );

    if (options?.sessionId) {
      records = records.filter(
        (record) => record.sessionId === options.sessionId
      );
    }

    if (options?.startDate) {
      records = records.filter(
        (record) => record.createdAt >= options.startDate!
      );
    }

    if (options?.endDate) {
      records = records.filter(
        (record) => record.createdAt <= options.endDate!
      );
    }

    if (options?.status && options.status.length > 0) {
      records = records.filter((record) =>
        options.status!.includes(record.status)
      );
    }

    return records.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  /**
   * Get attendance statistics for session
   */
  async getSessionAttendanceStats(sessionId: UUID): Promise<{
    totalParticipants: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    partial: number;
    attendanceRate: number;
    averageCheckInTime?: Date;
    verificationMethodStats: Record<AttendanceVerificationMethod, number>;
  }> {
    const records = await this.getSessionAttendance(sessionId);

    const stats = {
      totalParticipants: records.length,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT)
        .length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT)
        .length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
      excused: records.filter((r) => r.status === AttendanceStatus.EXCUSED)
        .length,
      partial: records.filter((r) => r.status === AttendanceStatus.PARTIAL)
        .length,
      attendanceRate: 0,
      averageCheckInTime: undefined as Date | undefined,
      verificationMethodStats: {} as Record<
        AttendanceVerificationMethod,
        number
      >,
    };

    stats.attendanceRate =
      stats.totalParticipants > 0
        ? ((stats.present + stats.late + stats.partial) /
            stats.totalParticipants) *
          100
        : 0;

    // Calculate verification method statistics
    for (const method of Object.values(AttendanceVerificationMethod)) {
      stats.verificationMethodStats[method] = records.filter(
        (r) => r.verificationMethod === method
      ).length;
    }

    // Calculate average check-in time
    const checkInTimes = records
      .filter((r) => r.checkInTime)
      .map((r) => r.checkInTime!.getTime());

    if (checkInTimes.length > 0) {
      const avgTime =
        checkInTimes.reduce((sum, time) => sum + time, 0) / checkInTimes.length;
      stats.averageCheckInTime = new Date(avgTime);
    }

    return stats;
  }

  // ============================================================================
  // AUTOMATED ATTENDANCE MANAGEMENT
  // ============================================================================

  /**
   * Auto-mark absent participants after session timeout
   */
  async autoMarkAbsent(sessionId: UUID): Promise<UUID[]> {
    const config = this.sessionConfigurations.get(sessionId);
    if (!config || !config.autoMarkAbsent) {
      return [];
    }

    // This would typically be called by a scheduled job
    // For now, we'll assume the session has ended and mark remaining participants as absent

    const markedAbsent: UUID[] = [];

    // In a real implementation, you would:
    // 1. Get list of enrolled participants for the session
    // 2. Check who hasn't checked in
    // 3. Mark them as absent

    this.emit('autoAbsentMarking', { sessionId, markedAbsent });

    return markedAbsent;
  }

  /**
   * Send attendance reminders
   */
  async sendAttendanceReminder(
    sessionId: UUID,
    minutesBefore: number = 15
  ): Promise<void> {
    // This would integrate with the communication service
    // to send reminders to participants

    this.emit('attendanceReminderSent', { sessionId, minutesBefore });
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private findExistingAttendance(
    participantId: UUID,
    sessionId: UUID
  ): AttendanceRecord | null {
    return (
      Array.from(this.attendanceRecords.values()).find(
        (record) =>
          record.participantId === participantId &&
          record.sessionId === sessionId
      ) || null
    );
  }

  private async validateCheckInWindow(
    config: AttendanceConfiguration
  ): Promise<void> {
    // In a real implementation, this would check the session start time
    // and validate that check-in is within the allowed window

    const now = new Date();
    const sessionStartTime = new Date(); // This would come from session data

    const windowStart = new Date(
      sessionStartTime.getTime() - config.checkInWindowStart * 60000
    );
    const windowEnd = new Date(
      sessionStartTime.getTime() + config.checkInWindowEnd * 60000
    );

    if (now < windowStart) {
      throw new Error('Check-in window has not opened yet');
    }

    if (now > windowEnd) {
      throw new Error('Check-in window has closed');
    }
  }

  private verifyLocation(
    userLocation: GeoLocation,
    allowedLocations: GeoLocation[],
    radiusMeters: number
  ): boolean {
    return allowedLocations.some((allowedLocation) => {
      const distance = this.calculateDistance(userLocation, allowedLocation);
      return distance <= radiusMeters;
    });
  }

  private calculateDistance(
    location1: GeoLocation,
    location2: GeoLocation
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (location1.latitude * Math.PI) / 180;
    const φ2 = (location2.latitude * Math.PI) / 180;
    const Δφ = ((location2.latitude - location1.latitude) * Math.PI) / 180;
    const Δλ = ((location2.longitude - location1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private async verifyBiometric(
    participantId: UUID,
    biometricHash: string
  ): Promise<boolean> {
    // In a real implementation, this would verify against stored biometric data
    // For now, just return true
    return true;
  }

  private startQRCodeCleanup(): void {
    // Clean up expired QR codes every minute
    setInterval(() => {
      const now = new Date();
      for (const [qrCode, info] of this.activeQRCodes.entries()) {
        if (now > info.expiresAt) {
          this.activeQRCodes.delete(qrCode);
        }
      }
    }, 60000);
  }
}
