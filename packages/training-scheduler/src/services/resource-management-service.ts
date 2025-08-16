import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import {
  addDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  parseISO,
  format,
} from 'date-fns';
import {
  UUID,
  createUUID,
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceAllocation,
  AvailabilityRule,
  DateException,
  MaintenanceWindow,
  SchedulingConflict,
  ConflictType,
  ResourceUtilizationMetric,
  PeakUsageTime,
  SchedulingError,
} from '../types';

export interface IResourceManagementService {
  createResource(
    resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Resource>;
  updateResource(id: UUID, updates: Partial<Resource>): Promise<Resource>;
  deleteResource(id: UUID): Promise<boolean>;
  getResource(id: UUID): Promise<Resource | null>;
  getAllResources(filters?: ResourceFilters): Promise<Resource[]>;
  searchResources(criteria: ResourceSearchCriteria): Promise<Resource[]>;

  // Availability Management
  setAvailabilityRule(
    rule: Omit<AvailabilityRule, 'id'>
  ): Promise<AvailabilityRule>;
  updateAvailabilityRule(
    id: UUID,
    updates: Partial<AvailabilityRule>
  ): Promise<AvailabilityRule>;
  deleteAvailabilityRule(id: UUID): Promise<boolean>;
  checkAvailability(
    resourceId: UUID,
    startTime: Date,
    endTime: Date
  ): Promise<boolean>;
  getAvailableSlots(resourceId: UUID, date: Date): Promise<TimeSlot[]>;

  // Allocation Management
  allocateResource(
    allocation: Omit<ResourceAllocation, 'id'>
  ): Promise<ResourceAllocation>;
  releaseResource(allocationId: UUID): Promise<boolean>;
  getResourceAllocations(
    resourceId: UUID,
    dateRange?: DateRange
  ): Promise<ResourceAllocation[]>;

  // Maintenance Management
  scheduleMaintenanceWindow(
    maintenance: Omit<MaintenanceWindow, 'id'>
  ): Promise<MaintenanceWindow>;
  updateMaintenanceWindow(
    id: UUID,
    updates: Partial<MaintenanceWindow>
  ): Promise<MaintenanceWindow>;
  cancelMaintenanceWindow(id: UUID): Promise<boolean>;
  getUpcomingMaintenance(resourceId?: UUID): Promise<MaintenanceWindow[]>;

  // Utilization & Analytics
  getResourceUtilization(
    resourceId: UUID,
    period: DateRange
  ): Promise<ResourceUtilizationMetric>;
  getUtilizationReport(
    filters: UtilizationFilters
  ): Promise<ResourceUtilizationMetric[]>;
  getPeakUsageTimes(
    resourceId: UUID,
    period: DateRange
  ): Promise<PeakUsageTime[]>;

  // Conflict Detection
  detectResourceConflicts(
    allocations: ResourceAllocation[]
  ): Promise<SchedulingConflict[]>;

  // Capacity Management
  optimizeCapacityAllocation(
    demands: CapacityDemand[]
  ): Promise<CapacityOptimizationResult>;
}

export interface ResourceFilters {
  type?: ResourceType;
  status?: ResourceStatus;
  location?: string;
  features?: string[];
  minCapacity?: number;
  maxCapacity?: number;
}

export interface ResourceSearchCriteria {
  query?: string;
  type?: ResourceType;
  requiredFeatures?: string[];
  minCapacity?: number;
  location?: string;
  availableFrom?: Date;
  availableTo?: Date;
  excludeResources?: UUID[];
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  reason?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface UtilizationFilters {
  resourceTypes?: ResourceType[];
  locations?: string[];
  period: DateRange;
  groupBy?: 'resource' | 'type' | 'location';
}

export interface CapacityDemand {
  resourceType: ResourceType;
  requiredCapacity: number;
  timeSlot: TimeSlot;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  flexibility: {
    timeFlexible: boolean;
    resourceSubstitutable: boolean;
    capacityFlexible: boolean;
  };
}

export interface CapacityOptimizationResult {
  optimizedAllocations: ResourceAllocation[];
  unmetDemands: CapacityDemand[];
  utilizationScore: number;
  recommendations: CapacityRecommendation[];
}

export interface CapacityRecommendation {
  type: 'add_resource' | 'upgrade_capacity' | 'reschedule' | 'split_demand';
  description: string;
  impact: 'low' | 'medium' | 'high';
  cost?: number;
  timeToImplement?: number; // in days
}

export class ResourceManagementService
  extends EventEmitter
  implements IResourceManagementService
{
  private resources: Map<UUID, Resource> = new Map();
  private availabilityRules: Map<UUID, AvailabilityRule> = new Map();
  private resourceAllocations: Map<UUID, ResourceAllocation> = new Map();
  private maintenanceWindows: Map<UUID, MaintenanceWindow> = new Map();

  constructor(
    private readonly databaseService?: any,
    private readonly notificationService?: any,
    private readonly analyticsService?: any
  ) {
    super();
  }

  // ============================================================================
  // RESOURCE CRUD OPERATIONS
  // ============================================================================

  async createResource(
    resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Resource> {
    const resource: Resource = {
      ...resourceData,
      id: createUUID(uuid()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.resources.set(resource.id, resource);

    if (this.databaseService) {
      await this.databaseService.createResource(resource);
    }

    this.emit('resourceCreated', { resource });

    return resource;
  }

  async updateResource(
    id: UUID,
    updates: Partial<Resource>
  ): Promise<Resource> {
    const existingResource = await this.getResource(id);
    if (!existingResource) {
      throw new SchedulingError(
        `Resource ${id} not found`,
        'RESOURCE_NOT_FOUND'
      );
    }

    const updatedResource: Resource = {
      ...existingResource,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    };

    this.resources.set(id, updatedResource);

    if (this.databaseService) {
      await this.databaseService.updateResource(updatedResource);
    }

    this.emit('resourceUpdated', {
      resource: updatedResource,
      changes: updates,
    });

    return updatedResource;
  }

  async deleteResource(id: UUID): Promise<boolean> {
    const resource = await this.getResource(id);
    if (!resource) {
      return false;
    }

    // Check if resource has active allocations
    const activeAllocations = await this.getResourceAllocations(id);
    const now = new Date();
    const hasActiveAllocations = activeAllocations.some(
      (allocation) =>
        allocation.allocatedTo > now && allocation.status === 'confirmed'
    );

    if (hasActiveAllocations) {
      throw new SchedulingError(
        'Cannot delete resource with active allocations',
        'RESOURCE_IN_USE'
      );
    }

    this.resources.delete(id);

    if (this.databaseService) {
      await this.databaseService.deleteResource(id);
    }

    this.emit('resourceDeleted', { resourceId: id, resource });

    return true;
  }

  async getResource(id: UUID): Promise<Resource | null> {
    if (this.resources.has(id)) {
      return this.resources.get(id)!;
    }

    if (this.databaseService) {
      const resource = await this.databaseService.getResource(id);
      if (resource) {
        this.resources.set(id, resource);
        return resource;
      }
    }

    return null;
  }

  async getAllResources(filters?: ResourceFilters): Promise<Resource[]> {
    let resources: Resource[];

    if (this.databaseService) {
      resources = await this.databaseService.getAllResources(filters);
    } else {
      resources = Array.from(this.resources.values());
    }

    // Apply filters if provided and not handled by database
    if (filters && !this.databaseService) {
      resources = this.applyResourceFilters(resources, filters);
    }

    return resources;
  }

  async searchResources(criteria: ResourceSearchCriteria): Promise<Resource[]> {
    let resources = await this.getAllResources();

    // Filter by basic criteria
    if (criteria.type) {
      resources = resources.filter((r) => r.type === criteria.type);
    }

    if (criteria.requiredFeatures && criteria.requiredFeatures.length > 0) {
      resources = resources.filter((r) =>
        criteria.requiredFeatures!.every((feature) =>
          r.features.includes(feature)
        )
      );
    }

    if (criteria.minCapacity) {
      resources = resources.filter(
        (r) => r.capacity && r.capacity >= criteria.minCapacity!
      );
    }

    if (criteria.location) {
      resources = resources.filter(
        (r) =>
          r.location &&
          r.location.toLowerCase().includes(criteria.location!.toLowerCase())
      );
    }

    if (criteria.excludeResources && criteria.excludeResources.length > 0) {
      const excludeSet = new Set(criteria.excludeResources);
      resources = resources.filter((r) => !excludeSet.has(r.id));
    }

    // Filter by availability if time range is specified
    if (criteria.availableFrom && criteria.availableTo) {
      const availableResources = await Promise.all(
        resources.map(async (resource) => {
          const isAvailable = await this.checkAvailability(
            resource.id,
            criteria.availableFrom!,
            criteria.availableTo!
          );
          return isAvailable ? resource : null;
        })
      );
      resources = availableResources.filter((r) => r !== null) as Resource[];
    }

    // Text search in name and description
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      resources = resources.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query)) ||
          r.features.some((feature) => feature.toLowerCase().includes(query))
      );
    }

    // Sort by relevance (simplified scoring)
    resources.sort(
      (a, b) =>
        this.calculateResourceRelevanceScore(b, criteria) -
        this.calculateResourceRelevanceScore(a, criteria)
    );

    return resources;
  }

