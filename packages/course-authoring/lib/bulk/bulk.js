"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleBulkService = void 0;
// Conditional import for xlsx - handles both ESM and CommonJS scenarios
let XLSX;
try {
    XLSX = require('xlsx');
}
catch {
    // Fallback for environments where xlsx is not available
    XLSX = {
        read: () => ({ SheetNames: [], Sheets: {} }),
        utils: {
            sheet_to_json: () => [],
            json_to_sheet: () => ({}),
            book_new: () => ({ SheetNames: [], Sheets: {} }),
            book_append_sheet: () => { },
        },
        write: () => Buffer.alloc(0)
    };
}
class SimpleBulkService {
    constructor() {
        this.courses = new Map();
        this.enrollments = new Map();
    }
    async importCoursesFromCsv(csv) {
        try {
            const data = this.parseCSV(csv);
            return this.processCourseImport(data);
        }
        catch (error) {
            return {
                success: false,
                created: 0,
                updated: 0,
                errors: [{ row: 0, message: `CSV parsing error: ${error}` }]
            };
        }
    }
    async exportCoursesToCsv() {
        const courses = Array.from(this.courses.values());
        const exportData = courses.map(course => ({
            id: course.id,
            slug: course.slug,
            title: course.title,
            description: course.description || '',
            status: course.status,
            version: course.version,
            authors: course.authors.join(';'),
            tags: course.tags.join(';'),
            createdAt: course.createdAt.toISOString(),
            updatedAt: course.updatedAt.toISOString(),
            templateId: course.templateId || ''
        }));
        return this.generateCSV(exportData);
    }
    async importCoursesFromExcel(excel) {
        try {
            const data = this.parseExcel(excel);
            return this.processCourseImport(data);
        }
        catch (error) {
            return {
                success: false,
                created: 0,
                updated: 0,
                errors: [{ row: 0, message: `Excel parsing error: ${error}` }]
            };
        }
    }
    async exportCoursesToExcel(courseIds) {
        const courses = courseIds.map(id => this.courses.get(id)).filter(Boolean);
        const exportData = courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description || '',
            status: course.status,
            version: course.version,
            authors: course.authors.join(';'),
            tags: course.tags.join(';'),
            createdAt: course.createdAt.toISOString(),
            updatedAt: course.updatedAt.toISOString(),
            slug: course.slug,
            templateId: course.templateId || ''
        }));
        return this.generateExcel(exportData, 'courses');
    }
    async importEnrollments(file, format) {
        try {
            const data = format === 'csv' ? this.parseCSV(file) : this.parseExcel(file);
            const validation = this.validateImportData(data, 'enrollments');
            if (!validation.isValid) {
                return {
                    success: false,
                    created: 0,
                    updated: 0,
                    errors: validation.errors
                };
            }
            let created = 0;
            let updated = 0;
            const errors = [];
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                try {
                    const enrollment = this.mapRowToEnrollment(row, i + 2);
                    const key = `${enrollment.userId}-${enrollment.courseId}`;
                    if (this.enrollments.has(key)) {
                        updated++;
                    }
                    else {
                        this.enrollments.set(key, enrollment);
                        created++;
                    }
                }
                catch (error) {
                    errors.push({
                        row: i + 2,
                        message: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
            return { success: errors.length === 0, created, updated, errors };
        }
        catch (error) {
            return {
                success: false,
                created: 0,
                updated: 0,
                errors: [{ row: 0, message: `File parsing error: ${error}` }]
            };
        }
    }
    async exportEnrollments(criteria, format) {
        const enrollments = Array.from(this.enrollments.values()).filter(enrollment => this.matchesExportCriteria(enrollment, criteria));
        const exportData = enrollments.map(enrollment => ({
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt.toISOString(),
            completedAt: enrollment.completedAt?.toISOString() || '',
            progress: enrollment.progress,
            grade: enrollment.grade || '',
            lastAccessedAt: enrollment.lastAccessedAt?.toISOString() || ''
        }));
        return format === 'csv'
            ? this.generateCSV(exportData)
            : this.generateExcel(exportData, 'enrollments');
    }
    validateImportData(data, type) {
        const errors = [];
        if (!Array.isArray(data) || data.length === 0) {
            return {
                isValid: false,
                errors: [{ row: 0, message: 'No data found in file' }]
            };
        }
        const requiredFields = type === 'courses'
            ? ['title', 'slug', 'status']
            : ['userId', 'courseId', 'status'];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            // Check required fields
            for (const field of requiredFields) {
                if (!row[field] || row[field].toString().trim() === '') {
                    errors.push({
                        row: i + 2,
                        message: `Missing required field: ${field}`
                    });
                }
            }
            // Type-specific validations
            if (type === 'courses') {
                if (row.status && !['draft', 'in-review', 'published', 'archived'].includes(row.status)) {
                    errors.push({
                        row: i + 2,
                        message: `Invalid status value: ${row.status}`
                    });
                }
            }
            if (type === 'enrollments') {
                if (row.status && !['enrolled', 'in-progress', 'completed', 'dropped'].includes(row.status)) {
                    errors.push({
                        row: i + 2,
                        message: `Invalid enrollment status: ${row.status}`
                    });
                }
                if (row.progress && (isNaN(row.progress) || row.progress < 0 || row.progress > 100)) {
                    errors.push({
                        row: i + 2,
                        message: `Invalid progress value: ${row.progress} (must be 0-100)`
                    });
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async bulkUpdateCourses(updates) {
        const results = [];
        for (const update of updates) {
            try {
                const existing = this.courses.get(update.courseId);
                if (!existing) {
                    results.push({
                        courseId: update.courseId,
                        success: false,
                        error: 'Course not found'
                    });
                    continue;
                }
                const updatedCourse = {
                    ...existing,
                    ...update.changes,
                    updatedAt: new Date()
                };
                this.courses.set(update.courseId, updatedCourse);
                results.push({
                    courseId: update.courseId,
                    success: true
                });
            }
            catch (error) {
                results.push({
                    courseId: update.courseId,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        return {
            success: successCount === updates.length,
            totalProcessed: updates.length,
            successCount,
            failureCount: updates.length - successCount,
            results
        };
    }
    // Private helper methods
    async processCourseImport(data) {
        const validation = this.validateImportData(data, 'courses');
        if (!validation.isValid) {
            return {
                success: false,
                created: 0,
                updated: 0,
                errors: validation.errors
            };
        }
        let created = 0;
        let updated = 0;
        const errors = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                const course = this.mapRowToCourse(row, i + 2);
                if (this.courses.has(course.id)) {
                    const existing = this.courses.get(course.id);
                    const updatedCourse = {
                        ...existing,
                        ...course,
                        updatedAt: new Date()
                    };
                    this.courses.set(course.id, updatedCourse);
                    updated++;
                }
                else {
                    this.courses.set(course.id, course);
                    created++;
                }
            }
            catch (error) {
                errors.push({
                    row: i + 2,
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return { success: errors.length === 0, created, updated, errors };
    }
    parseCSV(buffer) {
        const text = buffer.toString('utf-8');
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2)
            return [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
        return data;
    }
    parseExcel(buffer) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        return XLSX.utils.sheet_to_json(worksheet);
    }
    generateCSV(data) {
        if (data.length === 0)
            return Buffer.from('');
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');
        return Buffer.from(csvContent, 'utf-8');
    }
    generateExcel(data, sheetName) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }
    mapRowToCourse(row, _rowNumber) {
        if (!row.title || !row.slug) {
            throw new Error('Missing required fields: title and slug');
        }
        return {
            id: row.id || crypto.randomUUID(),
            title: row.title,
            slug: row.slug,
            description: row.description || '',
            status: row.status || 'draft',
            version: row.version || '1.0.0',
            authors: row.authors ? row.authors.split(';').map((a) => a.trim()) : [],
            tags: row.tags ? row.tags.split(';').map((t) => t.trim()) : [],
            createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
            updatedAt: new Date(),
            templateId: row.templateId || undefined
        };
    }
    mapRowToEnrollment(row, _rowNumber) {
        if (!row.userId || !row.courseId) {
            throw new Error('Missing required fields: userId and courseId');
        }
        return {
            id: crypto.randomUUID(),
            userId: row.userId,
            courseId: row.courseId,
            status: row.status || 'enrolled',
            enrolledAt: row.enrolledAt ? new Date(row.enrolledAt) : new Date(),
            completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
            progress: row.progress ? parseFloat(row.progress) : 0,
            grade: row.grade || undefined,
            lastAccessedAt: row.lastAccessedAt ? new Date(row.lastAccessedAt) : undefined
        };
    }
    matchesExportCriteria(enrollment, criteria) {
        if (criteria.courseIds && !criteria.courseIds.includes(enrollment.courseId)) {
            return false;
        }
        if (criteria.userIds && !criteria.userIds.includes(enrollment.userId)) {
            return false;
        }
        if (criteria.status && criteria.status !== enrollment.status) {
            return false;
        }
        if (criteria.enrolledAfter && enrollment.enrolledAt < criteria.enrolledAfter) {
            return false;
        }
        if (criteria.enrolledBefore && enrollment.enrolledAt > criteria.enrolledBefore) {
            return false;
        }
        return true;
    }
}
exports.SimpleBulkService = SimpleBulkService;
