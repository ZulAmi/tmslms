/**
 * API Documentation Service
 * Auto-generated API documentation with OpenAPI/Swagger integration
 */

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  tags: string[];
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: Record<string, ApiResponse>;
  security?: SecurityRequirement[];
  examples?: Record<string, any>;
}

export interface ApiParameter {
  name?: string;
  in?: 'query' | 'path' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: ApiSchema | ApiReference;
  example?: any;
  $ref?: string;
}

export interface ApiRequestBody {
  description?: string;
  required?: boolean;
  content?: Record<
    string,
    {
      schema: ApiSchema | ApiReference;
      examples?: Record<string, any>;
    }
  >;
  $ref?: string;
}

export interface ApiResponse {
  description?: string;
  content?: Record<
    string,
    {
      schema: ApiSchema | ApiReference;
      examples?: Record<string, any>;
    }
  >;
  headers?: Record<string, ApiHeader>;
  $ref?: string;
}

export interface ApiHeader {
  description?: string;
  schema?: ApiSchema | ApiReference;
  example?: any;
  $ref?: string;
}

export interface ApiSchema {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  format?: string;
  description?: string;
  example?: any;
  enum?: any[];
  items?: ApiSchema | ApiReference;
  properties?: Record<string, ApiSchema | ApiReference>;
  required?: string[];
  additionalProperties?: boolean | ApiSchema | ApiReference;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  // OpenAPI extensions
  $ref?: string;
  allOf?: (ApiSchema | ApiReference)[];
  oneOf?: (ApiSchema | ApiReference)[];
  anyOf?: (ApiSchema | ApiReference)[];
}

export interface ApiReference {
  $ref: string;
}

export interface SecurityRequirement {
  [scheme: string]: string[];
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact?: {
      name: string;
      email: string;
      url: string;
    };
    license?: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
    variables?: Record<
      string,
      {
        default: string;
        description: string;
        enum?: string[];
      }
    >;
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
  paths: Record<string, Record<string, any>>;
  components: {
    schemas: Record<string, ApiSchema>;
    securitySchemes: Record<string, any>;
    parameters: Record<string, ApiParameter>;
    responses: Record<string, ApiResponse>;
    examples: Record<string, any>;
  };
  security: SecurityRequirement[];
}

export class SSGWSGDocumentationService {
  private endpoints: Map<string, ApiEndpoint> = new Map();
  private schemas: Map<string, ApiSchema> = new Map();
  private baseInfo: OpenAPISpec['info'];
  private servers: OpenAPISpec['servers'];
  private tags: Array<{ name: string; description: string }> = [];

  constructor(config: {
    title: string;
    description: string;
    version: string;
    contact?: OpenAPISpec['info']['contact'];
    license?: OpenAPISpec['info']['license'];
    servers: OpenAPISpec['servers'];
  }) {
    this.baseInfo = {
      title: config.title,
      description: config.description,
      version: config.version,
      contact: config.contact,
      license: config.license,
    };
    this.servers = config.servers;

    // Initialize default tags
    this.addTag('Authentication', 'OAuth 2.0 authentication endpoints');
    this.addTag('Courses', 'Course management and enrollment');
    this.addTag('Applications', 'Funding application management');
    this.addTag('Participants', 'Participant and learner management');
    this.addTag(
      'Skills Framework',
      'SSG skills taxonomy and competency management'
    );
    this.addTag('Skills Tracking', 'Skills progress tracking and assessment');
    this.addTag('Learning Paths', 'Personalized learning recommendations');
    this.addTag('Reports', 'Reporting and analytics');
    this.addTag('Webhooks', 'Webhook configuration and management');
    this.addTag('Health', 'System health and monitoring');

    console.log('📚 SSG-WSG Documentation Service initialized');
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Add API endpoint documentation
   */
  addEndpoint(endpoint: ApiEndpoint): void {
    const key = `${endpoint.method.toUpperCase()} ${endpoint.path}`;
    this.endpoints.set(key, endpoint);
    console.log(`📝 Added API endpoint documentation: ${key}`);
  }

  /**
   * Add schema definition
   */
  addSchema(name: string, schema: ApiSchema): void {
    this.schemas.set(name, schema);
    console.log(`📋 Added schema definition: ${name}`);
  }

  /**
   * Add tag
   */
  addTag(name: string, description: string): void {
    const existingIndex = this.tags.findIndex((tag) => tag.name === name);
    if (existingIndex >= 0) {
      this.tags[existingIndex] = { name, description };
    } else {
      this.tags.push({ name, description });
    }
  }

  /**
   * Generate OpenAPI specification
   */
  generateOpenAPI(): OpenAPISpec {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: this.baseInfo,
      servers: this.servers,
      tags: this.tags,
      paths: this.generatePaths(),
      components: {
        schemas: this.generateSchemas(),
        securitySchemes: this.generateSecuritySchemes(),
        parameters: this.generateCommonParameters(),
        responses: this.generateCommonResponses(),
        examples: this.generateExamples(),
      },
      security: [{ OAuth2: ['read', 'write'] }, { ApiKey: [] }],
    };

    return spec;
  }