  // ============================================================================
  // AVAILABILITY MANAGEMENT
  // ============================================================================

  async setAvailabilityRule(
    ruleData: Omit<AvailabilityRule, 'id'>
  ): Promise<AvailabilityRule> {
    const rule: AvailabilityRule = {
      ...ruleData,
      id: createUUID(uuid()),
    };

    this.availabilityRules.set(rule.id, rule);

    // Update the resource's availability rules
    const resource = await this.getResource(rule.resourceId);
    if (resource) {
      const existingRuleIndex = resource.availabilityRules.findIndex(
        (r) => r.dayOfWeek === rule.dayOfWeek
      );

      if (existingRuleIndex >= 0) {
        resource.availabilityRules[existingRuleIndex] = rule;
      } else {
        resource.availabilityRules.push(rule);
      }

      await this.updateResource(resource.id, {
        availabilityRules: resource.availabilityRules,
      });
    }

    if (this.databaseService) {
      await this.databaseService.createAvailabilityRule(rule);
    }

    this.emit('availabilityRuleCreated', { rule });

    return rule;
  }

  async updateAvailabilityRule(
    id: UUID,
    updates: Partial<AvailabilityRule>
  ): Promise<AvailabilityRule> {
    const existingRule = this.availabilityRules.get(id);
    if (!existingRule) {
      throw new SchedulingError(
        `Availability rule ${id} not found`,
        'RULE_NOT_FOUND'
      );
    }

    const updatedRule: AvailabilityRule = {
      ...existingRule,
      ...updates,
      id, // Ensure ID cannot be changed
    };

    this.availabilityRules.set(id, updatedRule);

    // Update the resource's availability rules
    const resource = await this.getResource(updatedRule.resourceId);
    if (resource) {
      const ruleIndex = resource.availabilityRules.findIndex(
        (r) => r.id === id
      );
      if (ruleIndex >= 0) {
        resource.availabilityRules[ruleIndex] = updatedRule;
        await this.updateResource(resource.id, {
          availabilityRules: resource.availabilityRules,
        });
      }
    }

    if (this.databaseService) {
      await this.databaseService.updateAvailabilityRule(updatedRule);
    }

    this.emit('availabilityRuleUpdated', {
      rule: updatedRule,
      changes: updates,
    });

    return updatedRule;
  }

