"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationDashboard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const collab_1 = require("../collab/collab");
const CollaborationDashboard = (props) => {
    const { courseId, userId, onClose } = props;
    // Mock data for demonstration
    const workflows = [];
    const loading = false;
    let activeTab = 'pending';
    const selectedWorkflow = null;
    const collabService = new collab_1.InMemoryCollabService();
    const handleTabClick = (tab) => {
        activeTab = tab;
        console.log('Tab clicked:', tab);
    };
    const handleWorkflowClick = (workflow) => {
        console.log('Workflow clicked:', workflow);
    };
    const handleAction = async (workflowCourseId, action) => {
        console.log('Action:', action, 'for workflow:', workflowCourseId);
    };
    const getStatusColor = (state) => {
        switch (state) {
            case 'draft': return '#gray';
            case 'awaiting-approval': return '#orange';
            case 'approved': return '#green';
            case 'changes-requested': return '#red';
            default: return '#gray';
        }
    };
    const getStatusText = (state) => {
        switch (state) {
            case 'draft': return 'Draft';
            case 'awaiting-approval': return 'Awaiting Approval';
            case 'approved': return 'Approved';
            case 'changes-requested': return 'Changes Requested';
            default: return 'Unknown';
        }
    };
    const canApprove = (workflow) => {
        return workflow.approvers.includes(userId) && workflow.state === 'awaiting-approval';
    };
    const canRequestChanges = (workflow) => {
        return workflow.approvers.includes(userId) && workflow.state === 'awaiting-approval';
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "collaboration-dashboard", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Loading collaboration data..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "collaboration-dashboard", children: [(0, jsx_runtime_1.jsxs)("div", { className: "header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Collaboration Dashboard" }), !courseId && ((0, jsx_runtime_1.jsxs)("div", { className: "tabs", children: [(0, jsx_runtime_1.jsxs)("button", { className: activeTab === 'pending' ? 'active' : '', onClick: () => handleTabClick('pending'), children: ["Pending Reviews (", workflows.filter((w) => w.approvers.includes(userId) && w.state === 'awaiting-approval').length, ")"] }), (0, jsx_runtime_1.jsx)("button", { className: activeTab === 'my-reviews' ? 'active' : '', onClick: () => handleTabClick('my-reviews'), children: "My Reviews" }), (0, jsx_runtime_1.jsx)("button", { className: activeTab === 'all' ? 'active' : '', onClick: () => handleTabClick('all'), children: "All Workflows" })] })), onClose && ((0, jsx_runtime_1.jsx)("button", { className: "close-btn", onClick: onClose, children: "\u00D7" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "content", children: [(0, jsx_runtime_1.jsx)("div", { className: "workflows-list", children: workflows.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "empty-state", children: (0, jsx_runtime_1.jsxs)("p", { children: ["No workflows found for ", activeTab === 'pending' ? 'pending reviews' : activeTab === 'my-reviews' ? 'your reviews' : 'this view', "."] }) })) : (workflows.map((workflow) => ((0, jsx_runtime_1.jsxs)("div", { className: `workflow-card ${selectedWorkflow && selectedWorkflow.courseId === workflow.courseId ? 'selected' : ''}`, onClick: () => handleWorkflowClick(workflow), children: [(0, jsx_runtime_1.jsxs)("div", { className: "workflow-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: workflow.courseName }), (0, jsx_runtime_1.jsx)("span", { className: "status-badge", style: { backgroundColor: getStatusColor(workflow.state) }, children: getStatusText(workflow.state) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "workflow-meta", children: [(0, jsx_runtime_1.jsxs)("div", { className: "approvers", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Approvers:" }), " ", workflow.approvers.length] }), (0, jsx_runtime_1.jsxs)("div", { className: "history-count", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Actions:" }), " ", workflow.history.length] })] }), (0, jsx_runtime_1.jsx)("div", { className: "recent-activity", children: workflow.history.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "last-activity", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Last activity:" }), " ", workflow.history[workflow.history.length - 1].action, " by ", workflow.history[workflow.history.length - 1].by, " on ", workflow.history[workflow.history.length - 1].at.toLocaleDateString()] })) }), (0, jsx_runtime_1.jsxs)("div", { className: "workflow-actions", children: [canApprove(workflow) && ((0, jsx_runtime_1.jsx)("button", { className: "approve-btn", onClick: (e) => {
                                                e.stopPropagation();
                                                handleAction(workflow.courseId, 'approve');
                                            }, children: "Approve" })), canRequestChanges(workflow) && ((0, jsx_runtime_1.jsx)("button", { className: "changes-btn", onClick: (e) => {
                                                e.stopPropagation();
                                                handleWorkflowClick(workflow);
                                            }, children: "Request Changes" })), workflow.state === 'draft' && ((0, jsx_runtime_1.jsx)("button", { className: "submit-btn", onClick: (e) => {
                                                e.stopPropagation();
                                                handleAction(workflow.courseId, 'submit');
                                            }, children: "Submit for Review" }))] })] }, workflow.courseId)))) }), selectedWorkflow && ((0, jsx_runtime_1.jsxs)("div", { className: "workflow-details", children: [(0, jsx_runtime_1.jsxs)("div", { className: "details-header", children: [(0, jsx_runtime_1.jsxs)("h3", { children: ["Workflow Details: ", selectedWorkflow.courseName] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => console.log('Close details'), children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "workflow-info", children: [(0, jsx_runtime_1.jsxs)("div", { className: "info-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Current Status" }), (0, jsx_runtime_1.jsx)("p", { className: "status", style: { color: getStatusColor(selectedWorkflow.state) }, children: getStatusText(selectedWorkflow.state) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Approvers" }), (0, jsx_runtime_1.jsx)("ul", { className: "approvers-list", children: selectedWorkflow.approvers.map((approverId) => ((0, jsx_runtime_1.jsxs)("li", { children: ["User ", approverId.slice(0, 8), "...", selectedWorkflow.history.some((h) => h.by === approverId && h.action === 'approve') &&
                                                            (0, jsx_runtime_1.jsx)("span", { className: "approved", children: "\u2713 Approved" })] }, approverId))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Activity History" }), (0, jsx_runtime_1.jsx)("div", { className: "history-list", children: selectedWorkflow.history.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { children: "No activity yet" })) : (selectedWorkflow.history.map((entry, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "history-entry", children: [(0, jsx_runtime_1.jsxs)("div", { className: "history-meta", children: [(0, jsx_runtime_1.jsx)("strong", { children: entry.action }), " by User ", entry.by.slice(0, 8), "...", (0, jsx_runtime_1.jsx)("span", { className: "timestamp", children: entry.at.toLocaleString() })] }), entry.comment && ((0, jsx_runtime_1.jsx)("div", { className: "history-comment", children: entry.comment }))] }, index)))) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "action-panel", children: (0, jsx_runtime_1.jsxs)("div", { className: "comment-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Add Comment" }), (0, jsx_runtime_1.jsx)("textarea", { placeholder: "Add a comment...", rows: 3 }), (0, jsx_runtime_1.jsx)("div", { className: "comment-actions", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => console.log('Add comment'), children: "Add Comment" }) })] }) })] }))] }), (0, jsx_runtime_1.jsx)("style", { children: `
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
      ` })] }));
};
exports.CollaborationDashboard = CollaborationDashboard;
