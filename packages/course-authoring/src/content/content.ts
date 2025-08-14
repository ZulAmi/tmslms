import { UUID, Course, Module, Content, Assessment } from '../types';

export interface ContentEditorService {
  // Content creation and editing
  createContent(moduleId: UUID, type: ContentType): Promise<Content>;
  updateContent(contentId: UUID, updates: Partial<Content>): Promise<Content>;
  deleteContent(contentId: UUID): Promise<void>;
  
  // Content retrieval
  getContent(contentId: UUID): Promise<Content | null>;
  getModuleContent(moduleId: UUID): Promise<Content[]>;
  
  // Content operations
  duplicateContent(contentId: UUID): Promise<Content>;
  moveContent(contentId: UUID, targetModuleId: UUID, position?: number): Promise<void>;
  reorderContent(moduleId: UUID, contentIds: UUID[]): Promise<void>;
  
  // Rich content editing
  updateContentBlocks(contentId: UUID, blocks: ContentBlock[]): Promise<void>;
  insertContentBlock(contentId: UUID, block: ContentBlock, position?: number): Promise<void>;
  removeContentBlock(contentId: UUID, blockId: UUID): Promise<void>;
  
  // Media management
  uploadMedia(file: File, metadata?: MediaMetadata): Promise<MediaAsset>;
  getMediaAsset(assetId: UUID): Promise<MediaAsset | null>;
  deleteMediaAsset(assetId: UUID): Promise<void>;
  
  // Content validation and preview
  validateContent(contentId: UUID): Promise<ValidationResult>;
  previewContent(contentId: UUID): Promise<string>;
  
  // Search and filtering
  searchContent(query: ContentSearchQuery): Promise<Content[]>;
  filterContent(filters: ContentFilter): Promise<Content[]>;
}

export class InMemoryContentEditorService implements ContentEditorService {
  private content: Map<UUID, Content> = new Map();
  private mediaAssets: Map<UUID, MediaAsset> = new Map();

  async createContent(moduleId: UUID, type: ContentType): Promise<Content> {
    const content: Content = {
      id: crypto.randomUUID(),
      moduleId,
      type,
      title: `New ${type}`,
      slug: `new-${type}-${Date.now()}`,
      blocks: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        status: 'draft',
        estimatedDuration: 0
      },
      settings: {
        allowComments: true,
        showProgress: true,
        trackCompletion: true,
        requireCompletion: false
      }
    };

