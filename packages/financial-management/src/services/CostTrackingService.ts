import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import {
  CostRecord,
  CostCategory,
  CostType,
  CostStatus,
  ParticipantCost,
  CourseCost,
  ResourceCost,
  CostAllocation,
  CostCenter,
  Money,
  Currency,
  UUID,
  createUUID,
  CostAnalysis,
  CostBreakdown,
  CostTrend,
  CostComparison,
  AllocationMethod,
  CostDriver,
} from '../types';

/**
 * Comprehensive Cost Tracking Service
 * Granular cost tracking per participant, course, and resource
 */
export class CostTrackingService extends EventEmitter {
  private costs: Map<UUID, CostRecord> = new Map();
  private participantCosts: Map<UUID, ParticipantCost[]> = new Map();
  private courseCosts: Map<UUID, CourseCost> = new Map();
  private resourceCosts: Map<UUID, ResourceCost[]> = new Map();
  private costCenters: Map<UUID, CostCenter> = new Map();
  private allocations: Map<UUID, CostAllocation> = new Map();

  constructor() {
    super();
    this.initializeDefaultCostCenters();
  }

  // ============================================================================
  // COST RECORD MANAGEMENT
  // ============================================================================

  /**
   * Create a new cost record
   */
  async createCostRecord(costData: {
    description: string;
    category: CostCategory;
    type: CostType;
    amount: Money;
    organizationId: UUID;
    departmentId?: UUID;
    courseId?: UUID;
    participantId?: UUID;
    resourceId?: UUID;
    vendorId?: UUID;
    invoiceNumber?: string;
    referenceNumber?: string;
    incurredDate: Date;
    approvedBy?: UUID;
    costCenterId?: UUID;
    projectId?: UUID;
    tags?: string[];
    metadata?: Record<string, any>;
    createdBy: UUID;
  }): Promise<CostRecord> {
    const id = createUUID(uuidv4());
    const now = new Date();

    const costRecord: CostRecord = {
      id,
      description: costData.description,
      category: costData.category,
      type: costData.type,
      amount: costData.amount,
      status: CostStatus.PENDING,
      organizationId: costData.organizationId,
      departmentId: costData.departmentId,
      courseId: costData.courseId,
      participantId: costData.participantId,
      resourceId: costData.resourceId,
      vendorId: costData.vendorId,
      invoiceNumber: costData.invoiceNumber,
      referenceNumber: costData.referenceNumber,
      incurredDate: costData.incurredDate,
      approvedDate: costData.approvedBy ? now : undefined,
      approvedBy: costData.approvedBy,
      costCenterId: costData.costCenterId,
      projectId: costData.projectId,
      allocations: [],
      tags: costData.tags || [],
      metadata: costData.metadata || {},
      createdAt: now,
      updatedAt: now,
      createdBy: costData.createdBy,
      updatedBy: costData.createdBy,
    };

    this.costs.set(id, costRecord);

    // Auto-allocate if cost center is specified
    if (costData.costCenterId) {
      await this.allocateCost(
        id,
        costData.costCenterId,
        costData.amount,
        AllocationMethod.DIRECT
      );
    }

    // Update participant costs if applicable
    if (costData.participantId) {
      await this.updateParticipantCosts(costData.participantId, costRecord);
    }

    // Update course costs if applicable
    if (costData.courseId) {
      await this.updateCourseCosts(costData.courseId, costRecord);
    }

    // Update resource costs if applicable
    if (costData.resourceId) {
      await this.updateResourceCosts(costData.resourceId, costRecord);
    }

    this.emit('costRecordCreated', { costRecord });

    return costRecord;
  }

  /**
   * Batch create cost records
   */
  async createBatchCostRecords(
    costRecords: Array<Parameters<typeof this.createCostRecord>[0]>
  ): Promise<CostRecord[]> {
    const createdRecords: CostRecord[] = [];

    for (const costData of costRecords) {
      try {
        const record = await this.createCostRecord(costData);
        createdRecords.push(record);
      } catch (error) {
        this.emit('batchCostError', { costData, error });
      }
    }

    this.emit('batchCostCreated', {
      total: costRecords.length,
      successful: createdRecords.length,
      failed: costRecords.length - createdRecords.length,
    });

    return createdRecords;
  }

  // ============================================================================
  // PARTICIPANT COST TRACKING
  // ============================================================================