  async deleteAvailabilityRule(id: UUID): Promise<boolean> {
    const rule = this.availabilityRules.get(id);
    if (!rule) {
      return false;
    }

    this.availabilityRules.delete(id);

    // Remove from resource's availability rules
    const resource = await this.getResource(rule.resourceId);
    if (resource) {
      resource.availabilityRules = resource.availabilityRules.filter(
        (r) => r.id !== id
      );
      await this.updateResource(resource.id, {
        availabilityRules: resource.availabilityRules,
      });
    }

    if (this.databaseService) {
      await this.databaseService.deleteAvailabilityRule(id);
    }

    this.emit('availabilityRuleDeleted', { ruleId: id, rule });

    return true;
  }

  async checkAvailability(
    resourceId: UUID,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const resource = await this.getResource(resourceId);
    if (!resource || resource.status !== ResourceStatus.AVAILABLE) {
      return false;
    }

    // Check if time slot falls within any availability rule
    const isWithinAvailabilityRules = this.checkAvailabilityRules(
      resource,
      startTime,
      endTime
    );
    if (!isWithinAvailabilityRules) {
      return false;
    }

    // Check for maintenance conflicts
    const hasMaintenanceConflict = this.checkMaintenanceConflicts(
      resource,
      startTime,
      endTime
    );
    if (hasMaintenanceConflict) {
      return false;
    }

    // Check for existing allocations
    const allocations = await this.getResourceAllocations(resourceId, {
      startDate: startOfDay(startTime),
      endDate: endOfDay(endTime),
    });

    const hasAllocationConflict = allocations.some(
      (allocation) =>
        allocation.status === 'confirmed' &&
        this.timeRangesOverlap(
          { start: startTime, end: endTime },
          { start: allocation.allocatedFrom, end: allocation.allocatedTo }
        )
    );

    return !hasAllocationConflict;
  }

