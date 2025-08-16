import { EventEmitter } from 'events';
import {
  CATConfiguration,
  CATSession,
  CATAlgorithm,
  ItemSelectionMethod,
  AbilityEstimationMethod,
  ExposureControlMethod,
  CATParameters,
  CATStoppingCriteria,
  AbilityEstimate,
  AdministeredItem,
  ContentConstraint,
  Question,
  QuestionResponse,
  DifficultyLevel,
  UUID,
} from '../types';

export interface IRTParameters {
  a: number; // Discrimination parameter
  b: number; // Difficulty parameter
  c: number; // Guessing parameter (for 3PL)
  d?: number; // Upper asymptote (for 4PL)
}

export interface ItemInformation {
  questionId: UUID;
  information: number;
  ability: number;
}

export interface CATResult {
  finalAbility: number;
  sem: number;
  reliability: number;
  questionsAdministered: number;
  totalTime: number;
  terminationReason:
    | 'max_questions'
    | 'target_sem'
    | 'target_reliability'
    | 'time_limit'
    | 'no_items';
}

export class CATEngine extends EventEmitter {
  private sessions: Map<UUID, CATSession> = new Map();
  private itemParameters: Map<UUID, IRTParameters> = new Map();
  private exposureRates: Map<UUID, number> = new Map();
  private contentConstraints: Map<string, ContentConstraint> = new Map();

  constructor() {
    super();
    this.initializeDefaultParameters();
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  async startCATSession(
    assessmentId: UUID,
    participantId: UUID,
    configuration: CATConfiguration,
    availableQuestions: Question[]
  ): Promise<CATSession> {
    const sessionId = this.generateId();

    const session: CATSession = {
      id: sessionId,
      assessmentId,
      participantId,
      currentAbility: configuration.parameters.startingAbility,
      abilityHistory: [
        {
          value: configuration.parameters.startingAbility,
          sem: 1.0,
          timestamp: new Date(),
          itemsUsed: 0,
        },
      ],
      administeredItems: [],
      remainingPool: availableQuestions.map((q) => q.id),
      sem: 1.0,
      reliability: 0.0,
      status: 'active',
      startTime: new Date(),
    };

    this.sessions.set(sessionId, session);
    this.initializeItemParameters(availableQuestions);
    this.setupContentConstraints(configuration.parameters.contentConstraints);

    this.emit('sessionStarted', session);
    return session;
  }

  async getNextItem(
    sessionId: UUID,
    configuration: CATConfiguration
  ): Promise<UUID | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error('Invalid or inactive CAT session');
    }

    // Check stopping criteria
    if (this.shouldTerminate(session, configuration.stoppingCriteria)) {
      session.status = 'completed';
      session.endTime = new Date();
      this.emit('sessionCompleted', session);
      return null;
    }

    // Select next item based on algorithm
    const nextItemId = await this.selectNextItem(
      session,
      configuration.itemSelection,
      configuration.parameters
    );

    if (!nextItemId) {
      session.status = 'terminated';
      session.endTime = new Date();
      this.emit('sessionTerminated', session, 'no_items');
      return null;
    }

    // Remove from remaining pool
    session.remainingPool = session.remainingPool.filter(
      (id) => id !== nextItemId
    );