  /**
   * Track costs for a specific participant
   */
  async trackParticipantCost(
    participantId: UUID,
    costData: {
      description: string;
      category: CostCategory;
      amount: Money;
      courseId?: UUID;
      sessionId?: UUID;
      incurredDate: Date;
      isReimbursable?: boolean;
      reimbursementRate?: number;
      breakdown?: CostBreakdown[];
      createdBy: UUID;
    }
  ): Promise<ParticipantCost> {
    const id = createUUID(uuidv4());
    const now = new Date();

    // Calculate reimbursable amount
    const reimbursableAmount =
      costData.isReimbursable && costData.reimbursementRate
        ? this.createMoney(
            costData.amount.amount.mul(costData.reimbursementRate / 100),
            costData.amount.currency
          )
        : this.createMoney(0, costData.amount.currency);

    const participantCost: ParticipantCost = {
      id,
      participantId,
      description: costData.description,
      category: costData.category,
      totalCost: costData.amount,
      reimbursableAmount,
      courseId: costData.courseId,
      sessionId: costData.sessionId,
      incurredDate: costData.incurredDate,
      breakdown: costData.breakdown || [],
      isReimbursable: costData.isReimbursable || false,
      reimbursementRate: costData.reimbursementRate,
      createdAt: now,
      createdBy: costData.createdBy,
    };

    // Add to participant costs collection
    const existingCosts = this.participantCosts.get(participantId) || [];
    existingCosts.push(participantCost);
    this.participantCosts.set(participantId, existingCosts);

    // Create corresponding cost record
    await this.createCostRecord({
      description: `Participant Cost: ${costData.description}`,
      category: costData.category,
      type: CostType.DIRECT,
      amount: costData.amount,
      organizationId: await this.getParticipantOrganization(participantId),
      participantId,
      courseId: costData.courseId,
      incurredDate: costData.incurredDate,
      tags: ['participant-cost'],
      metadata: {
        participantCostId: id,
        isReimbursable: costData.isReimbursable,
        reimbursementRate: costData.reimbursementRate,
      },
      createdBy: costData.createdBy,
    });

    this.emit('participantCostTracked', { participantId, participantCost });

    return participantCost;
  }

  /**
   * Get total costs for a participant
   */
  async getParticipantTotalCosts(
    participantId: UUID,
    options?: {
      courseId?: UUID;
      dateRange?: { start: Date; end: Date };
      categories?: CostCategory[];
      includeReimbursable?: boolean;
    }
  ): Promise<{
    totalCost: Money;
    reimbursableAmount: Money;
    costBreakdown: Array<{
      category: CostCategory;
      amount: Money;
      count: number;
    }>;
    costHistory: ParticipantCost[];
  }> {
    let participantCosts = this.participantCosts.get(participantId) || [];

    // Apply filters
    if (options?.courseId) {
      participantCosts = participantCosts.filter(
        (cost) => cost.courseId === options.courseId
      );
    }

    if (options?.dateRange) {
      participantCosts = participantCosts.filter(
        (cost) =>
          cost.incurredDate >= options.dateRange!.start &&
          cost.incurredDate <= options.dateRange!.end
      );
    }

    if (options?.categories) {
      participantCosts = participantCosts.filter((cost) =>
        options.categories!.includes(cost.category)
      );
    }

    if (options?.includeReimbursable === false) {
      participantCosts = participantCosts.filter(
        (cost) => !cost.isReimbursable
      );
    }

    // Calculate totals
    const totalCost = participantCosts.reduce(
      (sum, cost) => this.addMoney(sum, cost.totalCost),
      this.createMoney(
        0,
        participantCosts[0]?.totalCost.currency || Currency.SGD
      )
    );

    const reimbursableAmount = participantCosts.reduce(
      (sum, cost) => this.addMoney(sum, cost.reimbursableAmount),
      this.createMoney(
        0,
        participantCosts[0]?.totalCost.currency || Currency.SGD
      )
    );

    // Create breakdown by category
    const categoryBreakdown = new Map<
      CostCategory,
      { amount: Money; count: number }
    >();

    participantCosts.forEach((cost) => {
      const existing = categoryBreakdown.get(cost.category) || {
        amount: this.createMoney(0, cost.totalCost.currency),
        count: 0,
      };

      categoryBreakdown.set(cost.category, {
        amount: this.addMoney(existing.amount, cost.totalCost),
        count: existing.count + 1,
      });
    });

    const costBreakdown = Array.from(categoryBreakdown.entries()).map(
      ([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      })
    );

    return {
      totalCost,
      reimbursableAmount,
      costBreakdown,
      costHistory: participantCosts,
    };
  }

  // ============================================================================
  // COURSE COST TRACKING
  // ============================================================================

