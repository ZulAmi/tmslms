"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleScormService = void 0;
class SimpleScormService {
    async package(zipBytes, opts) {
        return {
            id: crypto.randomUUID(),
            courseId: crypto.randomUUID(),
            version: opts?.version ?? '2004',
            imsmanifestXml: '<manifest></manifest>',
            sizeBytes: zipBytes.byteLength,
            createdAt: new Date(),
        };
    }
    async validate(manifestXml) {
        // Placeholder for schema validation against SCORM XSD
        const valid = manifestXml.includes('<manifest');
        return { valid, errors: valid ? [] : ['Invalid SCORM manifest'] };
    }
}
exports.SimpleScormService = SimpleScormService;
