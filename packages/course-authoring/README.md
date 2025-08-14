# Course Authoring Platform

A comprehensive course authoring and management platform with advanced features including WYSIWYG editing, SCORM/xAPI support, learning path design, collaboration tools, and SSG integration.

## Features

### 🎨 Content Creation & Editing

- **Rich Content Editor**: Create multimedia content with text, images, videos, audio, and interactive elements
- **WYSIWYG Interface**: Visual editing with real-time preview
- **Content Blocks**: Modular content architecture for flexible course design
- **Media Management**: Upload, organize, and optimize media assets
- **Content Validation**: Built-in validation and quality checks

### 🛤️ Learning Path Designer

- **Drag & Drop Interface**: Visual learning path creation with intuitive controls
- **Prerequisite Management**: Define learning dependencies and sequences
- **Auto-Layout Algorithms**: Automatic positioning with hierarchical, force-directed, and circular layouts
- **Progress Tracking**: Monitor learner progression through paths
- **Circular Dependency Detection**: Prevent invalid learning sequences

### 📦 Bulk Operations

- **CSV/Excel Import**: Mass import courses, modules, and enrollments
- **Data Validation**: Comprehensive validation with detailed error reporting
- **Bulk Updates**: Efficient batch operations for course management
- **Export Capabilities**: Generate reports and export data in multiple formats

### 🎯 Template System

- **Reusable Templates**: Create and share course templates
- **Component Library**: Pre-built components with variable substitution
- **Template Application**: Apply templates to existing courses
- **Usage Tracking**: Monitor template adoption and effectiveness
- **Search & Filtering**: Discover relevant templates quickly

### 👥 Collaboration Features

- **Multi-Author Support**: Role-based collaboration (Lead, Author, Reviewer, Contributor)
- **Section Locking**: Prevent conflicts with automatic lock management
- **Activity Feed**: Track all changes and contributions
- **Comment System**: Threaded discussions on course content
- **Approval Workflows**: Structured review and approval processes

### 📊 Analytics & Reporting

- **Engagement Metrics**: Track learner interaction and time spent
- **Performance Analytics**: Monitor completion rates and scores
- **Content Analytics**: Identify popular and problematic content
- **Learner Journey Mapping**: Visualize learning paths and drop-off points
- **Real-time Dashboard**: Live statistics and progress monitoring

### 🔄 SSG Integration

- **Real-time Sync**: Automatic synchronization with Student Success Gateway
- **Catalog Search**: Browse and import courses from SSG catalog
- **Conflict Resolution**: Smart handling of sync conflicts
- **Field Mapping**: Customizable data field mappings
- **Compatibility Validation**: Ensure content meets SSG standards

### 📋 Standards Compliance

- **SCORM Support**: Full SCORM 1.2 and 2004 compliance
- **xAPI Integration**: Experience API tracking and analytics
- **Package Validation**: Automated compliance testing
- **Manifest Generation**: Automatic SCORM manifest creation

### 🔧 Version Control

- **Git-like Versioning**: Track changes with commits and branches
- **Rollback Capability**: Revert to previous versions
- **Change History**: Detailed audit trail of modifications
- **Merge Conflict Resolution**: Handle concurrent edits gracefully

## Quick Start

### Installation

```bash
npm install @tmslms/course-authoring
```

### Basic Usage

```typescript
import { CourseAuthoringFactory } from "@tmslms/course-authoring";

// Create service instances
const services = CourseAuthoringFactory.createServices();

// Create a new course
const course = await services.courseAuthoring.createCourse({
  title: "Introduction to TypeScript",
  description: "Learn TypeScript fundamentals",
  authors: ["instructor-id"],
});

// Add content
const content = await services.contentEditor.createContent(moduleId, "lesson");

// Create learning path
const path = await services.learningPaths.createPath({
  title: "TypeScript Learning Journey",
  description: "Complete TypeScript mastery path",
});
```

### Learning Path Designer

```typescript
// Create nodes and connections
const courseNode = await services.learningPaths.addNode(pathId, {
  type: "course",
  courseId: course.id,
  title: course.title,
  position: { x: 100, y: 100 },
});

// Connect nodes with prerequisites
await services.learningPaths.connectNodes(
  pathId,
  prerequisiteNodeId,
  courseNode.id
);

// Auto-layout the path
await services.learningPaths.autoLayout(pathId, "hierarchical");
```

### Bulk Operations

```typescript
// Import courses from CSV
const csvData =
  'title,description,author\n"Course 1","Description 1","author1"';
const result = await services.bulkOperations.importCoursesFromCsv(csvData);

// Export enrollment data
const enrollmentData = await services.bulkOperations.exportEnrollments({
  courseIds: [course.id],
  format: "xlsx",
  includeProgress: true,
});
```

### Template Usage

```typescript
// Apply template to course
await services.templates.applyTemplate(course.id, templateId, {
  variables: {
    courseName: "Advanced JavaScript",
    instructor: "John Doe",
  },
});

// Search templates
const templates = await services.templates.searchTemplates({
  category: "programming",
  tags: ["javascript", "advanced"],
});
```

### Collaboration