  /**
   * Track costs for a specific course
   */
  async trackCourseCost(
    courseId: UUID,
    costData: {
      description: string;
      category: CostCategory;
      type: CostType;
      amount: Money;
      perParticipantCost?: Money;
      fixedCost?: Money;
      variableCost?: Money;
      costDrivers?: CostDriver[];
      allocations?: Array<{
        participantId: UUID;
        amount: Money;
        method: AllocationMethod;
      }>;
      incurredDate: Date;
      createdBy: UUID;
    }
  ): Promise<CourseCost> {
    const id = createUUID(uuidv4());
    const now = new Date();

    const courseCost: CourseCost = {
      id,
      courseId,
      description: costData.description,
      category: costData.category,
      type: costData.type,
      totalCost: costData.amount,
      perParticipantCost: costData.perParticipantCost,
      fixedCost:
        costData.fixedCost || this.createMoney(0, costData.amount.currency),
      variableCost:
        costData.variableCost || this.createMoney(0, costData.amount.currency),
      participantAllocations: costData.allocations || [],
      costDrivers: costData.costDrivers || [],
      incurredDate: costData.incurredDate,
      createdAt: now,
      createdBy: costData.createdBy,
    };

    this.courseCosts.set(courseId, courseCost);

    // Create corresponding cost record
    await this.createCostRecord({
      description: `Course Cost: ${costData.description}`,
      category: costData.category,
      type: costData.type,
      amount: costData.amount,
      organizationId: await this.getCourseOrganization(courseId),
      courseId,
      incurredDate: costData.incurredDate,
      tags: ['course-cost'],
      metadata: {
        courseCostId: id,
        perParticipantCost: costData.perParticipantCost?.amount.toNumber(),
        hasAllocations: (costData.allocations?.length || 0) > 0,
      },
      createdBy: costData.createdBy,
    });

    // Process participant allocations
    if (costData.allocations) {
      for (const allocation of costData.allocations) {
        await this.allocateParticipantCost(
          allocation.participantId,
          courseId,
          allocation.amount,
          allocation.method,
          costData.category
        );
      }
    }

    this.emit('courseCostTracked', { courseId, courseCost });

    return courseCost;
  }

  /**
   * Calculate total course costs with breakdown
   */
  async getCourseTotalCosts(
    courseId: UUID,
    options?: {
      includeParticipantCosts?: boolean;
      includeResourceCosts?: boolean;
      breakdown?: boolean;
    }
  ): Promise<{
    totalCost: Money;
    directCosts: Money;
    indirectCosts: Money;
    fixedCosts: Money;
    variableCosts: Money;
    costPerParticipant: Money;
    participantCount: number;
    breakdown: Array<{
      category: CostCategory;
      type: CostType;
      amount: Money;
      percentage: number;
    }>;
    costDriverAnalysis: Array<{
      driver: CostDriver;
      impact: Money;
      percentage: number;
    }>;
  }> {
    // Get course cost record
    const courseCost = this.courseCosts.get(courseId);

    // Get all cost records for this course
    const courseCostRecords = Array.from(this.costs.values()).filter(
      (cost) => cost.courseId === courseId
    );

    // Calculate totals
    let totalCost = this.createMoney(0, Currency.SGD);
    let directCosts = this.createMoney(0, Currency.SGD);
    let indirectCosts = this.createMoney(0, Currency.SGD);
    let fixedCosts = this.createMoney(0, Currency.SGD);
    let variableCosts = this.createMoney(0, Currency.SGD);

    courseCostRecords.forEach((cost) => {
      totalCost = this.addMoney(totalCost, cost.amount);

      if (cost.type === CostType.DIRECT) {
        directCosts = this.addMoney(directCosts, cost.amount);
      } else {
        indirectCosts = this.addMoney(indirectCosts, cost.amount);
      }

      // Determine if fixed or variable (simplified logic)
      if (this.isFixedCostCategory(cost.category)) {
        fixedCosts = this.addMoney(fixedCosts, cost.amount);
      } else {
        variableCosts = this.addMoney(variableCosts, cost.amount);
      }
    });

    // Get participant count
    const participantCount = await this.getCourseParticipantCount(courseId);
    const costPerParticipant =
      participantCount > 0
        ? this.createMoney(
            totalCost.amount.div(participantCount),
            totalCost.currency
          )
        : this.createMoney(0, totalCost.currency);

    // Create breakdown by category and type
    const categoryBreakdown = new Map<
      string,
      { amount: Money; count: number }
    >();

    courseCostRecords.forEach((cost) => {
      const key = `${cost.category}-${cost.type}`;
      const existing = categoryBreakdown.get(key) || {
        amount: this.createMoney(0, cost.amount.currency),
        count: 0,
      };

      categoryBreakdown.set(key, {
        amount: this.addMoney(existing.amount, cost.amount),
        count: existing.count + 1,
      });
    });

    const breakdown = Array.from(categoryBreakdown.entries()).map(
      ([key, data]) => {
        const [category, type] = key.split('-') as [CostCategory, CostType];
        const percentage = totalCost.amount.equals(0)
          ? 0
          : data.amount.amount.div(totalCost.amount).mul(100).toNumber();

        return {
          category,
          type,
          amount: data.amount,
          percentage,
        };
      }
    );

    // Analyze cost drivers
    const costDriverAnalysis =
      courseCost?.costDrivers.map((driver) => {
        const driverImpact = this.calculateDriverImpact(driver, totalCost);
        const percentage = totalCost.amount.equals(0)
          ? 0
          : driverImpact.amount.div(totalCost.amount).mul(100).toNumber();

        return {
          driver,
          impact: driverImpact,
          percentage,
        };
      }) || [];

    return {
      totalCost,
      directCosts,
      indirectCosts,
      fixedCosts,
      variableCosts,
      costPerParticipant,
      participantCount,
      breakdown,
      costDriverAnalysis,
    };
  }

