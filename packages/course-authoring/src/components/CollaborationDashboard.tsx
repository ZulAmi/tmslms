// Simplified Collaboration Dashboard Component
import { Course, ReviewWorkflow, UUID } from '../types';
import { InMemoryCollabService } from '../collab/collab';

interface CollaborationDashboardProps {
  courseId?: UUID;
  userId: string;
  onClose?: () => void;
}

interface WorkflowWithCourse extends ReviewWorkflow {
  courseName: string;
}

export const CollaborationDashboard = (props: CollaborationDashboardProps) => {
  const { courseId, userId, onClose } = props;
  
  // Mock data for demonstration
  const workflows: WorkflowWithCourse[] = [];
  const loading = false;
  let activeTab = 'pending';
  const selectedWorkflow: WorkflowWithCourse | null = null;

  const collabService = new InMemoryCollabService();

  const handleTabClick = (tab: string) => {
    activeTab = tab;
    console.log('Tab clicked:', tab);
  };

  const handleWorkflowClick = (workflow: WorkflowWithCourse) => {
    console.log('Workflow clicked:', workflow);
  };

  const handleAction = async (
    workflowCourseId: UUID, 
    action: 'approve' | 'request-changes' | 'submit'
  ) => {
    console.log('Action:', action, 'for workflow:', workflowCourseId);
  };

  const getStatusColor = (state: ReviewWorkflow['state']) => {
    switch (state) {
      case 'draft': return '#gray';
      case 'awaiting-approval': return '#orange';
      case 'approved': return '#green';
      case 'changes-requested': return '#red';
      default: return '#gray';
    }
  };

  const getStatusText = (state: ReviewWorkflow['state']) => {
    switch (state) {
      case 'draft': return 'Draft';
      case 'awaiting-approval': return 'Awaiting Approval';
      case 'approved': return 'Approved';
      case 'changes-requested': return 'Changes Requested';
      default: return 'Unknown';
    }
  };

  const canApprove = (workflow: ReviewWorkflow) => {
    return workflow.approvers.includes(userId) && workflow.state === 'awaiting-approval';
  };

  const canRequestChanges = (workflow: ReviewWorkflow) => {
    return workflow.approvers.includes(userId) && workflow.state === 'awaiting-approval';
  };

  if (loading) {
    return (
      <div className="collaboration-dashboard">
        <div className="loading">Loading collaboration data...</div>
      </div>
    );
  }

  return (
    <div className="collaboration-dashboard">
      <div className="header">
        <h2>Collaboration Dashboard</h2>
        {!courseId && (
          <div className="tabs">
            <button 
              className={activeTab === 'pending' ? 'active' : ''}
              onClick={() => handleTabClick('pending')}
            >
              Pending Reviews ({workflows.filter((w: WorkflowWithCourse) => w.approvers.includes(userId) && w.state === 'awaiting-approval').length})
            </button>
            <button 
              className={activeTab === 'my-reviews' ? 'active' : ''}
              onClick={() => handleTabClick('my-reviews')}
            >
              My Reviews
            </button>
            <button 
              className={activeTab === 'all' ? 'active' : ''}
              onClick={() => handleTabClick('all')}
            >
              All Workflows
            </button>
          </div>
        )}
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="content">
        <div className="workflows-list">
          {workflows.length === 0 ? (
            <div className="empty-state">
              <p>No workflows found for {activeTab === 'pending' ? 'pending reviews' : activeTab === 'my-reviews' ? 'your reviews' : 'this view'}.</p>
            </div>
          ) : (
            workflows.map((workflow: WorkflowWithCourse) => (
              <div 
                key={workflow.courseId} 
                className={`workflow-card ${selectedWorkflow && (selectedWorkflow as WorkflowWithCourse).courseId === workflow.courseId ? 'selected' : ''}`}
                onClick={() => handleWorkflowClick(workflow)}
              >
                <div className="workflow-header">
                  <h3>{workflow.courseName}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(workflow.state) }}
                  >
                    {getStatusText(workflow.state)}
                  </span>
                </div>
                
                <div className="workflow-meta">
                  <div className="approvers">
                    <strong>Approvers:</strong> {workflow.approvers.length}
                  </div>
                  <div className="history-count">
                    <strong>Actions:</strong> {workflow.history.length}
                  </div>
                </div>

                <div className="recent-activity">
                  {workflow.history.length > 0 && (
                    <div className="last-activity">
                      <strong>Last activity:</strong> {workflow.history[workflow.history.length - 1].action} by {workflow.history[workflow.history.length - 1].by} on {workflow.history[workflow.history.length - 1].at.toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="workflow-actions">
                  {canApprove(workflow) && (
                    <button 
                      className="approve-btn"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleAction(workflow.courseId, 'approve');
                      }}
                    >
                      Approve
                    </button>
                  )}
                  {canRequestChanges(workflow) && (
                    <button 
                      className="changes-btn"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleWorkflowClick(workflow);
                      }}
                    >
                      Request Changes
                    </button>
                  )}
                  {workflow.state === 'draft' && (
                    <button 
                      className="submit-btn"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        handleAction(workflow.courseId, 'submit');
                      }}
                    >
                      Submit for Review
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedWorkflow && (
          <div className="workflow-details">
            <div className="details-header">
              <h3>Workflow Details: {(selectedWorkflow as WorkflowWithCourse).courseName}</h3>
              <button onClick={() => console.log('Close details')}>×</button>
            </div>

            <div className="workflow-info">
              <div className="info-section">
                <h4>Current Status</h4>
                <p className="status" style={{ color: getStatusColor((selectedWorkflow as WorkflowWithCourse).state) }}>
                  {getStatusText((selectedWorkflow as WorkflowWithCourse).state)}
                </p>
              </div>

              <div className="info-section">
                <h4>Approvers</h4>
                <ul className="approvers-list">
                  {(selectedWorkflow as WorkflowWithCourse).approvers.map((approverId: string) => (
                    <li key={approverId}>
                      User {approverId.slice(0, 8)}...
                      {(selectedWorkflow as WorkflowWithCourse).history.some((h: any) => h.by === approverId && h.action === 'approve') && 
                        <span className="approved">✓ Approved</span>
                      }
                    </li>
                  ))}
                </ul>
              </div>

              <div className="info-section">
                <h4>Activity History</h4>
                <div className="history-list">
                  {(selectedWorkflow as WorkflowWithCourse).history.length === 0 ? (
                    <p>No activity yet</p>
                  ) : (
                    (selectedWorkflow as WorkflowWithCourse).history.map((entry: any, index: number) => (
                      <div key={index} className="history-entry">
                        <div className="history-meta">
                          <strong>{entry.action}</strong> by User {entry.by.slice(0, 8)}...
                          <span className="timestamp">{entry.at.toLocaleString()}</span>
                        </div>
                        {entry.comment && (
                          <div className="history-comment">{entry.comment}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="action-panel">
              <div className="comment-section">
                <h4>Add Comment</h4>
                <textarea
                  placeholder="Add a comment..."
                  rows={3}
                />
                <div className="comment-actions">
                  <button onClick={() => console.log('Add comment')}>
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .collaboration-dashboard {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }
        .header {
          display: flex;
          align-items: center;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
          gap: 24px;
        }
        .header h2 {
          margin: 0;
          flex: 1;
        }
        .tabs {
          display: flex;
          gap: 8px;
        }
        .tabs button {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .tabs button.active {
          background: #2196f3;
          color: white;
          border-color: #2196f3;
        }
        .close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #f5f5f5;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
        }
        .content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .workflows-list {
          width: 50%;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #666;
        }
        .workflow-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .workflow-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .workflow-card.selected {
          border-color: #2196f3;
          box-shadow: 0 0 8px rgba(33,150,243,0.3);
        }
        .workflow-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .workflow-header h3 {
          margin: 0;
          font-size: 18px;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .workflow-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #666;
        }
        .recent-activity {
          margin-bottom: 16px;
          font-size: 14px;
          color: #666;
        }
        .workflow-actions {
          display: flex;
          gap: 8px;
        }
        .workflow-actions button {
          padding: 6px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
        }
        .approve-btn {
          background: #4caf50 !important;
          color: white !important;
          border-color: #4caf50 !important;
        }
        .changes-btn {
          background: #ff9800 !important;
          color: white !important;
          border-color: #ff9800 !important;
        }
        .submit-btn {
          background: #2196f3 !important;
          color: white !important;
          border-color: #2196f3 !important;
        }
        .workflow-details {
          width: 50%;
          border-left: 1px solid #e0e0e0;
          background: white;
          display: flex;
          flex-direction: column;
        }
        .details-header {
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .details-header h3 {
          margin: 0;
        }
        .workflow-info {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
        }
        .info-section {
          margin-bottom: 24px;
        }
        .info-section h4 {
          margin: 0 0 12px 0;
          color: #333;
        }
        .status {
          font-weight: bold;
          font-size: 16px;
        }
        .approvers-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .approvers-list li {
          padding: 8px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .approved {
          color: #4caf50;
          font-weight: bold;
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .history-entry {
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: #f8f9fa;
        }
        .history-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .timestamp {
          font-size: 12px;
          color: #666;
        }
        .history-comment {
          font-style: italic;
          color: #666;
        }
        .action-panel {
          border-top: 1px solid #e0e0e0;
          padding: 16px;
        }
        .comment-section {
          margin-bottom: 24px;
        }
        .comment-section h4 {
          margin: 0 0 8px 0;
        }
        .comment-section textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          resize: vertical;
          margin-bottom: 8px;
        }
        .comment-actions {
          display: flex;
          justify-content: flex-end;
        }
        .comment-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: #2196f3;
          color: white;
          cursor: pointer;
        }
        .loading {
          padding: 48px;
          text-align: center;
          font-size: 18px;
          color: #666;
        }
      `}</style>
    </div>
  );
};
