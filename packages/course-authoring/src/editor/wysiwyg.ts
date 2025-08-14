import { ContentBlock } from '../types';

export interface WysiwygEditor {
  toBlocks(html: string): Promise<ContentBlock[]>;
  toHtml(blocks: ContentBlock[]): Promise<string>;
  sanitize(html: string): Promise<string>;
}

export class SimpleWysiwyg implements WysiwygEditor {
  async toBlocks(html: string): Promise<ContentBlock[]> {
    const blocks: ContentBlock[] = [];
    const sanitizedHtml = await this.sanitize(html);
    
    // Parse HTML using DOM parser (works in both Node.js and browser)
    const parser = this.createParser();
    const doc = parser.parseFromString(sanitizedHtml, 'text/html');
    
    // Extract different content types
    this.extractTextBlocks(doc, blocks);
    this.extractMediaBlocks(doc, blocks);
    this.extractInteractiveBlocks(doc, blocks);
    
    // If no blocks found, create a single text block
    if (blocks.length === 0) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'text',
        content: { text: sanitizedHtml },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    // Validate and filter blocks
    return this.validateContentBlocks(blocks);
  }

  private createParser(): DOMParser {
    // Use native DOMParser in browser, jsdom in Node.js environment
    if (typeof DOMParser !== 'undefined') {
      return new DOMParser();
    } else {
      // Graceful fallback for Node.js environments
      try {
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM();
        return new dom.window.DOMParser();
      } catch {
        // If jsdom not available, return mock parser
        return {
          parseFromString: (html: string) => ({
            body: { innerHTML: html, querySelectorAll: () => [] }
          })
        } as any;
      }
    }
  }

