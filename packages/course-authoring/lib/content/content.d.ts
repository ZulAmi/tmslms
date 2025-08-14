import { UUID, Content } from '../types';
export interface ContentEditorService {
    createContent(moduleId: UUID, type: ContentType): Promise<Content>;
    updateContent(contentId: UUID, updates: Partial<Content>): Promise<Content>;
    deleteContent(contentId: UUID): Promise<void>;
    getContent(contentId: UUID): Promise<Content | null>;
    getModuleContent(moduleId: UUID): Promise<Content[]>;
    duplicateContent(contentId: UUID): Promise<Content>;
    moveContent(contentId: UUID, targetModuleId: UUID, position?: number): Promise<void>;
    reorderContent(moduleId: UUID, contentIds: UUID[]): Promise<void>;
    updateContentBlocks(contentId: UUID, blocks: ContentBlock[]): Promise<void>;
    insertContentBlock(contentId: UUID, block: ContentBlock, position?: number): Promise<void>;
    removeContentBlock(contentId: UUID, blockId: UUID): Promise<void>;
    uploadMedia(file: File, metadata?: MediaMetadata): Promise<MediaAsset>;
    getMediaAsset(assetId: UUID): Promise<MediaAsset | null>;
    deleteMediaAsset(assetId: UUID): Promise<void>;
    validateContent(contentId: UUID): Promise<ValidationResult>;
    previewContent(contentId: UUID): Promise<string>;
    searchContent(query: ContentSearchQuery): Promise<Content[]>;
    filterContent(filters: ContentFilter): Promise<Content[]>;
}
export declare class InMemoryContentEditorService implements ContentEditorService {
    private content;
    private mediaAssets;
    createContent(moduleId: UUID, type: ContentType): Promise<Content>;
    updateContent(contentId: UUID, updates: Partial<Content>): Promise<Content>;
    deleteContent(contentId: UUID): Promise<void>;
    getContent(contentId: UUID): Promise<Content | null>;
    getModuleContent(moduleId: UUID): Promise<Content[]>;
    duplicateContent(contentId: UUID): Promise<Content>;
    moveContent(contentId: UUID, targetModuleId: UUID, position?: number): Promise<void>;
    reorderContent(moduleId: UUID, contentIds: UUID[]): Promise<void>;
    updateContentBlocks(contentId: UUID, blocks: ContentBlock[]): Promise<void>;
    insertContentBlock(contentId: UUID, block: ContentBlock, position?: number): Promise<void>;
    removeContentBlock(contentId: UUID, blockId: UUID): Promise<void>;
    uploadMedia(file: File, metadata?: MediaMetadata): Promise<MediaAsset>;
    getMediaAsset(assetId: UUID): Promise<MediaAsset | null>;
    deleteMediaAsset(assetId: UUID): Promise<void>;
    validateContent(contentId: UUID): Promise<ValidationResult>;
    previewContent(contentId: UUID): Promise<string>;
    searchContent(query: ContentSearchQuery): Promise<Content[]>;
    filterContent(filters: ContentFilter): Promise<Content[]>;
}
export type ContentType = 'lesson' | 'video' | 'audio' | 'document' | 'interactive' | 'assessment' | 'scorm';
export interface ContentBlock {
    id: UUID;
    type: 'text' | 'image' | 'video' | 'audio' | 'assessment' | 'interactive' | 'embed';
    content: any;
    metadata?: {
        createdAt: Date;
        updatedAt: Date;
        [key: string]: any;
    };
}
export interface MediaMetadata {
    alt?: string;
    caption?: string;
    description?: string;
    tags?: string[];
    [key: string]: any;
}
export interface MediaAsset {
    id: UUID;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: Date;
    metadata: MediaMetadata;
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
}
export interface ContentSearchQuery {
    title?: string;
    type?: ContentType;
    moduleId?: UUID;
    status?: string;
    tags?: string[];
    sortBy?: 'title' | 'created' | 'updated';
    page?: number;
    limit?: number;
}
export interface ContentFilter {
    moduleIds?: UUID[];
    types?: ContentType[];
    statuses?: string[];
    dateRange?: {
        start: string;
        end: string;
    };
    minDuration?: number;
    maxDuration?: number;
}