    this.emit('itemSelected', session, nextItemId);
    return nextItemId;
  }

  async processResponse(
    sessionId: UUID,
    questionId: UUID,
    response: QuestionResponse,
    configuration: CATConfiguration
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error('Invalid or inactive CAT session');
    }

    const isCorrect = this.evaluateResponse(response);
    const responseTime = response.responseTime;

    // Calculate ability before this item
    const abilityBeforeItem = session.currentAbility;

    // Update ability estimate
    const newAbility = await this.updateAbilityEstimate(
      session,
      questionId,
      isCorrect,
      configuration.abilityEstimation,
      configuration.algorithm
    );

    // Calculate information value
    const informationValue = this.calculateInformation(
      questionId,
      newAbility,
      configuration.algorithm
    );

    // Create administered item record
    const administeredItem: AdministeredItem = {
      questionId,
      response: response.response,
      responseTime,
      isCorrect,
      abilityBeforeItem,
      abilityAfterItem: newAbility,
      informationValue,
      timestamp: new Date(),
    };

    session.administeredItems.push(administeredItem);
    session.currentAbility = newAbility;

    // Update SEM and reliability
    session.sem = this.calculateSEM(session, configuration.algorithm);
    session.reliability = this.calculateReliability(session);

    // Add to ability history
    session.abilityHistory.push({
      value: newAbility,
      sem: session.sem,
      timestamp: new Date(),
      itemsUsed: session.administeredItems.length,
    });

    // Update exposure rate
    this.updateExposureRate(questionId);

    this.emit('responseProcessed', session, administeredItem);
  }

  async terminateSession(sessionId: UUID, reason: string): Promise<CATResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'terminated';
    session.endTime = new Date();

    const result: CATResult = {
      finalAbility: session.currentAbility,
      sem: session.sem,
      reliability: session.reliability,
      questionsAdministered: session.administeredItems.length,
      totalTime: session.endTime.getTime() - session.startTime.getTime(),
      terminationReason: reason as any,
    };

    this.emit('sessionTerminated', session, reason);
    return result;
  }

  // ============================================================================
  // ITEM SELECTION ALGORITHMS
  // ============================================================================

  private async selectNextItem(
    session: CATSession,
    method: ItemSelectionMethod,
    parameters: CATParameters
  ): Promise<UUID | null> {
    const candidates = this.getEligibleItems(session, parameters);
    if (candidates.length === 0) {
      return null;
    }

    switch (method) {
      case ItemSelectionMethod.MAXIMUM_INFORMATION:
        return this.selectMaximumInformation(session, candidates);

      case ItemSelectionMethod.WEIGHTED_INFORMATION:
        return this.selectWeightedInformation(session, candidates, parameters);

      case ItemSelectionMethod.BAYESIAN:
        return this.selectBayesian(session, candidates);

      case ItemSelectionMethod.CONSTRAINT_BASED:
        return this.selectConstraintBased(session, candidates, parameters);

      default:
        return this.selectMaximumInformation(session, candidates);
    }
  }

  private getEligibleItems(
    session: CATSession,
    parameters: CATParameters
  ): UUID[] {
    let eligible = [...session.remainingPool];

    // Apply exposure control
    if (parameters.exposureControl !== ExposureControlMethod.NONE) {
      eligible = this.applyExposureControl(
        eligible,
        parameters.exposureControl
      );
    }

    // Apply content constraints
    eligible = this.applyContentConstraints(session, eligible);

    return eligible;
  }

  private selectMaximumInformation(
    session: CATSession,
    candidates: UUID[]
  ): UUID {
    let maxInfo = -1;
    let selectedItem = candidates[0];

    candidates.forEach((itemId) => {
      const info = this.calculateInformation(
        itemId,
        session.currentAbility,
        CATAlgorithm.IRT_2PL
      );
      if (info > maxInfo) {
        maxInfo = info;
        selectedItem = itemId;
      }
    });

    return selectedItem;
  }

  private selectWeightedInformation(
    session: CATSession,
    candidates: UUID[],
    parameters: CATParameters
  ): UUID {
    const weights: number[] = [];
    let totalWeight = 0;

    candidates.forEach((itemId) => {
      const info = this.calculateInformation(
        itemId,
        session.currentAbility,
        CATAlgorithm.IRT_2PL
      );
      const exposureAdjustment = this.getExposureAdjustment(itemId);
      const contentAdjustment = this.getContentAdjustment(session, itemId);

      const weight = info * exposureAdjustment * contentAdjustment;
      weights.push(weight);
      totalWeight += weight;
    });

    // Weighted random selection
    const random = Math.random() * totalWeight;
    let cumulative = 0;

    for (let i = 0; i < candidates.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return candidates[i];
      }
    }

    return candidates[candidates.length - 1];
  }

  private selectBayesian(session: CATSession, candidates: UUID[]): UUID {
    // Simplified Bayesian selection
    // In practice, this would use prior distributions and expected information gain
    return this.selectMaximumInformation(session, candidates);
  }

  private selectConstraintBased(
    session: CATSession,
    candidates: UUID[],
    parameters: CATParameters
  ): UUID {
    // First apply content constraints
    const constraintFiltered = this.applyContentConstraints(
      session,
      candidates
    );

    if (constraintFiltered.length === 0) {
      // Relax constraints if no items available
      return this.selectMaximumInformation(session, candidates);
    }

    return this.selectMaximumInformation(session, constraintFiltered);
  }

  // ============================================================================
  // ABILITY ESTIMATION
  // ============================================================================

  private async updateAbilityEstimate(
    session: CATSession,
    questionId: UUID,
    isCorrect: boolean,
    method: AbilityEstimationMethod,
    algorithm: CATAlgorithm
  ): Promise<number> {
    switch (method) {
      case AbilityEstimationMethod.MLE:
        return this.estimateAbilityMLE(
          session,
          questionId,
          isCorrect,
          algorithm
        );

      case AbilityEstimationMethod.WLE:
        return this.estimateAbilityWLE(
          session,
          questionId,
          isCorrect,
          algorithm
        );

      case AbilityEstimationMethod.EAP:
        return this.estimateAbilityEAP(
          session,
          questionId,
          isCorrect,
          algorithm
        );

      case AbilityEstimationMethod.MAP:
        return this.estimateAbilityMAP(
          session,
          questionId,
          isCorrect,
          algorithm
        );

      default:
        return this.estimateAbilityMLE(
          session,
          questionId,
          isCorrect,
          algorithm
        );
    }
  }

  private estimateAbilityMLE(
    session: CATSession,
    questionId: UUID,
    isCorrect: boolean,
    algorithm: CATAlgorithm
  ): number {
    // Maximum Likelihood Estimation using Newton-Raphson
    let ability = session.currentAbility;
    const maxIterations = 10;
    const tolerance = 0.001;

    for (let i = 0; i < maxIterations; i++) {
      const { logLikelihood, firstDerivative, secondDerivative } =
        this.calculateLikelihoodDerivatives(
          session,
          questionId,
          isCorrect,
          ability,
          algorithm
        );

      if (Math.abs(firstDerivative) < tolerance) {
        break;
      }

      const delta = -firstDerivative / secondDerivative;
      ability += delta;

      // Constrain ability to reasonable range
      ability = Math.max(-6, Math.min(6, ability));
    }

    return ability;
  }

  private estimateAbilityWLE(
    session: CATSession,
    questionId: UUID,
    isCorrect: boolean,
    algorithm: CATAlgorithm
  ): number {
    // Weighted Likelihood Estimation (adds weight function to MLE)
    // For simplicity, use MLE with slight modification
    const mleEstimate = this.estimateAbilityMLE(
      session,
      questionId,
      isCorrect,
      algorithm
    );

    // Apply weight function (simplified)
    const weight = this.calculateWeightFunction(session, mleEstimate);
    return mleEstimate * weight;
  }

  private estimateAbilityEAP(
    session: CATSession,
    questionId: UUID,
    isCorrect: boolean,
    algorithm: CATAlgorithm
  ): number {
    // Expected A Posteriori estimation
    const numQuadraturePoints = 41;
    const minAbility = -6;
    const maxAbility = 6;
    const step = (maxAbility - minAbility) / (numQuadraturePoints - 1);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < numQuadraturePoints; i++) {
      const ability = minAbility + i * step;
      const likelihood = this.calculateLikelihood(
        session,
        questionId,
        isCorrect,
        ability,
        algorithm
      );
      const prior = this.calculatePrior(ability);
      const posterior = likelihood * prior;

      numerator += ability * posterior;
      denominator += posterior;
    }

    return denominator > 0 ? numerator / denominator : session.currentAbility;
  }

  private estimateAbilityMAP(
    session: CATSession,
    questionId: UUID,
    isCorrect: boolean,
    algorithm: CATAlgorithm
  ): number {
    // Maximum A Posteriori estimation
    let maxPosterior = -Infinity;
    let mapEstimate = session.currentAbility;

    const numPoints = 61;
    const minAbility = -6;
    const maxAbility = 6;
    const step = (maxAbility - minAbility) / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const ability = minAbility + i * step;
      const likelihood = this.calculateLikelihood(
        session,
        questionId,
        isCorrect,
        ability,
        algorithm
      );
      const prior = this.calculatePrior(ability);
      const posterior = likelihood * prior;

      if (posterior > maxPosterior) {
        maxPosterior = posterior;
        mapEstimate = ability;
      }
    }

    return mapEstimate;
  }

  // ============================================================================
  // IRT CALCULATIONS
  // ============================================================================

  private calculateProbability(
    questionId: UUID,
    ability: number,
    algorithm: CATAlgorithm
  ): number {
    const params = this.itemParameters.get(questionId);
    if (!params) {
      return 0.5; // Default probability
    }

    const { a, b, c, d } = params;

    switch (algorithm) {
      case CATAlgorithm.IRT_1PL:
        // Rasch Model
        return Math.exp(ability - b) / (1 + Math.exp(ability - b));

      case CATAlgorithm.IRT_2PL:
        // 2-Parameter Logistic
        return Math.exp(a * (ability - b)) / (1 + Math.exp(a * (ability - b)));

      case CATAlgorithm.IRT_3PL:
        // 3-Parameter Logistic
        return (
          c +
          (1 - c) *
            (Math.exp(a * (ability - b)) / (1 + Math.exp(a * (ability - b))))
        );

      case CATAlgorithm.GPCM:
      case CATAlgorithm.GRM:
        // For polytomous models, return probability for highest category
        // This is simplified - real implementation would handle all categories
        return Math.exp(a * (ability - b)) / (1 + Math.exp(a * (ability - b)));

      default:
        return 0.5;
    }
  }

  private calculateInformation(
    questionId: UUID,
    ability: number,
    algorithm: CATAlgorithm
  ): number {
    const params = this.itemParameters.get(questionId);
    if (!params) {
      return 0;
    }

    const { a, c } = params;
    const prob = this.calculateProbability(questionId, ability, algorithm);

    switch (algorithm) {
      case CATAlgorithm.IRT_1PL:
        return prob * (1 - prob);

      case CATAlgorithm.IRT_2PL:
        return a * a * prob * (1 - prob);

      case CATAlgorithm.IRT_3PL:
        const numerator = a * a * (prob - c) * (prob - c) * (1 - prob);
        const denominator = prob * (1 - c) * (1 - c);
        return denominator > 0 ? numerator / denominator : 0;

      default:
        return a * a * prob * (1 - prob);
    }
  }

  private calculateLikelihood(
    session: CATSession,
    questionId: UUID,
    isCorrect: boolean,
    ability: number,
    algorithm: CATAlgorithm
  ): number {
    let likelihood = 1;

    // Calculate likelihood for all administered items including the new one
    const allItems = [...session.administeredItems];
    allItems.push({
      questionId,
      response: isCorrect,
      responseTime: 0,
      isCorrect,
      abilityBeforeItem: ability,
      abilityAfterItem: ability,
      informationValue: 0,
      timestamp: new Date(),
    });

    allItems.forEach((item) => {
      const prob = this.calculateProbability(
        item.questionId,
        ability,
        algorithm
      );
      likelihood *= item.isCorrect ? prob : 1 - prob;
    });

    return likelihood;
  }

  private calculateLikelihoodDerivatives(
    session: CATSession,
    questionId: UUID,
    isCorrect: boolean,
    ability: number,
    algorithm: CATAlgorithm
  ): {
    logLikelihood: number;
    firstDerivative: number;
    secondDerivative: number;
  } {
    let logLikelihood = 0;
    let firstDerivative = 0;
    let secondDerivative = 0;

    const allItems = [...session.administeredItems];
    allItems.push({
      questionId,
      response: isCorrect,
      responseTime: 0,
      isCorrect,
      abilityBeforeItem: ability,
      abilityAfterItem: ability,
      informationValue: 0,
      timestamp: new Date(),
    });

    allItems.forEach((item) => {
      const params = this.itemParameters.get(item.questionId);
      if (!params) return;

      const { a, b, c } = params;
      const prob = this.calculateProbability(
        item.questionId,
        ability,
        algorithm
      );

      // Log-likelihood
      logLikelihood += item.isCorrect ? Math.log(prob) : Math.log(1 - prob);

      // First derivative
      const probDerivative = this.calculateProbabilityDerivative(
        item.questionId,
        ability,
        algorithm
      );
      if (item.isCorrect) {
        firstDerivative += probDerivative / prob;
      } else {
        firstDerivative -= probDerivative / (1 - prob);
      }

      // Second derivative (simplified)
      const info = this.calculateInformation(
        item.questionId,
        ability,
        algorithm
      );
      secondDerivative -= info;
    });

    return { logLikelihood, firstDerivative, secondDerivative };
  }

  private calculateProbabilityDerivative(
    questionId: UUID,
    ability: number,
    algorithm: CATAlgorithm
  ): number {
    const params = this.itemParameters.get(questionId);
    if (!params) return 0;

    const { a, b, c } = params;
    const prob = this.calculateProbability(questionId, ability, algorithm);

    switch (algorithm) {
      case CATAlgorithm.IRT_1PL:
        return prob * (1 - prob);

      case CATAlgorithm.IRT_2PL:
        return a * prob * (1 - prob);

      case CATAlgorithm.IRT_3PL:
        return (a * (1 - c) * prob * (1 - prob)) / (1 - c * (1 - prob));

      default:
        return a * prob * (1 - prob);
    }
  }

  private calculatePrior(ability: number): number {
    // Standard normal prior N(0,1)
    const variance = 1;
    const mean = 0;

    return (
      Math.exp(-0.5 * Math.pow((ability - mean) / Math.sqrt(variance), 2)) /
      Math.sqrt(2 * Math.PI * variance)
    );
  }

  private calculateWeightFunction(
    session: CATSession,
    ability: number
  ): number {
    // Weight function for WLE (simplified)
    const information = session.administeredItems.reduce((sum, item) => {
      return (
        sum +
        this.calculateInformation(
          item.questionId,
          ability,
          CATAlgorithm.IRT_2PL
        )
      );
    }, 0);

    return Math.sqrt(information) / (Math.sqrt(information) + 1);
  }

  // ============================================================================
  // STOPPING CRITERIA
  // ============================================================================

  private shouldTerminate(
    session: CATSession,
    criteria: CATStoppingCriteria
  ): boolean {
    // Maximum questions reached
    if (session.administeredItems.length >= criteria.maxQuestions) {
      return true;
    }

    // Minimum questions not yet reached
    if (session.administeredItems.length < criteria.minQuestions) {
      return false;
    }

    // SEM criterion
    if (session.sem <= criteria.maxSEM) {
      return true;
    }

    // Reliability criterion
    if (session.reliability >= criteria.minReliability) {
      return true;
    }

    // Time limit criterion
    if (criteria.timeLimit) {
      const elapsed = Date.now() - session.startTime.getTime();
      if (elapsed >= criteria.timeLimit * 60 * 1000) {
        // Convert minutes to ms
        return true;
      }
    }

    return false;
  }

  // ============================================================================
  // EXPOSURE CONTROL
  // ============================================================================

  private applyExposureControl(
    candidates: UUID[],
    method: ExposureControlMethod
  ): UUID[] {
    switch (method) {
      case ExposureControlMethod.SYMPSON_HETTER:
        return this.applySympsonHetter(candidates);

      case ExposureControlMethod.RANDOMESQUE:
        return this.applyRandomesque(candidates);

      case ExposureControlMethod.PROGRESSIVE:
        return this.applyProgressive(candidates);

      default:
        return candidates;
    }
  }

  private applySympsonHetter(candidates: UUID[]): UUID[] {
    // Sympson-Hetter exposure control
    const maxExposureRate = 0.3;

    return candidates.filter((itemId) => {
      const exposureRate = this.exposureRates.get(itemId) || 0;
      return exposureRate < maxExposureRate;
    });
  }

  private applyRandomesque(candidates: UUID[]): UUID[] {
    // Randomesque exposure control
    const poolSize = Math.min(5, candidates.length);

    // Select top items by information, then randomly choose from them
    const sorted = candidates.sort((a, b) => {
      const infoA = this.calculateInformation(a, 0, CATAlgorithm.IRT_2PL); // Use neutral ability
      const infoB = this.calculateInformation(b, 0, CATAlgorithm.IRT_2PL);
      return infoB - infoA;
    });

    return sorted.slice(0, poolSize);
  }

  private applyProgressive(candidates: UUID[]): UUID[] {
    // Progressive exposure control
    // Items with lower exposure rates are preferred
    return candidates.sort((a, b) => {
      const exposureA = this.exposureRates.get(a) || 0;
      const exposureB = this.exposureRates.get(b) || 0;
      return exposureA - exposureB;
    });
  }

  private updateExposureRate(questionId: UUID): void {
    const current = this.exposureRates.get(questionId) || 0;
    this.exposureRates.set(questionId, current + 1);
  }

  private getExposureAdjustment(questionId: UUID): number {
    const exposureRate = this.exposureRates.get(questionId) || 0;
    const maxRate = Math.max(...Array.from(this.exposureRates.values()));

    if (maxRate === 0) return 1;

    // Items with lower exposure get higher weights
    return 1 - (exposureRate / maxRate) * 0.5;
  }

  // ============================================================================
  // CONTENT CONSTRAINTS
  // ============================================================================

  private setupContentConstraints(constraints: ContentConstraint[]): void {
    this.contentConstraints.clear();
    constraints.forEach((constraint) => {
      this.contentConstraints.set(constraint.category, constraint);
    });
  }

  private applyContentConstraints(
    session: CATSession,
    candidates: UUID[]
  ): UUID[] {
    if (this.contentConstraints.size === 0) {
      return candidates;
    }

    // Count current content distribution
    const currentCounts = this.getCurrentContentCounts(session);

    // Filter candidates based on constraints
    return candidates.filter((itemId) => {
      return this.satisfiesContentConstraints(itemId, currentCounts);
    });
  }

  private getCurrentContentCounts(session: CATSession): Record<string, number> {
    const counts: Record<string, number> = {};

    // Initialize counts
    this.contentConstraints.forEach((constraint, category) => {
      counts[category] = 0;
    });

    // Count administered items
    session.administeredItems.forEach((item) => {
      const category = this.getItemCategory(item.questionId);
      if (category && counts[category] !== undefined) {
        counts[category]++;
      }
    });

    return counts;
  }

  private satisfiesContentConstraints(
    itemId: UUID,
    currentCounts: Record<string, number>
  ): boolean {
    const category = this.getItemCategory(itemId);
    if (!category) return true;

    const constraint = this.contentConstraints.get(category);
    if (!constraint) return true;

    const currentCount = currentCounts[category] || 0;
    return currentCount < constraint.maxItems;
  }

  private getItemCategory(questionId: UUID): string | null {
    // In practice, this would look up the question's category
    // For now, return a placeholder
    return 'general';
  }

  private getContentAdjustment(session: CATSession, itemId: UUID): number {
    const category = this.getItemCategory(itemId);
    if (!category) return 1;

    const constraint = this.contentConstraints.get(category);
    if (!constraint) return 1;

    const currentCounts = this.getCurrentContentCounts(session);
    const currentCount = currentCounts[category] || 0;
    const target = constraint.minItems;

    // Boost items from under-represented categories
    if (currentCount < target) {
      return 1 + constraint.weight;
    }

    return 1;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private calculateSEM(session: CATSession, algorithm: CATAlgorithm): number {
    const totalInformation = session.administeredItems.reduce((sum, item) => {
      return (
        sum +
        this.calculateInformation(
          item.questionId,
          session.currentAbility,
          algorithm
        )
      );
    }, 0);

    return totalInformation > 0 ? 1 / Math.sqrt(totalInformation) : 1;
  }

  private calculateReliability(session: CATSession): number {
    const sem = session.sem;
    return 1 - sem * sem;
  }

  private evaluateResponse(response: QuestionResponse): boolean {
    // This would integrate with the grading service
    // For now, return a placeholder
    return Math.random() > 0.5;
  }

  private initializeDefaultParameters(): void {
    // Initialize with some default IRT parameters
    // In practice, these would be calibrated from real data
  }

  private initializeItemParameters(questions: Question[]): void {
    questions.forEach((question) => {
      if (!this.itemParameters.has(question.id)) {
        // Generate default parameters based on question characteristics
        const params = this.generateDefaultIRTParameters(question);
        this.itemParameters.set(question.id, params);
      }
    });
  }

  private generateDefaultIRTParameters(question: Question): IRTParameters {
    // Generate reasonable default parameters based on question characteristics
    const difficulty = question.difficulty;

    // Map difficulty level to b parameter
    let b: number;
    switch (difficulty) {
      case DifficultyLevel.VERY_EASY:
        b = -2;
        break;
      case DifficultyLevel.EASY:
        b = -1;
        break;
      case DifficultyLevel.MEDIUM:
        b = 0;
        break;
      case DifficultyLevel.HARD:
        b = 1;
        break;
      case DifficultyLevel.VERY_HARD:
        b = 2;
        break;
      default:
        b = 0;
    }

    // Default discrimination (can be adjusted based on question type)
    const a = 1.0 + Math.random() * 0.5; // 1.0 to 1.5

    // Default guessing parameter
    const c = question.content.type === 'multiple-choice' ? 0.2 : 0.1;

    return { a, b, c };
  }

  private generateId(): UUID {
    return require('crypto').randomUUID();
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  getSession(sessionId: UUID): CATSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllSessions(): CATSession[] {
    return Array.from(this.sessions.values());
  }

  getSessionsByParticipant(participantId: UUID): CATSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.participantId === participantId
    );
  }

  getSessionsByAssessment(assessmentId: UUID): CATSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.assessmentId === assessmentId
    );
  }

  updateItemParameters(questionId: UUID, parameters: IRTParameters): void {
    this.itemParameters.set(questionId, parameters);
    this.emit('parametersUpdated', questionId, parameters);
  }

  getItemParameters(questionId: UUID): IRTParameters | null {
    return this.itemParameters.get(questionId) || null;
  }

  getExposureRates(): Map<UUID, number> {
    return new Map(this.exposureRates);
  }

  resetExposureRates(): void {
    this.exposureRates.clear();
    this.emit('exposureRatesReset');
  }
}
