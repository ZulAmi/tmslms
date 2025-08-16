import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';
import QRCode from 'qrcode';
import {
  ParticipantDocument,
  DocumentType,
  DocumentStatus,
  DocumentAccessLevel,
  DocumentTemplate,
  DocumentTemplateData,
  DocumentLayout,
  DocumentStyling,
  UUID,
  createUUID,
} from '../types';

/**
 * Document Management Service
 * Handles document generation, storage, and management for participants
 */
export class DocumentManagementService extends EventEmitter {
  private documents: Map<UUID, ParticipantDocument> = new Map();
  private templates: Map<UUID, DocumentTemplate> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
  }

  // ============================================================================
  // DOCUMENT TEMPLATE MANAGEMENT
  // ============================================================================

  /**
   * Create document template
   */
  async createTemplate(
    templateData: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DocumentTemplate> {
    const id = createUUID(uuidv4());
    const now = new Date();

    const template: DocumentTemplate = {
      ...templateData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.templates.set(id, template);

    this.emit('templateCreated', { template });

    return template;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: UUID): Promise<DocumentTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get templates by type
   */
  async getTemplatesByType(type: DocumentType): Promise<DocumentTemplate[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.type === type && template.isActive
    );
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: UUID,
    updates: Partial<Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<DocumentTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) {
      return null;
    }

    const updatedTemplate: DocumentTemplate = {
      ...template,
      ...updates,
      id: templateId,
      createdAt: template.createdAt,
      updatedAt: new Date(),
    };

    this.templates.set(templateId, updatedTemplate);

    this.emit('templateUpdated', {
      templateId,
      template: updatedTemplate,
      changes: updates,
    });

    return updatedTemplate;
  }

  // ============================================================================
  // DOCUMENT GENERATION
  // ============================================================================

  /**
   * Generate document from template
   */
  async generateDocument(
    participantId: UUID,
    templateId: UUID,
    documentData: Record<string, any>,
    options?: {
      title?: string;
      description?: string;
      accessLevel?: DocumentAccessLevel;
      expiryDate?: Date;
    }
  ): Promise<ParticipantDocument> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Generate document content based on template format
    let fileBuffer: Buffer;
    let mimeType: string;
    let filename: string;

    switch (template.templateData.format) {
      case 'pdf':
        fileBuffer = await this.generatePDF(template, documentData);
        mimeType = 'application/pdf';
        filename = `${template.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        break;

      case 'html':
        const htmlContent = await this.generateHTML(template, documentData);
        fileBuffer = Buffer.from(htmlContent, 'utf8');
        mimeType = 'text/html';
        filename = `${template.name.replace(/\s+/g, '_')}_${Date.now()}.html`;
        break;

      case 'image':
        fileBuffer = await this.generateImage(template, documentData);
        mimeType = 'image/png';
        filename = `${template.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
        break;

      default:
        throw new Error(
          `Unsupported document format: ${template.templateData.format}`
        );
    }

    // Generate verification hash
    const verificationHash = await this.generateVerificationHash(fileBuffer);

    // Store document (in real implementation, this would save to cloud storage)
    const fileUrl = await this.storeDocument(filename, fileBuffer);

    const documentId = createUUID(uuidv4());
    const now = new Date();

    const document: ParticipantDocument = {
      id: documentId,
      participantId,
      type: template.type,
      title: options?.title || template.name,
      description: options?.description || template.description,
      filename,
      fileUrl,
      mimeType,
      fileSize: fileBuffer.length,
      isGenerated: true,
      templateId,
      generatedData: documentData,
      version: 1,
      status: DocumentStatus.ACTIVE,
      expiryDate: options?.expiryDate,
      verificationHash,
      accessLevel: options?.accessLevel || DocumentAccessLevel.PARTICIPANT_ONLY,
      downloadCount: 0,
      metadata: {
        generatedAt: now,
        templateVersion: template.version,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: participantId,
    };

    this.documents.set(documentId, document);

    this.emit('documentGenerated', { document, template, documentData });

    return document;
  }

  /**
   * Generate certificate
   */
  async generateCertificate(
    participantId: UUID,
    certificateData: {
      participantName: string;
      courseName: string;
      completionDate: Date;
      grade?: string;
      instructor?: string;
      organizationName: string;
      logoUrl?: string;
    }
  ): Promise<ParticipantDocument> {
    const certificateTemplate = Array.from(this.templates.values()).find(
      (t) => t.type === DocumentType.CERTIFICATE && t.isActive
    );

    if (!certificateTemplate) {
      throw new Error('Certificate template not found');
    }

    return await this.generateDocument(
      participantId,
      certificateTemplate.id,
      certificateData,
      {
        title: `Certificate - ${certificateData.courseName}`,
        description: `Certificate of completion for ${certificateData.courseName}`,
        accessLevel: DocumentAccessLevel.PUBLIC,
      }
    );
  }

  /**
   * Generate transcript
   */
  async generateTranscript(
    participantId: UUID,
    transcriptData: {
      participantName: string;
      courses: Array<{
        name: string;
        completionDate: Date;
        grade: string;
        credits: number;
      }>;
      totalCredits: number;
      gpa?: number;
      organizationName: string;
    }
  ): Promise<ParticipantDocument> {
    const transcriptTemplate = Array.from(this.templates.values()).find(
      (t) => t.type === DocumentType.TRANSCRIPT && t.isActive
    );

    if (!transcriptTemplate) {
      throw new Error('Transcript template not found');
    }

    return await this.generateDocument(
      participantId,
      transcriptTemplate.id,
      transcriptData,
      {
        title: 'Official Transcript',
        description: 'Official academic transcript',
        accessLevel: DocumentAccessLevel.PARTICIPANT_ONLY,
      }
    );
  }

  // ============================================================================
  // DOCUMENT MANAGEMENT
  // ============================================================================

  /**
   * Get documents for participant
   */
  async getParticipantDocuments(
    participantId: UUID,
    filters?: {
      type?: DocumentType[];
      status?: DocumentStatus[];
      accessLevel?: DocumentAccessLevel[];
      search?: string;
    }
  ): Promise<ParticipantDocument[]> {
    let documents = Array.from(this.documents.values()).filter(
      (doc) => doc.participantId === participantId
    );

    if (filters?.type && filters.type.length > 0) {
      documents = documents.filter((doc) => filters.type!.includes(doc.type));
    }

    if (filters?.status && filters.status.length > 0) {
      documents = documents.filter((doc) =>
        filters.status!.includes(doc.status)
      );
    }

    if (filters?.accessLevel && filters.accessLevel.length > 0) {
      documents = documents.filter((doc) =>
        filters.accessLevel!.includes(doc.accessLevel)
      );
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      documents = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm) ||
          (doc.description &&
            doc.description.toLowerCase().includes(searchTerm)) ||
          doc.filename.toLowerCase().includes(searchTerm)
      );
    }

    return documents.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: UUID): Promise<ParticipantDocument | null> {
    return this.documents.get(documentId) || null;
  }

  /**
   * Update document
   */
  async updateDocument(
    documentId: UUID,
    updates: Partial<
      Omit<ParticipantDocument, 'id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<ParticipantDocument | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    const updatedDocument: ParticipantDocument = {
      ...document,
      ...updates,
      id: documentId,
      createdAt: document.createdAt,
      updatedAt: new Date(),
    };

    this.documents.set(documentId, updatedDocument);

    this.emit('documentUpdated', {
      documentId,
      document: updatedDocument,
      changes: updates,
    });

    return updatedDocument;
  }

  /**
   * Track document download
   */
  async trackDownload(
    documentId: UUID,
    downloadedBy: UUID
  ): Promise<ParticipantDocument | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    const updatedDocument: ParticipantDocument = {
      ...document,
      downloadCount: document.downloadCount + 1,
      lastDownloadedAt: new Date(),
      updatedAt: new Date(),
    };

    this.documents.set(documentId, updatedDocument);

    this.emit('documentDownloaded', {
      document: updatedDocument,
      downloadedBy,
    });

    return updatedDocument;
  }

  /**
   * Expire document
   */
  async expireDocument(
    documentId: UUID,
    reason?: string
  ): Promise<ParticipantDocument | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    const updatedDocument: ParticipantDocument = {
      ...document,
      status: DocumentStatus.EXPIRED,
      metadata: {
        ...document.metadata,
        expiredAt: new Date(),
        expirationReason: reason,
      },
      updatedAt: new Date(),
    };

    this.documents.set(documentId, updatedDocument);

    this.emit('documentExpired', { document: updatedDocument, reason });

    return updatedDocument;
  }

  /**
   * Revoke document
   */
  async revokeDocument(
    documentId: UUID,
    revokedBy: UUID,
    reason: string
  ): Promise<ParticipantDocument | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    const updatedDocument: ParticipantDocument = {
      ...document,
      status: DocumentStatus.REVOKED,
      metadata: {
        ...document.metadata,
        revokedAt: new Date(),
        revokedBy,
        revocationReason: reason,
      },
      updatedAt: new Date(),
    };

    this.documents.set(documentId, updatedDocument);

    this.emit('documentRevoked', {
      document: updatedDocument,
      revokedBy,
      reason,
    });

    return updatedDocument;
  }

  // ============================================================================
  // DOCUMENT VERIFICATION
  // ============================================================================

  /**
   * Verify document authenticity
   */
  async verifyDocument(
    documentId: UUID,
    providedHash?: string
  ): Promise<{
    isValid: boolean;
    document?: ParticipantDocument;
    verificationDetails: {
      hashMatch: boolean;
      statusValid: boolean;
      notExpired: boolean;
      notRevoked: boolean;
    };
  }> {
    const document = this.documents.get(documentId);
    if (!document) {
      return {
        isValid: false,
        verificationDetails: {
          hashMatch: false,
          statusValid: false,
          notExpired: false,
          notRevoked: false,
        },
      };
    }

    const hashMatch =
      !providedHash || document.verificationHash === providedHash;
    const statusValid = document.status === DocumentStatus.ACTIVE;
    const notExpired = !document.expiryDate || document.expiryDate > new Date();
    const notRevoked = document.status !== DocumentStatus.REVOKED;

    const isValid = hashMatch && statusValid && notExpired && notRevoked;

    return {
      isValid,
      document,
      verificationDetails: {
        hashMatch,
        statusValid,
        notExpired,
        notRevoked,
      },
    };
  }

  /**
   * Generate verification QR code for document
   */
  async generateVerificationQR(documentId: UUID): Promise<string> {
    const document = this.documents.get(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const verificationData = {
      documentId: document.id,
      type: document.type,
      hash: document.verificationHash,
      verifyUrl: `${process.env.BASE_URL}/verify-document/${documentId}`,
    };

    return await QRCode.toDataURL(JSON.stringify(verificationData));
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async generatePDF(
    template: DocumentTemplate,
    data: Record<string, any>
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    // Process template content
    const processedContent = this.processTemplateContent(
      template.templateData.content,
      data
    );

    // Simple text rendering (in a real implementation, this would be much more sophisticated)
    const fontSize = 12;
    const lineHeight = fontSize + 4;
    let yPosition = height - 50;

    // Add title
    if (data.title) {
      page.drawText(data.title, {
        x: 50,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 40;
    }

    // Add content
    const lines = processedContent.split('\n');
    for (const line of lines) {
      if (yPosition < 50) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - 50;
      }

      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;
    }

    // Add verification QR code if enabled
    if (template.templateData.watermark) {
      const qrCode = await this.generateDocumentQR(data);
      // In a real implementation, you would embed the QR code image
    }

    return Buffer.from(await pdfDoc.save());
  }

  private async generateHTML(
    template: DocumentTemplate,
    data: Record<string, any>
  ): Promise<string> {
    let htmlContent = template.templateData.content;

    // Process template variables
    htmlContent = this.processTemplateContent(htmlContent, data);

    // Add basic HTML structure if not present
    if (!htmlContent.includes('<html>')) {
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title || 'Document'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.title || 'Document'}</h1>
          </div>
          <div class="content">
            ${htmlContent}
          </div>
        </body>
        </html>
      `;
    }

    return htmlContent;
  }

  private async generateImage(
    template: DocumentTemplate,
    data: Record<string, any>
  ): Promise<Buffer> {
    // Generate a simple image with text (certificate-style)
    const width = 800;
    const height = 600;

    const svgImage = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
        <text x="50%" y="100" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold">
          ${data.title || 'Certificate'}
        </text>
        <text x="50%" y="200" text-anchor="middle" font-family="Arial" font-size="16">
          This is to certify that
        </text>
        <text x="50%" y="250" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold">
          ${data.participantName || 'Participant Name'}
        </text>
        <text x="50%" y="300" text-anchor="middle" font-family="Arial" font-size="16">
          has successfully completed
        </text>
        <text x="50%" y="350" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold">
          ${data.courseName || 'Course Name'}
        </text>
        <text x="50%" y="450" text-anchor="middle" font-family="Arial" font-size="14">
          Completion Date: ${data.completionDate ? new Date(data.completionDate).toLocaleDateString() : 'N/A'}
        </text>
      </svg>
    `;

    return await sharp(Buffer.from(svgImage)).png().toBuffer();
  }

  private processTemplateContent(
    content: string,
    data: Record<string, any>
  ): string {
    let processed = content;

    // Replace variables in format {{variableName}}
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    }

    // Handle date formatting
    processed = processed.replace(/{{date:([^}]+)}}/g, (match, format) => {
      return new Date().toLocaleDateString();
    });

    return processed;
  }

  private async generateVerificationHash(content: Buffer): Promise<string> {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private async storeDocument(
    filename: string,
    content: Buffer
  ): Promise<string> {
    // In a real implementation, this would upload to cloud storage
    // For now, just return a mock URL
    return `https://storage.example.com/documents/${filename}`;
  }

  private async generateDocumentQR(data: Record<string, any>): Promise<Buffer> {
    const qrData = {
      documentId: data.id,
      verificationUrl: `${process.env.BASE_URL}/verify/${data.id}`,
    };

    return Buffer.from(await QRCode.toDataURL(JSON.stringify(qrData)));
  }

  private async initializeDefaultTemplates(): Promise<void> {
    // Create default certificate template
    await this.createTemplate({
      name: 'Default Certificate',
      type: DocumentType.CERTIFICATE,
      description: 'Standard certificate template',
      templateData: {
        format: 'pdf',
        content: `
Certificate of Completion

This is to certify that {{participantName}} has successfully completed the course {{courseName}} on {{completionDate}}.

Instructor: {{instructor}}
Organization: {{organizationName}}
        `,
        layout: {
          pageSize: 'A4',
          orientation: 'landscape',
          margins: { top: 50, right: 50, bottom: 50, left: 50 },
        },
      } as DocumentTemplateData,
      variables: [
        {
          name: 'participantName',
          description: 'Name of the participant',
          type: 'string',
          isRequired: true,
        },
        {
          name: 'courseName',
          description: 'Name of the course',
          type: 'string',
          isRequired: true,
        },
        {
          name: 'completionDate',
          description: 'Date of completion',
          type: 'date',
          isRequired: true,
        },
        {
          name: 'instructor',
          description: 'Name of the instructor',
          type: 'string',
          isRequired: false,
        },
        {
          name: 'organizationName',
          description: 'Name of the organization',
          type: 'string',
          isRequired: true,
        },
      ],
      styling: {
        fonts: [
          { name: 'Helvetica', size: 12, weight: 'normal', style: 'normal' },
        ],
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#28a745',
          text: '#212529',
          background: '#ffffff',
        },
        spacing: { lineHeight: 1.5, paragraphSpacing: 16, sectionSpacing: 24 },
        branding: {
          organizationName: 'Training Organization',
          contactInfo: {
            email: 'info@training.org',
            phone: '+1-555-0123',
          },
          theme: 'corporate',
        },
      },
      isActive: true,
      version: 1,
      metadata: {},
    });

    // Create default transcript template
    await this.createTemplate({
      name: 'Default Transcript',
      type: DocumentType.TRANSCRIPT,
      description: 'Standard transcript template',
      templateData: {
        format: 'pdf',
        content: `
Official Transcript

Student: {{participantName}}
Student ID: {{studentId}}

Courses Completed:
{{#each courses}}
- {{name}} ({{completionDate}}) - Grade: {{grade}} - Credits: {{credits}}
{{/each}}

Total Credits: {{totalCredits}}
{{#if gpa}}GPA: {{gpa}}{{/if}}
        `,
        layout: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: { top: 50, right: 50, bottom: 50, left: 50 },
        },
      } as DocumentTemplateData,
      variables: [
        {
          name: 'participantName',
          description: 'Name of the participant',
          type: 'string',
          isRequired: true,
        },
        {
          name: 'studentId',
          description: 'Student ID',
          type: 'string',
          isRequired: true,
        },
        {
          name: 'courses',
          description: 'List of completed courses',
          type: 'object',
          isRequired: true,
        },
        {
          name: 'totalCredits',
          description: 'Total credits earned',
          type: 'number',
          isRequired: true,
        },
        {
          name: 'gpa',
          description: 'Grade point average',
          type: 'number',
          isRequired: false,
        },
      ],
      styling: {
        fonts: [
          { name: 'Helvetica', size: 12, weight: 'normal', style: 'normal' },
        ],
        colors: {
          primary: '#007bff',
          secondary: '#6c757d',
          accent: '#28a745',
          text: '#212529',
          background: '#ffffff',
        },
        spacing: { lineHeight: 1.5, paragraphSpacing: 16, sectionSpacing: 24 },
        branding: {
          organizationName: 'Training Organization',
          contactInfo: {
            email: 'info@training.org',
            phone: '+1-555-0123',
          },
          theme: 'academic',
        },
      },
      isActive: true,
      version: 1,
      metadata: {},
    });
  }
}
