export type UUID = string;
export interface Course {
    id: UUID;
    slug: string;
    title: string;
    description?: string;
    status: 'draft' | 'in-review' | 'published' | 'archived';
    version: string;
    createdAt: Date;
    updatedAt: Date;
    authors: string[];
    tags: string[];
    templateId?: UUID;
}
export interface Module {
    id: UUID;
    courseId: UUID;
    title: string;
    order: number;
    lessons: Lesson[];
}
export interface Lesson {
    id: UUID;
    moduleId: UUID;
    title: string;
    order: number;
    contentBlocks: ContentBlock[];
}
export interface Content {
    id: UUID;
    moduleId: UUID;
    type: 'lesson' | 'video' | 'audio' | 'document' | 'interactive' | 'assessment' | 'scorm';
    title: string;
    slug: string;
    blocks: ContentBlock[];
    order?: number;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: string;
        status: 'draft' | 'published' | 'archived';
        estimatedDuration: number;
        tags?: string[];
    };
    settings: {
        allowComments: boolean;
        showProgress: boolean;
        trackCompletion: boolean;
        requireCompletion: boolean;
    };
}
export interface Assessment {
    id: UUID;
    courseId?: UUID;
    moduleId?: UUID;
    title: string;
    description?: string;
    type: 'quiz' | 'test' | 'assignment' | 'survey';
    questions: Question[];
    settings: {
        timeLimit?: number;
        maxAttempts?: number;
        passingScore?: number;
        randomizeQuestions?: boolean;
        randomizeAnswers?: boolean;
        showCorrectAnswers?: boolean;
        allowReview?: boolean;
    };
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        version: string;
        status: 'draft' | 'published' | 'archived';
    };
}
export interface Question {
    id: UUID;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'matching' | 'drag-drop';
    question: string;
    points: number;
    options?: string[];
    correctAnswers?: string[] | number[];
    explanation?: string;
    metadata?: {
        difficulty?: 'easy' | 'medium' | 'hard';
        tags?: string[];
        estimatedTime?: number;
    };
}
export type ContentBlock = {
    id: UUID;
    type: 'text';
    content: {
        text: string;
    };
    metadata?: any;
} | {
    id: UUID;
    type: 'image';
    content: {
        url: string;
        alt?: string;
        caption?: string;
    };
    metadata?: any;
} | {
    id: UUID;
    type: 'video';
    content: {
        url: string;
        title?: string;
        description?: string;
        poster?: string;
        transcriptUrl?: string;
    };
    metadata?: any;
} | {
    id: UUID;
    type: 'audio';
    content: {
        url: string;
        title?: string;
        description?: string;
        transcriptUrl?: string;
    };
    metadata?: any;
} | {
    id: UUID;
    type: 'embed';
    content: {
        provider: 'youtube' | 'vimeo' | 'slideshare' | 'iframe';
        url: string;
    };
    metadata?: any;
} | {
    id: UUID;
    type: 'assessment';
    content: {
        type: string;
        question: string;
        options?: string[];
        correctAnswers?: any;
        explanation?: string;
        points?: number;
        timeLimit?: number;
    };
    metadata?: any;
} | {
    id: UUID;
    type: 'interactive';
    content: {
        interactiveType: string;
        config: any;
        data: any;
    };
    metadata?: any;
};
export interface VersionCommit {
    id: UUID;
    courseId: UUID;
    message: string;
    authorId: string;
    timestamp: Date;
    changes: ChangeSet;
}
export interface ChangeSet {
    added: string[];
    modified: string[];
    removed: string[];
}
export interface LearningPath {
    id: UUID;
    title: string;
    nodes: LearningNode[];
}
export type LearningNode = {
    id: UUID;
    type: 'course';
    courseId: UUID;
    title: string;
    prerequisites: UUID[];
} | {
    id: UUID;
    type: 'module';
    moduleId: UUID;
    title: string;
    prerequisites: UUID[];
} | {
    id: UUID;
    type: 'assessment';
    assessmentId: UUID;
    title: string;
    prerequisites: UUID[];
};
export interface ScormPackageMeta {
    id: UUID;
    courseId: UUID;
    version: '1.2' | '2004';
    imsmanifestXml: string;
    sizeBytes: number;
    createdAt: Date;
}
export interface XapiStatement {
    id: UUID;
    actor: {
        mbox?: string;
        account?: {
            homePage: string;
            name: string;
        };
    };
    verb: {
        id: string;
        display?: Record<string, string>;
    };
    object: {
        id: string;
        definition?: any;
    };
    result?: any;
    context?: any;
    timestamp: string;
}
export interface CsvImportResult {
    success: boolean;
    created: number;
    updated: number;
    errors: Array<{
        row: number;
        message: string;
    }>;
}
export interface CourseTemplate {
    id: UUID;
    name: string;
    description?: string;
    blocks: ContentBlock[];
    metadata?: Record<string, any>;
}
export interface ReviewWorkflow {
    courseId: UUID;
    state: 'draft' | 'awaiting-approval' | 'approved' | 'changes-requested';
    approvers: string[];
    history: Array<{
        by: string;
        action: 'submit' | 'approve' | 'request-changes' | 'comment';
        comment?: string;
        at: Date;
    }>;
}
export interface CourseAnalytics {
    courseId: UUID;
    enrollments: number;
    completions: number;
    avgTimeSpentMins: number;
    dropOffRate: number;
    engagementScore: number;
}
export interface SsgCourseRef {
    ssgId: string;
    lastSyncAt?: Date;
    metadata?: Record<string, any>;
}
