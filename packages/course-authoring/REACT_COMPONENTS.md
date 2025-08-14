# Course Authoring React UI Components

This package provides a complete set of React components for building course authoring interfaces. These components integrate seamlessly with the course authoring services and provide production-ready UI for complex educational content management.

## Components Overview

### 🎨 LearningPathDesigner

Interactive drag-and-drop learning path designer with prerequisite management.

**Features:**

- Drag-and-drop node positioning
- Multiple layout algorithms (hierarchical, force-directed, circular)
- Prerequisite relationship management
- Real-time visual feedback
- Node property editing panel

**Usage:**

```tsx
import { LearningPathDesigner } from "@tmslms/course-authoring";

<LearningPathDesigner
  learningPath={existingPath}
  onSave={path => console.log("Saved path:", path)}
  onClose={() => setDesignerOpen(false)}
/>;
```

### 📚 TemplateLibraryBrowser

Comprehensive template and component library browser with search and preview.

**Features:**

- Template search and filtering
- Category and tag-based organization
- Live template preview
- Component library management
- Template application workflow

**Usage:**

```tsx
import { TemplateLibraryBrowser } from "@tmslms/course-authoring";

<TemplateLibraryBrowser
  onSelectTemplate={template => applyTemplate(template)}
  onClose={() => setBrowserOpen(false)}
/>;
```

### 🤝 CollaborationDashboard

Multi-author collaboration dashboard with workflow management.

**Features:**

- Review workflow tracking
- Approval process management
- Comment and feedback system
- Activity history
- Role-based permissions

**Usage:**

```tsx
import { CollaborationDashboard } from "@tmslms/course-authoring";

<CollaborationDashboard
  courseId="course-123"
  userId="user-456"
  onClose={() => setDashboardOpen(false)}
/>;
```

### 📊 AnalyticsVisualization

Advanced analytics dashboard with interactive charts and insights.

**Features:**

- Real-time metrics display
- Interactive trend charts
- Learning progress visualization
- Performance insights
- Customizable time ranges

**Usage:**

```tsx
import { AnalyticsVisualization } from "@tmslms/course-authoring";

<AnalyticsVisualization
  courseId="course-123"
  timeRange="month"
  onClose={() => setAnalyticsOpen(false)}
/>;
```

## Component Architecture

### Design Principles

- **Self-contained**: Each component manages its own state and dependencies
- **Service Integration**: Components directly integrate with backend services
- **Type Safety**: Full TypeScript support with strict typing
- **Responsive**: Mobile-friendly responsive design
- **Accessible**: WCAG 2.1 compliance with keyboard navigation

### Styling Approach

Components use CSS-in-JS with styled-jsx for:

- Scoped styling without CSS conflicts
- Dynamic theming support
- Performance optimization
- Component-level style isolation

### State Management

- Local component state for UI interactions
- Service layer for data persistence
- Real-time updates via service subscriptions
- Optimistic UI updates for better UX

## Integration Examples

### Complete Course Authoring Interface

```tsx
import React, { useState } from "react";
import {
  LearningPathDesigner,
  TemplateLibraryBrowser,
  CollaborationDashboard,
  AnalyticsVisualization,
} from "@tmslms/course-authoring";

function CourseAuthoringApp() {
  const [activeView, setActiveView] = useState("editor");
  const [courseId] = useState("course-123");
  const [userId] = useState("user-456");

  return (
    <div className="course-authoring-app">
      <nav>
        <button onClick={() => setActiveView("paths")}>Learning Paths</button>
        <button onClick={() => setActiveView("templates")}>Templates</button>
        <button onClick={() => setActiveView("collaboration")}>
          Collaboration
        </button>
        <button onClick={() => setActiveView("analytics")}>Analytics</button>
      </nav>

      {activeView === "paths" && (
        <LearningPathDesigner
          onSave={path => console.log("Path saved:", path)}
          onClose={() => setActiveView("editor")}
        />
      )}

      {activeView === "templates" && (
        <TemplateLibraryBrowser
          onSelectTemplate={template =>
            console.log("Template selected:", template)
          }
          onClose={() => setActiveView("editor")}
        />
      )}

      {activeView === "collaboration" && (
        <CollaborationDashboard
          courseId={courseId}
          userId={userId}
          onClose={() => setActiveView("editor")}
        />
      )}

      {activeView === "analytics" && (
        <AnalyticsVisualization
          courseId={courseId}
          onClose={() => setActiveView("editor")}
        />
      )}
    </div>
  );
}
```

### Modal Integration

