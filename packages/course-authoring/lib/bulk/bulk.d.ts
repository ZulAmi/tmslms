/// <reference types="node" />
/// <reference types="node" />
import { Course, CsvImportResult, UUID } from '../types';
export interface BulkService {
    importCoursesFromCsv(csv: Buffer): Promise<CsvImportResult>;
    exportCoursesToCsv(): Promise<Buffer>;
    importCoursesFromExcel(excel: Buffer): Promise<CsvImportResult>;
    exportCoursesToExcel(courseIds: UUID[]): Promise<Buffer>;
    importEnrollments(file: Buffer, format: 'csv' | 'excel'): Promise<CsvImportResult>;
    exportEnrollments(criteria: EnrollmentExportCriteria, format: 'csv' | 'excel'): Promise<Buffer>;
    validateImportData(data: any[], type: 'courses' | 'enrollments'): ValidationResult;
    bulkUpdateCourses(updates: BulkCourseUpdate[]): Promise<BulkUpdateResult>;
}
export declare class SimpleBulkService implements BulkService {
    private courses;
    private enrollments;
    importCoursesFromCsv(csv: Buffer): Promise<CsvImportResult>;
    exportCoursesToCsv(): Promise<Buffer>;
    importCoursesFromExcel(excel: Buffer): Promise<CsvImportResult>;
    exportCoursesToExcel(courseIds: UUID[]): Promise<Buffer>;
    importEnrollments(file: Buffer, format: 'csv' | 'excel'): Promise<CsvImportResult>;
    exportEnrollments(criteria: EnrollmentExportCriteria, format: 'csv' | 'excel'): Promise<Buffer>;
    validateImportData(data: any[], type: 'courses' | 'enrollments'): ValidationResult;
    bulkUpdateCourses(updates: BulkCourseUpdate[]): Promise<BulkUpdateResult>;
    private processCourseImport;
    private parseCSV;
    private parseExcel;
    private generateCSV;
    private generateExcel;
    private mapRowToCourse;
    private mapRowToEnrollment;
    private matchesExportCriteria;
}
export interface Enrollment {
    id: UUID;
    userId: string;
    courseId: UUID;
    status: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
    enrolledAt: Date;
    completedAt?: Date;
    progress: number;
    grade?: string;
    lastAccessedAt?: Date;
}
export interface EnrollmentExportCriteria {
    courseIds?: UUID[];
    userIds?: string[];
    status?: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
    enrolledAfter?: Date;
    enrolledBefore?: Date;
}
export interface ValidationResult {
    isValid: boolean;
    errors: Array<{
        row: number;
        message: string;
    }>;
}
export interface BulkCourseUpdate {
    courseId: UUID;
    changes: Partial<Omit<Course, 'id' | 'createdAt'>>;
}
export interface BulkUpdateResult {
    success: boolean;
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    results: UpdateResult[];
}
export interface UpdateResult {
    courseId: UUID;
    success: boolean;
    error?: string;
}