    this.content.set(content.id, content);
    return content;
  }

  async updateContent(contentId: UUID, updates: Partial<Content>): Promise<Content> {
    const existing = this.content.get(contentId);
    if (!existing) {
      throw new Error('Content not found');
    }

    const updated: Content = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    };

    this.content.set(contentId, updated);
    return updated;
  }

  async deleteContent(contentId: UUID): Promise<void> {
    this.content.delete(contentId);
  }

  async getContent(contentId: UUID): Promise<Content | null> {
    return this.content.get(contentId) || null;
  }

  async getModuleContent(moduleId: UUID): Promise<Content[]> {
    return Array.from(this.content.values())
      .filter(content => content.moduleId === moduleId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async duplicateContent(contentId: UUID): Promise<Content> {
    const original = this.content.get(contentId);
    if (!original) {
      throw new Error('Content not found');
    }

    const duplicate: Content = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      metadata: {
        ...original.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    this.content.set(duplicate.id, duplicate);
    return duplicate;
  }

  async moveContent(contentId: UUID, targetModuleId: UUID, position?: number): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const updated: Content = {
      ...content,
      moduleId: targetModuleId,
      order: position,
      metadata: {
        ...content.metadata,
        updatedAt: new Date()
      }
    };

    this.content.set(contentId, updated);
  }

  async reorderContent(moduleId: UUID, contentIds: UUID[]): Promise<void> {
    const moduleContent = await this.getModuleContent(moduleId);
    
    contentIds.forEach((contentId, index) => {
      const content = moduleContent.find(c => c.id === contentId);
      if (content) {
        const updated: Content = {
          ...content,
          order: index,
          metadata: {
            ...content.metadata,
            updatedAt: new Date()
          }
        };
        this.content.set(contentId, updated);
      }
    });
  }

  async updateContentBlocks(contentId: UUID, blocks: ContentBlock[]): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const updated: Content = {
      ...content,
      blocks,
      metadata: {
        ...content.metadata,
        updatedAt: new Date()
      }
    };

    this.content.set(contentId, updated);
  }

  async insertContentBlock(contentId: UUID, block: ContentBlock, position?: number): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const blocks = [...content.blocks];
    
    if (position !== undefined && position >= 0 && position <= blocks.length) {
      blocks.splice(position, 0, block);
    } else {
      blocks.push(block);
    }

    await this.updateContentBlocks(contentId, blocks);
  }

  async removeContentBlock(contentId: UUID, blockId: UUID): Promise<void> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const blocks = content.blocks.filter(block => block.id !== blockId);
    await this.updateContentBlocks(contentId, blocks);
  }

  async uploadMedia(file: File, metadata: MediaMetadata = {}): Promise<MediaAsset> {
    const asset: MediaAsset = {
      id: crypto.randomUUID(),
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
      metadata: {
        alt: metadata.alt || '',
        caption: metadata.caption || '',
        description: metadata.description || '',
        tags: metadata.tags || [],
        ...metadata
      }
    };

    this.mediaAssets.set(asset.id, asset);
    return asset;
  }

  async getMediaAsset(assetId: UUID): Promise<MediaAsset | null> {
    return this.mediaAssets.get(assetId) || null;
  }

  async deleteMediaAsset(assetId: UUID): Promise<void> {
    const asset = this.mediaAssets.get(assetId);
    if (asset && asset.url.startsWith('blob:')) {
      URL.revokeObjectURL(asset.url);
    }
    this.mediaAssets.delete(assetId);
  }

  async validateContent(contentId: UUID): Promise<ValidationResult> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!content.title || content.title.trim().length < 3) {
      errors.push('Content title must be at least 3 characters long');
    }

    // Content blocks validation
    if (content.blocks.length === 0) {
      warnings.push('Content has no blocks');
    }

    // Check for empty text blocks
    const emptyTextBlocks = content.blocks.filter(block => 
      block.type === 'text' && (!block.content.text || block.content.text.trim().length === 0)
    );
    
    if (emptyTextBlocks.length > 0) {
      warnings.push(`${emptyTextBlocks.length} empty text block(s) found`);
    }

    // Check for missing media assets
    const mediaBlocks = content.blocks.filter(block => 
      ['image', 'video', 'audio'].includes(block.type)
    );
    
    for (const block of mediaBlocks) {
      if (block.type === 'image' || block.type === 'video' || block.type === 'audio') {
        if (!block.content.url) {
          errors.push(`Missing URL for ${block.type} block`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5))
    };
  }

  async previewContent(contentId: UUID): Promise<string> {
    const content = this.content.get(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    // Generate HTML preview
    const blockHtml = content.blocks.map(block => {
      switch (block.type) {
        case 'text':
          return `<div class="text-block">${block.content.text || ''}</div>`;
        case 'image':
          return `<div class="image-block">
            <img src="${block.content.url}" alt="${block.content.alt || ''}" />
            ${block.content.caption ? `<p class="caption">${block.content.caption}</p>` : ''}
          </div>`;
        case 'video':
          return `<div class="video-block">
            <video src="${block.content.url}" controls>
              Your browser does not support the video tag.
            </video>
            ${block.content.title ? `<h4>${block.content.title}</h4>` : ''}
          </div>`;
        case 'audio':
          return `<div class="audio-block">
            <audio src="${block.content.url}" controls>
              Your browser does not support the audio tag.
            </audio>
            ${block.content.title ? `<h4>${block.content.title}</h4>` : ''}
          </div>`;
        case 'assessment':
          return `<div class="assessment-block">
            <h3>${block.content.question}</h3>
            <div class="options">
              ${(block.content.options || []).map((option: string, index: number) => 
                `<label><input type="radio" name="q${block.id}" value="${index}" /> ${option}</label>`
              ).join('')}
            </div>
          </div>`;
        default:
          return `<div class="content-block">${JSON.stringify(block.content)}</div>`;
      }
    }).join('\n');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${content.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .text-block { margin: 15px 0; line-height: 1.6; }
    .image-block, .video-block, .audio-block { margin: 20px 0; text-align: center; }
    .caption { font-style: italic; margin-top: 5px; color: #666; }
    .assessment-block { border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .options label { display: block; margin: 10px 0; }
    img, video { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <h1>${content.title}</h1>
  ${blockHtml}
</body>
</html>`;
  }

  async searchContent(query: ContentSearchQuery): Promise<Content[]> {
    let results = Array.from(this.content.values());

    if (query.title) {
      const searchTerm = query.title.toLowerCase();
      results = results.filter(content =>
        content.title.toLowerCase().includes(searchTerm)
      );
    }

    if (query.type) {
      results = results.filter(content => content.type === query.type);
    }

    if (query.moduleId) {
      results = results.filter(content => content.moduleId === query.moduleId);
    }

    if (query.status) {
      results = results.filter(content => content.metadata.status === query.status);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(content =>
        query.tags!.some(tag => 
          content.metadata.tags?.includes(tag)
        )
      );
    }

    // Apply sorting
    if (query.sortBy) {
      results.sort((a, b) => {
        switch (query.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'created':
            return b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime();
          case 'updated':
            return b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime();
          default:
            return 0;
        }
      });
    }

    // Apply pagination
    if (query.limit) {
      const startIndex = ((query.page || 1) - 1) * query.limit;
      results = results.slice(startIndex, startIndex + query.limit);
    }

    return results;
  }

  async filterContent(filters: ContentFilter): Promise<Content[]> {
    let results = Array.from(this.content.values());

    if (filters.moduleIds && filters.moduleIds.length > 0) {
      results = results.filter(content => 
        filters.moduleIds!.includes(content.moduleId)
      );
    }

    if (filters.types && filters.types.length > 0) {
      results = results.filter(content => 
        filters.types!.includes(content.type)
      );
    }

    if (filters.statuses && filters.statuses.length > 0) {
      results = results.filter(content => 
        filters.statuses!.includes(content.metadata.status)
      );
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      
      results = results.filter(content => {
        const created = content.metadata.createdAt;
        return created >= start && created <= end;
      });
    }

    if (filters.minDuration !== undefined) {
      results = results.filter(content => 
        (content.metadata.estimatedDuration || 0) >= filters.minDuration!
      );
    }

    if (filters.maxDuration !== undefined) {
      results = results.filter(content => 
        (content.metadata.estimatedDuration || 0) <= filters.maxDuration!
      );
    }

    return results;
  }
}

// Supporting interfaces and types
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
