import { ScormPackageMeta } from '../types';

export interface ScormService {
  package(zipBytes: Buffer, opts?: { version?: '1.2' | '2004' }): Promise<ScormPackageMeta>;
  validate(manifestXml: string): Promise<{ valid: boolean; errors: string[] }>;
}

export class SimpleScormService implements ScormService {
  async package(zipBytes: Buffer, opts?: { version?: '1.2' | '2004' }): Promise<ScormPackageMeta> {
    return {
      id: crypto.randomUUID(),
      courseId: crypto.randomUUID(),
      version: opts?.version ?? '2004',
      imsmanifestXml: '<manifest></manifest>',
      sizeBytes: zipBytes.byteLength,
      createdAt: new Date(),
    };
  }

  async validate(manifestXml: string): Promise<{ valid: boolean; errors: string[] }> {
    // Placeholder for schema validation against SCORM XSD
    const valid = manifestXml.includes('<manifest');
    return { valid, errors: valid ? [] : ['Invalid SCORM manifest'] };
  }
}