  // ============================================================================
  // RESOURCE COST TRACKING
  // ============================================================================

  /**
   * Track costs for resources (materials, equipment, etc.)
   */
  async trackResourceCost(
    resourceId: UUID,
    costData: {
      description: string;
      category: CostCategory;
      unitCost: Money;
      quantity: number;
      totalCost?: Money;
      vendor?: string;
      purchaseDate: Date;
      usageStartDate?: Date;
      usageEndDate?: Date;
      depreciationMethod?: 'straight_line' | 'declining_balance';
      depreciationRate?: number;
      usefulLife?: number; // in years
      allocatedCourses?: UUID[];
      utilizationRate?: number;
      createdBy: UUID;
    }
  ): Promise<ResourceCost> {
    const id = createUUID(uuidv4());
    const now = new Date();

    const totalCost =
      costData.totalCost ||
      this.createMoney(
        costData.unitCost.amount.mul(costData.quantity),
        costData.unitCost.currency
      );

    const resourceCost: ResourceCost = {
      id,
      resourceId,
      description: costData.description,
      category: costData.category,
      unitCost: costData.unitCost,
      quantity: costData.quantity,
      totalCost,
      vendor: costData.vendor,
      purchaseDate: costData.purchaseDate,
      usageStartDate: costData.usageStartDate,
      usageEndDate: costData.usageEndDate,
      depreciationMethod: costData.depreciationMethod || 'straight_line',
      depreciationRate: costData.depreciationRate,
      usefulLife: costData.usefulLife,
      allocatedCourses: costData.allocatedCourses || [],
      utilizationRate: costData.utilizationRate || 100,
      createdAt: now,
      createdBy: costData.createdBy,
    };

    // Add to resource costs collection
    const existingCosts = this.resourceCosts.get(resourceId) || [];
    existingCosts.push(resourceCost);
    this.resourceCosts.set(resourceId, existingCosts);

    // Create corresponding cost record
    await this.createCostRecord({
      description: `Resource Cost: ${costData.description}`,
      category: costData.category,
      type: CostType.DIRECT,
      amount: totalCost,
      organizationId: await this.getResourceOrganization(resourceId),
      resourceId,
      incurredDate: costData.purchaseDate,
      tags: ['resource-cost'],
      metadata: {
        resourceCostId: id,
        unitCost: costData.unitCost.amount.toNumber(),
        quantity: costData.quantity,
        vendor: costData.vendor,
      },
      createdBy: costData.createdBy,
    });

    // Allocate to courses if specified
    if (costData.allocatedCourses) {
      const allocationAmount = this.createMoney(
        totalCost.amount.div(costData.allocatedCourses.length),
        totalCost.currency
      );

      for (const courseId of costData.allocatedCourses) {
        await this.allocateResourceToCourse(
          resourceId,
          courseId,
          allocationAmount,
          costData.category
        );
      }
    }

    this.emit('resourceCostTracked', { resourceId, resourceCost });

    return resourceCost;
  }

