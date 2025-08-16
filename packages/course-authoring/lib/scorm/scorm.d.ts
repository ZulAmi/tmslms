/**
 * Full SCORM Service Implementation
 * Complete SCORM 1.2 and 2004 package validation and processing
 */
/// <reference types="node" />
/// <reference types="node" />
import { ScormPackageMeta } from '../types';
export interface ScormService {
  package(
    zipBytes: Buffer,
    opts?: {
      version?: '1.2' | '2004';
    }
  ): Promise<ScormPackageMeta>;
  validate(manifestXml: string): Promise<{
    valid: boolean;
    errors: string[];
  }>;
  extractContent(zipBytes: Buffer): Promise<ScormContent>;
  validateSequencing(manifestXml: string): Promise<SequencingValidationResult>;
  extractMetadata(manifestXml: string): Promise<ScormMetadata>;
}
export interface ScormContent {
  manifest: string;
  resources: ScormResource[];
  organizations: ScormOrganization[];
  metadata?: ScormMetadata;
}
export interface ScormResource {
  identifier: string;
  type: string;
  href?: string;
  files: ScormFile[];
  dependencies: string[];
  metadata?: any;
}
export interface ScormFile {
  href: string;
  content: Buffer;
  mimeType: string;
}
export interface ScormOrganization {
  identifier: string;
  title: string;
  items: ScormItem[];
  objectives?: ScormObjective[];
  sequencing?: SequencingInfo;
}
export interface ScormItem {
  identifier: string;
  title: string;
  identifierref?: string;
  children: ScormItem[];
  prerequisites?: string;
  maxtimeallowed?: string;
  timelimitaction?: string;
  datafromlms?: string;
  masteryscore?: number;
  objectives?: ScormObjective[];
  sequencing?: SequencingInfo;
}
export interface ScormObjective {
  id: string;
  primary?: boolean;
  satisfiedByMeasure?: boolean;
  minNormalizedMeasure?: number;
}
export interface SequencingInfo {
  controlMode?: {
    choice?: boolean;
    choiceExit?: boolean;
    flow?: boolean;
    forwardOnly?: boolean;
  };
  sequencingRules?: SequencingRule[];
  limitConditions?: LimitConditions;
  auxiliaryResources?: AuxiliaryResource[];
}
export interface SequencingRule {
  type: 'precondition' | 'postcondition' | 'exit';
  conditions: SequencingCondition[];
  action: string;
}
export interface SequencingCondition {
  type:
    | 'satisfied'
    | 'objectiveStatusKnown'
    | 'objectiveMeasureKnown'
    | 'completed'
    | 'activityProgressKnown'
    | 'attempted'
    | 'attemptLimitExceeded'
    | 'timeLimitExceeded'
    | 'outsideAvailableTimeRange';
  operator: 'noOp' | 'not';
  referencedObjective?: string;
  measureThreshold?: number;
}
export interface LimitConditions {
  attemptLimit?: number;
  attemptAbsoluteDurationLimit?: string;
  attemptExperiencedDurationLimit?: string;
  activityAbsoluteDurationLimit?: string;
  activityExperiencedDurationLimit?: string;
  beginTimeLimit?: string;
  endTimeLimit?: string;
}
export interface AuxiliaryResource {
  id: string;
  purpose:
    | 'suspendAll'
    | 'abandonAll'
    | 'abandonParent'
    | 'continueParent'
    | 'forwardOnly';
  resourceIdentifier: string;
}
export interface ScormMetadata {
  general?: {
    identifier?: string;
    title?: string;
    language?: string;
    description?: string;
    keyword?: string[];
    coverage?: string;
    aggregationLevel?: number;
  };
  lifecycle?: {
    version?: string;
    status?: string;
    contribute?: ContributeInfo[];
  };
  technical?: {
    format?: string[];
    size?: number;
    location?: string;
    requirement?: TechnicalRequirement[];
    installationRemarks?: string;
    otherPlatformRequirements?: string;
    duration?: string;
  };
  educational?: {
    interactivityType?: 'active' | 'expositive' | 'mixed';
    learningResourceType?: string[];
    interactivityLevel?: number;
    semanticDensity?: number;
    intendedEndUserRole?: string[];
    context?: string[];
    typicalAgeRange?: string[];
    difficulty?: number;
    typicalLearningTime?: string;
    description?: string;
    language?: string[];
  };
  rights?: {
    cost?: boolean;
    copyrightAndOtherRestrictions?: boolean;
    description?: string;
  };
  classification?: ClassificationInfo[];
}
export interface ContributeInfo {
  role: string;
  entity: string[];
  date: string;
}
export interface TechnicalRequirement {
  orComposite: {
    type: string;
    name: string;
    minimumVersion?: string;
    maximumVersion?: string;
  }[];
}
export interface ClassificationInfo {
  purpose: string;
  description?: string;
  keyword?: string[];
}
export interface SequencingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sequencingInfo?: SequencingInfo;
}
export declare class FullScormService implements ScormService {
  private static readonly MIME_TYPE_MAP;
  /**
   * Package SCORM content with full validation and processing
   */
  package(
    zipBytes: Buffer,
    opts?: {
      version?: '1.2' | '2004';
    }
  ): Promise<ScormPackageMeta>;
  /**
   * Comprehensive SCORM manifest validation using XML parsing
   */
  validate(manifestXml: string): Promise<{
    valid: boolean;
    errors: string[];
  }>;
  /**
   * Extract full SCORM content from package
   */
  extractContent(zipBytes: Buffer): Promise<ScormContent>;
  /**
   * Validate SCORM 2004 sequencing and navigation
   */
  validateSequencing(manifestXml: string): Promise<SequencingValidationResult>;
  /**
   * Extract comprehensive metadata from manifest
   */
  extractMetadata(manifestXml: string): Promise<ScormMetadata>;
  private extractOrganizations;
  private extractItems;
  private extractResources;
  private getMimeType;
}
export declare function createFullScormService(): ScormService;
export { FullScormService as SimpleScormService };