  async getAvailableSlots(resourceId: UUID, date: Date): Promise<TimeSlot[]> {
    const resource = await this.getResource(resourceId);
    if (!resource) {
      throw new SchedulingError(
        `Resource ${resourceId} not found`,
        'RESOURCE_NOT_FOUND'
      );
    }

    const dayOfWeek = date.getDay();
    const availabilityRule = resource.availabilityRules.find(
      (rule) => rule.dayOfWeek === dayOfWeek && rule.isActive
    );

    if (!availabilityRule) {
      return [];
    }

    // Check for date exceptions
    const dateStr = format(date, 'yyyy-MM-dd');
    const exception = availabilityRule.exceptions.find(
      (ex) => ex.date === dateStr
    );

    if (exception && exception.type === 'unavailable') {
      return [];
    }

    // Get base availability time
    let startTime = availabilityRule.startTime;
    let endTime = availabilityRule.endTime;

    // Apply exception modifications
    if (exception && exception.type === 'modified') {
      startTime = exception.modifiedStartTime || startTime;
      endTime = exception.modifiedEndTime || endTime;
    } else if (exception && exception.type === 'extended') {
      startTime = exception.modifiedStartTime || startTime;
      endTime = exception.modifiedEndTime || endTime;
    }

    // Create time slots (e.g., hourly slots)
    const slots: TimeSlot[] = [];
    const slotDuration = 60; // 60 minutes

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    for (
      let currentTime = new Date(startDateTime);
      currentTime < endDateTime;
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000)
    ) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      const isAvailable = await this.checkAvailability(
        resourceId,
        currentTime,
        slotEnd
      );

      slots.push({
        startTime: new Date(currentTime),
        endTime: slotEnd > endDateTime ? endDateTime : slotEnd,
        isAvailable,
        reason: isAvailable
          ? undefined
          : 'Resource unavailable or already booked',
      });
    }

