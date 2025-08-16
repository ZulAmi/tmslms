# Assessment System

A comprehensive assessment system with advanced features including Computer Adaptive Testing (CAT), ML-powered grading, anti-cheating mechanisms, and detailed analytics.

## Features

### 🎯 Question Bank Management

- **Comprehensive Question Types**: MCQ, essay, drag-drop, hotspot, code evaluation, audio/video responses, and more
- **Advanced Categorization**: Hierarchical categories, tags, subjects, topics, and learning objectives
- **Quality Analytics**: Difficulty index, discrimination analysis, item response theory metrics
- **Import/Export**: Support for JSON, QTI, CSV, and XLSX formats
- **Search & Filtering**: Semantic search with multiple criteria and content-based filtering

### 🧠 Computer Adaptive Testing (CAT)

- **IRT Models**: Support for 1PL, 2PL, 3PL, GPCM, and GRM models
- **Ability Estimation**: MLE, WLE, EAP, and MAP methods
- **Item Selection**: Maximum information, weighted information, Bayesian, and constraint-based algorithms
- **Stopping Criteria**: Configurable based on SEM, reliability, question count, or time
- **Exposure Control**: Sympson-Hetter, Randomesque, and Progressive methods
- **Content Balancing**: Automatic constraint enforcement for balanced test construction

### 🤖 ML-Powered Grading

- **Automated Essay Scoring**: Neural network-based grading with rubric support
- **Code Evaluation**: Syntax validation, test case execution, quality analysis, and security checking
- **Multimedia Assessment**: Audio transcription, video analysis, and gesture recognition
- **Rubric-Based Grading**: Criterion-specific scoring with confidence measures
- **Human Review Integration**: Automatic flagging for low-confidence scores
- **Bias Detection**: Demographic, linguistic, and temporal bias analysis

### 🔒 Security & Anti-Cheating

- **Browser Lockdown**: Prevent copy/paste, right-click, new tabs, and developer tools
- **Behavior Analysis**: Keystroke patterns, mouse movement, focus tracking, and suspicious activity detection
- **Plagiarism Detection**: Text similarity, code comparison, and external source checking
- **Randomization**: Question and answer order, parameter variation, and content shuffling
- **Environment Monitoring**: Screen recording, webcam monitoring, and periodic environment scans
- **Authentication**: Multi-factor auth, biometric verification, and ID checking

### 👁️ Proctoring Integration

- **Multiple Providers**: Support for Proctorio, Examity, Honorlock, ProctorU, and custom solutions
- **Monitoring Types**: Live, recorded, automated, and hybrid proctoring
- **AI Detection**: Face recognition, eye tracking, audio analysis, and motion detection
- **Real-time Alerts**: Configurable severity levels and automatic flagging
- **Review Workflow**: Automated scoring with human review for flagged content

### 📊 Advanced Analytics

