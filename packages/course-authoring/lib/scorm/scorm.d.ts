/// <reference types="node" />
/// <reference types="node" />
import { ScormPackageMeta } from '../types';
export interface ScormService {
    package(zipBytes: Buffer, opts?: {
        version?: '1.2' | '2004';
    }): Promise<ScormPackageMeta>;
    validate(manifestXml: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
export declare class SimpleScormService implements ScormService {
    package(zipBytes: Buffer, opts?: {
        version?: '1.2' | '2004';
    }): Promise<ScormPackageMeta>;
    validate(manifestXml: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
}