    return slots;
  }

  // ============================================================================
  // ALLOCATION MANAGEMENT
  // ============================================================================

  async allocateResource(
    allocationData: Omit<ResourceAllocation, 'id'>
  ): Promise<ResourceAllocation> {
    // Check if resource is available
    const isAvailable = await this.checkAvailability(
      allocationData.resourceId,
      allocationData.allocatedFrom,
      allocationData.allocatedTo
    );

    if (!isAvailable) {
      throw new SchedulingError(
        'Resource is not available for the requested time slot',
        'RESOURCE_UNAVAILABLE'
      );
    }

    const allocation: ResourceAllocation = {
      ...allocationData,
      id: createUUID(uuid()),
    };

    this.resourceAllocations.set(allocation.id, allocation);

    if (this.databaseService) {
      await this.databaseService.createResourceAllocation(allocation);
    }

    this.emit('resourceAllocated', { allocation });

    return allocation;
  }

  async releaseResource(allocationId: UUID): Promise<boolean> {
    const allocation = this.resourceAllocations.get(allocationId);
    if (!allocation) {
      return false;
    }

    allocation.status = 'released';
    this.resourceAllocations.set(allocationId, allocation);

    if (this.databaseService) {
      await this.databaseService.updateResourceAllocation(allocation);
    }

    this.emit('resourceReleased', { allocationId, allocation });

    return true;
  }

  async getResourceAllocations(
    resourceId: UUID,
    dateRange?: DateRange
  ): Promise<ResourceAllocation[]> {
    let allocations: ResourceAllocation[];

    if (this.databaseService) {
      allocations = await this.databaseService.getResourceAllocations(
        resourceId,
        dateRange
      );
    } else {
      allocations = Array.from(this.resourceAllocations.values()).filter(
        (allocation) => allocation.resourceId === resourceId
      );
    }

    // Filter by date range if not handled by database
    if (dateRange && !this.databaseService) {
      allocations = allocations.filter(
        (allocation) =>
          isWithinInterval(allocation.allocatedFrom, {
            start: dateRange.startDate,
            end: dateRange.endDate,
          }) ||
          isWithinInterval(allocation.allocatedTo, {
            start: dateRange.startDate,
            end: dateRange.endDate,
          })
      );
    }

    return allocations.sort(
      (a, b) => a.allocatedFrom.getTime() - b.allocatedFrom.getTime()
    );
  }

  // ============================================================================
  // MAINTENANCE MANAGEMENT
  // ============================================================================

  async scheduleMaintenanceWindow(
    maintenanceData: Omit<MaintenanceWindow, 'id'>
  ): Promise<MaintenanceWindow> {
    // Check if maintenance window conflicts with existing allocations
    const existingAllocations = await this.getResourceAllocations(
      maintenanceData.resourceId,
      {
        startDate: startOfDay(maintenanceData.startDate),
        endDate: endOfDay(maintenanceData.endDate),
      }
    );

    const hasConflicts = existingAllocations.some(
      (allocation) =>
        allocation.status === 'confirmed' &&
        this.timeRangesOverlap(
          { start: maintenanceData.startDate, end: maintenanceData.endDate },
          { start: allocation.allocatedFrom, end: allocation.allocatedTo }
        )
    );

    if (hasConflicts) {
      throw new SchedulingError(
        'Maintenance window conflicts with existing resource allocations',
        'MAINTENANCE_CONFLICT'
      );
    }

    const maintenance: MaintenanceWindow = {
      ...maintenanceData,
      id: createUUID(uuid()),
    };

    this.maintenanceWindows.set(maintenance.id, maintenance);

    // Update resource's maintenance schedule
    const resource = await this.getResource(maintenance.resourceId);
    if (resource) {
      resource.maintenanceSchedule.push(maintenance);
      await this.updateResource(resource.id, {
        maintenanceSchedule: resource.maintenanceSchedule,
      });
    }

    if (this.databaseService) {
      await this.databaseService.createMaintenanceWindow(maintenance);
    }

    this.emit('maintenanceScheduled', { maintenance });

    return maintenance;
  }

  async updateMaintenanceWindow(
    id: UUID,
    updates: Partial<MaintenanceWindow>
  ): Promise<MaintenanceWindow> {
    const existingMaintenance = this.maintenanceWindows.get(id);
    if (!existingMaintenance) {
      throw new SchedulingError(
        `Maintenance window ${id} not found`,
        'MAINTENANCE_NOT_FOUND'
      );
    }

    const updatedMaintenance: MaintenanceWindow = {
      ...existingMaintenance,
      ...updates,
      id, // Ensure ID cannot be changed
    };

    this.maintenanceWindows.set(id, updatedMaintenance);

    // Update resource's maintenance schedule
    const resource = await this.getResource(updatedMaintenance.resourceId);
    if (resource) {
      const maintenanceIndex = resource.maintenanceSchedule.findIndex(
        (m) => m.id === id
      );
      if (maintenanceIndex >= 0) {
        resource.maintenanceSchedule[maintenanceIndex] = updatedMaintenance;
        await this.updateResource(resource.id, {
          maintenanceSchedule: resource.maintenanceSchedule,
        });
      }
    }

    if (this.databaseService) {
      await this.databaseService.updateMaintenanceWindow(updatedMaintenance);
    }

    this.emit('maintenanceUpdated', {
      maintenance: updatedMaintenance,
      changes: updates,
    });

    return updatedMaintenance;
  }

  async cancelMaintenanceWindow(id: UUID): Promise<boolean> {
    const maintenance = this.maintenanceWindows.get(id);
    if (!maintenance) {
      return false;
    }

    this.maintenanceWindows.delete(id);

    // Remove from resource's maintenance schedule
    const resource = await this.getResource(maintenance.resourceId);
    if (resource) {
      resource.maintenanceSchedule = resource.maintenanceSchedule.filter(
        (m) => m.id !== id
      );
      await this.updateResource(resource.id, {
        maintenanceSchedule: resource.maintenanceSchedule,
      });
    }

    if (this.databaseService) {
      await this.databaseService.deleteMaintenanceWindow(id);
    }

    this.emit('maintenanceCancelled', { maintenanceId: id, maintenance });

    return true;
  }

  async getUpcomingMaintenance(
    resourceId?: UUID
  ): Promise<MaintenanceWindow[]> {
    const now = new Date();
    const futureDate = addDays(now, 30); // Next 30 days

    let maintenanceWindows: MaintenanceWindow[];

    if (this.databaseService) {
      maintenanceWindows = await this.databaseService.getMaintenanceWindows(
        resourceId,
        {
          startDate: now,
          endDate: futureDate,
        }
      );
    } else {
      maintenanceWindows = Array.from(this.maintenanceWindows.values());
    }

    // Filter by resource if specified and not handled by database
    if (resourceId && !this.databaseService) {
      maintenanceWindows = maintenanceWindows.filter(
        (m) => m.resourceId === resourceId
      );
    }

    // Filter upcoming maintenance
    maintenanceWindows = maintenanceWindows.filter((m) => m.startDate >= now);

    return maintenanceWindows.sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );
  }

  // ============================================================================
  // UTILIZATION & ANALYTICS
  // ============================================================================

  async getResourceUtilization(
    resourceId: UUID,
    period: DateRange
  ): Promise<ResourceUtilizationMetric> {
    const resource = await this.getResource(resourceId);
    if (!resource) {
      throw new SchedulingError(
        `Resource ${resourceId} not found`,
        'RESOURCE_NOT_FOUND'
      );
    }

    const allocations = await this.getResourceAllocations(resourceId, period);

    // Calculate total available hours based on availability rules
    const totalAvailableHours = this.calculateAvailableHours(resource, period);

    // Calculate total booked hours
    const totalBookedHours = allocations
      .filter((allocation) => allocation.status === 'confirmed')
      .reduce((total, allocation) => {
        const duration =
          (allocation.allocatedTo.getTime() -
            allocation.allocatedFrom.getTime()) /
          (1000 * 60 * 60);
        return total + duration;
      }, 0);

    const utilizationPercentage =
      totalAvailableHours > 0
        ? (totalBookedHours / totalAvailableHours) * 100
        : 0;

    const peakUsageTimes = await this.getPeakUsageTimes(resourceId, period);

    return {
      resourceId,
      resourceType: resource.type,
      totalAvailableHours,
      totalBookedHours,
      utilizationPercentage,
      peakUsageTimes,
    };
  }

  async getUtilizationReport(
    filters: UtilizationFilters
  ): Promise<ResourceUtilizationMetric[]> {
    const resources = await this.getAllResources({
      type: filters.resourceTypes?.[0], // Simplified for now
      location: filters.locations?.[0],
    });

    const utilizationMetrics = await Promise.all(
      resources.map((resource) =>
        this.getResourceUtilization(resource.id, filters.period)
      )
    );

    // Group by specified criteria if needed
    if (filters.groupBy) {
      // Implementation would depend on grouping requirements
    }

    return utilizationMetrics.sort(
      (a, b) => b.utilizationPercentage - a.utilizationPercentage
    );
  }

  async getPeakUsageTimes(
    resourceId: UUID,
    period: DateRange
  ): Promise<PeakUsageTime[]> {
    const allocations = await this.getResourceAllocations(resourceId, period);

    // Group allocations by day of week and hour
    const usageByTimeSlot = new Map<string, number>();

    for (const allocation of allocations) {
      if (allocation.status !== 'confirmed') continue;

      let currentTime = new Date(allocation.allocatedFrom);
      const endTime = allocation.allocatedTo;

      while (currentTime < endTime) {
        const dayOfWeek = currentTime.getDay();
        const hour = currentTime.getHours();
        const key = `${dayOfWeek}-${hour}`;

        usageByTimeSlot.set(key, (usageByTimeSlot.get(key) || 0) + 1);
        currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // Next hour
      }
    }

    // Convert to peak usage times and calculate percentages
    const peakTimes: PeakUsageTime[] = [];
    const maxUsage = Math.max(...Array.from(usageByTimeSlot.values()));

    for (const [key, usage] of usageByTimeSlot) {
      const [dayOfWeek, hour] = key.split('-').map(Number);
      const utilizationPercentage = maxUsage > 0 ? (usage / maxUsage) * 100 : 0;

      peakTimes.push({
        dayOfWeek,
        hour,
        utilizationPercentage,
      });
    }

    return peakTimes.sort(
      (a, b) => b.utilizationPercentage - a.utilizationPercentage
    );
  }

  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================

  async detectResourceConflicts(
    allocations: ResourceAllocation[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];
    const resourceGroups = new Map<UUID, ResourceAllocation[]>();

    // Group allocations by resource
    for (const allocation of allocations) {
      if (!resourceGroups.has(allocation.resourceId)) {
        resourceGroups.set(allocation.resourceId, []);
      }
      resourceGroups.get(allocation.resourceId)!.push(allocation);
    }

    // Check for conflicts within each resource group
    for (const [resourceId, resourceAllocations] of resourceGroups) {
      const sortedAllocations = resourceAllocations.sort(
        (a, b) => a.allocatedFrom.getTime() - b.allocatedFrom.getTime()
      );

      for (let i = 0; i < sortedAllocations.length - 1; i++) {
        const current = sortedAllocations[i];
        const next = sortedAllocations[i + 1];

        if (
          this.timeRangesOverlap(
            { start: current.allocatedFrom, end: current.allocatedTo },
            { start: next.allocatedFrom, end: next.allocatedTo }
          )
        ) {
          const conflict: SchedulingConflict = {
            id: createUUID(uuid()),
            type: ConflictType.RESOURCE_DOUBLE_BOOKING,
            severity: 'high',
            description: `Resource ${resourceId} has overlapping allocations`,
            affectedSessions: [current.sessionId, next.sessionId],
            affectedResources: [resourceId],
            suggestedResolutions: [],
            detectedAt: new Date(),
          };

          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  // ============================================================================
  // CAPACITY OPTIMIZATION
  // ============================================================================

  async optimizeCapacityAllocation(
    demands: CapacityDemand[]
  ): Promise<CapacityOptimizationResult> {
    const optimizedAllocations: ResourceAllocation[] = [];
    const unmetDemands: CapacityDemand[] = [];
    const recommendations: CapacityRecommendation[] = [];

    // Sort demands by priority
    const sortedDemands = demands.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const demand of sortedDemands) {
      const availableResources = await this.searchResources({
        type: demand.resourceType,
        minCapacity: demand.requiredCapacity,
        availableFrom: demand.timeSlot.startTime,
        availableTo: demand.timeSlot.endTime,
      });

      if (availableResources.length > 0) {
        // Allocate to the best matching resource
        const bestResource = availableResources[0];

        const allocation: ResourceAllocation = {
          id: createUUID(uuid()),
          sessionId: createUUID('temp'), // Would be provided by the caller
          resourceId: bestResource.id,
          allocatedFrom: demand.timeSlot.startTime,
          allocatedTo: demand.timeSlot.endTime,
          status: 'pending',
        };

        optimizedAllocations.push(allocation);
      } else {
        unmetDemands.push(demand);

        // Generate recommendations for unmet demands
        if (demand.flexibility.resourceSubstitutable) {
          recommendations.push({
            type: 'add_resource',
            description: `Consider adding more ${demand.resourceType} resources`,
            impact: 'medium',
            cost: this.estimateResourceCost(demand.resourceType),
            timeToImplement: 30,
          });
        }

        if (demand.flexibility.timeFlexible) {
          recommendations.push({
            type: 'reschedule',
            description: 'Consider rescheduling to off-peak times',
            impact: 'low',
            timeToImplement: 1,
          });
        }
      }
    }

    // Calculate utilization score
    const utilizationScore =
      (optimizedAllocations.length / demands.length) * 100;

    return {
      optimizedAllocations,
      unmetDemands,
      utilizationScore,
      recommendations,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private applyResourceFilters(
    resources: Resource[],
    filters: ResourceFilters
  ): Resource[] {
    return resources.filter((resource) => {
      if (filters.type && resource.type !== filters.type) return false;
      if (filters.status && resource.status !== filters.status) return false;
      if (
        filters.location &&
        (!resource.location || !resource.location.includes(filters.location))
      )
        return false;
      if (
        filters.minCapacity &&
        (!resource.capacity || resource.capacity < filters.minCapacity)
      )
        return false;
      if (
        filters.maxCapacity &&
        resource.capacity &&
        resource.capacity > filters.maxCapacity
      )
        return false;

      if (filters.features && filters.features.length > 0) {
        const hasAllFeatures = filters.features.every((feature) =>
          resource.features.includes(feature)
        );
        if (!hasAllFeatures) return false;
      }

      return true;
    });
  }

  private calculateResourceRelevanceScore(
    resource: Resource,
    criteria: ResourceSearchCriteria
  ): number {
    let score = 0;

    // Exact type match
    if (criteria.type && resource.type === criteria.type) {
      score += 10;
    }

    // Feature matches
    if (criteria.requiredFeatures) {
      const matchingFeatures = criteria.requiredFeatures.filter((feature) =>
        resource.features.includes(feature)
      );
      score += matchingFeatures.length * 5;
    }

    // Capacity appropriateness (not too small, not excessively large)
    if (criteria.minCapacity && resource.capacity) {
      if (resource.capacity >= criteria.minCapacity) {
        score += 5;
        // Bonus for not being excessively oversized
        const oversizeFactor = resource.capacity / criteria.minCapacity;
        if (oversizeFactor <= 1.5) score += 3;
      }
    }

    // Location preference
    if (criteria.location && resource.location) {
      if (
        resource.location
          .toLowerCase()
          .includes(criteria.location.toLowerCase())
      ) {
        score += 8;
      }
    }

    return score;
  }

  private checkAvailabilityRules(
    resource: Resource,
    startTime: Date,
    endTime: Date
  ): boolean {
    const startDay = startTime.getDay();
    const endDay = endTime.getDay();

    // Check if the time span crosses multiple days (for now, require single day)
    if (startDay !== endDay) {
      return false; // Simplified - would need more complex logic for multi-day events
    }

    const availabilityRule = resource.availabilityRules.find(
      (rule) => rule.dayOfWeek === startDay && rule.isActive
    );

    if (!availabilityRule) {
      return false;
    }

    // Check if times fall within the availability window
    const startTimeStr = format(startTime, 'HH:mm');
    const endTimeStr = format(endTime, 'HH:mm');

    return (
      startTimeStr >= availabilityRule.startTime &&
      endTimeStr <= availabilityRule.endTime
    );
  }

  private checkMaintenanceConflicts(
    resource: Resource,
    startTime: Date,
    endTime: Date
  ): boolean {
    return resource.maintenanceSchedule.some((maintenance) =>
      this.timeRangesOverlap(
        { start: startTime, end: endTime },
        { start: maintenance.startDate, end: maintenance.endDate }
      )
    );
  }

  private timeRangesOverlap(
    range1: { start: Date; end: Date },
    range2: { start: Date; end: Date }
  ): boolean {
    return range1.start < range2.end && range1.end > range2.start;
  }

  private calculateAvailableHours(
    resource: Resource,
    period: DateRange
  ): number {
    let totalHours = 0;
    const currentDate = new Date(period.startDate);

    while (currentDate <= period.endDate) {
      const dayOfWeek = currentDate.getDay();
      const availabilityRule = resource.availabilityRules.find(
        (rule) => rule.dayOfWeek === dayOfWeek && rule.isActive
      );

      if (availabilityRule) {
        const [startHour, startMinute] = availabilityRule.startTime
          .split(':')
          .map(Number);
        const [endHour, endMinute] = availabilityRule.endTime
          .split(':')
          .map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        const dayHours = (endMinutes - startMinutes) / 60;

        totalHours += dayHours;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalHours;
  }

  private estimateResourceCost(resourceType: ResourceType): number {
    // Simplified cost estimation
    const baseCosts = {
      [ResourceType.ROOM]: 50000,
      [ResourceType.EQUIPMENT]: 25000,
      [ResourceType.INSTRUCTOR]: 0, // Hiring cost separate
      [ResourceType.VEHICLE]: 75000,
      [ResourceType.VENUE]: 100000,
      [ResourceType.VIRTUAL_ROOM]: 5000,
    };

    return baseCosts[resourceType] || 0;
  }
}