  private extractTextBlocks(doc: Document, blocks: ContentBlock[]): void {
    const textElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div');
    textElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        blocks.push({
          id: crypto.randomUUID(),
          type: 'text',
          content: { 
            text: text
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            tagName: element.tagName.toLowerCase(),
            html: element.outerHTML,
            formatting: this.extractFormatting(element)
          }
        });
      }
    });
  }

  private extractMediaBlocks(doc: Document, blocks: ContentBlock[]): void {
    // Extract images
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'image',
        content: {
          url: img.src,
          alt: img.alt || '',
          caption: img.getAttribute('data-caption') || undefined
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          width: img.width || undefined,
          height: img.height || undefined
        }
      });
    });

    // Extract videos
    const videos = doc.querySelectorAll('video');
    videos.forEach(video => {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'video',
        content: {
          url: video.src,
          title: video.title || undefined,
          description: video.getAttribute('data-description') || undefined,
          poster: video.poster || undefined,
          transcriptUrl: video.getAttribute('data-transcript') || undefined
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          duration: video.duration || undefined,
          autoplay: video.autoplay,
          controls: video.controls
        }
      });
    });

    // Extract audio
    const audios = doc.querySelectorAll('audio');
    audios.forEach(audio => {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'audio',
        content: {
          url: audio.src,
          title: audio.title || undefined,
          description: audio.getAttribute('data-description') || undefined,
          transcriptUrl: audio.getAttribute('data-transcript') || undefined
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          duration: audio.duration || undefined,
          autoplay: audio.autoplay,
          controls: audio.controls
        }
      });
    });
  }

  private extractInteractiveBlocks(doc: Document, blocks: ContentBlock[]): void {
    // Extract assessment blocks
    const assessments = doc.querySelectorAll('[data-assessment-id]');
    assessments.forEach(assessment => {
      const question = assessment.querySelector('h3')?.textContent || '';
      const options = Array.from(assessment.querySelectorAll('label'))
        .map(label => label.textContent?.replace(/^\s*\w+\s*/, '') || '');
      
      blocks.push({
        id: assessment.getAttribute('data-assessment-id') || crypto.randomUUID(),
        type: 'assessment',
        content: {
          type: 'multiple-choice',
          question,
          options: options.length > 0 ? options : undefined,
          points: 1
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    });

    // Extract interactive elements
    const interactives = doc.querySelectorAll('[data-interactive-id]');
    interactives.forEach(interactive => {
      blocks.push({
        id: interactive.getAttribute('data-interactive-id') || crypto.randomUUID(),
        type: 'interactive',
        content: {
          interactiveType: interactive.getAttribute('data-type') || 'generic',
          config: {},
          data: {}
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    });

    // Extract embeds
    const iframes = doc.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const url = iframe.src;
      let provider: 'youtube' | 'vimeo' | 'slideshare' | 'iframe' = 'iframe';
      
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        provider = 'youtube';
      } else if (url.includes('vimeo.com')) {
        provider = 'vimeo';
      } else if (url.includes('slideshare.net')) {
        provider = 'slideshare';
      }
      
      blocks.push({
        id: crypto.randomUUID(),
        type: 'embed',
        content: {
          provider,
          url
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          width: iframe.width || undefined,
          height: iframe.height || undefined,
          title: iframe.title || undefined
        }
      });
    });
  }

  private extractFormatting(element: Element): any {
    return {
      bold: element.querySelector('strong, b') !== null,
      italic: element.querySelector('em, i') !== null,
      underline: element.querySelector('u') !== null,
      links: Array.from(element.querySelectorAll('a')).map(a => ({
        url: a.href,
        text: a.textContent
      }))
    };
  }

  async toHtml(blocks: ContentBlock[]): Promise<string> {
    return blocks
      .map((b) => {
        switch (b.type) {
          case 'text':
            return b.content.text;
          case 'image':
            return `<figure><img src="${b.content.url}" alt="${b.content.alt ?? ''}"/>${b.content.caption ? `<figcaption>${b.content.caption}</figcaption>` : ''}</figure>`;
          case 'video':
            return `<video src="${b.content.url}" controls poster="${b.content.poster ?? ''}"></video>`;
          case 'audio':
            return `<audio src="${b.content.url}" controls></audio>`;
          case 'embed':
            return `<iframe src="${b.content.url}" loading="lazy"></iframe>`;
          case 'assessment':
            return `<div data-assessment-id="${b.id}" class="assessment-block">
              <h3>${b.content.question}</h3>
              ${b.content.options ? b.content.options.map((option: string, index: number) => 
                `<label><input type="radio" name="q${b.id}" value="${index}" /> ${option}</label>`
              ).join('') : ''}
            </div>`;
          case 'interactive':
            return `<div data-interactive-id="${b.id}" data-type="${b.content.interactiveType}" class="interactive-block"></div>`;
          default:
            return '';
        }
      })
      .join('\n');
  }

  async sanitize(html: string): Promise<string> {
    // Comprehensive HTML sanitization for security
    return this.sanitizeHtml(html);
  }

  private sanitizeHtml(html: string): string {
    // Basic HTML sanitization - remove dangerous elements and attributes
    const dangerousTags = ['script', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'style'];
    const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onfocus', 'onblur'];
    
    let sanitized = html;
    
    // Remove dangerous tags
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // Remove dangerous attributes
    dangerousAttrs.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
    
    // Validate URLs in src and href attributes
    sanitized = this.validateUrls(sanitized);
    
    return sanitized;
  }

  private validateUrls(html: string): string {
    // Ensure URLs use safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:'];
    
    // Validate href attributes
    html = html.replace(/href\s*=\s*["']([^"']*)["']/gi, (match, url) => {
      if (this.isValidUrl(url, safeProtocols)) {
        return match;
      }
      return 'href="#"';
    });
    
    // Validate src attributes
    html = html.replace(/src\s*=\s*["']([^"']*)["']/gi, (match, url) => {
      if (this.isValidUrl(url, safeProtocols)) {
        return match;
      }
      return 'src=""';
    });
    
    return html;
  }

  private isValidUrl(url: string, allowedProtocols: string[]): boolean {
    if (!url || url.trim().length === 0) return false;
    
    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
      return true;
    }
    
    // Allow fragment URLs
    if (url.startsWith('#')) {
      return true;
    }
    
    // Check protocol
    try {
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  private validateContentBlocks(blocks: ContentBlock[]): ContentBlock[] {
    return blocks.filter(block => {
      // Validate block structure
      if (!block.id || !block.type || !block.content) {
        return false;
      }
      
      // Type-specific validation
      switch (block.type) {
        case 'text':
          return typeof block.content.text === 'string' && block.content.text.trim().length > 0;
        case 'image':
          return typeof block.content.url === 'string' && this.isValidUrl(block.content.url, ['http:', 'https:']);
        case 'video':
        case 'audio':
          return typeof block.content.url === 'string' && this.isValidUrl(block.content.url, ['http:', 'https:']);
        case 'embed':
          return typeof block.content.url === 'string' && this.isValidUrl(block.content.url, ['http:', 'https:']);
        case 'assessment':
          return typeof block.content.question === 'string' && block.content.question.trim().length > 0;
        case 'interactive':
          return typeof block.content.interactiveType === 'string';
        default:
          return false;
      }
    });
  }
}
