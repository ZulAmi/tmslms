import { LearningNode, LearningPath, UUID } from '../types';
export interface LearningPathService {
    create(path: Omit<LearningPath, 'id'>): Promise<LearningPath>;
    addNode(pathId: UUID, node: LearningNode): Promise<void>;
    validate(path: LearningPath): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    moveNode(pathId: UUID, nodeId: UUID, position: {
        x: number;
        y: number;
    }): Promise<void>;
    connectNodes(pathId: UUID, fromNodeId: UUID, toNodeId: UUID): Promise<void>;
    disconnectNodes(pathId: UUID, fromNodeId: UUID, toNodeId: UUID): Promise<void>;
    getPathLayout(pathId: UUID): Promise<PathLayout>;
    autoLayout(pathId: UUID, algorithm: 'hierarchical' | 'force' | 'circular'): Promise<void>;
}
export declare class InMemoryLearningPathService implements LearningPathService {
    private paths;
    private nodePositions;
    create(path: Omit<LearningPath, 'id'>): Promise<LearningPath>;
    addNode(pathId: UUID, node: LearningNode): Promise<void>;
    validate(path: LearningPath): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    moveNode(pathId: UUID, nodeId: UUID, position: {
        x: number;
        y: number;
    }): Promise<void>;
    connectNodes(pathId: UUID, fromNodeId: UUID, toNodeId: UUID): Promise<void>;
    disconnectNodes(pathId: UUID, fromNodeId: UUID, toNodeId: UUID): Promise<void>;
    getPathLayout(pathId: UUID): Promise<PathLayout>;
    autoLayout(pathId: UUID, algorithm: 'hierarchical' | 'force' | 'circular'): Promise<void>;
    private hasCircularDependency;
    private validatePathStructure;
    private calculateLevels;
    private getSuggestedLayout;
    private calculateLayout;
    private calculateHierarchicalLayout;
    private calculateCircularLayout;
    private calculateForceLayout;
    private calculateNodeLevel;
}
export interface PathLayout {
    nodes: Array<{
        id: UUID;
        title: string;
        type: string;
        position: {
            x: number;
            y: number;
        };
        prerequisites: UUID[];
        status: 'active' | 'completed' | 'locked';
    }>;
    connections: Array<{
        from: UUID;
        to: UUID;
        type: 'prerequisite' | 'optional';
    }>;
    metadata: {
        totalNodes: number;
        totalConnections: number;
        levels: number;
        suggestedLayout: 'hierarchical' | 'force' | 'circular';
    };
}
