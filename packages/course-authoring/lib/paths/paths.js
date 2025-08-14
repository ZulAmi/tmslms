"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryLearningPathService = void 0;
class InMemoryLearningPathService {
    constructor() {
        this.paths = new Map();
        this.nodePositions = new Map();
    }
    async create(path) {
        const id = crypto.randomUUID();
        const result = { id, ...path };
        this.paths.set(id, result);
        return result;
    }
    async addNode(pathId, node) {
        const p = this.paths.get(pathId);
        if (!p)
            throw new Error('Path not found');
        p.nodes.push(node);
        // Set default position for new node
        const nodeCount = p.nodes.length;
        this.nodePositions.set(node.id, {
            x: (nodeCount % 4) * 250,
            y: Math.floor(nodeCount / 4) * 150
        });
    }
    async validate(path) {
        const issues = [];
        const nodeIds = new Set(path.nodes.map((n) => n.id));
        // Check prerequisites exist
        for (const n of path.nodes) {
            for (const prereq of n.prerequisites) {
                if (!nodeIds.has(prereq)) {
                    issues.push(`Missing prerequisite ${prereq} for node ${n.id}`);
                }
            }
        }
        // Check for circular dependencies
        for (const node of path.nodes) {
            if (this.hasCircularDependency(node, path.nodes, new Set())) {
                issues.push(`Circular dependency detected for node ${node.id}`);
            }
        }
        // Validate path structure
        const structureIssues = this.validatePathStructure(path);
        issues.push(...structureIssues);
        return { valid: issues.length === 0, issues };
    }
    // Drag-drop interface implementation
    async moveNode(pathId, nodeId, position) {
        const path = this.paths.get(pathId);
        if (!path)
            throw new Error('Path not found');
        const node = path.nodes.find(n => n.id === nodeId);
        if (!node)
            throw new Error('Node not found');
        this.nodePositions.set(nodeId, position);
    }
    async connectNodes(pathId, fromNodeId, toNodeId) {
        const path = this.paths.get(pathId);
        if (!path)
            throw new Error('Path not found');
        const toNode = path.nodes.find(n => n.id === toNodeId);
        if (!toNode)
            throw new Error('Target node not found');
        // Add prerequisite if not already present
        if (!toNode.prerequisites.includes(fromNodeId)) {
            toNode.prerequisites.push(fromNodeId);
        }
        // Validate no circular dependency created
        const validation = await this.validate(path);
        if (!validation.valid) {
            // Rollback if circular dependency
            const circularError = validation.issues.find(issue => issue.includes('Circular dependency') && issue.includes(toNodeId));
            if (circularError) {
                toNode.prerequisites = toNode.prerequisites.filter(id => id !== fromNodeId);
                throw new Error('Connection would create circular dependency');
            }
        }
    }
    async disconnectNodes(pathId, fromNodeId, toNodeId) {
        const path = this.paths.get(pathId);
        if (!path)
            throw new Error('Path not found');
        const toNode = path.nodes.find(n => n.id === toNodeId);
        if (!toNode)
            throw new Error('Target node not found');
        toNode.prerequisites = toNode.prerequisites.filter(id => id !== fromNodeId);
    }
    async getPathLayout(pathId) {
        const path = this.paths.get(pathId);
        if (!path)
            throw new Error('Path not found');
        const nodes = path.nodes.map(node => ({
            id: node.id,
            title: node.title,
            type: node.type,
            position: this.nodePositions.get(node.id) || { x: 0, y: 0 },
            prerequisites: node.prerequisites,
            status: 'active'
        }));
        const connections = path.nodes.flatMap(node => node.prerequisites.map(prereqId => ({
            from: prereqId,
            to: node.id,
            type: 'prerequisite'
        })));
        return {
            nodes,
            connections,
            metadata: {
                totalNodes: nodes.length,
                totalConnections: connections.length,
                levels: this.calculateLevels(path.nodes),
                suggestedLayout: this.getSuggestedLayout(nodes.length)
            }
        };
    }
    async autoLayout(pathId, algorithm) {
        const path = this.paths.get(pathId);
        if (!path)
            throw new Error('Path not found');
        const positions = this.calculateLayout(path.nodes, algorithm);
        // Update all node positions
        positions.forEach((position, nodeId) => {
            this.nodePositions.set(nodeId, position);
        });
    }
    // Private helper methods
    hasCircularDependency(node, allNodes, visited) {
        if (visited.has(node.id))
            return true;
        visited.add(node.id);
        for (const prereqId of node.prerequisites) {
            const prereqNode = allNodes.find(n => n.id === prereqId);
            if (prereqNode && this.hasCircularDependency(prereqNode, allNodes, new Set(visited))) {
                return true;
            }
        }
        return false;
    }
    validatePathStructure(path) {
        const issues = [];
        // Check for orphaned nodes (nodes with no path to completion)
        const terminalNodes = path.nodes.filter(node => !path.nodes.some(other => other.prerequisites.includes(node.id)));
        if (terminalNodes.length === 0 && path.nodes.length > 0) {
            issues.push('Path has no terminal nodes - all nodes have dependencies');
        }
        // Check for starting nodes (nodes with no prerequisites)
        const startingNodes = path.nodes.filter(node => node.prerequisites.length === 0);
        if (startingNodes.length === 0 && path.nodes.length > 0) {
            issues.push('Path has no starting nodes - all nodes have prerequisites');
        }
        return issues;
    }
    calculateLevels(nodes) {
        const levels = new Map();
        const calculateLevel = (nodeId) => {
            if (levels.has(nodeId))
                return levels.get(nodeId);
            const node = nodes.find(n => n.id === nodeId);
            if (!node)
                return 0;
            if (node.prerequisites.length === 0) {
                levels.set(nodeId, 0);
                return 0;
            }
            const prereqLevels = node.prerequisites.map(prereqId => calculateLevel(prereqId));
            const level = Math.max(...prereqLevels) + 1;
            levels.set(nodeId, level);
            return level;
        };
        nodes.forEach(node => calculateLevel(node.id));
        return Math.max(...Array.from(levels.values())) + 1;
    }
    getSuggestedLayout(nodeCount) {
        if (nodeCount <= 5)
            return 'circular';
        if (nodeCount <= 15)
            return 'hierarchical';
        return 'force';
    }
    calculateLayout(nodes, algorithm) {
        const positions = new Map();
        switch (algorithm) {
            case 'hierarchical':
                return this.calculateHierarchicalLayout(nodes);
            case 'circular':
                return this.calculateCircularLayout(nodes);
            case 'force':
                return this.calculateForceLayout(nodes);
            default:
                return this.calculateHierarchicalLayout(nodes);
        }
    }
    calculateHierarchicalLayout(nodes) {
        const positions = new Map();
        const levels = new Map();
        // Group nodes by level
        nodes.forEach(node => {
            const level = this.calculateNodeLevel(node, nodes);
            if (!levels.has(level))
                levels.set(level, []);
            levels.get(level).push(node);
        });
        // Position nodes
        const levelSpacing = 200;
        const nodeSpacing = 150;
        Array.from(levels.entries()).forEach(([level, levelNodes]) => {
            levelNodes.forEach((node, index) => {
                const totalWidth = (levelNodes.length - 1) * nodeSpacing;
                const startX = -totalWidth / 2;
                positions.set(node.id, {
                    x: startX + (index * nodeSpacing),
                    y: level * levelSpacing
                });
            });
        });
        return positions;
    }
    calculateCircularLayout(nodes) {
        const positions = new Map();
        const radius = Math.max(100, nodes.length * 20);
        const angleStep = (2 * Math.PI) / nodes.length;
        nodes.forEach((node, index) => {
            const angle = index * angleStep;
            positions.set(node.id, {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            });
        });
        return positions;
    }
    calculateForceLayout(nodes) {
        // Simplified force-directed layout
        const positions = new Map();
        // Initialize random positions
        nodes.forEach(node => {
            positions.set(node.id, {
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400
            });
        });
        // Simple spring simulation (would be more complex in real implementation)
        for (let iteration = 0; iteration < 50; iteration++) {
            const forces = new Map();
            // Initialize forces
            nodes.forEach(node => forces.set(node.id, { x: 0, y: 0 }));
            // Repulsion between all nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeA = nodes[i];
                    const nodeB = nodes[j];
                    const posA = positions.get(nodeA.id);
                    const posB = positions.get(nodeB.id);
                    const dx = posA.x - posB.x;
                    const dy = posA.y - posB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 0) {
                        const force = 1000 / (distance * distance);
                        const fx = (dx / distance) * force;
                        const fy = (dy / distance) * force;
                        const forceA = forces.get(nodeA.id);
                        const forceB = forces.get(nodeB.id);
                        forceA.x += fx;
                        forceA.y += fy;
                        forceB.x -= fx;
                        forceB.y -= fy;
                    }
                }
            }
            // Attraction for prerequisites
            nodes.forEach(node => {
                node.prerequisites.forEach(prereqId => {
                    const prereqNode = nodes.find(n => n.id === prereqId);
                    if (prereqNode) {
                        const posNode = positions.get(node.id);
                        const posPrereq = positions.get(prereqId);
                        const dx = posPrereq.x - posNode.x;
                        const dy = posPrereq.y - posNode.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance > 0) {
                            const force = distance * 0.1;
                            const fx = (dx / distance) * force;
                            const fy = (dy / distance) * force;
                            const forceNode = forces.get(node.id);
                            const forcePrereq = forces.get(prereqId);
                            forceNode.x += fx;
                            forceNode.y += fy;
                            forcePrereq.x -= fx;
                            forcePrereq.y -= fy;
                        }
                    }
                });
            });
            // Apply forces
            nodes.forEach(node => {
                const pos = positions.get(node.id);
                const force = forces.get(node.id);
                pos.x += force.x * 0.1;
                pos.y += force.y * 0.1;
            });
        }
        return positions;
    }
    calculateNodeLevel(node, allNodes) {
        if (node.prerequisites.length === 0)
            return 0;
        const prereqLevels = node.prerequisites.map(prereqId => {
            const prereqNode = allNodes.find(n => n.id === prereqId);
            return prereqNode ? this.calculateNodeLevel(prereqNode, allNodes) : 0;
        });
        return Math.max(...prereqLevels) + 1;
    }
}
exports.InMemoryLearningPathService = InMemoryLearningPathService;
