import { ReviewWorkflow, UUID } from '../types';
export interface CollaborationService {
    submitForReview(courseId: UUID, by: string): Promise<ReviewWorkflow>;
    approve(courseId: UUID, by: string, comment?: string): Promise<void>;
    requestChanges(courseId: UUID, by: string, comment: string): Promise<void>;
    assignAuthor(courseId: UUID, authorId: string, role: AuthorRole): Promise<void>;
    removeAuthor(courseId: UUID, authorId: string): Promise<void>;
    getAuthors(courseId: UUID): Promise<AuthorAssignment[]>;
    lockSection(courseId: UUID, sectionId: string, authorId: string): Promise<SectionLock>;
    unlockSection(courseId: UUID, sectionId: string, authorId: string): Promise<void>;
    getSectionLocks(courseId: UUID): Promise<SectionLock[]>;
    getActivityFeed(courseId: UUID, limit?: number): Promise<ActivityEvent[]>;
    addComment(courseId: UUID, userId: string, comment: string, section?: string): Promise<void>;
    getCollaborationStats(courseId: UUID): Promise<CollaborationStats>;
}
export declare class InMemoryCollabService implements CollaborationService {
    private workflows;
    private authors;
    private sectionLocks;
    private activities;
    private comments;
    submitForReview(courseId: UUID, by: string): Promise<ReviewWorkflow>;
    approve(courseId: UUID, by: string, comment?: string): Promise<void>;
    requestChanges(courseId: UUID, by: string, comment: string): Promise<void>;
    assignAuthor(courseId: UUID, authorId: string, role: AuthorRole): Promise<void>;
    removeAuthor(courseId: UUID, authorId: string): Promise<void>;
    getAuthors(courseId: UUID): Promise<AuthorAssignment[]>;
    lockSection(courseId: UUID, sectionId: string, authorId: string): Promise<SectionLock>;
    unlockSection(courseId: UUID, sectionId: string, authorId: string): Promise<void>;
    getSectionLocks(courseId: UUID): Promise<SectionLock[]>;
    getActivityFeed(courseId: UUID, limit?: number): Promise<ActivityEvent[]>;
    addComment(courseId: UUID, userId: string, comment: string, section?: string): Promise<void>;
    getCollaborationStats(courseId: UUID): Promise<CollaborationStats>;
    private getPermissionsForRole;
    private logActivity;
    private getActiveAuthors;
}
export interface AuthorAssignment {
    courseId: UUID;
    authorId: string;
    role: AuthorRole;
    assignedAt: Date;
    permissions: AuthorPermissions;
}
export type AuthorRole = 'lead' | 'author' | 'reviewer' | 'contributor';
export interface AuthorPermissions {
    canEdit: boolean;
    canReview: boolean;
    canApprove: boolean;
    canManageAuthors: boolean;
    canPublish: boolean;
    canDelete: boolean;
}
export interface SectionLock {
    id: UUID;
    courseId: UUID;
    sectionId: string;
    authorId: string;
    lockedAt: Date;
    expiresAt?: Date;
    releasedAt?: Date;
}
export interface ActivityEvent {
    id: UUID;
    type: ActivityType;
    userId: string;
    timestamp: Date;
    data: Record<string, any>;
}
export type ActivityType = 'review_submitted' | 'review_approved' | 'changes_requested' | 'course_approved' | 'comment_added' | 'author_assigned' | 'author_removed' | 'section_locked' | 'section_unlocked' | 'content_updated' | 'course_published';
export interface Comment {
    id: UUID;
    courseId: UUID;
    userId: string;
    content: string;
    section?: string;
    timestamp: Date;
    resolved: boolean;
}
export interface CollaborationStats {
    totalAuthors: number;
    activeAuthors: number;
    totalComments: number;
    unresolvedComments: number;
    activeLocks: number;
    recentActivity: number;
    lastActivity?: number;
}
