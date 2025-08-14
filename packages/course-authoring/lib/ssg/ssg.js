"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySsgSyncService = void 0;
class InMemorySsgSyncService {
    constructor() {
        this.links = new Map();
        this.syncStatuses = new Map();
        this.conflicts = new Map();
        this.fieldMappings = [];
        this.realTimeSyncs = new Set();
        this.ssgCatalog = new Map();
        this.initializeMockData();
    }
    async link(courseId, ssgId) {
        const ref = {
            ssgId,
            lastSyncAt: new Date(),
            metadata: {
                version: '1.0.0',
                syncStatus: 'linked',
                autoSync: false
            }
        };
        this.links.set(courseId, ref);
        // Initialize sync status
        this.syncStatuses.set(courseId, {
            courseId,
            ssgId,
            status: 'linked',
            lastSync: new Date(),
            nextSync: undefined,
            conflicts: [],
            syncHistory: [{
                    timestamp: new Date(),
                    action: 'linked',
                    success: true,
                    message: 'Course successfully linked to SSG'
                }]
        });
        return ref;
    }
    async sync(courseId) {
        const link = this.links.get(courseId);
        if (!link) {
            throw new Error('Course is not linked to SSG');
        }
        const startTime = new Date();
        try {
            // Simulate sync process
            await this.performSync(courseId, link.ssgId);
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            const result = {
                success: true,
                syncedAt: endTime,
                duration,
                changesDetected: Math.floor(Math.random() * 5) + 1,
                itemsSynced: Math.floor(Math.random() * 20) + 5,
                conflicts: [],
                details: {
                    metadata: { synced: true, conflicts: 0 },
                    content: { synced: true, conflicts: 0 },
                    assessments: { synced: true, conflicts: 0 },
                    media: { synced: true, conflicts: 0 }
                }
            };
            // Update sync status
            await this.updateSyncStatus(courseId, 'synced', result);
            // Update link metadata
            link.lastSyncAt = endTime;
            this.links.set(courseId, link);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                syncedAt: new Date(),
                duration: new Date().getTime() - startTime.getTime(),
                changesDetected: 0,
                itemsSynced: 0,
                conflicts: [],
                error: error instanceof Error ? error.message : 'Unknown sync error',
                details: {
                    metadata: { synced: false, conflicts: 0 },
                    content: { synced: false, conflicts: 0 },
                    assessments: { synced: false, conflicts: 0 },
                    media: { synced: false, conflicts: 0 }
                }
            };
            await this.updateSyncStatus(courseId, 'error', result);
            return result;
        }
    }
    async getStatus(courseId) {
        const status = this.syncStatuses.get(courseId);
        if (!status) {
            throw new Error('Course is not linked to SSG');
        }
        return status;
    }
    async enableRealTimeSync(courseId, webhookUrl) {
        const link = this.links.get(courseId);
        if (!link) {
            throw new Error('Course is not linked to SSG');
        }
        this.realTimeSyncs.add(courseId);
        // Update metadata
        link.metadata = {
            ...link.metadata,
            autoSync: true,
            webhookUrl
        };
        this.links.set(courseId, link);
        // Update sync status
        const status = this.syncStatuses.get(courseId);
        status.syncHistory.push({
            timestamp: new Date(),
            action: 'real_time_enabled',
            success: true,
            message: 'Real-time sync enabled'
        });
    }
    async disableRealTimeSync(courseId) {
        this.realTimeSyncs.delete(courseId);
        const link = this.links.get(courseId);
        if (link) {
            link.metadata = {
                ...link.metadata,
                autoSync: false,
                webhookUrl: undefined
            };
            this.links.set(courseId, link);
        }
        const status = this.syncStatuses.get(courseId);
        if (status) {
            status.syncHistory.push({
                timestamp: new Date(),
                action: 'real_time_disabled',
                success: true,
                message: 'Real-time sync disabled'
            });
        }
    }
    async searchSsgCatalog(query) {
        let results = Array.from(this.ssgCatalog.values());
        // Apply filters
        if (query.title) {
            const searchTerm = query.title.toLowerCase();
            results = results.filter(course => course.title.toLowerCase().includes(searchTerm) ||
                (course.description && course.description.toLowerCase().includes(searchTerm)));
        }
        if (query.category) {
            results = results.filter(course => course.category === query.category);
        }
        if (query.tags && query.tags.length > 0) {
            results = results.filter(course => query.tags.some(tag => course.tags.includes(tag)));
        }
        if (query.author) {
            results = results.filter(course => course.author === query.author);
        }
        // Apply sorting
        if (query.sortBy) {
            results.sort((a, b) => {
                switch (query.sortBy) {
                    case 'title':
                        return a.title.localeCompare(b.title);
                    case 'updated':
                        return b.lastModified.getTime() - a.lastModified.getTime();
                    case 'popularity':
                        return (b.popularity || 0) - (a.popularity || 0);
                    default:
                        return 0;
                }
            });
        }
        // Apply pagination
        const startIndex = ((query.page || 1) - 1) * (query.limit || 10);
        const endIndex = startIndex + (query.limit || 10);
        return results.slice(startIndex, endIndex);
    }
    async importFromSsg(ssgId, mappingConfig) {
        const ssgCourse = this.ssgCatalog.get(ssgId);
        if (!ssgCourse) {
            throw new Error(`SSG course not found: ${ssgId}`);
        }
        // Apply field mapping if provided
        const mapping = mappingConfig || this.getDefaultFieldMapping();
        const importedCourse = {
            id: crypto.randomUUID(),
            slug: this.generateSlug(ssgCourse.title),
            title: ssgCourse.title,
            description: ssgCourse.description,
            status: 'draft',
            version: '1.0.0',
            createdAt: new Date(),
            updatedAt: new Date(),
            authors: [ssgCourse.author],
            tags: ssgCourse.tags,
            templateId: undefined
        };
        // Apply custom field mappings
        if (mapping.customFields) {
            mapping.customFields.forEach(fieldMap => {
                if (ssgCourse.customData && ssgCourse.customData[fieldMap.ssgField]) {
                    // Apply custom field mapping logic here
                }
            });
        }
        // Link the imported course
        await this.link(importedCourse.id, ssgId);
        return importedCourse;
    }
    async exportToSsg(courseId, publishConfig) {
        const link = this.links.get(courseId);
        if (!link) {
            throw new Error('Course is not linked to SSG');
        }
        try {
            // Simulate export process
            const exportTime = new Date();
            const result = {
                success: true,
                publishedAt: exportTime,
                ssgId: link.ssgId,
                publishUrl: `https://ssg.example.com/courses/${link.ssgId}`,
                version: publishConfig?.version || '1.0.0',
                itemsPublished: Math.floor(Math.random() * 15) + 5,
                warnings: []
            };
            // Add warnings based on config
            if (publishConfig?.validateBeforePublish) {
                const validation = await this.validateSsgCompatibility(courseId);
                if (validation.warnings.length > 0) {
                    result.warnings = validation.warnings.slice(0, 3); // Limit warnings
                }
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                publishedAt: new Date(),
                ssgId: link.ssgId,
                error: error instanceof Error ? error.message : 'Export failed',
                itemsPublished: 0,
                warnings: []
            };
        }
    }
    async detectConflicts(courseId) {
        const status = this.syncStatuses.get(courseId);
        if (!status) {
            throw new Error('Course is not linked to SSG');
        }
        // Simulate conflict detection
        const conflicts = [];
        // Random chance of conflicts for demo
        if (Math.random() < 0.3) {
            conflicts.push({
                id: crypto.randomUUID(),
                courseId,
                type: 'content',
                field: 'title',
                localValue: 'Advanced JavaScript',
                ssgValue: 'JavaScript Fundamentals',
                lastModified: {
                    local: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    ssg: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                },
                severity: 'medium',
                description: 'Course title differs between local and SSG versions'
            });
        }
        if (Math.random() < 0.2) {
            conflicts.push({
                id: crypto.randomUUID(),
                courseId,
                type: 'metadata',
                field: 'tags',
                localValue: ['javascript', 'advanced', 'programming'],
                ssgValue: ['javascript', 'beginner'],
                lastModified: {
                    local: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    ssg: new Date(Date.now() - 3 * 60 * 60 * 1000)
                },
                severity: 'low',
                description: 'Tag mismatch between local and SSG versions'
            });
        }
        // Store conflicts for later resolution
        conflicts.forEach(conflict => {
            this.conflicts.set(conflict.id, conflict);
        });
        return conflicts;
    }
    async resolveConflict(conflictId, resolution) {
        const conflict = this.conflicts.get(conflictId);
        if (!conflict) {
            throw new Error('Conflict not found');
        }
        // Apply resolution based on strategy
        switch (resolution.strategy) {
            case 'use_local':
                // Keep local value, update SSG
                break;
            case 'use_ssg':
                // Update local with SSG value
                break;
            case 'merge':
                // Apply custom merge logic
                break;
            case 'manual':
                // Use provided value
                break;
        }
        // Record resolution in sync history
        const status = this.syncStatuses.get(conflict.courseId);
        if (status) {
            status.syncHistory.push({
                timestamp: new Date(),
                action: 'conflict_resolved',
                success: true,
                message: `Conflict resolved: ${conflict.field} using ${resolution.strategy}`
            });
        }
        // Remove resolved conflict
        this.conflicts.delete(conflictId);
    }
    async getFieldMappings() {
        return this.fieldMappings;
    }
    async updateFieldMapping(mapping) {
        const existingIndex = this.fieldMappings.findIndex(m => m.id === mapping.id);
        if (existingIndex >= 0) {
            this.fieldMappings[existingIndex] = mapping;
        }
        else {
            this.fieldMappings.push(mapping);
        }
    }
    async validateSsgCompatibility(courseId) {
        const warnings = [];
        const errors = [];
        const recommendations = [];
        // Simulate validation checks
        if (Math.random() < 0.3) {
            warnings.push('Course contains custom fields that may not map correctly to SSG');
        }
        if (Math.random() < 0.1) {
            errors.push('Course title exceeds SSG character limit');
        }
        if (Math.random() < 0.4) {
            recommendations.push('Consider adding more descriptive tags for better SSG categorization');
        }
        const compatibilityScore = Math.max(0, 100 - (errors.length * 25) - (warnings.length * 10));
        return {
            courseId,
            compatible: errors.length === 0,
            compatibilityScore,
            warnings,
            errors,
            recommendations,
            checkedAt: new Date(),
            checks: {
                metadata: { passed: true, issues: [] },
                content: { passed: warnings.length === 0, issues: warnings },
                structure: { passed: true, issues: [] },
                media: { passed: errors.length === 0, issues: errors }
            }
        };
    }
    // Private helper methods
    initializeMockData() {
        // Initialize mock SSG catalog
        const mockCourses = [
            {
                ssgId: 'ssg-course-1',
                title: 'Introduction to Web Development',
                description: 'Learn the basics of HTML, CSS, and JavaScript',
                category: 'Web Development',
                tags: ['html', 'css', 'javascript', 'beginner'],
                author: 'Jane Smith',
                lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                version: '2.1.0',
                popularity: 95,
                customData: {
                    difficulty: 'beginner',
                    duration: 120,
                    language: 'en'
                }
            },
            {
                ssgId: 'ssg-course-2',
                title: 'Advanced React Patterns',
                description: 'Deep dive into advanced React concepts and patterns',
                category: 'Frontend Development',
                tags: ['react', 'javascript', 'advanced', 'patterns'],
                author: 'John Doe',
                lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                version: '1.5.0',
                popularity: 87,
                customData: {
                    difficulty: 'advanced',
                    duration: 240,
                    language: 'en'
                }
            }
        ];
        mockCourses.forEach(course => {
            this.ssgCatalog.set(course.ssgId, course);
        });
        // Initialize default field mappings
        this.fieldMappings = [
            {
                id: 'default-mapping',
                name: 'Default SSG Mapping',
                description: 'Standard field mapping for SSG integration',
                systemFields: {
                    title: 'title',
                    description: 'description',
                    tags: 'keywords',
                    author: 'created_by',
                    status: 'publication_status'
                },
                customFields: [
                    {
                        localField: 'difficulty',
                        ssgField: 'skill_level',
                        transform: 'direct'
                    },
                    {
                        localField: 'estimatedDuration',
                        ssgField: 'duration_minutes',
                        transform: 'direct'
                    }
                ]
            }
        ];
    }
    async performSync(courseId, ssgId) {
        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        // Random chance of conflict for demo purposes
        if (Math.random() < 0.2) {
            await this.detectConflicts(courseId);
        }
    }
    async updateSyncStatus(courseId, status, result) {
        const syncStatus = this.syncStatuses.get(courseId);
        if (!syncStatus)
            return;
        syncStatus.status = status;
        syncStatus.lastSync = result.syncedAt;
        syncStatus.conflicts = result.conflicts || [];
        syncStatus.syncHistory.push({
            timestamp: result.syncedAt,
            action: 'sync',
            success: result.success,
            message: result.success ?
                `Sync completed: ${result.itemsSynced} items synced` :
                `Sync failed: ${result.error}`,
            details: result.details
        });
        // Schedule next sync if real-time is enabled
        if (this.realTimeSyncs.has(courseId)) {
            syncStatus.nextSync = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        }
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    getDefaultFieldMapping() {
        return this.fieldMappings[0] || {
            id: 'default',
            name: 'Default Mapping',
            description: 'Default field mapping',
            systemFields: {
                title: 'title',
                description: 'description',
                tags: 'tags',
                author: 'author',
                status: 'status'
            },
            customFields: []
        };
    }
}
exports.InMemorySsgSyncService = InMemorySsgSyncService;
