"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateLibraryBrowser = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const TemplateLibraryBrowser = ({ onSelectTemplate, onClose }) => {
    // Mock templates for demonstration
    const mockTemplates = [
        {
            id: 'basic-course',
            name: 'Basic Course Template',
            description: 'A simple course template with introduction, content, and assessment',
            category: 'General',
            tags: ['basic', 'beginner'],
            previewUrl: 'https://example.com/preview/basic',
            difficulty: 'beginner',
            estimatedDuration: 60,
            structure: {
                modules: [
                    {
                        id: 'intro',
                        title: 'Introduction',
                        lessons: [
                            { id: 'welcome', title: 'Welcome', duration: 15 },
                            { id: 'objectives', title: 'Learning Objectives', duration: 15 }
                        ]
                    }
                ]
            }
        }
    ];
    const handleSelectTemplate = (template) => {
        const courseTemplate = {
            id: template.id,
            name: template.name,
            description: template.description,
            blocks: [], // Empty blocks for now
            metadata: {
                category: template.category,
                tags: template.tags,
                difficulty: template.difficulty,
                estimatedDuration: template.estimatedDuration,
                author: 'System',
                isPublic: true
            }
        };
        onSelectTemplate(courseTemplate);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "template-library-browser", children: [(0, jsx_runtime_1.jsxs)("div", { className: "browser-header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Template Library" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "close-btn", children: "Close" })] }), (0, jsx_runtime_1.jsx)("div", { className: "browser-content", children: (0, jsx_runtime_1.jsx)("div", { className: "templates-grid", children: mockTemplates.map(template => ((0, jsx_runtime_1.jsxs)("div", { className: "template-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "template-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: template.name }), (0, jsx_runtime_1.jsx)("span", { className: `difficulty-badge difficulty-${template.difficulty}`, children: template.difficulty })] }), (0, jsx_runtime_1.jsx)("p", { className: "template-description", children: template.description }), (0, jsx_runtime_1.jsx)("div", { className: "template-actions", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleSelectTemplate(template), className: "select-btn", children: "Use This Template" }) })] }, template.id))) }) }), (0, jsx_runtime_1.jsx)("style", { children: `
        .template-library-browser {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8f9fa;
        }

        .browser-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e1e5e9;
        }

        .browser-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .close-btn {
          padding: 0.5rem 1rem;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          font-weight: 500;
        }

        .close-btn:hover {
          background: #4b5563;
        }

        .browser-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .template-card {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .template-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .template-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
        }

        .difficulty-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .difficulty-beginner {
          background: #d1fae5;
          color: #047857;
        }

        .template-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .template-actions {
          display: flex;
          justify-content: flex-end;
        }

        .select-btn {
          background: #007acc;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.25rem;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .select-btn:hover {
          background: #005a9e;
        }
      ` })] }));
};
exports.TemplateLibraryBrowser = TemplateLibraryBrowser;