```typescript
// Set up collaboration
await services.collaboration.addCollaborator(course.id, {
  userId: "collaborator-id",
  role: "author",
  permissions: ["edit_content", "add_media"],
});

// Lock section for editing
await services.collaboration.lockSection(course.id, "module-1", {
  userId: "author-id",
  expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
});
```

### Analytics

```typescript
// Get course analytics
const analytics = await services.analytics.getCourseAnalytics(course.id, {
  startDate: "2024-01-01",
  endDate: "2024-12-31",
});

// Track engagement
await services.analytics.trackEvent({
  courseId: course.id,
  userId: "learner-id",
  event: "content_viewed",
  data: { contentId: "lesson-1", timeSpent: 300 },
});
```

### SSG Integration

```typescript
// Link course to SSG
const ssgRef = await services.ssgSync.link(course.id, "ssg-course-123");

// Sync with SSG
const syncResult = await services.ssgSync.sync(course.id);

// Search SSG catalog
const ssgCourses = await services.ssgSync.searchSsgCatalog({
  title: "JavaScript",
  category: "Programming",
});
```

## Architecture

### Service Layer

- **Modular Design**: Independent services for each feature area
- **Interface-Driven**: Clear contracts between components
- **Dependency Injection**: Configurable service implementations
- **Error Handling**: Comprehensive error management

### Data Models

- **Type Safety**: Full TypeScript type definitions
- **Immutable Patterns**: Predictable state management
- **Validation**: Built-in data validation rules
- **Extensibility**: Support for custom fields and metadata

### Storage

- **Database Agnostic**: Works with any storage backend
- **Caching Layer**: Performance optimization
- **Migration Support**: Schema evolution support
- **Backup & Recovery**: Data protection mechanisms

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://localhost:5432/tmslms

# File Storage
STORAGE_PROVIDER=aws-s3
STORAGE_BUCKET=course-content
STORAGE_REGION=us-east-1

# SSG Integration
SSG_API_URL=https://api.ssg.example.com
SSG_API_KEY=your-api-key

# SCORM Settings
SCORM_PLAYER_URL=https://player.example.com
SCORM_CONTENT_URL=https://content.example.com
```

### Service Configuration

```typescript
import { CourseAuthoringFactory } from "@tmslms/course-authoring";

const services = CourseAuthoringFactory.createProductionServices({
  database: {
    url: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
  },
  storage: {
    provider: "aws-s3",
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION,
  },
  ssg: {
    apiUrl: process.env.SSG_API_URL,
    apiKey: process.env.SSG_API_KEY,
  },
});
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## API Reference

### Course Authoring Service

- `createCourse(data: CourseData): Promise<Course>`
- `updateCourse(id: UUID, updates: Partial<Course>): Promise<Course>`
- `deleteCourse(id: UUID): Promise<void>`
- `getCourse(id: UUID): Promise<Course | null>`
- `listCourses(filters?: CourseFilter): Promise<Course[]>`

### Content Editor Service

- `createContent(moduleId: UUID, type: ContentType): Promise<Content>`
- `updateContent(id: UUID, updates: Partial<Content>): Promise<Content>`
- `uploadMedia(file: File, metadata?: MediaMetadata): Promise<MediaAsset>`
- `validateContent(id: UUID): Promise<ValidationResult>`

### Learning Path Service

- `createPath(data: PathData): Promise<LearningPath>`
- `addNode(pathId: UUID, node: NodeData): Promise<LearningNode>`
- `connectNodes(pathId: UUID, sourceId: UUID, targetId: UUID): Promise<void>`
- `autoLayout(pathId: UUID, algorithm: LayoutAlgorithm): Promise<void>`

### Bulk Operations Service

- `importCoursesFromCsv(data: string): Promise<ImportResult>`
- `exportEnrollments(options: ExportOptions): Promise<ArrayBuffer>`
- `bulkUpdateCourses(updates: BulkUpdate[]): Promise<UpdateResult[]>`

### Template Service

- `createTemplate(data: TemplateData): Promise<Template>`
- `applyTemplate(courseId: UUID, templateId: UUID, options?: ApplyOptions): Promise<void>`
- `searchTemplates(query: TemplateQuery): Promise<Template[]>`

### Collaboration Service

- `addCollaborator(courseId: UUID, collaborator: CollaboratorData): Promise<void>`
- `lockSection(courseId: UUID, sectionId: string, lock: LockData): Promise<void>`
- `addComment(courseId: UUID, comment: CommentData): Promise<Comment>`

### Analytics Service

- `getCourseAnalytics(courseId: UUID, timeRange?: DateRange): Promise<CourseAnalytics>`
- `trackEvent(event: AnalyticsEvent): Promise<void>`
- `generateReport(type: ReportType, options: ReportOptions): Promise<Report>`

### SSG Sync Service

- `link(courseId: UUID, ssgId: string): Promise<SsgCourseRef>`
- `sync(courseId: UUID): Promise<SsgSyncResult>`
- `searchSsgCatalog(query: SsgSearchQuery): Promise<SsgCourseInfo[]>`
- `detectConflicts(courseId: UUID): Promise<SsgConflict[]>`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:

- GitHub Issues: [Create an issue](https://github.com/tmslms/tmslms/issues)
- Documentation: [Full documentation](https://docs.tmslms.com)
- Email: support@tmslms.com
