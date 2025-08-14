"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCollabService = void 0;
class InMemoryCollabService {
    constructor() {
        this.workflows = new Map();
        this.authors = new Map();
        this.sectionLocks = new Map();
        this.activities = new Map();
        this.comments = new Map();
    }
    async submitForReview(courseId, by) {
        const wf = {
            courseId,
            state: 'awaiting-approval',
            approvers: [],
            history: [{ by, action: 'submit', at: new Date() }],
        };
        this.workflows.set(courseId, wf);
        await this.logActivity(courseId, {
            id: crypto.randomUUID(),
            type: 'review_submitted',
            userId: by,
            timestamp: new Date(),
            data: {}
        });
        return wf;
    }
    async approve(courseId, by, comment) {
        const wf = this.workflows.get(courseId);
        if (!wf)
            throw new Error('Workflow not found');
        wf.state = 'approved';
        wf.history.push({ by, action: 'approve', comment, at: new Date() });
        await this.logActivity(courseId, {
            id: crypto.randomUUID(),
            type: 'course_approved',
            userId: by,
            timestamp: new Date(),
            data: { comment }
        });
    }
    async requestChanges(courseId, by, comment) {
        const wf = this.workflows.get(courseId);
        if (!wf)
            throw new Error('Workflow not found');
        wf.state = 'changes-requested';
        wf.history.push({ by, action: 'request-changes', comment, at: new Date() });
        await this.logActivity(courseId, {
            id: crypto.randomUUID(),
            type: 'changes_requested',
            userId: by,
            timestamp: new Date(),
            data: { comment }
        });
    }
    // Multi-author collaboration methods
    async assignAuthor(courseId, authorId, role) {
        const authors = this.authors.get(courseId) || [];
        const filtered = authors.filter(a => a.authorId !== authorId);
        const assignment = {
            courseId,
            authorId,
            role,
            assignedAt: new Date(),
            permissions: this.getPermissionsForRole(role)
        };
        filtered.push(assignment);
        this.authors.set(courseId, filtered);
        await this.logActivity(courseId, {
            id: crypto.randomUUID(),
            type: 'author_assigned',
            userId: authorId,
            timestamp: new Date(),
            data: { role }
        });
    }
    async removeAuthor(courseId, authorId) {
        const authors = this.authors.get(courseId) || [];
        const filtered = authors.filter(a => a.authorId !== authorId);
        this.authors.set(courseId, filtered);
        await this.logActivity(courseId, {
            id: crypto.randomUUID(),
            type: 'author_removed',
            userId: authorId,
            timestamp: new Date(),
            data: {}
        });
    }
    async getAuthors(courseId) {
        return this.authors.get(courseId) || [];
    }
    async lockSection(courseId, sectionId, authorId) {
        const locks = this.sectionLocks.get(courseId) || [];
        // Check if section is already locked
        const existingLock = locks.find(l => l.sectionId === sectionId && !l.releasedAt);
        if (existingLock) {
            throw new Error(`Section is already locked by ${existingLock.authorId}`);
        }
        const lock = {
            id: crypto.randomUUID(),
            courseId,
            sectionId,
            authorId,
            lockedAt: new Date(),
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
        };
        locks.push(lock);
        this.sectionLocks.set(courseId, locks);
        await this.logActivity(courseId, {
            id: crypto.randomUUID(),
            type: 'section_locked',
            userId: authorId,
            timestamp: new Date(),
            data: { sectionId }
        });
        return lock;
    }
    async unlockSection(courseId, sectionId, authorId) {
        const locks = this.sectionLocks.get(courseId) || [];
        const lock = locks.find(l => l.sectionId === sectionId &&
            l.authorId === authorId &&
            !l.releasedAt);
        if (!lock) {
            throw new Error('No active lock found for this section and author');
        }
        lock.releasedAt = new Date();
        await this.logActivity(courseId, {
            id: crypto.randomUUID(),
            type: 'section_unlocked',
            userId: authorId,
            timestamp: new Date(),
            data: { sectionId }
        });
    }
    async getSectionLocks(courseId) {
        const locks = this.sectionLocks.get(courseId) || [];
        const now = new Date();
        return locks.filter(lock => !lock.releasedAt &&
            (!lock.expiresAt || lock.expiresAt > now));
    }
    async getActivityFeed(courseId, limit = 50) {
        const activities = this.activities.get(courseId) || [];
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async addComment(courseId, userId, comment, section) {
        const comments = this.comments.get(courseId) || [];
        const newComment = {
            id: crypto.randomUUID(),
            courseId,
            userId,
            content: comment,
            section,
            timestamp: new Date(),
            resolved: false
        };
        comments.push(newComment);
        this.comments.set(courseId, comments);
        await this.logActivity(courseId, {
            id: crypto.randomUUID(),
            type: 'comment_added',
            userId,
            timestamp: new Date(),
            data: { comment, section }
        });
    }
    async getCollaborationStats(courseId) {
        const authors = this.authors.get(courseId) || [];
        const activities = this.activities.get(courseId) || [];
        const comments = this.comments.get(courseId) || [];
        const locks = this.sectionLocks.get(courseId) || [];
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
            totalAuthors: authors.length,
            activeAuthors: this.getActiveAuthors(activities, weekAgo).length,
            totalComments: comments.length,
            unresolvedComments: comments.filter(c => !c.resolved).length,
            activeLocks: locks.filter(l => !l.releasedAt && (!l.expiresAt || l.expiresAt > now)).length,
            recentActivity: activities.filter(a => a.timestamp > weekAgo).length,
            lastActivity: activities.length > 0
                ? Math.max(...activities.map(a => a.timestamp.getTime()))
                : undefined
        };
    }
    // Private helper methods
    getPermissionsForRole(role) {
        const basePermissions = {
            canEdit: false,
            canReview: false,
            canApprove: false,
            canManageAuthors: false,
            canPublish: false,
            canDelete: false
        };
        switch (role) {
            case 'lead':
                return { ...basePermissions, canEdit: true, canReview: true, canApprove: true, canManageAuthors: true, canPublish: true, canDelete: true };
            case 'author':
                return { ...basePermissions, canEdit: true, canReview: true };
            case 'reviewer':
                return { ...basePermissions, canReview: true, canApprove: true };
            case 'contributor':
                return { ...basePermissions, canEdit: true };
            default:
                return basePermissions;
        }
    }
    async logActivity(courseId, activity) {
        const activities = this.activities.get(courseId) || [];
        activities.push(activity);
        this.activities.set(courseId, activities);
    }
    getActiveAuthors(activities, since) {
        const activeUserIds = new Set();
        activities
            .filter(a => a.timestamp > since)
            .forEach(a => activeUserIds.add(a.userId));
        return Array.from(activeUserIds);
    }
}
exports.InMemoryCollabService = InMemoryCollabService;