- **Psychometric Analysis**: Reliability (Cronbach's Alpha), validity metrics, and item analysis
- **Performance Analytics**: Score distributions, percentiles, and trend analysis
- **Predictive Modeling**: Early warning systems and success prediction
- **Detailed Reporting**: Participant, item, and assessment-level insights
- **Real-time Dashboards**: Live monitoring and performance tracking

### ♿ Accessibility Features

- **WCAG Compliance**: AA level compliance with comprehensive accessibility features
- **Assistive Technology**: Screen reader, magnification, and voice recognition support
- **Accommodations**: Extended time, breaks, alternative formats, and custom configurations
- **Universal Design**: Multiple access methods, clear navigation, and flexible timing
- **Multi-language Support**: Internationalization and localization capabilities

## Quick Start

```typescript
import { createAssessmentSystem } from '@tmslms/assessment-system';

// Initialize the assessment system
const system = createAssessmentSystem({
  enableCAT: true,
  enableMLGrading: true,
  enableProctoring: true,
  enableSecurity: true,
});

// Create a question bank
const questionBank = await system.questionBankService.createQuestionBank({
  name: 'Math Assessment Bank',
  description: 'Questions for mathematics assessment',
  createdBy: 'instructor-123',
});

// Add questions to the bank
const question = await system.questionBankService.createQuestion({
  title: 'Basic Algebra',
  content: {
    type: 'multiple-choice',
    text: 'What is 2x + 5 = 15?',
    options: [
      { id: 'a', text: 'x = 5', isCorrect: true },
      { id: 'b', text: 'x = 7', isCorrect: false },
      { id: 'c', text: 'x = 10', isCorrect: false },
    ],
    correctAnswers: ['a'],
  },
  subject: 'Mathematics',
  topic: 'Algebra',
  difficulty: 2,
  points: 10,
  createdBy: 'instructor-123',
});

// Create an assessment
const assessment = await system.assessmentService.createAssessment(
  {
    title: 'Midterm Mathematics Exam',
    description: 'Comprehensive math assessment',
    type: 'exam',
    questions: [{ questionId: question.id, points: 10 }],
    configuration: {
      timeLimit: 60, // minutes
      attempts: 2,
      randomizeQuestions: true,
    },
    security: {
      browserLockdown: { enabled: true },
      behaviorAnalysis: { enabled: true },
    },
  },
  'instructor-123'
);

// Start an assessment session
const session = await system.assessmentService.startAssessment(
  assessment.id,
  'student-456',
  {
    adaptiveTesting: true,
    proctoringEnabled: true,
    securityLevel: 'high',
  }
);

// Get next question (CAT will select optimal question)
const nextQuestion = await system.assessmentService.getNextQuestion(session.id);

// Submit response
await system.assessmentService.submitResponse(session.id, nextQuestion.id, {
  type: 'choice',
  selected: ['a'],
});

// Complete assessment
const attempt = await system.assessmentService.completeAssessment(
  session.id,
  'completed'
);
```

## Architecture

The assessment system is built with a modular architecture:

### Core Services

- **QuestionBankService**: Question management and search
- **CATEngine**: Adaptive testing algorithms and item selection
- **MLGradingService**: Automated grading with machine learning
- **AssessmentService**: Main orchestration service
- **SecurityService**: Anti-cheating and monitoring
- **ProctoringService**: Proctoring integration
- **AnalyticsService**: Reporting and insights

### Key Features

- **Event-Driven**: All services emit events for loose coupling
- **TypeScript**: Full type safety with comprehensive interfaces
- **Extensible**: Plugin architecture for custom integrations
- **Scalable**: Designed for high-concurrency environments
- **Standards-Compliant**: QTI, WCAG, and psychometric standards

## Advanced Configuration

### Computer Adaptive Testing

```typescript
const catConfig = {
  algorithm: 'irt-2pl',
  parameters: {
    startingAbility: 0,
    minQuestions: 5,
    maxQuestions: 20,
    targetSEM: 0.3,
    exposureControl: 'sympson-hetter',
  },
  stoppingCriteria: {
    maxSEM: 0.3,
    minReliability: 0.8,
  },
};
```

### ML Grading Setup

```typescript
const gradingConfig = {
  autoGrading: {
    enabled: true,
    confidenceThreshold: 0.8,
    humanReviewRequired: true,
  },
  rubrics: [
    {
      name: 'Essay Rubric',
      criteria: ['content', 'organization', 'grammar'],
      levels: ['excellent', 'good', 'satisfactory', 'needs_improvement'],
    },
  ],
};
```

### Security Configuration

```typescript
const securityConfig = {
  browserLockdown: {
    preventCopyPaste: true,
    fullScreen: true,
    disableDevTools: true,
  },
  behaviorAnalysis: {
    trackMouseMovement: true,
    trackKeystrokes: true,
    suspicionThreshold: 0.7,
  },
};
```

## Integration Examples

### LMS Integration

```typescript
// Integrate with existing LMS
import { Assessment, ParticipantAttempt } from '@tmslms/assessment-system';

class LMSIntegration {
  async syncGrades(attempt: ParticipantAttempt) {
    // Sync grades back to LMS gradebook
    await lms.updateGrade(attempt.participantId, attempt.score);
  }

  async enrollParticipants(assessmentId: string, courseId: string) {
    // Auto-enroll course participants
    const participants = await lms.getCourseParticipants(courseId);
    // ... enrollment logic
  }
}
```

### Proctoring Integration

```typescript
// Custom proctoring provider
class CustomProctoringProvider {
  async startSession(config: ProctoringConfiguration) {
    // Initialize proctoring session
    return await this.api.createSession(config);
  }

  async processAlerts(alerts: ProctoringAlert[]) {
    // Handle real-time alerts
    alerts.forEach((alert) => this.handleAlert(alert));
  }
}
```

## Performance Considerations

- **Caching**: Built-in caching for question banks and assessment metadata
- **Lazy Loading**: Questions loaded on-demand during delivery
- **Batch Processing**: Efficient bulk operations for imports and analytics
- **Database Optimization**: Indexed searches and query optimization
- **Scalability**: Horizontal scaling support with session clustering

## Security Best Practices

1. **Data Encryption**: All sensitive data encrypted at rest and in transit
2. **Access Controls**: Role-based permissions and audit logging
3. **Session Management**: Secure session handling with timeout controls
4. **Content Protection**: Question bank security and access controls
5. **Compliance**: FERPA, GDPR, and accessibility compliance

## API Reference

### Question Bank API

- `createQuestion(data)` - Create new question
- `searchQuestions(criteria)` - Advanced question search
- `analyzeQuestionQuality(id)` - Get quality metrics
- `importQuestions(data, format)` - Bulk import
- `exportQuestions(ids, format)` - Bulk export

### Assessment API

- `createAssessment(data)` - Create assessment
- `startAssessment(id, participant)` - Begin session
- `getNextQuestion(sessionId)` - Get next question (CAT)
- `submitResponse(sessionId, data)` - Submit answer
- `completeAssessment(sessionId)` - Finish assessment

### Analytics API

- `generateAssessmentAnalytics(id)` - Comprehensive analytics
- `getItemAnalysis(questionId)` - Item statistics
- `getParticipantReport(id)` - Individual performance
- `exportAnalytics(format)` - Export reports

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support:

- 📧 Email: support@tmslms.com
- 📖 Documentation: [docs.tmslms.com](https://docs.tmslms.com)
- 🐛 Issues: [GitHub Issues](https://github.com/tmslms/assessment-system/issues)
- 💬 Discord: [TMSLMS Community](https://discord.gg/tmslms)
