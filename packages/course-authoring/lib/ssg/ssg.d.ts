import { SsgCourseRef, UUID, Course } from '../types';
export interface SsgSyncService {
    link(courseId: UUID, ssgId: string): Promise<SsgCourseRef>;
    sync(courseId: UUID): Promise<SsgSyncResult>;
    getStatus(courseId: UUID): Promise<SsgSyncStatus>;
    enableRealTimeSync(courseId: UUID, webhookUrl?: string): Promise<void>;
    disableRealTimeSync(courseId: UUID): Promise<void>;
    searchSsgCatalog(query: SsgSearchQuery): Promise<SsgCourseInfo[]>;
    importFromSsg(ssgId: string, mappingConfig?: FieldMapping): Promise<Course>;
    exportToSsg(courseId: UUID, publishConfig?: PublishConfig): Promise<SsgPublishResult>;
    detectConflicts(courseId: UUID): Promise<SsgConflict[]>;
    resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void>;
    getFieldMappings(): Promise<FieldMapping[]>;
    updateFieldMapping(mapping: FieldMapping): Promise<void>;
    validateSsgCompatibility(courseId: UUID): Promise<CompatibilityReport>;
}
export declare class InMemorySsgSyncService implements SsgSyncService {
    private links;
    private syncStatuses;
    private conflicts;
    private fieldMappings;
    private realTimeSyncs;
    private ssgCatalog;
    constructor();
    link(courseId: UUID, ssgId: string): Promise<SsgCourseRef>;
    sync(courseId: UUID): Promise<SsgSyncResult>;
    getStatus(courseId: UUID): Promise<SsgSyncStatus>;
    enableRealTimeSync(courseId: UUID, webhookUrl?: string): Promise<void>;
    disableRealTimeSync(courseId: UUID): Promise<void>;
    searchSsgCatalog(query: SsgSearchQuery): Promise<SsgCourseInfo[]>;
    importFromSsg(ssgId: string, mappingConfig?: FieldMapping): Promise<Course>;
    exportToSsg(courseId: UUID, publishConfig?: PublishConfig): Promise<SsgPublishResult>;
    detectConflicts(courseId: UUID): Promise<SsgConflict[]>;
    resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void>;
    getFieldMappings(): Promise<FieldMapping[]>;
    updateFieldMapping(mapping: FieldMapping): Promise<void>;
    validateSsgCompatibility(courseId: UUID): Promise<CompatibilityReport>;
    private initializeMockData;
    private performSync;
    private updateSyncStatus;
    private generateSlug;
    private getDefaultFieldMapping;
}
export interface SsgSyncResult {
    success: boolean;
    syncedAt: Date;
    duration: number;
    changesDetected: number;
    itemsSynced: number;
    conflicts: SsgConflict[];
    error?: string;
    details: {
        metadata: {
            synced: boolean;
            conflicts: number;
        };
        content: {
            synced: boolean;
            conflicts: number;
        };
        assessments: {
            synced: boolean;
            conflicts: number;
        };
        media: {
            synced: boolean;
            conflicts: number;
        };
    };
}
export interface SsgSyncStatus {
    courseId: UUID;
    ssgId: string;
    status: 'linked' | 'syncing' | 'synced' | 'error' | 'conflict';
    lastSync: Date;
    nextSync?: Date;
    conflicts: SsgConflict[];
    syncHistory: Array<{
        timestamp: Date;
        action: string;
        success: boolean;
        message: string;
        details?: any;
    }>;
}
export interface SsgSearchQuery {
    title?: string;
    category?: string;
    tags?: string[];
    author?: string;
    sortBy?: 'title' | 'updated' | 'popularity';
    page?: number;
    limit?: number;
}
export interface SsgCourseInfo {
    ssgId: string;
    title: string;
    description?: string;
    category: string;
    tags: string[];
    author: string;
    lastModified: Date;
    version: string;
    popularity?: number;
    customData?: Record<string, any>;
}
export interface PublishConfig {
    version?: string;
    validateBeforePublish?: boolean;
    publishDrafts?: boolean;
    notifySubscribers?: boolean;
    customMetadata?: Record<string, any>;
}
export interface SsgPublishResult {
    success: boolean;
    publishedAt: Date;
    ssgId: string;
    publishUrl?: string;
    version?: string;
    itemsPublished: number;
    warnings: string[];
    error?: string;
}
export interface SsgConflict {
    id: string;
    courseId: UUID;
    type: 'content' | 'metadata' | 'structure' | 'media';
    field: string;
    localValue: any;
    ssgValue: any;
    lastModified: {
        local: Date;
        ssg: Date;
    };
    severity: 'low' | 'medium' | 'high';
    description: string;
}
export interface ConflictResolution {
    strategy: 'use_local' | 'use_ssg' | 'merge' | 'manual';
    value?: any;
    mergeRules?: Record<string, any>;
}
export interface FieldMapping {
    id: string;
    name: string;
    description?: string;
    systemFields: {
        title: string;
        description: string;
        tags: string;
        author: string;
        status: string;
    };
    customFields: Array<{
        localField: string;
        ssgField: string;
        transform: 'direct' | 'function' | 'lookup';
        transformFunction?: string;
        lookupTable?: Record<string, any>;
    }>;
}
export interface CompatibilityReport {
    courseId: UUID;
    compatible: boolean;
    compatibilityScore: number;
    warnings: string[];
    errors: string[];
    recommendations: string[];
    checkedAt: Date;
    checks: {
        metadata: {
            passed: boolean;
            issues: string[];
        };
        content: {
            passed: boolean;
            issues: string[];
        };
        structure: {
            passed: boolean;
            issues: string[];
        };
        media: {
            passed: boolean;
            issues: string[];
        };
    };
}