  /**
   * Generate and save documentation files
   */
  async generateDocumentation(outputDir: string): Promise<{
    openapi: string;
    html: string;
    markdown: string;
  }> {
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const spec = this.generateOpenAPI();

    // Generate OpenAPI JSON
    const openapiPath = path.join(outputDir, 'openapi.json');
    writeFileSync(openapiPath, JSON.stringify(spec, null, 2));

    // Generate HTML documentation
    const htmlPath = path.join(outputDir, 'index.html');
    const htmlContent = this.generateHTMLDocumentation(spec);
    writeFileSync(htmlPath, htmlContent);

    // Generate Markdown documentation
    const markdownPath = path.join(outputDir, 'API.md');
    const markdownContent = this.generateMarkdownDocumentation(spec);
    writeFileSync(markdownPath, markdownContent);

    console.log(`📄 Documentation generated:`);
    console.log(`  - OpenAPI: ${openapiPath}`);
    console.log(`  - HTML: ${htmlPath}`);
    console.log(`  - Markdown: ${markdownPath}`);

    return {
      openapi: openapiPath,
      html: htmlPath,
      markdown: markdownPath,
    };
  }

  /**
   * Initialize with predefined SSG-WSG endpoints
   */
  initializeSSGWSGEndpoints(): void {
    this.addCommonSchemas();
    this.addSkillsFrameworkSchemas();
    this.addAuthenticationEndpoints();
    this.addCourseEndpoints();
    this.addApplicationEndpoints();
    this.addParticipantEndpoints();
    this.addSkillsFrameworkEndpoints();
    this.addSkillsTrackingEndpoints();
    this.addLearningPathEndpoints();
    this.addWebhookEndpoints();
    this.addHealthEndpoints();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Generate paths section
   */
  private generatePaths(): Record<string, Record<string, any>> {
    const paths: Record<string, Record<string, any>> = {};

    for (const [key, endpoint] of this.endpoints.entries()) {
      const [method, path] = key.split(' ', 2);

      if (!paths[path]) {
        paths[path] = {};
      }

      paths[path][method.toLowerCase()] = {
        tags: endpoint.tags,
        summary: endpoint.summary,
        description: endpoint.description,
        parameters: endpoint.parameters,
        requestBody: endpoint.requestBody,
        responses: endpoint.responses,
        security: endpoint.security,
      };
    }

    return paths;
  }

  /**
   * Generate schemas section
   */
  private generateSchemas(): Record<string, ApiSchema> {
    const schemas: Record<string, ApiSchema> = {};
    for (const [name, schema] of this.schemas.entries()) {
      schemas[name] = schema;
    }
    return schemas;
  }

  /**
   * Generate security schemes
   */
  private generateSecuritySchemes(): Record<string, any> {
    return {
      OAuth2: {
        type: 'oauth2',
        description: 'OAuth 2.0 authentication',
        flows: {
          clientCredentials: {
            tokenUrl: '/oauth/token',
            scopes: {
              read: 'Read access to resources',
              write: 'Write access to resources',
              admin: 'Administrative access',
            },
          },
        },
      },
      ApiKey: {
        type: 'apiKey',
        description: 'API key authentication',
        name: 'X-API-Key',
        in: 'header',
      },
    };
  }

  /**
   * Generate common parameters
   */
  private generateCommonParameters(): Record<string, ApiParameter> {
    return {
      Page: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination',
        required: false,
        schema: { type: 'integer', minimum: 1, example: 1 },
      },
      Limit: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 100, example: 20 },
      },
      UserId: {
        name: 'userId',
        in: 'path',
        description: 'Unique identifier for a user',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    };
  }

  /**
   * Generate common responses
   */
  private generateCommonResponses(): Record<string, ApiResponse> {
    return {
      BadRequest: {
        description: 'Bad request - invalid parameters',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized - authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden - insufficient permissions',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    };
  }

  /**
   * Generate examples
   */
  private generateExamples(): Record<string, any> {
    return {
      CourseExample: {
        summary: 'Sample course',
        value: {
          id: 'course-123',
          title: 'Advanced Data Analytics',
          description: 'Comprehensive course on data analytics techniques',
          duration: 40,
          category: 'Technology',
          level: 'Advanced',
          provider: 'TechSkills Institute',
          skillsMapped: [
            {
              courseId: 'course-123',
              skillId: 'skill-001',
              competencyLevel: 'Advanced',
              relevanceScore: 0.9,
              assessmentMethod: 'Project',
            },
          ],
        },
      },
      ApplicationExample: {
        summary: 'Sample funding application',
        value: {
          id: 'app-456',
          userId: 'user-789',
          courseId: 'course-123',
          status: 'pending',
          submittedAt: '2024-01-15T10:30:00Z',
          amount: 2500.0,
        },
      },
      SkillExample: {
        summary: 'Sample skill from SSG framework',
        value: {
          id: 'skill-001',
          code: 'DA-001',
          title: 'Data Visualization',
          description:
            'Ability to create effective visual representations of data',
          category: 'Technical Skills',
          subcategory: 'Data Analytics',
          level: 'Intermediate',
          sector: 'Infocomm Technology',
          jobRoles: [
            'Data Analyst',
            'Business Intelligence Analyst',
            'Data Scientist',
          ],
          keywords: ['visualization', 'charts', 'graphs', 'dashboards'],
          lastUpdated: '2024-01-15T10:30:00Z',
          isActive: true,
        },
      },
      SkillProgressExample: {
        summary: 'Sample skill progress tracking',
        value: {
          userId: 'user-789',
          skillId: 'skill-001',
          currentLevel: 'Intermediate',
          targetLevel: 'Advanced',
          progressPercentage: 65,
          lastAssessed: '2024-01-15T10:30:00Z',
          evidences: [
            {
              type: 'Course',
              title: 'Advanced Data Analytics',
              completedDate: '2024-01-10T10:30:00Z',
              verificationStatus: 'Verified',
            },
          ],
          recommendedActions: [
            'Complete advanced visualization project',
            'Attend data storytelling workshop',
          ],
        },
      },
      SkillsGapExample: {
        summary: 'Sample skills gap analysis',
        value: {
          userId: 'user-789',
          targetRole: 'Senior Data Analyst',
          analysisDate: '2024-01-15T10:30:00Z',
          overallGapScore: 35,
          criticalGaps: [
            {
              skillId: 'skill-002',
              skillTitle: 'Machine Learning Fundamentals',
              requiredLevel: 'Advanced',
              currentLevel: 'Basic',
              gapSeverity: 'High',
              marketDemand: 'High',
              estimatedLearningTime: 120,
            },
          ],
          recommendations: [
            'Focus on machine learning certification',
            'Gain hands-on experience with ML projects',
          ],
        },
      },
      LearningPathExample: {
        summary: 'Sample personalized learning path',
        value: {
          id: 'path-123',
          userId: 'user-789',
          title: 'Data Science Career Advancement',
          description:
            'Comprehensive path to advance from analyst to senior data scientist',
          targetRole: 'Senior Data Scientist',
          estimatedDuration: 480,
          difficulty: 'Advanced',
          prerequisites: ['Basic statistics', 'Programming fundamentals'],
          pathSteps: [
            {
              stepNumber: 1,
              type: 'Course',
              title: 'Machine Learning Fundamentals',
              description: 'Introduction to ML algorithms and techniques',
              provider: 'TechSkills Institute',
              duration: 40,
              cost: 1200,
              skillsAddressed: ['Machine Learning', 'Statistical Analysis'],
              isOptional: false,
              dependencies: [],
            },
          ],
          completionCriteria: [
            'Complete all mandatory courses',
            'Pass final assessment with 80% score',
            'Submit capstone project',
          ],
          estimatedROI: {
            salaryIncrease: 25,
            careerAdvancement: 'Senior role within 12 months',
            jobMarketImprovement: 'High demand skills acquisition',
          },
          createdDate: '2024-01-15T10:30:00Z',
          lastUpdated: '2024-01-15T10:30:00Z',
        },
      },
    };
  }

  /**
   * Generate HTML documentation
   */
  private generateHTMLDocumentation(spec: OpenAPISpec): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.info.title} - API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@latest/swagger-ui-bundle.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@latest/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@latest/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                spec: ${JSON.stringify(spec, null, 2)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
  }

  /**
   * Generate Markdown documentation
   */
  private generateMarkdownDocumentation(spec: OpenAPISpec): string {
    let markdown = `# ${spec.info.title}\n\n`;
    markdown += `${spec.info.description}\n\n`;
    markdown += `**Version:** ${spec.info.version}\n\n`;

    if (spec.info.contact) {
      markdown += `**Contact:** ${spec.info.contact.name} - ${spec.info.contact.email}\n\n`;
    }

    markdown += `## Servers\n\n`;
    for (const server of spec.servers) {
      markdown += `- **${server.description}:** ${server.url}\n`;
    }
    markdown += `\n`;

    markdown += `## Authentication\n\n`;
    markdown += `This API uses OAuth 2.0 authentication. Include the access token in the Authorization header:\n\n`;
    markdown += '```\nAuthorization: Bearer <access_token>\n```\n\n';

    markdown += `## Endpoints\n\n`;
    for (const tag of spec.tags) {
      markdown += `### ${tag.name}\n\n${tag.description}\n\n`;

      // Find endpoints for this tag
      for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, endpoint] of Object.entries(methods)) {
          if (endpoint.tags && endpoint.tags.includes(tag.name)) {
            markdown += `#### ${method.toUpperCase()} ${path}\n\n`;
            markdown += `${endpoint.summary}\n\n`;
            markdown += `${endpoint.description}\n\n`;

            if (endpoint.parameters && endpoint.parameters.length > 0) {
              markdown += `**Parameters:**\n\n`;
              for (const param of endpoint.parameters) {
                markdown += `- **${param.name}** (${param.in}${param.required ? ', required' : ''}): ${param.description}\n`;
              }
              markdown += `\n`;
            }

            markdown += `**Responses:**\n\n`;
            for (const [status, response] of Object.entries(
              endpoint.responses
            )) {
              const apiResponse = response as ApiResponse;
              markdown += `- **${status}**: ${apiResponse.description || 'No description'}\n`;
            }
            markdown += `\n`;
          }
        }
      }
    }

    return markdown;
  }

  /**
   * Add common schemas
   */
  private addCommonSchemas(): void {
    this.addSchema('Error', {
      type: 'object',
      properties: {
        error: { type: 'string', description: 'Error message' },
        code: { type: 'string', description: 'Error code' },
        details: { type: 'object', description: 'Additional error details' },
      },
      required: ['error'],
    });

    this.addSchema('PaginatedResponse', {
      type: 'object',
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    });

    this.addSchema('Course', {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Unique course identifier' },
        title: { type: 'string', description: 'Course title' },
        description: { type: 'string', description: 'Course description' },
        duration: { type: 'integer', description: 'Duration in hours' },
        category: { type: 'string', description: 'Course category' },
        level: {
          type: 'string',
          enum: ['Beginner', 'Intermediate', 'Advanced'],
        },
        provider: { type: 'string', description: 'Training provider' },
        cost: { type: 'number', description: 'Course cost' },
        available: { type: 'boolean', description: 'Availability status' },
        skillsMapped: {
          type: 'array',
          items: { $ref: '#/components/schemas/SkillMapping' },
          description: 'Skills mapped to this course',
        },
      },
      required: ['id', 'title', 'duration', 'category', 'level', 'provider'],
    });
  }

  /**
   * Add skills framework schemas
   */
  private addSkillsFrameworkSchemas(): void {
    this.addSchema('Skill', {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique skill identifier from SSG taxonomy',
        },
        code: { type: 'string', description: 'SSG skill code' },
        title: { type: 'string', description: 'Skill title' },
        description: {
          type: 'string',
          description: 'Detailed skill description',
        },
        category: { type: 'string', description: 'Skill category' },
        subcategory: { type: 'string', description: 'Skill subcategory' },
        level: {
          type: 'string',
          enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
          description: 'Skill proficiency level',
        },
        sector: { type: 'string', description: 'Industry sector' },
        jobRoles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Associated job roles',
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Search keywords',
        },
        lastUpdated: { type: 'string', format: 'date-time' },
        isActive: {
          type: 'boolean',
          description: 'Whether skill is currently active',
        },
      },
      required: ['id', 'code', 'title', 'category', 'level', 'sector'],
    });

    this.addSchema('SkillsFramework', {
      type: 'object',
      properties: {
        version: { type: 'string', description: 'Framework version' },
        lastSynced: { type: 'string', format: 'date-time' },
        totalSkills: { type: 'integer', description: 'Total number of skills' },
        sectors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Available sectors',
        },
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Skill categories',
        },
        skills: {
          type: 'array',
          items: { $ref: '#/components/schemas/Skill' },
        },
      },
      required: ['version', 'lastSynced', 'totalSkills', 'skills'],
    });

    this.addSchema('SkillMapping', {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course identifier' },
        skillId: { type: 'string', description: 'Skill identifier' },
        competencyLevel: {
          type: 'string',
          enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
          description: 'Expected competency level after course completion',
        },
        relevanceScore: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'How relevant this skill is to the course (0-1)',
        },
        assessmentMethod: {
          type: 'string',
          enum: ['Assignment', 'Test', 'Project', 'Practical', 'Portfolio'],
          description: 'How this skill is assessed',
        },
        learningOutcomes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific learning outcomes for this skill',
        },
      },
      required: ['courseId', 'skillId', 'competencyLevel', 'relevanceScore'],
    });

    this.addSchema('SkillProgress', {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User identifier' },
        skillId: { type: 'string', description: 'Skill identifier' },
        currentLevel: {
          type: 'string',
          enum: ['None', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
          description: 'Current proficiency level',
        },
        targetLevel: {
          type: 'string',
          enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
          description: 'Target proficiency level',
        },
        progressPercentage: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Progress towards target level (0-100%)',
        },
        lastAssessed: { type: 'string', format: 'date-time' },
        evidences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'Course',
                  'Certification',
                  'WorkExperience',
                  'Assessment',
                ],
                description: 'Type of evidence',
              },
              title: { type: 'string', description: 'Evidence title' },
              completedDate: { type: 'string', format: 'date-time' },
              verificationStatus: {
                type: 'string',
                enum: ['Verified', 'Pending', 'Unverified'],
                description: 'Verification status',
              },
            },
          },
        },
        recommendedActions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Recommended actions to improve this skill',
        },
      },
      required: ['userId', 'skillId', 'currentLevel', 'progressPercentage'],
    });

    this.addSchema('SkillsGap', {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User identifier' },
        targetRole: { type: 'string', description: 'Target job role' },
        analysisDate: { type: 'string', format: 'date-time' },
        overallGapScore: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Overall skills gap score (0-100, lower is better)',
        },
        criticalGaps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              skillId: { type: 'string' },
              skillTitle: { type: 'string' },
              requiredLevel: {
                type: 'string',
                enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
              },
              currentLevel: {
                type: 'string',
                enum: ['None', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
              },
              gapSeverity: {
                type: 'string',
                enum: ['Low', 'Medium', 'High', 'Critical'],
                description: 'Severity of the skills gap',
              },
              marketDemand: {
                type: 'string',
                enum: ['Low', 'Medium', 'High'],
                description: 'Market demand for this skill',
              },
              estimatedLearningTime: {
                type: 'integer',
                description: 'Estimated hours to bridge gap',
              },
            },
          },
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Strategic recommendations to address gaps',
        },
      },
      required: [
        'userId',
        'targetRole',
        'analysisDate',
        'overallGapScore',
        'criticalGaps',
      ],
    });

    this.addSchema('LearningPath', {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Learning path identifier' },
        userId: { type: 'string', description: 'User identifier' },
        title: { type: 'string', description: 'Learning path title' },
        description: {
          type: 'string',
          description: 'Learning path description',
        },
        targetRole: { type: 'string', description: 'Target job role' },
        estimatedDuration: {
          type: 'integer',
          description: 'Estimated total duration in hours',
        },
        difficulty: {
          type: 'string',
          enum: ['Beginner', 'Intermediate', 'Advanced'],
          description: 'Overall difficulty level',
        },
        prerequisites: {
          type: 'array',
          items: { type: 'string' },
          description: 'Required prerequisites',
        },
        pathSteps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stepNumber: {
                type: 'integer',
                description: 'Sequential step number',
              },
              type: {
                type: 'string',
                enum: [
                  'Course',
                  'Certification',
                  'Workshop',
                  'SelfStudy',
                  'Mentoring',
                ],
                description: 'Type of learning activity',
              },
              title: { type: 'string', description: 'Step title' },
              description: { type: 'string', description: 'Step description' },
              provider: { type: 'string', description: 'Training provider' },
              duration: { type: 'integer', description: 'Duration in hours' },
              cost: { type: 'number', description: 'Cost in SGD' },
              skillsAddressed: {
                type: 'array',
                items: { type: 'string' },
                description: 'Skills addressed in this step',
              },
              isOptional: {
                type: 'boolean',
                description: 'Whether step is optional',
              },
              dependencies: {
                type: 'array',
                items: { type: 'integer' },
                description: 'Step numbers that must be completed first',
              },
            },
          },
        },
        completionCriteria: {
          type: 'array',
          items: { type: 'string' },
          description: 'Criteria for path completion',
        },
        estimatedROI: {
          type: 'object',
          properties: {
            salaryIncrease: {
              type: 'number',
              description: 'Expected salary increase %',
            },
            careerAdvancement: {
              type: 'string',
              description: 'Career advancement opportunities',
            },
            jobMarketImprovement: {
              type: 'string',
              description: 'Job market positioning improvement',
            },
          },
        },
        createdDate: { type: 'string', format: 'date-time' },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
      required: [
        'id',
        'userId',
        'title',
        'targetRole',
        'estimatedDuration',
        'pathSteps',
      ],
    });
  }

  /**
   * Add authentication endpoints
   */
  private addAuthenticationEndpoints(): void {
    this.addEndpoint({
      method: 'POST',
      path: '/oauth/token',
      summary: 'Get access token',
      description: 'Obtain an OAuth 2.0 access token using client credentials',
      tags: ['Authentication'],
      requestBody: {
        description: 'Token request',
        required: true,
        content: {
          'application/x-www-form-urlencoded': {
            schema: {
              type: 'object',
              properties: {
                grant_type: { type: 'string', example: 'client_credentials' },
                client_id: { type: 'string' },
                client_secret: { type: 'string' },
                scope: { type: 'string', example: 'read write' },
              },
              required: ['grant_type', 'client_id', 'client_secret'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Access token granted',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  access_token: { type: 'string' },
                  token_type: { type: 'string', example: 'Bearer' },
                  expires_in: { type: 'integer' },
                  scope: { type: 'string' },
                },
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
      security: [],
    });
  }

  /**
   * Add course endpoints
   */
  private addCourseEndpoints(): void {
    this.addEndpoint({
      method: 'GET',
      path: '/courses',
      summary: 'List available courses',
      description:
        'Retrieve a list of available courses with optional filtering',
      tags: ['Courses'],
      parameters: [
        { $ref: '#/components/parameters/Page' },
        { $ref: '#/components/parameters/Limit' },
        {
          name: 'category',
          in: 'query',
          description: 'Filter by course category',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'level',
          in: 'query',
          description: 'Filter by course level',
          required: false,
          schema: {
            type: 'string',
            enum: ['Beginner', 'Intermediate', 'Advanced'],
          },
        },
      ],
      responses: {
        '200': {
          description: 'List of courses',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/PaginatedResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Course' },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });
  }

  /**
   * Add application endpoints
   */
  private addApplicationEndpoints(): void {
    this.addEndpoint({
      method: 'POST',
      path: '/applications',
      summary: 'Submit funding application',
      description: 'Submit a new funding application for course enrollment',
      tags: ['Applications'],
      requestBody: {
        description: 'Application details',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'string', format: 'uuid' },
                courseId: { type: 'string' },
                schemeId: { type: 'string' },
                personalDetails: { type: 'object' },
                supportingDocuments: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['userId', 'courseId', 'schemeId'],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Application submitted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: { type: 'string' },
                  submittedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });
  }

  /**
   * Add participant endpoints
   */
  private addParticipantEndpoints(): void {
    this.addEndpoint({
      method: 'GET',
      path: '/participants/{userId}/progress',
      summary: 'Get participant progress',
      description: 'Retrieve learning progress for a specific participant',
      tags: ['Participants'],
      parameters: [{ $ref: '#/components/parameters/UserId' }],
      responses: {
        '200': {
          description: 'Participant progress',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  completedCourses: { type: 'integer' },
                  totalHours: { type: 'number' },
                  averageScore: { type: 'number' },
                  certifications: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                },
              },
            },
          },
        },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    });
  }

  /**
   * Add webhook endpoints
   */
  private addWebhookEndpoints(): void {
    this.addEndpoint({
      method: 'POST',
      path: '/webhooks',
      summary: 'Register webhook',
      description: 'Register a new webhook endpoint for event notifications',
      tags: ['Webhooks'],
      requestBody: {
        description: 'Webhook configuration',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                url: { type: 'string', format: 'uri' },
                events: {
                  type: 'array',
                  items: { type: 'string' },
                },
                secret: { type: 'string' },
              },
              required: ['url', 'events'],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Webhook registered',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  url: { type: 'string' },
                  active: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Add health endpoints
   */
  private addHealthEndpoints(): void {
    this.addEndpoint({
      method: 'GET',
      path: '/health',
      summary: 'Health check',
      description: 'Check the health status of the API and its dependencies',
      tags: ['Health'],
      responses: {
        '200': {
          description: 'System health status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['healthy', 'degraded', 'unhealthy'],
                  },
                  timestamp: { type: 'string', format: 'date-time' },
                  version: { type: 'string' },
                  dependencies: {
                    type: 'object',
                    additionalProperties: {
                      type: 'object',
                      properties: {
                        status: { type: 'string' },
                        responseTime: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      security: [],
    });
  }

  /**
   * Add skills framework endpoints
   */
  private addSkillsFrameworkEndpoints(): void {
    this.addEndpoint({
      method: 'GET',
      path: '/skills/framework',
      summary: 'Get SSG skills framework',
      description:
        'Retrieve the complete SSG skills framework with taxonomy and competencies',
      tags: ['Skills Framework'],
      parameters: [
        {
          name: 'sector',
          in: 'query',
          description: 'Filter by industry sector',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'category',
          in: 'query',
          description: 'Filter by skill category',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'level',
          in: 'query',
          description: 'Filter by proficiency level',
          required: false,
          schema: {
            type: 'string',
            enum: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
          },
        },
      ],
      responses: {
        '200': {
          description: 'SSG skills framework data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SkillsFramework' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });

    this.addEndpoint({
      method: 'POST',
      path: '/skills/framework/sync',
      summary: 'Synchronize skills framework',
      description: 'Trigger real-time synchronization with SSG skills taxonomy',
      tags: ['Skills Framework'],
      requestBody: {
        description: 'Sync configuration',
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                forceRefresh: {
                  type: 'boolean',
                  description: 'Force full refresh instead of incremental',
                },
                sectors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Specific sectors to sync (empty for all)',
                },
              },
            },
          },
        },
      },
      responses: {
        '202': {
          description: 'Synchronization initiated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  jobId: {
                    type: 'string',
                    description: 'Background job identifier',
                  },
                  status: { type: 'string', example: 'initiated' },
                  estimatedCompletion: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });

    this.addEndpoint({
      method: 'GET',
      path: '/skills/{skillId}',
      summary: 'Get skill details',
      description: 'Retrieve detailed information about a specific skill',
      tags: ['Skills Framework'],
      parameters: [
        {
          name: 'skillId',
          in: 'path',
          description: 'SSG skill identifier',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Skill details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Skill' },
            },
          },
        },
        '404': { $ref: '#/components/responses/NotFound' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });

    this.addEndpoint({
      method: 'POST',
      path: '/courses/{courseId}/skills',
      summary: 'Map course to skills',
      description: 'Create or update skill mappings for a course',
      tags: ['Skills Framework'],
      parameters: [
        {
          name: 'courseId',
          in: 'path',
          description: 'Course identifier',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        description: 'Skill mappings',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                mappings: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/SkillMapping' },
                },
                autoMap: {
                  type: 'boolean',
                  description: 'Use AI to automatically suggest mappings',
                },
              },
              required: ['mappings'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Skill mappings updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  courseId: { type: 'string' },
                  mappingsCount: { type: 'integer' },
                  mappings: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SkillMapping' },
                  },
                },
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    });

    this.addEndpoint({
      method: 'GET',
      path: '/courses/{courseId}/skills',
      summary: 'Get course skill mappings',
      description: 'Retrieve all skills mapped to a specific course',
      tags: ['Skills Framework'],
      parameters: [
        {
          name: 'courseId',
          in: 'path',
          description: 'Course identifier',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Course skill mappings',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  courseId: { type: 'string' },
                  courseTitle: { type: 'string' },
                  mappings: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SkillMapping' },
                  },
                },
              },
            },
          },
        },
        '404': { $ref: '#/components/responses/NotFound' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });
  }

  /**
   * Add skills tracking endpoints
   */
  private addSkillsTrackingEndpoints(): void {
    this.addEndpoint({
      method: 'GET',
      path: '/users/{userId}/skills/progress',
      summary: 'Get user skills progress',
      description: 'Retrieve comprehensive skills progress tracking for a user',
      tags: ['Skills Tracking'],
      parameters: [
        { $ref: '#/components/parameters/UserId' },
        {
          name: 'skillIds',
          in: 'query',
          description: 'Specific skill IDs to track (comma-separated)',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'sector',
          in: 'query',
          description: 'Filter by industry sector',
          required: false,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'User skills progress',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  totalSkills: { type: 'integer' },
                  skillsProgress: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SkillProgress' },
                  },
                  overallCompetencyScore: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Overall competency score (0-100)',
                  },
                  lastUpdated: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '404': { $ref: '#/components/responses/NotFound' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });

    this.addEndpoint({
      method: 'PUT',
      path: '/users/{userId}/skills/{skillId}/progress',
      summary: 'Update skill progress',
      description: 'Update progress tracking for a specific skill',
      tags: ['Skills Tracking'],
      parameters: [
        { $ref: '#/components/parameters/UserId' },
        {
          name: 'skillId',
          in: 'path',
          description: 'Skill identifier',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        description: 'Progress update',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                currentLevel: {
                  type: 'string',
                  enum: ['None', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
                },
                evidence: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: [
                        'Course',
                        'Certification',
                        'WorkExperience',
                        'Assessment',
                      ],
                    },
                    title: { type: 'string' },
                    completedDate: { type: 'string', format: 'date-time' },
                    verificationUrl: { type: 'string', format: 'uri' },
                  },
                  required: ['type', 'title', 'completedDate'],
                },
                assessmentScore: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                  description: 'Assessment score if applicable',
                },
              },
              required: ['currentLevel'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Progress updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SkillProgress' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    });

    this.addEndpoint({
      method: 'POST',
      path: '/users/{userId}/skills/gap-analysis',
      summary: 'Generate skills gap analysis',
      description:
        'Analyze skills gaps for career progression or role requirements',
      tags: ['Skills Tracking'],
      parameters: [{ $ref: '#/components/parameters/UserId' }],
      requestBody: {
        description: 'Gap analysis request',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                targetRole: {
                  type: 'string',
                  description: 'Target job role for analysis',
                },
                targetCompany: {
                  type: 'string',
                  description: 'Specific company requirements (optional)',
                },
                careerLevel: {
                  type: 'string',
                  enum: ['Entry', 'Mid', 'Senior', 'Executive'],
                  description: 'Target career level',
                },
                includeMarketTrends: {
                  type: 'boolean',
                  description: 'Include job market trends in analysis',
                },
                prioritySkills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Priority skills to focus on',
                },
              },
              required: ['targetRole'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Skills gap analysis',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SkillsGap' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    });
  }

  /**
   * Add learning path endpoints
   */
  private addLearningPathEndpoints(): void {
    this.addEndpoint({
      method: 'POST',
      path: '/users/{userId}/learning-paths',
      summary: 'Generate personalized learning path',
      description:
        'Create AI-optimized learning path based on skills gap analysis',
      tags: ['Learning Paths'],
      parameters: [{ $ref: '#/components/parameters/UserId' }],
      requestBody: {
        description: 'Learning path generation request',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                skillsGapId: {
                  type: 'string',
                  description: 'Skills gap analysis identifier',
                },
                targetRole: { type: 'string' },
                timeframe: {
                  type: 'object',
                  properties: {
                    months: { type: 'integer', minimum: 1, maximum: 36 },
                    hoursPerWeek: { type: 'integer', minimum: 1, maximum: 40 },
                  },
                  required: ['months', 'hoursPerWeek'],
                },
                budget: {
                  type: 'object',
                  properties: {
                    maxAmount: { type: 'number', minimum: 0 },
                    currency: { type: 'string', example: 'SGD' },
                  },
                },
                preferences: {
                  type: 'object',
                  properties: {
                    learningStyle: {
                      type: 'string',
                      enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reading'],
                    },
                    formats: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: ['Online', 'Classroom', 'Blended', 'SelfPaced'],
                      },
                    },
                    certificationRequired: { type: 'boolean' },
                  },
                },
                prioritySkills: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Skills to prioritize in the learning path',
                },
              },
              required: ['targetRole', 'timeframe'],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Learning path created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LearningPath' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    });

    this.addEndpoint({
      method: 'GET',
      path: '/users/{userId}/learning-paths',
      summary: 'Get user learning paths',
      description: 'Retrieve all learning paths for a user',
      tags: ['Learning Paths'],
      parameters: [
        { $ref: '#/components/parameters/UserId' },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by path status',
          required: false,
          schema: {
            type: 'string',
            enum: ['Active', 'Completed', 'Paused', 'Cancelled'],
          },
        },
      ],
      responses: {
        '200': {
          description: 'User learning paths',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  totalPaths: { type: 'integer' },
                  paths: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/LearningPath' },
                  },
                },
              },
            },
          },
        },
        '404': { $ref: '#/components/responses/NotFound' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });

    this.addEndpoint({
      method: 'GET',
      path: '/learning-paths/{pathId}',
      summary: 'Get learning path details',
      description:
        'Retrieve detailed information about a specific learning path',
      tags: ['Learning Paths'],
      parameters: [
        {
          name: 'pathId',
          in: 'path',
          description: 'Learning path identifier',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Learning path details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LearningPath' },
            },
          },
        },
        '404': { $ref: '#/components/responses/NotFound' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });

    this.addEndpoint({
      method: 'PUT',
      path: '/learning-paths/{pathId}/progress',
      summary: 'Update learning path progress',
      description: 'Update progress on learning path steps',
      tags: ['Learning Paths'],
      parameters: [
        {
          name: 'pathId',
          in: 'path',
          description: 'Learning path identifier',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        description: 'Progress update',
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                stepNumber: {
                  type: 'integer',
                  description: 'Step number being updated',
                },
                status: {
                  type: 'string',
                  enum: ['NotStarted', 'InProgress', 'Completed', 'Skipped'],
                },
                completionDate: { type: 'string', format: 'date-time' },
                notes: { type: 'string', description: 'Progress notes' },
                evidence: {
                  type: 'object',
                  properties: {
                    certificateUrl: { type: 'string', format: 'uri' },
                    assessmentScore: { type: 'number' },
                    completionProof: { type: 'string' },
                  },
                },
              },
              required: ['stepNumber', 'status'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Progress updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  pathId: { type: 'string' },
                  stepNumber: { type: 'integer' },
                  status: { type: 'string' },
                  overallProgress: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Overall path completion percentage',
                  },
                },
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    });

    this.addEndpoint({
      method: 'GET',
      path: '/skills/market-trends',
      summary: 'Get skills market trends',
      description: 'Retrieve job market data and skills demand forecasting',
      tags: ['Learning Paths'],
      parameters: [
        {
          name: 'sector',
          in: 'query',
          description: 'Industry sector',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'region',
          in: 'query',
          description: 'Geographic region',
          required: false,
          schema: { type: 'string', example: 'Singapore' },
        },
        {
          name: 'timeframe',
          in: 'query',
          description: 'Forecast timeframe in months',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 36, example: 12 },
        },
      ],
      responses: {
        '200': {
          description: 'Market trends and demand forecast',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reportDate: { type: 'string', format: 'date-time' },
                  region: { type: 'string' },
                  sector: { type: 'string' },
                  trendingSkills: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        skillId: { type: 'string' },
                        skillTitle: { type: 'string' },
                        demandGrowth: {
                          type: 'number',
                          description: 'Demand growth percentage',
                        },
                        averageSalary: { type: 'number' },
                        jobOpenings: { type: 'integer' },
                        skillShortage: {
                          type: 'string',
                          enum: ['Low', 'Medium', 'High', 'Critical'],
                        },
                      },
                    },
                  },
                  emergingSkills: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Newly emerging skills in the market',
                  },
                  decliningSkills: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Skills with declining demand',
                  },
                  forecast: {
                    type: 'object',
                    properties: {
                      timeframe: {
                        type: 'integer',
                        description: 'Forecast period in months',
                      },
                      confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 100,
                        description: 'Forecast confidence level',
                      },
                      keyTrends: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Key market trends',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    });
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createDocumentationService(config: {
  title: string;
  description: string;
  version: string;
  contact?: OpenAPISpec['info']['contact'];
  license?: OpenAPISpec['info']['license'];
  servers: OpenAPISpec['servers'];
}): SSGWSGDocumentationService {
  const service = new SSGWSGDocumentationService(config);
  service.initializeSSGWSGEndpoints();
  return service;
}
