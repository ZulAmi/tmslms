import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';
import { TrainingSession, Resource, TimeSlot, DateRange } from './types';

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

export const DateUtils = {
  /**
   * Format a date for display
   */
  formatDate(date: Date, formatString = 'yyyy-MM-dd'): string {
    return format(date, formatString);
  },

  /**
   * Format a time for display
   */
  formatTime(date: Date, formatString = 'HH:mm'): string {
    return format(date, formatString);
  },

  /**
   * Format a date and time for display
   */
  formatDateTime(date: Date, formatString = 'yyyy-MM-dd HH:mm'): string {
    return format(date, formatString);
  },

  /**
   * Generate time slots for a given date range
   */
  generateTimeSlots(
    startDate: Date,
    endDate: Date,
    durationMinutes: number,
    intervalMinutes = 30
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const slotDuration = durationMinutes * 60000; // Convert to milliseconds
    const interval = intervalMinutes * 60000;

    for (
      let time = startDate.getTime();
      time + slotDuration <= endDate.getTime();
      time += interval
    ) {
      slots.push({
        startTime: new Date(time),
        endTime: new Date(time + slotDuration),
        isAvailable: true,
      });
    }

    return slots;
  },

  /**
   * Get business hours for a given date
   */
  getBusinessHours(
    date: Date,
    startHour = 9,
    endHour = 17
  ): { start: Date; end: Date } {
    const start = new Date(date);
    start.setHours(startHour, 0, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, 0, 0, 0);

    return { start, end };
  },

  /**
   * Check if a date falls within business hours
   */
  isBusinessHours(date: Date, startHour = 9, endHour = 17): boolean {
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Check if it's a weekday (Monday-Friday)
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    // Check if it's within business hours
    const isBusinessTime = hour >= startHour && hour < endHour;

    return isWeekday && isBusinessTime;
  },

  /**
   * Get the week range for a given date
   */
  getWeekRange(date: Date): DateRange {
    return {
      startDate: startOfWeek(date, { weekStartsOn: 1 }), // Monday
      endDate: endOfWeek(date, { weekStartsOn: 1 }), // Sunday
    };
  },

  /**
   * Get all days in a week
   */
  getWeekDays(date: Date): Date[] {
    const weekRange = this.getWeekRange(date);
    return eachDayOfInterval({
      start: weekRange.startDate,
      end: weekRange.endDate,
    });
  },

  /**
   * Calculate duration between two dates in various units
   */
  calculateDuration(
    startDate: Date,
    endDate: Date,
    unit: 'minutes' | 'hours' | 'days' = 'minutes'
  ): number {
    const diffMs = endDate.getTime() - startDate.getTime();

    switch (unit) {
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60));
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      default:
        return diffMs;
    }
  },
};

// ============================================================================
// SCHEDULING UTILITIES
// ============================================================================