  /**
   * Calculate depreciation for resource costs
   */
  async calculateResourceDepreciation(
    resourceId: UUID,
    asOfDate?: Date
  ): Promise<{
    originalCost: Money;
    accumulatedDepreciation: Money;
    bookValue: Money;
    currentYearDepreciation: Money;
    depreciationSchedule: Array<{
      year: number;
      startValue: Money;
      depreciation: Money;
      endValue: Money;
    }>;
  }> {
    const resourceCosts = this.resourceCosts.get(resourceId) || [];
    const evaluationDate = asOfDate || new Date();

    let originalCost = this.createMoney(0, Currency.SGD);
    let accumulatedDepreciation = this.createMoney(0, Currency.SGD);
    let currentYearDepreciation = this.createMoney(0, Currency.SGD);

    const depreciationSchedule: Array<{
      year: number;
      startValue: Money;
      depreciation: Money;
      endValue: Money;
    }> = [];

    for (const cost of resourceCosts) {
      originalCost = this.addMoney(originalCost, cost.totalCost);

      if (cost.usefulLife && cost.depreciationRate) {
        const yearsInService = this.calculateYearsInService(
          cost.purchaseDate,
          evaluationDate
        );

        const annualDepreciation = this.calculateAnnualDepreciation(
          cost.totalCost,
          cost.depreciationMethod,
          cost.depreciationRate,
          cost.usefulLife
        );

        const totalDepreciation = this.createMoney(
          annualDepreciation.amount.mul(
            Math.min(yearsInService, cost.usefulLife)
          ),
          cost.totalCost.currency
        );

        accumulatedDepreciation = this.addMoney(
          accumulatedDepreciation,
          totalDepreciation
        );

        // Current year depreciation
        if (yearsInService < cost.usefulLife) {
          currentYearDepreciation = this.addMoney(
            currentYearDepreciation,
            annualDepreciation
          );
        }

        // Generate schedule
        for (let year = 1; year <= cost.usefulLife; year++) {
          const startValue =
            year === 1
              ? cost.totalCost
              : this.subtractMoney(
                  cost.totalCost,
                  this.createMoney(
                    annualDepreciation.amount.mul(year - 1),
                    cost.totalCost.currency
                  )
                );

          const depreciation = annualDepreciation;
          const endValue = this.subtractMoney(startValue, depreciation);

          depreciationSchedule.push({
            year,
            startValue,
            depreciation,
            endValue,
          });
        }
      }
    }

    const bookValue = this.subtractMoney(originalCost, accumulatedDepreciation);

    return {
      originalCost,
      accumulatedDepreciation,
      bookValue,
      currentYearDepreciation,
      depreciationSchedule,
    };
  }

  // ============================================================================
  // COST ALLOCATION
  // ============================================================================

  /**
   * Allocate costs to cost centers
   */
  async allocateCost(
    costId: UUID,
    costCenterId: UUID,
    amount: Money,
    method: AllocationMethod,
    allocationBasis?: string
  ): Promise<CostAllocation> {
    const allocationId = createUUID(uuidv4());
    const now = new Date();

    const allocation: CostAllocation = {
      id: allocationId,
      costId,
      costCenterId,
      amount,
      method,
      allocationBasis,
      percentage: this.calculateAllocationPercentage(costId, amount),
      createdAt: now,
    };

    this.allocations.set(allocationId, allocation);

    // Update cost record
    const costRecord = this.costs.get(costId);
    if (costRecord) {
      costRecord.allocations.push(allocation);
      costRecord.updatedAt = now;
    }

    // Update cost center
    const costCenter = this.costCenters.get(costCenterId);
    if (costCenter) {
      costCenter.totalAllocated = this.addMoney(
        costCenter.totalAllocated,
        amount
      );
      costCenter.updatedAt = now;
    }

    this.emit('costAllocated', { allocation });

    return allocation;
  }

