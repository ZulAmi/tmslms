import React from 'react';
import { LearningPath, LearningNode, UUID } from '../types';

interface LearningPathDesignerProps {
  learningPath?: LearningPath;
  onSave: (path: LearningPath) => void;
  onClose: () => void;
}

export const LearningPathDesigner = ({
  learningPath,
  onSave,
  onClose
}: LearningPathDesignerProps) => {
  // Mock data for demonstration
  const mockNodes = [
    {
      id: '1' as UUID,
      title: 'Introduction',
      position: { x: 100, y: 100 },
      type: 'course' as const,
      prerequisites: [] as UUID[]
    },
    {
      id: '2' as UUID,
      title: 'Core Concepts',
      position: { x: 300, y: 100 },
      type: 'module' as const,
      prerequisites: ['1' as UUID]
    },
    {
      id: '3' as UUID,
      title: 'Final Assessment',
      position: { x: 500, y: 100 },
      type: 'assessment' as const,
      prerequisites: ['2' as UUID]
    }
  ];

  const handleSave = () => {
    const pathNodes: LearningNode[] = mockNodes.map(node => {
      if (node.type === 'course') {
        return {
          id: node.id,
          type: 'course' as const,
          courseId: node.id,
          title: node.title,
          prerequisites: node.prerequisites
        };
      } else if (node.type === 'module') {
        return {
          id: node.id,
          type: 'module' as const,
          moduleId: node.id,
          title: node.title,
          prerequisites: node.prerequisites
        };
      } else {
        return {
          id: node.id,
          type: 'assessment' as const,
          assessmentId: node.id,
          title: node.title,
          prerequisites: node.prerequisites
        };
      }
    });

    const savedPath: LearningPath = {
      id: learningPath?.id || ('new-path' as UUID),
      title: learningPath?.title || 'New Learning Path',
      nodes: pathNodes
    };

    onSave(savedPath);
  };

  return (
    <div className="learning-path-designer">
      <div className="designer-header">
        <h2>Learning Path Designer</h2>
        <div className="header-actions">
          <button onClick={handleSave} className="save-btn">
            Save Path
          </button>
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>
      </div>

      <div className="designer-canvas">
        <svg width="800" height="600" className="path-canvas">
          {/* Connection lines */}
          {mockNodes.map(node =>
            node.prerequisites.map(prereqId => {
              const prereq = mockNodes.find(n => n.id === prereqId);
              if (!prereq) return null;
              return (
                <line
                  key={`${node.id}-${prereqId}`}
                  x1={prereq.position.x + 60}
                  y1={prereq.position.y + 30}
                  x2={node.position.x}
                  y2={node.position.y + 30}
                  stroke="#007acc"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })
          )}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#007acc" />
            </marker>
          </defs>
        </svg>

        {/* Node elements */}
        <div className="nodes-container">
          {mockNodes.map(node => (
            <div
              key={node.id}
              className={`node node-${node.type}`}
              style={{
                left: node.position.x,
                top: node.position.y
              }}
            >
              <div className="node-header">
                <span className="node-type">{node.type.charAt(0).toUpperCase()}</span>
                <h4>{node.title}</h4>
              </div>
              <div className="node-content">
                <p>Prerequisites: {node.prerequisites.length}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="designer-sidebar">
        <h3>Path Information</h3>
        <div className="path-info">
          <div>Title: {learningPath?.title || 'New Learning Path'}</div>
          <div>Nodes: {mockNodes.length}</div>
          <div>Total Duration: {mockNodes.length * 30} minutes</div>
        </div>

        <h3>Add Components</h3>
        <div className="component-library">
          <button className="component-btn">+ Course</button>
          <button className="component-btn">+ Module</button>
          <button className="component-btn">+ Assessment</button>
        </div>
      </div>

      <style>{`
        .learning-path-designer {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8f9fa;
        }

        .designer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid #e1e5e9;
        }

        .designer-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .save-btn, .close-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .save-btn {
          background: #007acc;
          color: white;
        }

        .save-btn:hover {
          background: #005a9e;
        }

        .close-btn {
          background: #6b7280;
          color: white;
        }

        .close-btn:hover {
          background: #4b5563;
        }

        .designer-canvas {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #f0f0f0 1px, transparent 1px),
                      linear-gradient(#f0f0f0 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .path-canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .nodes-container {
          position: relative;
          z-index: 2;
        }

        .node {
          position: absolute;
          width: 120px;
          background: white;
          border: 2px solid #007acc;
          border-radius: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .node:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .node-course {
          border-color: #10b981;
        }

        .node-module {
          border-color: #f59e0b;
        }

        .node-assessment {
          border-color: #ef4444;
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
          border-radius: 0.25rem 0.25rem 0 0;
        }

        .node-type {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #007acc;
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .node-course .node-type {
          background: #10b981;
        }

        .node-module .node-type {
          background: #f59e0b;
        }

        .node-assessment .node-type {
          background: #ef4444;
        }

        .node-header h4 {
          margin: 0;
          font-size: 0.875rem;
          color: #1f2937;
        }

        .node-content {
          padding: 0.5rem;
        }

        .node-content p {
          margin: 0;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .designer-sidebar {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 250px;
          background: white;
          border-left: 1px solid #e1e5e9;
          padding: 1rem;
          overflow-y: auto;
        }

        .designer-sidebar h3 {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .path-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .path-info div {
          font-size: 0.875rem;
          color: #4b5563;
        }

        .component-library {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .component-btn {
          padding: 0.75rem;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.2s;
          text-align: left;
        }

        .component-btn:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
};
