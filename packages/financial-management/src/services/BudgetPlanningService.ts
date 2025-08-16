import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import * as statistics from 'simple-statistics';
import {
  Budget,
  BudgetType,
  BudgetStatus,
  BudgetCategory,
  BudgetScenario,
  ScenarioType,
  BudgetRevision,
  Money,
  Currency,
  CostCategory,
  UUID,
  createUUID,
  ProjectionFactor,
  BudgetProjection,
  ScenarioAssumption,
} from '../types';

/**
 * Comprehensive Budget Planning Service
 * Multi-year budget planning with scenario modeling and predictive analytics
 */
export class BudgetPlanningService extends EventEmitter {
  private budgets: Map<UUID, Budget> = new Map();
  private scenarios: Map<UUID, BudgetScenario> = new Map();
  private templates: Map<string, Budget> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
  }

  // ============================================================================
  // BUDGET CREATION AND MANAGEMENT
  // ============================================================================

  /**
   * Create a new budget with multi-year support
   */
  async createBudget(budgetData: {
    name: string;
    description?: string;
    type: BudgetType;
    organizationId: UUID;
    departmentId?: UUID;
    trainingProgramId?: UUID;
    fiscalYear: number;
    startDate: Date;
    endDate: Date;
    totalAllocated: Money;
    categories: Partial<BudgetCategory>[];
    tags?: string[];
    metadata?: Record<string, any>;
    createdBy: UUID;
  }): Promise<Budget> {
    const id = createUUID(uuidv4());
    const now = new Date();

    // Calculate remaining amount
    const totalCommitted = this.createMoney(
      0,
      budgetData.totalAllocated.currency
    );
    const totalSpent = this.createMoney(0, budgetData.totalAllocated.currency);
    const totalRemaining = this.subtractMoney(
      budgetData.totalAllocated,
      totalSpent
    );

    // Process budget categories
    const categories = await this.processBudgetCategories(
      budgetData.categories,
      budgetData.totalAllocated.currency
    );

    const budget: Budget = {
      id,
      name: budgetData.name,
      description: budgetData.description,
      type: budgetData.type,
      status: BudgetStatus.DRAFT,
      organizationId: budgetData.organizationId,
      departmentId: budgetData.departmentId,
      trainingProgramId: budgetData.trainingProgramId,
      fiscalYear: budgetData.fiscalYear,
      startDate: budgetData.startDate,
      endDate: budgetData.endDate,
      totalAllocated: budgetData.totalAllocated,
      totalCommitted,
      totalSpent,
      totalRemaining,
      categories,
      approvers: [],
      scenarios: [],
      revisions: [],
      tags: budgetData.tags || [],
      metadata: budgetData.metadata || {},
      createdAt: now,
      updatedAt: now,
      createdBy: budgetData.createdBy,
      updatedBy: budgetData.createdBy,
    };

    this.budgets.set(id, budget);

    // Generate default scenarios
    await this.generateDefaultScenarios(id);

    this.emit('budgetCreated', { budget });

    return budget;
  }

  /**
   * Create budget from template
   */
  async createBudgetFromTemplate(
    templateName: string,
    customizations: {
      name: string;
      organizationId: UUID;
      fiscalYear: number;
      totalAllocated: Money;
      adjustments?: Record<CostCategory, number>; // percentage adjustments
      createdBy: UUID;
    }
  ): Promise<Budget> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Budget template '${templateName}' not found`);
    }

    // Apply customizations to template
    const categories = template.categories.map((category) => ({
      ...category,
      id: createUUID(uuidv4()),
      allocated: this.adjustAmount(
        category.allocated,
        customizations.adjustments?.[category.category] || 0
      ),
      committed: this.createMoney(0, customizations.totalAllocated.currency),
      spent: this.createMoney(0, customizations.totalAllocated.currency),
      remaining: this.adjustAmount(
        category.allocated,
        customizations.adjustments?.[category.category] || 0
      ),
    }));

    return this.createBudget({
      name: customizations.name,
      description: `Created from template: ${templateName}`,
      type: template.type,
      organizationId: customizations.organizationId,
      fiscalYear: customizations.fiscalYear,
      startDate: new Date(customizations.fiscalYear, 0, 1),
      endDate: new Date(customizations.fiscalYear, 11, 31),
      totalAllocated: customizations.totalAllocated,
      categories,
      createdBy: customizations.createdBy,
    });
  }

  // ============================================================================
  // SCENARIO MODELING
  // ============================================================================

  /**
   * Generate comprehensive budget scenarios
   */
  async generateScenarios(
    budgetId: UUID,
    parameters?: {
      includeOptimistic?: boolean;
      includePessimistic?: boolean;
      customAssumptions?: Record<string, number>;
      marketFactors?: ProjectionFactor[];
    }
  ): Promise<BudgetScenario[]> {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    const scenarios: BudgetScenario[] = [];
    const baseAssumptions = this.getBaseAssumptions(budget);

    // Realistic Scenario (baseline)
    scenarios.push(
      await this.createScenario(
        budget,
        'Realistic',
        'Base case scenario with current market conditions',
        ScenarioType.REALISTIC,
        baseAssumptions,
        0.7
      )
    );

    // Optimistic Scenario
    if (parameters?.includeOptimistic !== false) {
      const optimisticAssumptions = this.adjustAssumptions(baseAssumptions, {
        inflationRate: -0.5,
        demandGrowth: 15,
        costEfficiency: 10,
        marketExpansion: 20,
      });

      scenarios.push(
        await this.createScenario(
          budget,
          'Optimistic',
          'Best case scenario with favorable market conditions',
          ScenarioType.OPTIMISTIC,
          optimisticAssumptions,
          0.3
        )
      );
    }

    // Pessimistic Scenario
    if (parameters?.includePessimistic !== false) {
      const pessimisticAssumptions = this.adjustAssumptions(baseAssumptions, {
        inflationRate: 2.0,
        demandGrowth: -10,
        costEfficiency: -5,
        marketContraction: -15,
      });

      scenarios.push(
        await this.createScenario(
          budget,
          'Pessimistic',
          'Worst case scenario with challenging market conditions',
          ScenarioType.PESSIMISTIC,
          pessimisticAssumptions,
          0.2
        )
      );
    }

    // Custom Scenario with user-defined assumptions
    if (parameters?.customAssumptions) {
      const customAssumptions = this.adjustAssumptions(
        baseAssumptions,
        parameters.customAssumptions
      );

      scenarios.push(
        await this.createScenario(
          budget,
          'Custom',
          'Custom scenario with user-defined assumptions',
          ScenarioType.CUSTOM,
          customAssumptions,
          0.5
        )
      );
    }

    // Store scenarios
    scenarios.forEach((scenario) => {
      this.scenarios.set(scenario.id, scenario);
    });

    // Update budget with scenarios
    budget.scenarios = scenarios;
    budget.updatedAt = new Date();

    this.emit('scenariosGenerated', { budgetId, scenarios });

    return scenarios;
  }

  /**
   * Create individual scenario with projections
   */
  private async createScenario(
    budget: Budget,
    name: string,
    description: string,
    type: ScenarioType,
    assumptions: ScenarioAssumption[],
    confidence: number
  ): Promise<BudgetScenario> {
    const id = createUUID(uuidv4());

    // Generate projections for each category
    const projections = await Promise.all(
      budget.categories.map((category) =>
        this.createCategoryProjection(category, assumptions, type)
      )
    );

    return {
      id,
      name,
      description,
      type,
      assumptions,
      projections,
      confidenceLevel: confidence,
      createdAt: new Date(),
      createdBy: budget.createdBy,
    };
  }

  /**
   * Create projection for a budget category
   */
  private async createCategoryProjection(
    category: BudgetCategory,
    assumptions: ScenarioAssumption[],
    scenarioType: ScenarioType
  ): Promise<BudgetProjection> {
    const baseAmount = category.allocated;

    // Calculate projection factors
    const factors: ProjectionFactor[] = [
      {
        name: 'Inflation Impact',
        impact: this.getAssumptionValue(assumptions, 'inflationRate', 2.0),
        confidence: 85,
        description: 'Expected inflation impact on costs',
      },
      {
        name: 'Demand Fluctuation',
        impact: this.getAssumptionValue(assumptions, 'demandGrowth', 0),
        confidence: 70,
        description: 'Expected change in training demand',
      },
      {
        name: 'Cost Efficiency',
        impact: this.getAssumptionValue(assumptions, 'costEfficiency', 0),
        confidence: 75,
        description: 'Expected efficiency gains or losses',
      },
    ];

    // Calculate projected amount
    const totalImpact = factors.reduce(
      (sum, factor) => sum + factor.impact / 100,
      0
    );

    const projectedAmount = this.createMoney(
      baseAmount.amount.mul(1 + totalImpact),
      baseAmount.currency
    );

    const variance = this.subtractMoney(projectedAmount, baseAmount);

    // Calculate probability based on scenario type
    let probability: number;
    switch (scenarioType) {
      case ScenarioType.OPTIMISTIC:
        probability = 0.25;
        break;
      case ScenarioType.PESSIMISTIC:
        probability = 0.15;
        break;
      case ScenarioType.REALISTIC:
        probability = 0.6;
        break;
      default:
        probability = 0.33;
    }

    return {
      category: category.category,
      projected: projectedAmount,
      variance,
      probability,
      factors,
    };
  }

  // ============================================================================
  // MULTI-YEAR PLANNING
  // ============================================================================

  /**
   * Create multi-year budget plan
   */
  async createMultiYearPlan(planData: {
    name: string;
    organizationId: UUID;
    startYear: number;
    numberOfYears: number;
    baseAllocations: Record<CostCategory, Money>;
    growthAssumptions: Record<CostCategory, number>; // annual growth %
    marketFactors: ProjectionFactor[];
    createdBy: UUID;
  }): Promise<Budget[]> {
    const budgets: Budget[] = [];

    for (let year = 0; year < planData.numberOfYears; year++) {
      const fiscalYear = planData.startYear + year;
      const yearlyAllocations = this.calculateYearlyAllocations(
        planData.baseAllocations,
        planData.growthAssumptions,
        year,
        planData.marketFactors
      );

      const totalAllocated = Object.values(yearlyAllocations).reduce(
        (sum, amount) => this.addMoney(sum, amount)
      );

      const categories = Object.entries(yearlyAllocations).map(
        ([category, amount]) => ({
          category: category as CostCategory,
          name: this.getCategoryDisplayName(category as CostCategory),
          allocated: amount,
          approvalRequired: this.requiresApproval(category as CostCategory),
          approvalThreshold: this.getApprovalThreshold(
            category as CostCategory
          ),
        })
      );

      const budget = await this.createBudget({
        name: `${planData.name} - FY${fiscalYear}`,
        description: `Multi-year plan budget for fiscal year ${fiscalYear}`,
        type: BudgetType.ANNUAL,
        organizationId: planData.organizationId,
        fiscalYear,
        startDate: new Date(fiscalYear, 0, 1),
        endDate: new Date(fiscalYear, 11, 31),
        totalAllocated,
        categories,
        tags: ['multi-year-plan', `fy${fiscalYear}`],
        createdBy: planData.createdBy,
      });

      budgets.push(budget);
    }

    this.emit('multiYearPlanCreated', {
      planName: planData.name,
      budgets: budgets.map((b) => b.id),
    });

    return budgets;
  }

  /**
   * Calculate yearly allocations with growth factors
   */
  private calculateYearlyAllocations(
    baseAllocations: Record<CostCategory, Money>,
    growthAssumptions: Record<CostCategory, number>,
    yearIndex: number,
    marketFactors: ProjectionFactor[]
  ): Record<CostCategory, Money> {
    const yearlyAllocations: Record<CostCategory, Money> = {} as any;

    Object.entries(baseAllocations).forEach(([category, baseAmount]) => {
      const categoryKey = category as CostCategory;
      const growthRate = growthAssumptions[categoryKey] || 0;
      const marketImpact = this.calculateMarketImpact(
        marketFactors,
        categoryKey
      );

      const adjustedGrowthRate = (growthRate + marketImpact) / 100;
      const compoundedAmount = baseAmount.amount.mul(
        Math.pow(1 + adjustedGrowthRate, yearIndex)
      );

      yearlyAllocations[categoryKey] = this.createMoney(
        compoundedAmount,
        baseAmount.currency
      );
    });

    return yearlyAllocations;
  }

  // ============================================================================
  // BUDGET MONITORING AND VARIANCE ANALYSIS
  // ============================================================================

  /**
   * Analyze budget variance
   */
  async analyzeBudgetVariance(budgetId: UUID): Promise<{
    overallVariance: {
      budgetedAmount: Money;
      actualAmount: Money;
      variance: Money;
      variancePercentage: number;
      status: 'under_budget' | 'over_budget' | 'on_budget';
    };
    categoryVariances: Array<{
      category: CostCategory;
      budgeted: Money;
      actual: Money;
      variance: Money;
      variancePercentage: number;
      utilizationRate: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      alerts: string[];
    }>;
    insights: string[];
    recommendations: string[];
  }> {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Calculate overall variance
    const overallVariance = {
      budgetedAmount: budget.totalAllocated,
      actualAmount: budget.totalSpent,
      variance: this.subtractMoney(budget.totalAllocated, budget.totalSpent),
      variancePercentage: this.calculateVariancePercentage(
        budget.totalAllocated,
        budget.totalSpent
      ),
      status: this.determineVarianceStatus(
        budget.totalAllocated,
        budget.totalSpent
      ),
    };

    // Analyze category variances
    const categoryVariances = budget.categories.map((category) => {
      const variance = this.subtractMoney(category.allocated, category.spent);
      const variancePercentage = this.calculateVariancePercentage(
        category.allocated,
        category.spent
      );
      const utilizationRate = this.calculateUtilizationRate(
        category.allocated,
        category.spent
      );

      return {
        category: category.category,
        budgeted: category.allocated,
        actual: category.spent,
        variance,
        variancePercentage,
        utilizationRate,
        trend: this.determineTrend(category),
        alerts: this.generateCategoryAlerts(
          category,
          utilizationRate,
          variancePercentage
        ),
      };
    });

    // Generate insights and recommendations
    const insights = this.generateVarianceInsights(
      overallVariance,
      categoryVariances
    );
    const recommendations = this.generateVarianceRecommendations(
      overallVariance,
      categoryVariances
    );

    const analysis = {
      overallVariance,
      categoryVariances,
      insights,
      recommendations,
    };

    this.emit('varianceAnalyzed', { budgetId, analysis });

    return analysis;
  }

  /**
   * Generate budget forecasts
   */
  async generateBudgetForecast(
    budgetId: UUID,
    options: {
      forecastPeriods: number;
      useSeasonality: boolean;
      includeExternalFactors: boolean;
      confidence: number;
    }
  ): Promise<{
    forecasts: Array<{
      period: string;
      category: CostCategory;
      predictedSpend: Money;
      confidence: number;
      factors: string[];
    }>;
    totalForecast: Money;
    budgetProjection: {
      projectedCompletion: Date;
      finalUtilization: number;
      riskFactors: string[];
    };
  }> {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    const forecasts: Array<{
      period: string;
      category: CostCategory;
      predictedSpend: Money;
      confidence: number;
      factors: string[];
    }> = [];

    let totalForecast = this.createMoney(0, budget.totalAllocated.currency);

    // Generate forecasts for each category
    for (const category of budget.categories) {
      const categoryForecasts = await this.forecastCategorySpend(
        category,
        options
      );

      forecasts.push(...categoryForecasts);

      // Add to total forecast
      categoryForecasts.forEach((forecast) => {
        totalForecast = this.addMoney(totalForecast, forecast.predictedSpend);
      });
    }

    // Generate budget projection
    const budgetProjection = {
      projectedCompletion: this.calculateProjectedCompletion(budget, forecasts),
      finalUtilization: this.calculateFinalUtilization(budget, totalForecast),
      riskFactors: this.identifyRiskFactors(budget, forecasts),
    };

    const result = {
      forecasts,
      totalForecast,
      budgetProjection,
    };

    this.emit('forecastGenerated', { budgetId, forecast: result });

    return result;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private initializeDefaultTemplates(): void {
    // Training Program Template
    const trainingTemplate: Partial<Budget> = {
      name: 'Standard Training Program Budget',
      type: BudgetType.COURSE,
      categories: [
        this.createBudgetCategory(CostCategory.COURSE_FEES, 'Course Fees', 40),
        this.createBudgetCategory(
          CostCategory.INSTRUCTOR_FEES,
          'Instructor Fees',
          25
        ),
        this.createBudgetCategory(
          CostCategory.MATERIALS,
          'Training Materials',
          10
        ),
        this.createBudgetCategory(
          CostCategory.VENUE_RENTAL,
          'Venue Rental',
          15
        ),
        this.createBudgetCategory(CostCategory.CATERING, 'Catering', 5),
        this.createBudgetCategory(
          CostCategory.ADMINISTRATION,
          'Administration',
          5
        ),
      ],
    };

    this.templates.set('training-program', trainingTemplate as Budget);

    // Annual Department Template
    const departmentTemplate: Partial<Budget> = {
      name: 'Annual Department Budget',
      type: BudgetType.DEPARTMENT,
      categories: [
        this.createBudgetCategory(CostCategory.COURSE_FEES, 'Course Fees', 35),
        this.createBudgetCategory(
          CostCategory.INSTRUCTOR_FEES,
          'Instructor Fees',
          20
        ),
        this.createBudgetCategory(CostCategory.TECHNOLOGY, 'Technology', 15),
        this.createBudgetCategory(CostCategory.MATERIALS, 'Materials', 10),
        this.createBudgetCategory(CostCategory.VENUE_RENTAL, 'Venue', 10),
        this.createBudgetCategory(
          CostCategory.ADMINISTRATION,
          'Administration',
          10
        ),
      ],
    };

    this.templates.set('department-annual', departmentTemplate as Budget);
  }

  private createBudgetCategory(
    category: CostCategory,
    name: string,
    percentage: number
  ): BudgetCategory {
    return {
      id: createUUID(uuidv4()),
      category,
      name,
      allocated: this.createMoney(0, Currency.SGD), // Will be calculated later
      committed: this.createMoney(0, Currency.SGD),
      spent: this.createMoney(0, Currency.SGD),
      remaining: this.createMoney(0, Currency.SGD),
      utilizationPercentage: 0,
      subcategories: [],
      approvalRequired: this.requiresApproval(category),
      approvalThreshold: this.getApprovalThreshold(category),
    };
  }

  private async processBudgetCategories(
    categories: Partial<BudgetCategory>[],
    currency: Currency
  ): Promise<BudgetCategory[]> {
    return categories.map((cat) => ({
      id: cat.id || createUUID(uuidv4()),
      category: cat.category!,
      name: cat.name!,
      description: cat.description,
      allocated: cat.allocated!,
      committed: this.createMoney(0, currency),
      spent: this.createMoney(0, currency),
      remaining: cat.allocated!,
      utilizationPercentage: 0,
      subcategories: cat.subcategories || [],
      approvalRequired:
        cat.approvalRequired ?? this.requiresApproval(cat.category!),
      approvalThreshold:
        cat.approvalThreshold ?? this.getApprovalThreshold(cat.category!),
    }));
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

  private adjustAmount(amount: Money, percentage: number): Money {
    return {
      amount: amount.amount.mul(1 + percentage / 100),
      currency: amount.currency,
    };
  }

  private getBaseAssumptions(budget: Budget): ScenarioAssumption[] {
    return [
      {
        parameter: 'inflationRate',
        baseValue: 2.0,
        adjustmentPercentage: 0,
        rationale: 'Expected annual inflation rate',
      },
      {
        parameter: 'demandGrowth',
        baseValue: 5.0,
        adjustmentPercentage: 0,
        rationale: 'Expected growth in training demand',
      },
      {
        parameter: 'costEfficiency',
        baseValue: 0,
        adjustmentPercentage: 0,
        rationale: 'Expected efficiency improvements',
      },
    ];
  }

  private adjustAssumptions(
    baseAssumptions: ScenarioAssumption[],
    adjustments: Record<string, number>
  ): ScenarioAssumption[] {
    return baseAssumptions.map((assumption) => ({
      ...assumption,
      adjustmentPercentage: adjustments[assumption.parameter] || 0,
    }));
  }

  private getAssumptionValue(
    assumptions: ScenarioAssumption[],
    parameter: string,
    defaultValue: number
  ): number {
    const assumption = assumptions.find((a) => a.parameter === parameter);
    return assumption
      ? assumption.baseValue * (1 + assumption.adjustmentPercentage / 100)
      : defaultValue;
  }

  private async generateDefaultScenarios(budgetId: UUID): Promise<void> {
    await this.generateScenarios(budgetId, {
      includeOptimistic: true,
      includePessimistic: true,
    });
  }

  private requiresApproval(category: CostCategory): boolean {
    const highRiskCategories = [
      CostCategory.EQUIPMENT,
      CostCategory.TECHNOLOGY,
      CostCategory.OVERHEAD,
    ];
    return highRiskCategories.includes(category);
  }

  private getApprovalThreshold(category: CostCategory): Money {
    const thresholds: Record<CostCategory, number> = {
      [CostCategory.COURSE_FEES]: 5000,
      [CostCategory.INSTRUCTOR_FEES]: 3000,
      [CostCategory.MATERIALS]: 1000,
      [CostCategory.VENUE_RENTAL]: 2000,
      [CostCategory.EQUIPMENT]: 10000,
      [CostCategory.CATERING]: 500,
      [CostCategory.TRANSPORTATION]: 1500,
      [CostCategory.ACCOMMODATION]: 2000,
      [CostCategory.CERTIFICATION]: 1000,
      [CostCategory.ADMINISTRATION]: 1000,
      [CostCategory.TECHNOLOGY]: 5000,
      [CostCategory.MARKETING]: 2000,
      [CostCategory.OVERHEAD]: 3000,
    };

    return this.createMoney(thresholds[category] || 1000, Currency.SGD);
  }

  private getCategoryDisplayName(category: CostCategory): string {
    const displayNames: Record<CostCategory, string> = {
      [CostCategory.COURSE_FEES]: 'Course Fees',
      [CostCategory.INSTRUCTOR_FEES]: 'Instructor Fees',
      [CostCategory.MATERIALS]: 'Training Materials',
      [CostCategory.VENUE_RENTAL]: 'Venue Rental',
      [CostCategory.EQUIPMENT]: 'Equipment',
      [CostCategory.CATERING]: 'Catering',
      [CostCategory.TRANSPORTATION]: 'Transportation',
      [CostCategory.ACCOMMODATION]: 'Accommodation',
      [CostCategory.CERTIFICATION]: 'Certification',
      [CostCategory.ADMINISTRATION]: 'Administration',
      [CostCategory.TECHNOLOGY]: 'Technology',
      [CostCategory.MARKETING]: 'Marketing',
      [CostCategory.OVERHEAD]: 'Overhead',
    };

    return displayNames[category] || category;
  }

  private calculateMarketImpact(
    marketFactors: ProjectionFactor[],
    category: CostCategory
  ): number {
    return marketFactors
      .filter((factor) => this.isFactorRelevant(factor, category))
      .reduce((impact, factor) => impact + factor.impact, 0);
  }

  private isFactorRelevant(
    factor: ProjectionFactor,
    category: CostCategory
  ): boolean {
    // Implement logic to determine if a market factor is relevant to a category
    const relevanceMap: Record<string, CostCategory[]> = {
      inflation: Object.values(CostCategory),
      technology: [CostCategory.TECHNOLOGY, CostCategory.EQUIPMENT],
      labor: [CostCategory.INSTRUCTOR_FEES, CostCategory.ADMINISTRATION],
      venue: [CostCategory.VENUE_RENTAL, CostCategory.ACCOMMODATION],
    };

    const relevantCategories = relevanceMap[factor.name.toLowerCase()] || [];
    return relevantCategories.includes(category);
  }

  private calculateVariancePercentage(budgeted: Money, actual: Money): number {
    if (budgeted.amount.equals(0)) return 0;
    return actual.amount
      .sub(budgeted.amount)
      .div(budgeted.amount)
      .mul(100)
      .toNumber();
  }

  private determineVarianceStatus(
    budgeted: Money,
    actual: Money
  ): 'under_budget' | 'over_budget' | 'on_budget' {
    const variance = this.calculateVariancePercentage(budgeted, actual);
    if (Math.abs(variance) <= 5) return 'on_budget';
    return variance > 0 ? 'over_budget' : 'under_budget';
  }

  private calculateUtilizationRate(allocated: Money, spent: Money): number {
    if (allocated.amount.equals(0)) return 0;
    return spent.amount.div(allocated.amount).mul(100).toNumber();
  }

  private determineTrend(
    category: BudgetCategory
  ): 'increasing' | 'decreasing' | 'stable' {
    // This would typically analyze historical spending patterns
    // For now, return a placeholder
    return 'stable';
  }

  private generateCategoryAlerts(
    category: BudgetCategory,
    utilizationRate: number,
    variancePercentage: number
  ): string[] {
    const alerts: string[] = [];

    if (utilizationRate > 90) {
      alerts.push('Budget utilization exceeds 90%');
    }
    if (variancePercentage > 15) {
      alerts.push('Spending significantly over budget');
    }
    if (utilizationRate < 50 && new Date() > new Date(new Date().setMonth(6))) {
      alerts.push('Low utilization rate - consider budget reallocation');
    }

    return alerts;
  }

  private generateVarianceInsights(
    overallVariance: any,
    categoryVariances: any[]
  ): string[] {
    const insights: string[] = [];

    if (overallVariance.status === 'over_budget') {
      insights.push(
        'Overall budget is over by ' +
          overallVariance.variancePercentage.toFixed(1) +
          '%'
      );
    }

    const highVarianceCategories = categoryVariances
      .filter((cv) => Math.abs(cv.variancePercentage) > 20)
      .map((cv) => cv.category);

    if (highVarianceCategories.length > 0) {
      insights.push(
        `High variance detected in: ${highVarianceCategories.join(', ')}`
      );
    }

    return insights;
  }

  private generateVarianceRecommendations(
    overallVariance: any,
    categoryVariances: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (overallVariance.status === 'over_budget') {
      recommendations.push('Consider implementing cost control measures');
      recommendations.push('Review and reallocate budget between categories');
    }

    const underUtilizedCategories = categoryVariances
      .filter((cv) => cv.utilizationRate < 50)
      .map((cv) => cv.category);

    if (underUtilizedCategories.length > 0) {
      recommendations.push(
        `Consider reallocating unused budget from: ${underUtilizedCategories.join(', ')}`
      );
    }

    return recommendations;
  }

  private async forecastCategorySpend(
    category: BudgetCategory,
    options: any
  ): Promise<
    Array<{
      period: string;
      category: CostCategory;
      predictedSpend: Money;
      confidence: number;
      factors: string[];
    }>
  > {
    // Simplified forecasting logic
    const forecasts = [];
    const monthlySpend = category.spent.amount.div(new Date().getMonth() + 1);

    for (let i = 1; i <= options.forecastPeriods; i++) {
      const period = `Month ${new Date().getMonth() + 1 + i}`;
      const predictedSpend = this.createMoney(
        monthlySpend,
        category.allocated.currency
      );

      forecasts.push({
        period,
        category: category.category,
        predictedSpend,
        confidence: options.confidence,
        factors: ['Historical trend', 'Seasonal patterns'],
      });
    }

    return forecasts;
  }

  private calculateProjectedCompletion(budget: Budget, forecasts: any[]): Date {
    // Simplified calculation
    const monthsRemaining = Math.ceil(
      forecasts.length / budget.categories.length
    );
    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsRemaining);
    return projectedDate;
  }

  private calculateFinalUtilization(
    budget: Budget,
    totalForecast: Money
  ): number {
    const projectedTotal = this.addMoney(budget.totalSpent, totalForecast);
    return this.calculateUtilizationRate(budget.totalAllocated, projectedTotal);
  }

  private identifyRiskFactors(budget: Budget, forecasts: any[]): string[] {
    const risks: string[] = [];

    if (forecasts.some((f) => f.confidence < 70)) {
      risks.push('Low confidence in some forecasts');
    }

    const projectedOverrun = forecasts.reduce(
      (sum, f) => sum + f.predictedSpend.amount.toNumber(),
      0
    );

    if (projectedOverrun > budget.totalRemaining.amount.toNumber()) {
      risks.push('Projected spending exceeds remaining budget');
    }

    return risks;
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  async getBudget(budgetId: UUID): Promise<Budget | null> {
    return this.budgets.get(budgetId) || null;
  }

  async getBudgets(filters?: {
    organizationId?: UUID;
    type?: BudgetType;
    status?: BudgetStatus;
    fiscalYear?: number;
  }): Promise<Budget[]> {
    let budgets = Array.from(this.budgets.values());

    if (filters?.organizationId) {
      budgets = budgets.filter(
        (b) => b.organizationId === filters.organizationId
      );
    }
    if (filters?.type) {
      budgets = budgets.filter((b) => b.type === filters.type);
    }
    if (filters?.status) {
      budgets = budgets.filter((b) => b.status === filters.status);
    }
    if (filters?.fiscalYear) {
      budgets = budgets.filter((b) => b.fiscalYear === filters.fiscalYear);
    }

    return budgets;
  }

  async updateBudgetStatus(
    budgetId: UUID,
    status: BudgetStatus,
    reason?: string,
    updatedBy?: UUID
  ): Promise<Budget> {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      throw new Error('Budget not found');
    }

    budget.status = status;
    budget.updatedAt = new Date();
    if (updatedBy) {
      budget.updatedBy = updatedBy;
    }

    this.emit('budgetStatusUpdated', { budgetId, status, reason });

    return budget;
  }

  async deleteBudget(budgetId: UUID): Promise<boolean> {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      return false;
    }

    // Remove associated scenarios
    budget.scenarios.forEach((scenario) => {
      this.scenarios.delete(scenario.id);
    });

    this.budgets.delete(budgetId);
    this.emit('budgetDeleted', { budgetId });

    return true;
  }
}