  /**
   * Reallocate costs between cost centers
   */
  async reallocateCosts(reallocationData: {
    sourceCostCenterId: UUID;
    targetCostCenterId: UUID;
    amount: Money;
    reason: string;
    approvedBy: UUID;
  }): Promise<{
    sourceAllocation: CostAllocation;
    targetAllocation: CostAllocation;
  }> {
    const sourceCostCenter = this.costCenters.get(
      reallocationData.sourceCostCenterId
    );
    const targetCostCenter = this.costCenters.get(
      reallocationData.targetCostCenterId
    );

    if (!sourceCostCenter || !targetCostCenter) {
      throw new Error('Cost center(s) not found');
    }

    if (
      sourceCostCenter.totalAllocated.amount.lt(reallocationData.amount.amount)
    ) {
      throw new Error('Insufficient allocated amount in source cost center');
    }

    // Create reallocation cost record
    const reallocationCostId = await this.createCostRecord({
      description: `Reallocation: ${reallocationData.reason}`,
      category: CostCategory.ADMINISTRATION,
      type: CostType.ALLOCATION,
      amount: reallocationData.amount,
      organizationId: sourceCostCenter.organizationId,
      incurredDate: new Date(),
      tags: ['reallocation'],
      metadata: {
        sourceCostCenterId: reallocationData.sourceCostCenterId,
        targetCostCenterId: reallocationData.targetCostCenterId,
        reason: reallocationData.reason,
      },
      createdBy: reallocationData.approvedBy,
    });

    // Create negative allocation for source
    const sourceAllocation = await this.allocateCost(
      reallocationCostId.id,
      reallocationData.sourceCostCenterId,
      this.createMoney(
        reallocationData.amount.amount.neg(),
        reallocationData.amount.currency
      ),
      AllocationMethod.REALLOCATION,
      'Cost center reallocation'
    );

    // Create positive allocation for target
    const targetAllocation = await this.allocateCost(
      reallocationCostId.id,
      reallocationData.targetCostCenterId,
      reallocationData.amount,
      AllocationMethod.REALLOCATION,
      'Cost center reallocation'
    );

    this.emit('costsReallocated', {
      sourceCostCenterId: reallocationData.sourceCostCenterId,
      targetCostCenterId: reallocationData.targetCostCenterId,
      amount: reallocationData.amount,
      reason: reallocationData.reason,
    });

    return { sourceAllocation, targetAllocation };
  }

  // ============================================================================
  // COST ANALYSIS AND REPORTING
  // ============================================================================

  /**
   * Generate comprehensive cost analysis
   */
  async generateCostAnalysis(options: {
    organizationId?: UUID;
    departmentId?: UUID;
    courseId?: UUID;
    participantId?: UUID;
    dateRange: { start: Date; end: Date };
    groupBy?: 'category' | 'type' | 'month' | 'course' | 'participant';
    includeComparisons?: boolean;
    includeTrends?: boolean;
  }): Promise<CostAnalysis> {
    // Filter costs based on criteria
    let filteredCosts = Array.from(this.costs.values());

    if (options.organizationId) {
      filteredCosts = filteredCosts.filter(
        (cost) => cost.organizationId === options.organizationId
      );
    }

    if (options.departmentId) {
      filteredCosts = filteredCosts.filter(
        (cost) => cost.departmentId === options.departmentId
      );
    }

    if (options.courseId) {
      filteredCosts = filteredCosts.filter(
        (cost) => cost.courseId === options.courseId
      );
    }

    if (options.participantId) {
      filteredCosts = filteredCosts.filter(
        (cost) => cost.participantId === options.participantId
      );
    }

    filteredCosts = filteredCosts.filter(
      (cost) =>
        cost.incurredDate >= options.dateRange.start &&
        cost.incurredDate <= options.dateRange.end
    );

    // Calculate totals
    const totalCost = filteredCosts.reduce(
      (sum, cost) => this.addMoney(sum, cost.amount),
      this.createMoney(0, Currency.SGD)
    );

    const averageCost =
      filteredCosts.length > 0
        ? this.createMoney(
            totalCost.amount.div(filteredCosts.length),
            totalCost.currency
          )
        : this.createMoney(0, totalCost.currency);

    // Generate breakdown
    const breakdown = this.generateCostBreakdown(
      filteredCosts,
      options.groupBy
    );

    // Generate trends if requested
    const trends = options.includeTrends
      ? this.generateCostTrends(filteredCosts, options.dateRange)
      : [];

    // Generate comparisons if requested
    const comparisons = options.includeComparisons
      ? await this.generateCostComparisons(options)
      : [];

    const analysis: CostAnalysis = {
      period: options.dateRange,
      totalCost,
      averageCost,
      transactionCount: filteredCosts.length,
      breakdown,
      trends,
      comparisons,
      topCategories: this.getTopCategories(breakdown, 5),
      costEfficiencyMetrics: this.calculateEfficiencyMetrics(filteredCosts),
      generatedAt: new Date(),
    };

    this.emit('costAnalysisGenerated', { analysis });

    return analysis;
  }