```tsx
import React, { useState } from "react";
import { LearningPathDesigner } from "@tmslms/course-authoring";

function CourseEditor() {
  const [showPathDesigner, setShowPathDesigner] = useState(false);

  return (
    <>
      <button onClick={() => setShowPathDesigner(true)}>
        Design Learning Path
      </button>

      {showPathDesigner && (
        <div className="modal-overlay">
          <LearningPathDesigner
            onSave={path => {
              savePath(path);
              setShowPathDesigner(false);
            }}
            onClose={() => setShowPathDesigner(false)}
          />
        </div>
      )}
    </>
  );
}
```

## Customization

### Theme Override

```tsx
// Create a theme context for consistent styling
const theme = {
  colors: {
    primary: "#2196f3",
    secondary: "#4caf50",
    danger: "#f44336",
    warning: "#ff9800",
  },
  spacing: {
    small: "8px",
    medium: "16px",
    large: "24px",
  },
};

// Components automatically inherit theme via CSS custom properties
<div style={{ "--primary-color": theme.colors.primary }}>
  <LearningPathDesigner />
</div>;
```

### Custom Event Handlers

```tsx
<CollaborationDashboard
  courseId="course-123"
  userId="user-456"
  onWorkflowUpdate={workflow => {
    // Custom workflow update logic
    notifyTeam(workflow);
    updateUI(workflow);
  }}
  onCommentAdded={comment => {
    // Custom comment handling
    sendNotification(comment);
  }}
/>
```

## Performance Considerations

### Code Splitting

```tsx
import { lazy, Suspense } from "react";

const LearningPathDesigner = lazy(() =>
  import("@tmslms/course-authoring").then(module => ({
    default: module.LearningPathDesigner,
  }))
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LearningPathDesigner />
    </Suspense>
  );
}
```

### Memory Management

- Components automatically cleanup subscriptions on unmount
- Large datasets are virtualized for performance
- Image and media assets use lazy loading
- Service connections are pooled and reused

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { LearningPathDesigner } from "@tmslms/course-authoring";

test("learning path designer saves path on save button click", async () => {
  const mockSave = jest.fn();

  render(<LearningPathDesigner onSave={mockSave} onClose={() => {}} />);

  fireEvent.click(screen.getByText("Save"));

  expect(mockSave).toHaveBeenCalledWith(
    expect.objectContaining({
      id: expect.any(String),
      title: expect.any(String),
      nodes: expect.any(Array),
    })
  );
});
```

### Integration Testing

```tsx
import { render, screen } from "@testing-library/react";
import { CourseAuthoringProvider } from "@tmslms/course-authoring";
import { TemplateLibraryBrowser } from "@tmslms/course-authoring";

test("template browser loads templates on mount", async () => {
  render(
    <CourseAuthoringProvider>
      <TemplateLibraryBrowser onSelectTemplate={() => {}} onClose={() => {}} />
    </CourseAuthoringProvider>
  );

  expect(await screen.findByText("Loading templates...")).toBeInTheDocument();
  expect(await screen.findByText(/templates found/)).toBeInTheDocument();
});
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features Used**: CSS Grid, Flexbox, SVG, Canvas API, File API
- **Polyfills**: None required for supported browsers

## Accessibility

### Keyboard Navigation

- Full keyboard accessibility for all interactive elements
- Tab order follows logical content flow
- Escape key closes modals and overlays
- Arrow keys for drag-and-drop operations

### Screen Reader Support

- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content updates
- High contrast mode compatibility

### Focus Management

- Clear focus indicators
- Focus trap in modal dialogs
- Programmatic focus management
- Skip links for complex interfaces

## Production Deployment

### Build Configuration

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:prod": "NODE_ENV=production npm run build"
  }
}
```

### Bundle Optimization

- Tree shaking for unused components
- Code splitting by route/feature
- SVG optimization for icons
- Image compression and WebP support

### CDN Deployment

Components are optimized for CDN delivery:

- Minified JavaScript bundles
- Compressed CSS assets
- HTTP/2 server push headers
- Long-term caching strategies

## Migration Guide

### From Version 1.x to 2.x

- Updated React peer dependency to 18+
- New TypeScript strict mode requirements
- Changed prop names for consistency
- Added new component lifecycle methods

### Breaking Changes

- `onPathChanged` → `onSave` in LearningPathDesigner
- Template props now require explicit typing
- Service instantiation moved to component level
- CSS class names updated for BEM consistency

## Contributing

### Development Setup

```bash
npm install
npm run dev        # Start development server
npm run test       # Run test suite
npm run lint       # Check code quality
npm run type-check # Verify TypeScript
```

### Component Guidelines

1. Use TypeScript with strict mode
2. Include comprehensive prop types
3. Add unit tests for all features
4. Follow accessibility guidelines
5. Document public APIs thoroughly

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit pull request with description

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: https://docs.tmslms.dev/course-authoring
- **Issues**: https://github.com/tmslms/tmslms/issues
- **Discussions**: https://github.com/tmslms/tmslms/discussions
- **Discord**: https://discord.gg/tmslms
