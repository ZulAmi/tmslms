import { ReviewWorkflow, UUID } from '../types';

export interface CollaborationService {
  submitForReview(courseId: UUID, by: string): Promise<ReviewWorkflow>;
  approve(courseId: UUID, by: string, comment?: string): Promise<void>;
  requestChanges(courseId: UUID, by: string, comment: string): Promise<void>;
  
  // Multi-author collaboration
  assignAuthor(courseId: UUID, authorId: string, role: AuthorRole): Promise<void>;
  removeAuthor(courseId: UUID, authorId: string): Promise<void>;
  getAuthors(courseId: UUID): Promise<AuthorAssignment[]>;
  lockSection(courseId: UUID, sectionId: string, authorId: string): Promise<SectionLock>;
  unlockSection(courseId: UUID, sectionId: string, authorId: string): Promise<void>;
  getSectionLocks(courseId: UUID): Promise<SectionLock[]>;
  
  // Activity tracking and notifications
  getActivityFeed(courseId: UUID, limit?: number): Promise<ActivityEvent[]>;
  addComment(courseId: UUID, userId: string, comment: string, section?: string): Promise<void>;
  getCollaborationStats(courseId: UUID): Promise<CollaborationStats>;
}

export class InMemoryCollabService implements CollaborationService {
  private workflows: Map<UUID, ReviewWorkflow> = new Map();
  private authors: Map<UUID, AuthorAssignment[]> = new Map();
  private sectionLocks: Map<UUID, SectionLock[]> = new Map();
  private activities: Map<UUID, ActivityEvent[]> = new Map();
  private comments: Map<UUID, Comment[]> = new Map();

  async submitForReview(courseId: UUID, by: string): Promise<ReviewWorkflow> {
    const wf: ReviewWorkflow = {
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

  async approve(courseId: UUID, by: string, comment?: string): Promise<void> {
    const wf = this.workflows.get(courseId);
    if (!wf) throw new Error('Workflow not found');
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

  async requestChanges(courseId: UUID, by: string, comment: string): Promise<void> {
    const wf = this.workflows.get(courseId);
    if (!wf) throw new Error('Workflow not found');
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
  async assignAuthor(courseId: UUID, authorId: string, role: AuthorRole): Promise<void> {
    const authors = this.authors.get(courseId) || [];
    const filtered = authors.filter(a => a.authorId !== authorId);
    
    const assignment: AuthorAssignment = {
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

  async removeAuthor(courseId: UUID, authorId: string): Promise<void> {
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

  async getAuthors(courseId: UUID): Promise<AuthorAssignment[]> {
    return this.authors.get(courseId) || [];
  }

  async lockSection(courseId: UUID, sectionId: string, authorId: string): Promise<SectionLock> {
    const locks = this.sectionLocks.get(courseId) || [];
    
    // Check if section is already locked
    const existingLock = locks.find(l => l.sectionId === sectionId && !l.releasedAt);
    if (existingLock) {
      throw new Error(`Section is already locked by ${existingLock.authorId}`);
    }

    const lock: SectionLock = {
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

  async unlockSection(courseId: UUID, sectionId: string, authorId: string): Promise<void> {
    const locks = this.sectionLocks.get(courseId) || [];
    const lock = locks.find(l => 
      l.sectionId === sectionId && 
      l.authorId === authorId && 
      !l.releasedAt
    );

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

  async getSectionLocks(courseId: UUID): Promise<SectionLock[]> {
    const locks = this.sectionLocks.get(courseId) || [];
    const now = new Date();
    return locks.filter(lock => 
      !lock.releasedAt && 
      (!lock.expiresAt || lock.expiresAt > now)
    );
  }

  async getActivityFeed(courseId: UUID, limit: number = 50): Promise<ActivityEvent[]> {
    const activities = this.activities.get(courseId) || [];
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async addComment(courseId: UUID, userId: string, comment: string, section?: string): Promise<void> {
    const comments = this.comments.get(courseId) || [];
    
    const newComment: Comment = {
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

  async getCollaborationStats(courseId: UUID): Promise<CollaborationStats> {
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
  private getPermissionsForRole(role: AuthorRole): AuthorPermissions {
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

  private async logActivity(courseId: UUID, activity: ActivityEvent): Promise<void> {
    const activities = this.activities.get(courseId) || [];
    activities.push(activity);
    this.activities.set(courseId, activities);
  }

  private getActiveAuthors(activities: ActivityEvent[], since: Date): string[] {
    const activeUserIds = new Set<string>();
    activities
      .filter(a => a.timestamp > since)
      .forEach(a => activeUserIds.add(a.userId));
    return Array.from(activeUserIds);
  }
}

// Supporting interfaces
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

export type ActivityType = 
  | 'review_submitted'
  | 'review_approved' 
  | 'changes_requested'
  | 'course_approved'
  | 'comment_added'
  | 'author_assigned'
  | 'author_removed'
  | 'section_locked'
  | 'section_unlocked'
  | 'content_updated'
  | 'course_published';

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