export const SchedulingUtils = {
  /**
   * Check if two sessions have overlapping times
   */
  sessionsOverlap(
    session1: TrainingSession,
    session2: TrainingSession
  ): boolean {
    return (
      session1.startDateTime < session2.endDateTime &&
      session1.endDateTime > session2.startDateTime
    );
  },

  /**
   * Check if two time ranges overlap
   */
  timeRangesOverlap(
    range1: { start: Date; end: Date },
    range2: { start: Date; end: Date }
  ): boolean {
    return range1.start < range2.end && range1.end > range2.start;
  },

  /**
   * Find gaps in a schedule
   */
  findScheduleGaps(
    sessions: TrainingSession[],
    dateRange: DateRange,
    minGapMinutes = 60
  ): TimeSlot[] {
    const gaps: TimeSlot[] = [];
    const sortedSessions = sessions
      .filter(
        (session) =>
          session.startDateTime >= dateRange.startDate &&
          session.endDateTime <= dateRange.endDate
      )
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());

    // Gap before first session
    if (sortedSessions.length > 0) {
      const firstGap = DateUtils.calculateDuration(
        dateRange.startDate,
        sortedSessions[0].startDateTime,
        'minutes'
      );
      if (firstGap >= minGapMinutes) {
        gaps.push({
          startTime: dateRange.startDate,
          endTime: sortedSessions[0].startDateTime,
          isAvailable: true,
        });
      }
    }

    // Gaps between sessions
    for (let i = 0; i < sortedSessions.length - 1; i++) {
      const currentEnd = sortedSessions[i].endDateTime;
      const nextStart = sortedSessions[i + 1].startDateTime;
      const gapMinutes = DateUtils.calculateDuration(
        currentEnd,
        nextStart,
        'minutes'
      );

      if (gapMinutes >= minGapMinutes) {
        gaps.push({
          startTime: currentEnd,
          endTime: nextStart,
          isAvailable: true,
        });
      }
    }

    // Gap after last session
    if (sortedSessions.length > 0) {
      const lastSession = sortedSessions[sortedSessions.length - 1];
      const lastGap = DateUtils.calculateDuration(
        lastSession.endDateTime,
        dateRange.endDate,
        'minutes'
      );
      if (lastGap >= minGapMinutes) {
        gaps.push({
          startTime: lastSession.endDateTime,
          endTime: dateRange.endDate,
          isAvailable: true,
        });
      }
    }

    return gaps;
  },

  /**
   * Calculate optimal break time between sessions
   */
  calculateOptimalBreakTime(
    previousSession: TrainingSession,
    nextSession: TrainingSession,
    minimumBreakMinutes = 15
  ): number {
    const gapMinutes = DateUtils.calculateDuration(
      previousSession.endDateTime,
      nextSession.startDateTime,
      'minutes'
    );

    return Math.max(gapMinutes, minimumBreakMinutes);
  },

  /**
   * Generate suggested time slots based on preferences
   */
  generateSuggestedSlots(
    preferredTimes: Date[],
    sessionDurationMinutes: number,
    existingSessions: TrainingSession[],
    maxSuggestions = 5
  ): TimeSlot[] {
    const suggestions: TimeSlot[] = [];

    for (const preferredTime of preferredTimes) {
      const endTime = new Date(
        preferredTime.getTime() + sessionDurationMinutes * 60000
      );

      // Check if this slot conflicts with existing sessions
      const hasConflict = existingSessions.some((session) =>
        this.timeRangesOverlap(
          { start: preferredTime, end: endTime },
          { start: session.startDateTime, end: session.endDateTime }
        )
      );

      if (!hasConflict) {
        suggestions.push({
          startTime: preferredTime,
          endTime,
          isAvailable: true,
        });

        if (suggestions.length >= maxSuggestions) {
          break;
        }
      }
    }

    return suggestions;
  },
};

// ============================================================================
// RESOURCE UTILITIES
// ============================================================================