  /**
   * Generate cost trends over time
   */
  private generateCostTrends(
    costs: CostRecord[],
    dateRange: { start: Date; end: Date }
  ): CostTrend[] {
    const trends: CostTrend[] = [];
    const monthlyData = new Map<string, Money>();

    // Group costs by month
    costs.forEach((cost) => {
      const monthKey = `${cost.incurredDate.getFullYear()}-${cost.incurredDate.getMonth()}`;
      const existing =
        monthlyData.get(monthKey) || this.createMoney(0, cost.amount.currency);
      monthlyData.set(monthKey, this.addMoney(existing, cost.amount));
    });

    // Convert to trend data
    const sortedMonths = Array.from(monthlyData.keys()).sort();

    for (let i = 0; i < sortedMonths.length; i++) {
      const month = sortedMonths[i];
      const amount = monthlyData.get(month)!;

      let changeFromPrevious = 0;
      if (i > 0) {
        const previousAmount = monthlyData.get(sortedMonths[i - 1])!;
        if (!previousAmount.amount.equals(0)) {
          changeFromPrevious = amount.amount
            .sub(previousAmount.amount)
            .div(previousAmount.amount)
            .mul(100)
            .toNumber();
        }
      }

      trends.push({
        period: month,
        amount,
        changeFromPrevious,
        trendDirection:
          changeFromPrevious > 0
            ? 'increasing'
            : changeFromPrevious < 0
              ? 'decreasing'
              : 'stable',
      });
    }

    return trends;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async updateParticipantCosts(
    participantId: UUID,
    costRecord: CostRecord
  ): Promise<void> {
    // Implementation would update participant cost aggregations
  }

  private async updateCourseCosts(
    courseId: UUID,
    costRecord: CostRecord
  ): Promise<void> {
    // Implementation would update course cost aggregations
  }

  private async updateResourceCosts(
    resourceId: UUID,
    costRecord: CostRecord
  ): Promise<void> {
    // Implementation would update resource cost aggregations
  }

  private async getParticipantOrganization(participantId: UUID): Promise<UUID> {
    // Implementation would fetch participant's organization
    return createUUID('default-org');
  }

  private async getCourseOrganization(courseId: UUID): Promise<UUID> {
    // Implementation would fetch course's organization
    return createUUID('default-org');
  }

  private async getResourceOrganization(resourceId: UUID): Promise<UUID> {
    // Implementation would fetch resource's organization
    return createUUID('default-org');
  }

  private async getCourseParticipantCount(courseId: UUID): Promise<number> {
    // Implementation would fetch actual participant count
    return this.participantCosts.size;
  }

  private createMoney(amount: number | Decimal, currency: Currency): Money {
    return {
      amount: typeof amount === 'number' ? new Decimal(amount) : amount,
      currency,
    };
  }

  private addMoney(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return {
      amount: a.amount.add(b.amount),
      currency: a.currency,
    };
  }

  private subtractMoney(a: Money, b: Money): Money {
    if (a.currency !== b.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return {
      amount: a.amount.sub(b.amount),
      currency: a.currency,
    };
  }

  private isFixedCostCategory(category: CostCategory): boolean {
    const fixedCategories = [
      CostCategory.VENUE_RENTAL,
      CostCategory.EQUIPMENT,
      CostCategory.TECHNOLOGY,
      CostCategory.OVERHEAD,
    ];
    return fixedCategories.includes(category);
  }

  private calculateDriverImpact(driver: CostDriver, totalCost: Money): Money {
    // Simplified calculation - would be more sophisticated in practice
    return this.createMoney(
      totalCost.amount.mul(driver.impact / 100),
      totalCost.currency
    );
  }

  private async allocateParticipantCost(
    participantId: UUID,
    courseId: UUID,
    amount: Money,
    method: AllocationMethod,
    category: CostCategory
  ): Promise<void> {
    // Implementation would create participant cost allocation
  }

  private async allocateResourceToCourse(
    resourceId: UUID,
    courseId: UUID,
    amount: Money,
    category: CostCategory
  ): Promise<void> {
    // Implementation would allocate resource cost to course
  }

  private calculateYearsInService(purchaseDate: Date, asOfDate: Date): number {
    const diffTime = Math.abs(asOfDate.getTime() - purchaseDate.getTime());
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
  }

  private calculateAnnualDepreciation(
    cost: Money,
    method: 'straight_line' | 'declining_balance',
    rate: number,
    usefulLife: number
  ): Money {
    if (method === 'straight_line') {
      return this.createMoney(cost.amount.div(usefulLife), cost.currency);
    } else {
      return this.createMoney(cost.amount.mul(rate / 100), cost.currency);
    }
  }

  private calculateAllocationPercentage(costId: UUID, amount: Money): number {
    const costRecord = this.costs.get(costId);
    if (!costRecord) return 100;

    return amount.amount.div(costRecord.amount.amount).mul(100).toNumber();
  }

  private generateCostBreakdown(
    costs: CostRecord[],
    groupBy?: string
  ): CostBreakdown[] {
    const breakdown = new Map<string, { amount: Money; count: number }>();

    costs.forEach((cost) => {
      let key: string;
      switch (groupBy) {
        case 'category':
          key = cost.category;
          break;
        case 'type':
          key = cost.type;
          break;
        case 'month':
          key = `${cost.incurredDate.getFullYear()}-${cost.incurredDate.getMonth()}`;
          break;
        default:
          key = cost.category;
      }

      const existing = breakdown.get(key) || {
        amount: this.createMoney(0, cost.amount.currency),
        count: 0,
      };

      breakdown.set(key, {
        amount: this.addMoney(existing.amount, cost.amount),
        count: existing.count + 1,
      });
    });

    return Array.from(breakdown.entries()).map(([key, data]) => ({
      label: key,
      amount: data.amount,
      count: data.count,
      percentage: 0, // Would calculate based on total
    }));
  }

  private async generateCostComparisons(
    options: any
  ): Promise<CostComparison[]> {
    // Implementation would generate period-over-period comparisons
    return [];
  }

  private getTopCategories(
    breakdown: CostBreakdown[],
    limit: number
  ): CostBreakdown[] {
    return breakdown
      .sort((a, b) => b.amount.amount.sub(a.amount.amount).toNumber())
      .slice(0, limit);
  }

  private calculateEfficiencyMetrics(
    costs: CostRecord[]
  ): Record<string, number> {
    // Implementation would calculate various efficiency metrics
    return {
      costPerTransaction:
        costs.length > 0
          ? costs.reduce(
              (sum, cost) => sum + cost.amount.amount.toNumber(),
              0
            ) / costs.length
          : 0,
      processingEfficiency: 95.0,
      costVariance: 0.1,
    };
  }

  private initializeDefaultCostCenters(): void {
    const defaultCenters = [
      {
        name: 'Training Operations',
        description: 'Core training delivery operations',
        type: 'operational',
      },
      {
        name: 'Technology Infrastructure',
        description: 'IT systems and platforms',
        type: 'support',
      },
      {
        name: 'Administration',
        description: 'Administrative overhead',
        type: 'overhead',
      },
    ];

    defaultCenters.forEach((center) => {
      const id = createUUID(uuidv4());
      const costCenter: CostCenter = {
        id,
        name: center.name,
        description: center.description,
        organizationId: createUUID('default-org'),
        totalBudget: this.createMoney(0, Currency.SGD),
        totalAllocated: this.createMoney(0, Currency.SGD),
        costCategories: Object.values(CostCategory),
        managers: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.costCenters.set(id, costCenter);
    });
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  async getCostRecord(costId: UUID): Promise<CostRecord | null> {
    return this.costs.get(costId) || null;
  }

  async getCostRecords(filters?: {
    organizationId?: UUID;
    courseId?: UUID;
    participantId?: UUID;
    category?: CostCategory;
    type?: CostType;
    status?: CostStatus;
    dateRange?: { start: Date; end: Date };
  }): Promise<CostRecord[]> {
    let costs = Array.from(this.costs.values());

    if (filters?.organizationId) {
      costs = costs.filter((c) => c.organizationId === filters.organizationId);
    }
    if (filters?.courseId) {
      costs = costs.filter((c) => c.courseId === filters.courseId);
    }
    if (filters?.participantId) {
      costs = costs.filter((c) => c.participantId === filters.participantId);
    }
    if (filters?.category) {
      costs = costs.filter((c) => c.category === filters.category);
    }
    if (filters?.type) {
      costs = costs.filter((c) => c.type === filters.type);
    }
    if (filters?.status) {
      costs = costs.filter((c) => c.status === filters.status);
    }
    if (filters?.dateRange) {
      costs = costs.filter(
        (c) =>
          c.incurredDate >= filters.dateRange!.start &&
          c.incurredDate <= filters.dateRange!.end
      );
    }

    return costs;
  }

  async updateCostStatus(
    costId: UUID,
    status: CostStatus,
    reason?: string,
    updatedBy?: UUID
  ): Promise<CostRecord> {
    const cost = this.costs.get(costId);
    if (!cost) {
      throw new Error('Cost record not found');
    }

    cost.status = status;
    cost.updatedAt = new Date();
    if (updatedBy) {
      cost.updatedBy = updatedBy;
    }

    this.emit('costStatusUpdated', { costId, status, reason });

    return cost;
  }

  async deleteCostRecord(costId: UUID): Promise<boolean> {
    const cost = this.costs.get(costId);
    if (!cost) {
      return false;
    }

    // Remove associated allocations
    cost.allocations.forEach((allocation) => {
      this.allocations.delete(allocation.id);
    });

    this.costs.delete(costId);
    this.emit('costDeleted', { costId });

    return true;
  }
}
