import { ContentBlock } from '../types';
export interface WysiwygEditor {
    toBlocks(html: string): Promise<ContentBlock[]>;
    toHtml(blocks: ContentBlock[]): Promise<string>;
    sanitize(html: string): Promise<string>;
}
export declare class SimpleWysiwyg implements WysiwygEditor {
    toBlocks(html: string): Promise<ContentBlock[]>;
    private createParser;
    private extractTextBlocks;
    private extractMediaBlocks;
    private extractInteractiveBlocks;
    private extractFormatting;
    toHtml(blocks: ContentBlock[]): Promise<string>;
    sanitize(html: string): Promise<string>;
    private sanitizeHtml;
    private validateUrls;
    private isValidUrl;
    private validateContentBlocks;
}