export const ResourceUtils = {
  /**
   * Calculate resource utilization percentage
   */
  calculateUtilization(
    totalAvailableHours: number,
    totalBookedHours: number
  ): number {
    if (totalAvailableHours === 0) return 0;
    return Math.min(100, (totalBookedHours / totalAvailableHours) * 100);
  },

  /**
   * Find resources with similar capabilities
   */
  findSimilarResources(
    targetResource: Resource,
    availableResources: Resource[],
    similarityThreshold = 0.7
  ): Resource[] {
    const similar = availableResources.filter((resource) => {
      if (resource.id === targetResource.id) return false;

      const similarity = this.calculateResourceSimilarity(
        targetResource,
        resource
      );
      return similarity >= similarityThreshold;
    });

    return similar.sort(
      (a, b) =>
        this.calculateResourceSimilarity(targetResource, b) -
        this.calculateResourceSimilarity(targetResource, a)
    );
  },

  /**
   * Calculate similarity score between two resources
   */
  calculateResourceSimilarity(
    resource1: Resource,
    resource2: Resource
  ): number {
    let score = 0;
    let totalFactors = 0;

    // Type match (high weight)
    totalFactors += 3;
    if (resource1.type === resource2.type) {
      score += 3;
    }

    // Capacity match (medium weight)
    if (resource1.capacity && resource2.capacity) {
      totalFactors += 2;
      const capacityRatio =
        Math.min(resource1.capacity, resource2.capacity) /
        Math.max(resource1.capacity, resource2.capacity);
      score += capacityRatio * 2;
    }

    // Feature overlap (medium weight)
    if (resource1.features.length > 0 || resource2.features.length > 0) {
      totalFactors += 2;
      const commonFeatures = resource1.features.filter((feature) =>
        resource2.features.includes(feature)
      );
      const totalFeatures = new Set([
        ...resource1.features,
        ...resource2.features,
      ]).size;
      if (totalFeatures > 0) {
        score += (commonFeatures.length / totalFeatures) * 2;
      }
    }

    // Location match (low weight)
    if (resource1.location || resource2.location) {
      totalFactors += 1;
      if (resource1.location === resource2.location) {
        score += 1;
      }
    }

    return totalFactors > 0 ? score / totalFactors : 0;
  },

  /**
   * Check if a resource meets specific requirements
   */
  meetsRequirements(
    resource: Resource,
    requirements: {
      type?: string;
      minCapacity?: number;
      requiredFeatures?: string[];
      location?: string;
    }
  ): boolean {
    // Type check
    if (requirements.type && resource.type !== requirements.type) {
      return false;
    }

    // Capacity check
    if (
      requirements.minCapacity &&
      (!resource.capacity || resource.capacity < requirements.minCapacity)
    ) {
      return false;
    }

    // Features check
    if (requirements.requiredFeatures) {
      const hasAllFeatures = requirements.requiredFeatures.every((feature) =>
        resource.features.includes(feature)
      );
      if (!hasAllFeatures) {
        return false;
      }
    }

    // Location check
    if (requirements.location && resource.location !== requirements.location) {
      return false;
    }

    return true;
  },
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const ValidationUtils = {
  /**
   * Validate session data
   */
  validateSession(session: Partial<TrainingSession>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!session.title || session.title.trim().length === 0) {
      errors.push('Session title is required');
    }

    if (!session.startDateTime) {
      errors.push('Start date and time is required');
    }

    if (!session.endDateTime) {
      errors.push('End date and time is required');
    }

    if (
      session.startDateTime &&
      session.endDateTime &&
      session.startDateTime >= session.endDateTime
    ) {
      errors.push('Start time must be before end time');
    }

    if (session.maxParticipants !== undefined && session.maxParticipants < 1) {
      errors.push('Maximum participants must be at least 1');
    }

    if (session.minParticipants !== undefined && session.minParticipants < 0) {
      errors.push('Minimum participants cannot be negative');
    }

    if (
      session.maxParticipants !== undefined &&
      session.minParticipants !== undefined &&
      session.minParticipants > session.maxParticipants
    ) {
      errors.push('Minimum participants cannot exceed maximum participants');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate resource data
   */
  validateResource(resource: Partial<Resource>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!resource.name || resource.name.trim().length === 0) {
      errors.push('Resource name is required');
    }

    if (!resource.type) {
      errors.push('Resource type is required');
    }

    if (resource.capacity !== undefined && resource.capacity < 0) {
      errors.push('Resource capacity cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate time slot
   */
  validateTimeSlot(timeSlot: TimeSlot): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!timeSlot.startTime) {
      errors.push('Start time is required');
    }

    if (!timeSlot.endTime) {
      errors.push('End time is required');
    }

    if (
      timeSlot.startTime &&
      timeSlot.endTime &&
      timeSlot.startTime >= timeSlot.endTime
    ) {
      errors.push('Start time must be before end time');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export const ExportUtils = {
  /**
   * Convert session data to CSV format
   */
  sessionsToCsv(sessions: TrainingSession[]): string {
    const headers = [
      'ID',
      'Title',
      'Type',
      'Status',
      'Start Date',
      'End Date',
      'Location',
      'Max Participants',
      'Enrolled Count',
      'Instructor ID',
    ];

    const rows = sessions.map((session) => [
      session.id,
      session.title,
      session.type,
      session.status,
      DateUtils.formatDateTime(session.startDateTime),
      DateUtils.formatDateTime(session.endDateTime),
      session.location || '',
      session.maxParticipants.toString(),
      session.enrolledCount.toString(),
      session.instructorId || '',
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
  },

  /**
   * Convert resource data to CSV format
   */
  resourcesToCsv(resources: Resource[]): string {
    const headers = [
      'ID',
      'Name',
      'Type',
      'Status',
      'Capacity',
      'Location',
      'Features',
    ];

    const rows = resources.map((resource) => [
      resource.id,
      resource.name,
      resource.type,
      resource.status,
      resource.capacity?.toString() || '',
      resource.location || '',
      resource.features.join(';'),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a human-readable ID
 */
export function generateReadableId(prefix = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), waitMs);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Check if an object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}
